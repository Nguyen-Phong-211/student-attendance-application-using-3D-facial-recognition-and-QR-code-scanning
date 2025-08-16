import React, { useState, useEffect, useRef } from 'react';
import { Layout, Input, Table, Button, Tag, Space, message, Modal, Descriptions } from 'antd';
import {
    SearchOutlined,
    PlusOutlined,
    ReloadOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import Sidebar from '../../../components/Layout/Sidebar';
import Navbar from '../../../components/Layout/Navbar';
import Highlighter from 'react-highlight-words';
import dayjs from 'dayjs';
import api from '../../../api/axiosInstance';

const { Header } = Layout;

export default function SubjectManagement() {
    const { t } = useTranslation();
    const [collapsed, setCollapsed] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [searchedColumn, setSearchedColumn] = useState('');
    const searchInput = useRef(null);

    const [loading, setLoading] = useState(false);
    const [subjects, setSubjects] = useState([]);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedClass, setSelectedClass] = useState(null);

    useEffect(() => {
        document.title = "ATTEND 3D - Subject Management";

        const token = localStorage.getItem("access_token");
        if (!token) {
            window.location.href = "/account/login";
            return;
        }

        fetchSubjects();
    }, []);

    const fetchSubjects = async () => {
        try {
            setLoading(true);
            const res = await api.get('subjects/all');
            const data = await res.data;
            setSubjects(data);
        } catch (error) {
            message.error("Lỗi khi tải danh sách môn học.");
        } finally {
            setLoading(false);
        }
    };

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
                <Space>
                    <Button
                        type="primary"
                        onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
                        icon={<SearchOutlined />}
                        size="small"
                    >
                        Tìm
                    </Button>
                    <Button onClick={() => handleReset(clearFilters)} size="small">
                        Xoá
                    </Button>
                </Space>
            </div>
        ),
        filterIcon: (filtered) => (
            <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
        ),
        onFilter: (value, record) => {
            const keys = dataIndex.split('.');
            let data = record;
            for (const key of keys) {
                data = data?.[key];
            }
            return data?.toString().toLowerCase().includes(value.toLowerCase());
        },
        onOpenChange: (visible) => {
            if (visible) {
                setTimeout(() => searchInput.current?.select(), 100);
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

    const handleDetail = (record) => {
        setSelectedClass(record);
        setIsModalOpen(true);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    const columns = [
        {
            title: 'Mã môn học',
            dataIndex: 'subject_code',
            key: 'subject_code',
            ...getColumnSearchProps('subject_code'),
        },
        {
            title: 'Tên môn học',
            dataIndex: 'subject_name',
            key: 'subject_name',
            ...getColumnSearchProps('subject_name'),
        },
        {
            title: 'Phòng ban',
            dataIndex: 'department',
            key: 'department',
            ...getColumnSearchProps('department_name'),
            render: (_, record) => record.department?.department_name || '---',
        },
        {
            title: 'Năm học',
            dataIndex: 'academic_year',
            key: 'academic_year',
            ...getColumnSearchProps('academic_year_name'),
            render: (_, record) => record.academic_year?.academic_year_name || '---',
        },
        {
            title: 'Chỉ lý thuyết',
            dataIndex: 'theoretical_credits',
            key: 'theoretical_credits',
        },
        {
            title: 'Chỉ thực hành',
            dataIndex: 'practical_credits',
            key: 'practical_credits',
        },
        {
            title: 'Tổng số tín chỉ',
            dataIndex: 'total_credits',
            key: 'total_credits',
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <Tag color={status === '1' ? 'green' : 'volcano'}>
                    {status === '1' ? 'Hoạt động' : 'Ngừng' }
                </Tag>
            ),
            filters: [
                { text: 'Hoạt động', value: '1' },
                { text: 'Ngừng', value: '0' },
            ],
            onFilter: (value, record) => record.status === value,
        },
        {
            title: 'Hành động',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Button size="small" onClick={() => handleDetail(record)}>Chi tiết</Button>
                    <Button size="small" danger onClick={() => handleDelete(record)}>Sửa</Button>
                </Space>
            ),
        },
    ];

    const handleDelete = async (subject) => {
        try {
            await fetch(`http://127.0.0.1:8000/api/v1/subjects/delete/${subject.id}`, {
                method: 'DELETE',
            });
            message.success("Xoá thành công!");
            fetchSubjects();
        } catch (err) {
            message.error("Xoá thất bại!");
        }
    };

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} t={t} />
            <Layout>
                <Header className="bg-white px-4 flex justify-between items-center border-b">
                    <Navbar />
                </Header>

                <main className="mx-4 my-4 p-4 sm:p-6 bg-white rounded shadow">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold">Quản lý môn học</h1>
                        <Space>
                            <Button
                                type="default"
                                icon={<ReloadOutlined />}
                                onClick={fetchSubjects}
                            >
                                Làm mới
                            </Button>
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                href="/admin/academics/subjects/create"
                            >
                                Thêm môn học
                            </Button>
                        </Space>
                    </div>

                    <Table
                        rowKey="subject_id"
                        columns={columns}
                        dataSource={subjects}
                        loading={loading}
                        rowSelection={{
                            selectedRowKeys,
                            onChange: setSelectedRowKeys
                        }}
                        pagination={{ pageSize: 10 }}
                        bordered
                        scroll={{ x: 'max-content' }}
                    />

                    <Modal
                        title="Thông tin chi tiết môn học"
                        open={isModalOpen}
                        onCancel={handleCancel}
                        footer={[
                            <Button key="close" onClick={handleCancel}>
                                Đóng
                            </Button>
                        ]}
                    >
                        {selectedClass ? (
                            <Descriptions
                                bordered
                                column={1}
                                size="small"
                                styles={{
                                    label: { fontWeight: 'bold', width: '150px' },
                                }}
                            >
                                <Descriptions.Item label="Mã môn học">{selectedClass.subject_code}</Descriptions.Item>
                                <Descriptions.Item label="Tên lớp">{selectedClass.subject_name}</Descriptions.Item>
                                <Descriptions.Item label="Tổng số tín chỉ">{selectedClass.total_credits}</Descriptions.Item>
                                <Descriptions.Item label="Số tín chỉ lý thuyết">{selectedClass.theoretical_credits}</Descriptions.Item>
                                <Descriptions.Item label="Số tín chỉ thực hành">{selectedClass.practical_credits}</Descriptions.Item>
                                <Descriptions.Item label="Khoa">{selectedClass.department.department_name}</Descriptions.Item>
                                <Descriptions.Item label="Năm học">{selectedClass.academic_year?.academic_year_name}</Descriptions.Item>
                                <Descriptions.Item label="Trạng thái">
                                    {selectedClass.status === '1' ? <Tag color="green">Hoạt động</Tag> : <Tag color="red">Không hoạt động</Tag>}
                                </Descriptions.Item>
                                <Descriptions.Item label="Ngày tạo">{dayjs(selectedClass.created_at).format('HH:mm DD/MM/YYYY')}</Descriptions.Item>
                            </Descriptions>
                        ) : (
                            <p>Không có thông tin lớp.</p>
                        )}
                    </Modal>
                </main>
            </Layout>
        </Layout>
    );
}