import React, { useState, useEffect, useRef } from 'react';
import { Layout, Input, Table, Button, Tag, Modal } from 'antd';
import {
    SearchOutlined,
    PlusOutlined,
    DownloadOutlined,
    ReloadOutlined
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import Sidebar from '../../../components/Layout/Sidebar';
import Navbar from '../../../components/Layout/Navbar';
import { saveAs } from 'file-saver';
import Highlighter from 'react-highlight-words';
import api from '../../../api/axiosInstance';
import { logout } from "../../../utils/auth";

const { Header } = Layout;

export default function LecturerManagement() {
    const { t } = useTranslation();
    const [collapsed, setCollapsed] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const [lecturers, setLecturers] = useState([]);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [searchedColumn, setSearchedColumn] = useState('');
    const searchInput = useRef(null);
    const [newPassword, setNewPassword] = useState('');
    const [isResettingPassword, setIsResettingPassword] = useState(false);
    const [lockConfirmVisible, setLockConfirmVisible] = useState(false);
    const [lecturerToLock, setLecturerToLock] = useState(null);
    const [selectedLecturer, setSelectedLecturer] = useState(null);
    const [resetPasswordModalVisible, setResetPasswordModalVisible] = useState(false);
    const [isLocking, setIsLocking] = useState(false);

    const [lecturerToUnLock, setLecturerToUnLock] = useState(null);
    const [unlockConfirmVisible, setUnLockConfirmVisible] = useState(false);

    useEffect(() => {
        document.title = "ATTEND 3D - Quản lý tài khoản giảng viên";
        
        const fetchLecturers = async () => {
            try {
                const response = await api.get('lecturers/all/');
        
                if (response.status === 401) {
                    logout();
                    window.location.href = "/account/login";
                    return;
                }
        
                const data = response.data;
        
                const transformed = data.map((item, index) => ({
                    key: item.lecturer_id || index,
                    lecturer_code: item.lecturer_code,
                    name: item.fullname,
                    email: item.account?.email || '',
                    phone: item.account?.phone_number || '',
                    is_locked: item.account?.is_locked === true,
                    is_active: item.account?.is_active === true,
                }));
        
                setLecturers(transformed);
            } catch (error) {
                console.error('Lỗi khi tải danh sách giảng viên:', error);
            }
        };        

        fetchLecturers();
    }, [t]);

    const getColumnSearchProps = (dataIndex) => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
            <div style={{ padding: 8 }}>
                <Input
                    ref={searchInput}
                    placeholder={`Tìm kiếm ${dataIndex}`}
                    value={selectedKeys[0]}
                    onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
                    style={{ width: 188, marginBottom: 8, display: 'block' }}
                />
                <div style={{ display: 'flex', gap: 8 }}>
                    <Button
                        type="primary"
                        onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
                        icon={<SearchOutlined />}
                        size="small"
                        style={{ width: 90 }}
                    >
                        Tìm
                    </Button>
                    <Button
                        onClick={() => handleReset(clearFilters)}
                        size="small"
                        style={{ width: 90 }}
                    >
                        Reset
                    </Button>
                </div>
            </div>
        ),
        filterIcon: (filtered) => (
            <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
        ),
        onFilter: (value, record) =>
            record[dataIndex]?.toString().toLowerCase().includes(value.toLowerCase()),
        filterDropdownProps: {
            onOpenChange: (visible) => {
                if (visible) {
                    setTimeout(() => searchInput.current?.select(), 100);
                }
            }
        },
        render: (text) =>
            searchedColumn === dataIndex ? (
                <Highlighter
                    highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
                    searchWords={[searchText]}
                    autoEscape
                    textToHighlight={text ? text.toString() : ''}
                />
            ) : (
                text
            ),
    });

    const handleSearch = (selectedKeys, confirm, dataIndex) => {
        confirm();
        setSearchText(selectedKeys[0]);
        setSearchedColumn(dataIndex);
    };

    const handleReset = (clearFilters) => {
        clearFilters();
        setSearchText('');
    };

    const columns = [
        {
            title: 'Code',
            dataIndex: 'lecturer_code',
            key: 'lecturer_code',
            width: 80,
            ...getColumnSearchProps('lecturer_code')
        },
        {
            title: 'Họ và tên',
            dataIndex: 'name',
            key: 'name',
            ...getColumnSearchProps('name')
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            ...getColumnSearchProps('email')
        },
        {
            title: 'Số điện thoại',
            dataIndex: 'phone',
            key: 'phone',
            ...getColumnSearchProps('phone')
        },
        {
            title: 'Trạng thái tài khoản',
            dataIndex: 'is_active',
            key: 'is_active',
            filters: [
                { text: 'Hoạt động', value: true },
                { text: 'Vô hiệu hóa', value: false },
            ],
            onFilter: (value, record) => record.is_active === value,
            render: (is_active) => (
                <Tag color={is_active ? 'green' : 'red'}>
                    {is_active ? 'Hoạt động' : 'Vô hiệu hóa'}
                </Tag>
            )
        },
        {
            title: 'Trạng thái khóa',
            dataIndex: 'is_locked',
            key: 'is_locked',
            filters: [
                { text: 'Không khóa', value: false },
                { text: 'Bị khóa', value: true },
            ],
            onFilter: (value, record) => record.is_locked === value,
            render: (is_locked) => (
                <Tag color={is_locked ? 'red' : 'green'}>
                    {is_locked ? 'Bị khóa' : 'Không khóa'}
                </Tag>
            )
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => (
                <div className="flex gap-2">
                    <Button size="small" onClick={() => openResetPasswordModal(record)}>
                        Cấp lại mật khẩu
                    </Button>
        
                    {record.is_locked ? (
                        <Button type="primary" size="small" onClick={() => openUnlockConfirmModal(record)}>
                            Mở khóa
                        </Button>
                    ) : (
                        <Button danger size="small" onClick={() => openLockConfirmModal(record)}>
                            Tạm dừng
                        </Button>
                    )}
                </div>
            )
        }        
    ];

    const filteredStudents = lecturers.filter(student =>
        student.name.toLowerCase().includes(searchValue.toLowerCase()) ||
        student.email.toLowerCase().includes(searchValue.toLowerCase())
    );

    const rowSelection = {
        selectedRowKeys,
        onChange: (newSelectedKeys) => {
            setSelectedRowKeys(newSelectedKeys);
        },
    };

    const convertToCSV = (arr) => {
        if (!arr.length) return '';
        const keys = Object.keys(arr[0]);
        const header = keys.join(',');
        const rows = arr.map(obj => keys.map(k => `"${obj[k] ?? ''}"`).join(','));
        return [header, ...rows].join('\n');
    };

    const exportCSV = () => {
        const now = new Date();
        const filename = `danh_sach_giang_vien_${now.toISOString().replace(/[-:.]/g, '').slice(0, 15)}.csv`;
        const csv = convertToCSV(filteredStudents);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        saveAs(blob, filename);
    };

    const openResetPasswordModal = (lecturer) => {
        setSelectedLecturer(lecturer);
        setNewPassword('');
        setResetPasswordModalVisible(true);
    };

    const generateRandomPassword = () => {
        const lowercase = 'abcdefghijklmnopqrstuvwxyz';
        const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const digits = '0123456789';
        const specials = '!@#$%^&*()';
        const allChars = lowercase + uppercase + digits + specials;
    
        const getRandom = (str) => str.charAt(Math.floor(Math.random() * str.length));
    
        let password = [
            getRandom(lowercase),
            getRandom(uppercase),
            getRandom(digits),
        ];
    
        const length = 10;
    
        for (let i = password.length; i < length; i++) {
            password.push(getRandom(allChars));
        }
        password = password.sort(() => 0.5 - Math.random());
    
        setNewPassword(password.join(''));
    };    

    const handlePasswordReset = async () => {
        setIsResettingPassword(true);
        try {
            await api.post(
                `accounts/lecturer/reset-password/${selectedLecturer.email}/`,
                { new_password: newPassword }
            );
    
            Modal.success({
                title: 'Thành công',
                content: 'Cập nhật mật khẩu thành công!',
            });
    
            setResetPasswordModalVisible(false);
        } catch (error) {
            Modal.error({
                title: 'Thất bại',
                content: error.response?.data?.message || error.message,
            });
        } finally {
            setIsResettingPassword(false);
        }
    };    

    const openLockConfirmModal = (lecturer) => {
        setLecturerToLock(lecturer);
        setLockConfirmVisible(true);
    };

    const openUnlockConfirmModal = (lecturer) => {
        setLecturerToUnLock(lecturer);
        setUnLockConfirmVisible(true);
    };

    const handleRefresh = () => {
        window.location.reload();
    };

    const handleConfirmLock = async () => {
        setIsLocking(true);
        try {
            await api.patch(`accounts/lock/${lecturerToLock.email}/`, {
                is_locked: true
            });
    
            Modal.success({
                title: 'Thành công',
                content: 'Đã tạm dừng tài khoản giảng viên.',
            });
    
            setLockConfirmVisible(false);
            handleRefresh();
        } catch (error) {
            Modal.error({
                title: 'Thất bại',
                content: error.message,
            });
        } finally {
            setIsLocking(false);
        }
    };    

    const handleConfirmUnLock = async () => {
        setIsLocking(true);
        try {
            await api.patch(`accounts/unlock/${lecturerToUnLock.email}/`, {
                is_locked: false
            });
    
            Modal.success({
                title: 'Thành công',
                content: 'Đã mở tài khoản giảng viên.',
            });
    
            setUnLockConfirmVisible(false);
            handleRefresh();
        } catch (error) {
            Modal.error({
                title: 'Thất bại',
                content: error.message,
            });
        } finally {
            setIsLocking(false);
        }
    };    

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} t={t} />
            <Layout>
                <Header className="bg-white px-4 flex flex-col sm:flex-row justify-between items-center gap-4 py-3 border-b">
                    <Navbar
                        searchValue={searchValue}
                        setSearchValue={setSearchValue}
                    />
                </Header>

                <main className="mx-4 my-4 p-4 sm:p-6 bg-white rounded shadow">
                    <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                        <h1 className="text-2xl font-bold">Quản lý tài khoản giảng viên</h1>
                        <div className="flex flex-wrap gap-3">
                            <Button
                                type="default"
                                icon={<ReloadOutlined />}
                                onClick={handleRefresh}
                            >
                                Làm mới
                            </Button>
                            <Button type="primary" icon={<PlusOutlined />} href='/admin/management/lecturers/create' key={"4-2-1"}>
                                Thêm danh sách giảng viên
                            </Button>
                            <Button
                                type="primary"
                                icon={<DownloadOutlined />}
                                onClick={exportCSV}
                            >
                                Xuất file CSV
                            </Button>
                        </div>
                    </div>

                    <Table
                        rowSelection={rowSelection}
                        columns={columns}
                        dataSource={filteredStudents}
                        pagination={{ pageSize: 10 }}
                        scroll={{ x: 'max-content' }}
                        bordered
                    />

                    <Modal
                        title="Cấp lại mật khẩu cho giảng viên"
                        open={resetPasswordModalVisible}
                        onCancel={() => setResetPasswordModalVisible(false)}
                        onOk={handlePasswordReset}
                        okText="Xác nhận"
                        cancelText="Hủy"
                        confirmLoading={isResettingPassword}
                    >
                        <div className="space-y-4">
                            <div>
                                <p className="font-medium text-gray-700">
                                    Gửi đến email: <strong className=''>{selectedLecturer?.email}</strong>
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Mật khẩu mới
                                </label>
                                <Input.Password
                                    className="w-full"
                                    placeholder="Nhập mật khẩu mới"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    minLength={8}
                                    required
                                    size='large'
                                    style={{ borderWidth: 1.5, boxShadow: 'none' }}
                                />
                                {newPassword && newPassword.length < 8 && (
                                    <p className="text-red-500 text-sm mt-1">Mật khẩu phải có ít nhất 8 ký tự.</p>
                                )}
                            </div>

                            <Button
                                onClick={generateRandomPassword}
                                icon={<ReloadOutlined />}
                                className="mt-2 bg-white border border-gray-300 w-full"
                                size='large'
                            >
                                Tạo mật khẩu ngẫu nhiên
                            </Button>
                        </div>
                    </Modal>

                    <Modal
                        title="Xác nhận tạm dừng tài khoản"
                        open={lockConfirmVisible}
                        onCancel={() => setLockConfirmVisible(false)}
                        onOk={handleConfirmLock}
                        okText="Xác nhận"
                        cancelText="Hủy"
                        confirmLoading={isLocking}
                    >
                        <p>Bạn có chắc chắn muốn tạm dừng tài khoản của giảng viên <strong>{lecturerToLock?.name}</strong>?</p>
                    </Modal>

                    <Modal
                        title="Xác nhận mở tài khoản"
                        open={unlockConfirmVisible}
                        onCancel={() => setUnLockConfirmVisible(false)}
                        onOk={handleConfirmUnLock}
                        okText="Xác nhận"
                        cancelText="Hủy"
                        confirmLoading={isLocking}
                    >
                        <p>Bạn có chắc chắn muốn mở khoá tài khoản của giảng viên <strong>{lecturerToUnLock?.name}</strong>?</p>
                    </Modal>

                </main>
            </Layout>
        </Layout>
    );
};