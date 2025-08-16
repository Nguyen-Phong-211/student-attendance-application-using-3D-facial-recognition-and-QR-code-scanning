import React, { useState, useEffect, useRef } from 'react';
import { Layout, Input, Table, Button, Tag, Row, Col } from 'antd';
import {
    SearchOutlined,
    PlusOutlined
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import Sidebar from '../../../components/Layout/Sidebar';
import Navbar from '../../../components/Layout/Navbar';
import Highlighter from 'react-highlight-words';

const { Header } = Layout;

export default function RoleManagement() {
    const { t } = useTranslation();
    const [collapsed, setCollapsed] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const [roles, setRoles] = useState([]);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [searchedColumn, setSearchedColumn] = useState('');
    const searchInput = useRef(null);

    useEffect(() => {
        document.title = "ATTEND 3D - Role Management";
        setRoles([
            { key: '1', roleId: 'R001', name: 'Admin', description: 'Quản trị hệ thống', status: 'Hoạt động' },
            { key: '2', roleId: 'R002', name: 'Giảng viên', description: 'Quản lý lớp học', status: 'Hoạt động' },
            { key: '3', roleId: 'R003', name: 'Sinh viên', description: 'Học viên', status: 'Không hoạt động' }
        ]);
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
            title: 'ID',
            dataIndex: 'roleId',
            key: 'roleId',
            width: 80,
            ...getColumnSearchProps('roleId')
        },
        {
            title: 'Tên vai trò',
            dataIndex: 'name',
            key: 'name',
            ...getColumnSearchProps('name')
        },
        {
            title: 'Mô tả',
            dataIndex: 'description',
            key: 'description',
            ...getColumnSearchProps('description')
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <Tag color={status === 'Hoạt động' ? 'green' : 'red'}>{status}</Tag>
            ),
            ...getColumnSearchProps('status')
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => (
                <div className="flex gap-2">
                    <Button size="small">Chi tiết</Button>
                    <Button danger size="small">Tạm dừng</Button>
                </div>
            )
        }
    ];

    const filteredRoles = roles.filter(role =>
        role.name.toLowerCase().includes(searchValue.toLowerCase()) ||
        role.description.toLowerCase().includes(searchValue.toLowerCase())
    );

    const rowSelection = {
        selectedRowKeys,
        onChange: (newSelectedKeys) => {
            setSelectedRowKeys(newSelectedKeys);
        },
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
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold">{t('Role Management')}</h1>
                    </div>

                    <Row gutter={[16, 16]} className="mb-4">
                        <Col xs={24} sm={12} md={8}>
                            <Button type="primary" size='large' icon={<PlusOutlined />} href='/admin/management/role/create'>{t('Add Role')}</Button>
                        </Col>
                    </Row>

                    <Table
                        rowSelection={rowSelection}
                        columns={columns}
                        dataSource={filteredRoles}
                        pagination={{ pageSize: 10 }}
                        scroll={{ x: 1000 }}
                        bordered
                    />
                </main>
            </Layout>
        </Layout>
    );
}