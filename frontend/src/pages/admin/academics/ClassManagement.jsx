import React, { useState, useEffect, useRef } from 'react';
import { Layout, Input, Table, Button, Space, message, Modal, Descriptions, Tag, Select, Form, Tooltip } from 'antd';
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
const { Option } = Select;

export default function ClassManagement() {
    const { t } = useTranslation();
    const [collapsed, setCollapsed] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [searchedColumn, setSearchedColumn] = useState('');
    const searchInput = useRef(null);

    const [loading, setLoading] = useState(false);
    const [classes, setClasses] = useState([]);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedClass, setSelectedClass] = useState(null);

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [, setEditForm] = useState({
        class_name: '',
        academic_year: '',
        department: ''
    });
    const [academicYears, setAcademicYears] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [form] = Form.useForm();

    useEffect(() => {
        document.title = "ATTEND 3D - Quản lý lớp học";

        fetchClasses();
        fetchYearsAndDepartments();
    }, []);

    const fetchClasses = async () => {
        try {
            setLoading(true);
            const res = await api.get("classes/all/");
            const data = await res.data;
            setClasses(data);
        } catch (error) {
            message.error("Lỗi khi tải danh sách lớp học.");
        } finally {
            setLoading(false);
        }
    };

    const fetchYearsAndDepartments = async () => {
        try {
            const [yearsRes, deptRes] = await Promise.all([
                api.get('academic-years/all/'),
                api.get('departments/all/'),
            ]);
            setAcademicYears(yearsRes.data);
            setDepartments(deptRes.data);
        } catch (error) {
            message.error("Lỗi khi tải dữ liệu danh mục.");
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
        onFilter: (value, record) =>
            record[dataIndex]?.toString().toLowerCase().includes(value.toLowerCase()),
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

    // const handleDetail = (record) => {
    //     setIsModalOpen(false);
    //     setSelectedClass(null);

    //     setTimeout(() => {
    //         setSelectedClass(record);
    //         setIsModalOpen(true);
    //     }, 0);
    // };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    const columns = [
        {
            title: 'Mã lớp',
            dataIndex: 'class_code',
            key: 'class_code',
            ...getColumnSearchProps('class_code'),
        },
        {
            title: 'Tên lớp',
            dataIndex: 'class_name',
            key: 'class_name',
            ...getColumnSearchProps('class_name'),
        },
        {
            title: 'Năm học',
            dataIndex: 'academic_year',
            key: 'academic_year',
            ...getColumnSearchProps('academic_year_name'),
            render: (_, record) => {
                const year = record.academic_year;
                return (
                        <Tooltip
                            title={
                                <>
                                    <div>Mã năm học: {year?.academic_year_code || '—'}</div>
                                </>
                            }
                        >
                            <Tag color="blue">
                                {year?.academic_year_name || '—'}
                            </Tag>
                        </Tooltip>
                    )
            }
        },
        {
            title: 'Tên khoa',
            dataIndex: 'department',
            key: 'department',
            ...getColumnSearchProps('department_name'),
            render: (_, record) => {
                const dept = record.department;
                return (
                    <Tooltip
                        title={
                            <>
                                <div>Mã khoa: {dept?.department_code || '—'}</div>
                            </>
                        }
                    >
                        <Tag color="blue">
                            {dept?.department_name || '—'}
                        </Tag>
                    </Tooltip>
                )
            }
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            filters: [
                { text: 'Đang hoạt động', value: '1' },
                { text: 'Đã khóa', value: '0' },
            ],
            onFilter: (value, record) => record.status === value,
            render: (_, record) => {
                if (record.status === '1' || record.status === 1) {
                    return <Tag color="green">Đang hoạt động</Tag>;
                } else if (record.status === '0' || record.status === 0) {
                    return <Tag color="red">Đã khóa</Tag>;
                } else {
                    return <Tag color="default">---</Tag>;
                }
            }
        },        
        {
            title: 'Thao tác',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    {/* <Button size="small" onClick={() => handleDetail(record)}>Chi tiết</Button> */}
                    <Button type='primary' size="small" onClick={() => handleEdit(record)}>Cập nhật</Button>
                </Space>
            ),
        },
    ];

    const handleEdit = (record) => {
        setSelectedClass(record);
    
        const updatedForm = {
            class_name: record.class_name,
            academic_year: record.academic_year?.academic_year_code || '',
            department: record.department?.department_code || '',
            status: record.status || '1',
        };
    
        setEditForm(updatedForm);
        form.setFieldsValue(updatedForm);
    
        setIsEditModalOpen(true);
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
                        <h1 className="text-2xl font-bold">Quản lý lớp học</h1>
                        <Space>
                            <Button
                                type="default"
                                icon={<ReloadOutlined />}
                                onClick={fetchClasses}
                            >
                                Làm mới
                            </Button>
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                href="/admin/academics/classes/create"
                            >
                                Thêm lớp học
                            </Button>
                        </Space>
                    </div>

                    <Table
                        rowKey="class_id"
                        columns={columns}
                        dataSource={classes}
                        loading={loading}
                        rowSelection={{
                            selectedRowKeys,
                            onChange: setSelectedRowKeys
                        }}
                        pagination={{ pageSize: 10 }}
                        bordered
                        scroll={{ x: 'max-content' }}
                    />

                    {selectedClass && (
                        <Modal
                            title="Thông tin chi tiết lớp học"
                            open={isModalOpen}
                            onCancel={handleCancel}
                            footer={[
                                <Button key="close" onClick={handleCancel}>
                                    Đóng
                                </Button>
                            ]}
                            destroyOnHidden
                        >
                            <Descriptions
                                bordered
                                column={1}
                                size="small"
                            >
                                <Descriptions.Item label="Mã lớp">{selectedClass.class_code}</Descriptions.Item>
                                <Descriptions.Item label="Tên lớp">{selectedClass.class_name}</Descriptions.Item>
                                <Descriptions.Item label="Năm học">
                                    {selectedClass.academic_year?.academic_year_name} - {selectedClass.academic_year?.academic_year_code}
                                </Descriptions.Item>
                                <Descriptions.Item label="Khoa">{selectedClass.department?.department_name}</Descriptions.Item>
                                <Descriptions.Item label="Trạng thái">
                                    {selectedClass.status === '1' ? <Tag color="green">Hoạt động</Tag> : <Tag color="red">Không hoạt động</Tag>}
                                </Descriptions.Item>
                                <Descriptions.Item label="Ngày tạo">
                                    {dayjs(selectedClass.created_at).format('HH:mm DD/MM/YYYY')}
                                </Descriptions.Item>
                            </Descriptions>
                        </Modal>
                    )}

                    <Modal
                        title="Sửa thông tin lớp học"
                        open={isEditModalOpen}
                        onCancel={() => setIsEditModalOpen(false)}
                        onOk={() => form.submit()}
                        okText="Lưu"
                    >
                        <Form
                            layout="vertical"
                            form={form}
                            onFinish={async (values) => {
                                try {
                                    await api.put(`classes/update/${selectedClass.class_id}/`, {
                                        class_name: values.class_name,
                                        academic_year_code: values.academic_year,
                                        department_code: values.department,
                                        status: values.status, 
                                    });
                                    message.success("Cập nhật thành công!");
                                    fetchClasses();
                                    setIsEditModalOpen(false);
                                } catch (error) {
                                    message.error("Cập nhật thất bại.");
                                }
                            }}
                        >
                            <Form.Item
                                name="class_name"
                                label="Tên lớp"
                                rules={[{ required: true, message: 'Vui lòng nhập tên lớp' }]}
                            >
                                <Input placeholder="Nhập tên lớp" />
                            </Form.Item>

                            <Form.Item
                                name="academic_year"
                                label="Năm học"
                                rules={[{ required: true, message: 'Vui lòng chọn năm học' }]}
                            >
                                <Select
                                    showSearch
                                    placeholder="Chọn năm học"
                                    optionFilterProp="children"
                                    filterOption={(input, option) =>
                                        option.children.toLowerCase().includes(input.toLowerCase())
                                    }
                                >
                                    {academicYears.map((y) => (
                                        <Option key={y.academic_year_code} value={y.academic_year_code}>
                                            {y.academic_year_name}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>

                            <Form.Item
                                name="department"
                                label="Khoa"
                                rules={[{ required: true, message: 'Vui lòng chọn khoa' }]}
                            >
                                <Select
                                    showSearch
                                    placeholder="Chọn khoa"
                                    optionFilterProp="children"
                                    filterOption={(input, option) =>
                                        option.children.toLowerCase().includes(input.toLowerCase())
                                    }
                                >
                                    {departments.map((d) => (
                                        <Option key={d.department_code} value={d.department_code}>
                                            {d.department_name}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>

                            <Form.Item
                                name="status"
                                label="Trạng thái"
                                rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
                            >
                                <Select placeholder="Chọn trạng thái">
                                    <Option value="1">Đang hoạt động</Option>
                                    <Option value="0">Đã khoá</Option>
                                </Select>
                            </Form.Item>
                        </Form>
                    </Modal>
                </main>
            </Layout>
        </Layout>
    );
}