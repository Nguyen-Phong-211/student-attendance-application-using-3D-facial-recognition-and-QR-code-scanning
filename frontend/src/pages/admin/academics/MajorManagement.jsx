import React, { useState, useEffect, useRef } from 'react';
import { Layout, Input, Table, Button, Space, message, Tag, Tooltip, Modal, Form, Select } from 'antd';
import {
    SearchOutlined,
    PlusOutlined,
    ReloadOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import Sidebar from '../../../components/Layout/Sidebar';
import Navbar from '../../../components/Layout/Navbar';
import Highlighter from 'react-highlight-words';
import api from '../../../api/axiosInstance';

const { Header } = Layout;
const { Option } = Select;

export default function MajorManagement() {
    const { t } = useTranslation();
    const [collapsed, setCollapsed] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [searchedColumn, setSearchedColumn] = useState('');
    const searchInput = useRef(null);

    const [loading, setLoading] = useState(false);
    const [majors, setMajors] = useState([]);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedMajor, setSelectedMajor] = useState(null);

    const [departments, setDepartments] = useState([]);

    const [form] = Form.useForm();

    useEffect(() => {
        document.title = "ATTEND 3D - Admin - Quản lý ngành học";

        fetchMajors();
        fetchDepartments();
    }, []);
    const fetchMajors = async () => {
        try {
            setLoading(true);
            const res = await api.get('majors/all/');
            const data = res.data;
            setMajors(data);
        } catch (error) {
            message.error("Lỗi khi tải danh sách ngành học.");
        } finally {
            setLoading(false);
        }
    };

    const fetchDepartments = async () => {
        try {
            const res = await api.get('departments/all/');
            setDepartments(res.data);
        } catch (error) {
            message.error("Lỗi khi tải danh sách khoa.");
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
        onOpenChange: (open) => {
            if (open) {
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

    const columns = [
        {
            title: 'Mã ngành',
            dataIndex: 'major_code',
            key: 'major_code',
            ...getColumnSearchProps('major_code'),
        },
        {
            title: 'Tên ngành',
            dataIndex: 'major_name',
            key: 'major_name',
            ...getColumnSearchProps('major_name'),
        },
        {
            title: 'Tên khoa',
            key: 'department_name',
            ...getColumnSearchProps('department.department_name'),
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
                );
            }
        },
        {
            title: 'Hành động',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Button type='primary' size="small" onClick={() => handleEdit(record)} >Cập nhật</Button>
                </Space>
            ),
        },
    ];

    const handleEdit = (major) => {
        setSelectedMajor(major);
        setIsModalVisible(true);
        form.setFieldsValue({
            major_code: major.major_code,
            major_name: major.major_name,
            department: major.department?.department_id,
        });
    };

    const handleSubmit = async (values) => {
        try {
            await api.put(`majors/update/${selectedMajor.major_id}/`, {
                major_name: values.major_name,
                department_id: values.department,
            });
            message.success('Cập nhật ngành thành công');
            setIsModalVisible(false);
            fetchMajors();
        } catch (err) {
            message.error('Cập nhật thất bại');
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
                        <h1 className="text-2xl font-bold">Quản lý ngành học</h1>
                        <Space>
                            <Button
                                type="default"
                                icon={<ReloadOutlined />}
                                onClick={fetchMajors}
                            >
                                Làm mới
                            </Button>
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                href="/admin/majors/create"
                            >
                                Thêm ngành
                            </Button>
                        </Space>
                    </div>

                    <Table
                        rowKey="major_id"
                        columns={columns}
                        dataSource={majors}
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
                        title="Cập nhật ngành học"
                        open={isModalVisible}
                        onCancel={() => setIsModalVisible(false)}
                        footer={[
                            <Button key="cancel" onClick={() => setIsModalVisible(false)}>Huỷ</Button>,
                            <Button key="submit" type="primary" onClick={() => form.submit()}>
                                Lưu
                            </Button>
                        ]}
                    >
                        {selectedMajor && (
                            <Form layout="vertical" form={form} onFinish={handleSubmit}>
                                <Form.Item label="Mã ngành" name="major_code">
                                    <Input disabled />
                                </Form.Item>

                                <Form.Item
                                    label="Tên ngành"
                                    name="major_name"
                                    rules={[{ required: true, message: 'Vui lòng không để trống tên ngành' }]}
                                >
                                    <Input />
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
                                        {departments.map((dept) => (
                                            <Option key={dept.department_id} value={dept.department_id}>
                                                {dept.department_name}
                                            </Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </Form>
                        )}
                    </Modal>
                </main>
            </Layout>
        </Layout>
    );
}