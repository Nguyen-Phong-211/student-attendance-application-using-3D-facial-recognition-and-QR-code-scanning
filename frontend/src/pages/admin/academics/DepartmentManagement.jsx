import React, { useState, useEffect, useRef } from 'react';
import { Layout, Input, Table, Button, Space, message } from 'antd';
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

export default function DepartmentManagement() {
    const { t } = useTranslation();
    const [collapsed, setCollapsed] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [searchedColumn, setSearchedColumn] = useState('');
    const searchInput = useRef(null);

    const [loading, setLoading] = useState(false);
    const [departments, setDepartments] = useState([]);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);

    useEffect(() => {
        document.title = "ATTEND 3D - Department Management";
        fetchDepartments();
    }, []);

    const fetchDepartments = async () => {
        try {
            setLoading(true);
            const res = await api.get("departments/all/");
            const data = await res.data;
            setDepartments(data);
        } catch (error) {
            message.error("Lỗi khi tải danh sách khoa.");
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

    const columns = [
        {
            title: 'Mã khoa',
            dataIndex: 'department_code',
            key: 'departmentCode',
            ...getColumnSearchProps('departmentCode'),
        },
        {
            title: 'Tên khoa',
            dataIndex: 'department_name',
            key: 'departmentName',
            ...getColumnSearchProps('departmentName'),
        },
        {
            title: 'Hành động',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Button size="small" onClick={() => handleDetail(record)}>Chi tiết</Button>
                    <Button size="small" danger onClick={() => handleDelete(record)}>Xóa</Button>
                </Space>
            ),
        },
    ];

    const handleDetail = (department) => {
        console.log("Chi tiết khoa", department);
    };

    const handleDelete = async (department) => {
        try {
            await fetch(`/api/departments/${department.departmentId}`, {
                method: 'DELETE',
            });
            message.success("Xoá thành công!");
            fetchDepartments();
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
                        <h1 className="text-2xl font-bold">Quản lý khoa/viện</h1>
                        <Space>
                            <Button
                                type="default"
                                icon={<ReloadOutlined />}
                                onClick={fetchDepartments}
                            >
                                Làm mới
                            </Button>
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                href="/admin/departments/create"
                            >
                                Thêm khoa
                            </Button>
                        </Space>
                    </div>

                    <Table
                        rowKey="departmentId"
                        columns={columns}
                        dataSource={departments}
                        loading={loading}
                        rowSelection={{
                            selectedRowKeys,
                            onChange: setSelectedRowKeys
                        }}
                        pagination={{ pageSize: 10 }}
                        bordered
                        scroll={{ x: 'max-content' }}
                    />
                </main>
            </Layout>
        </Layout>
    );
}
