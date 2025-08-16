import React, { useState, useEffect, useRef } from 'react';
import { Layout, Input, Table, Button, Tag, Space, message } from 'antd';
import {
    SearchOutlined,
    PlusOutlined,
    ReloadOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import Sidebar from '../../../components/Layout/Sidebar';
import Navbar from '../../../components/Layout/Navbar';
import Highlighter from 'react-highlight-words';

const { Header } = Layout;

export default function RoomManagement() {
    const { t } = useTranslation();
    const [collapsed, setCollapsed] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [searchedColumn, setSearchedColumn] = useState('');
    const searchInput = useRef(null);

    const [loading, setLoading] = useState(false);
    const [rooms, setRooms] = useState([]);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);

    useEffect(() => {
        document.title = "ATTEND 3D - Room Management";
        fetchRooms();
    }, []);

    const fetchRooms = async () => {
        const token = localStorage.getItem("access_token");
        try {
            setLoading(true);
            const res = await fetch('http://127.0.0.1:8000/api/v1/rooms/all/', {
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
            }); 
            const data = await res.json();
            setRooms(data);
        } catch (error) {
            message.error("Lỗi khi tải danh sách phòng.");
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
            title: 'Mã phòng',
            dataIndex: 'room_id',
            key: 'roomId',
            ...getColumnSearchProps('roomId'),
        },
        {
            title: 'Tên phòng',
            dataIndex: 'room_name',
            key: 'roomName',
            ...getColumnSearchProps('roomName'),
        },
        {
            title: 'Loại phòng',
            dataIndex: 'room_type',
            key: 'roomType',
            filters: [
                { text: 'Lý thuyết', value: 'Lý thuyết' },
                { text: 'Thực hành', value: 'Thực hành' },
            ],
            onFilter: (value, record) => record.roomType.includes(value),
        },
        {
            title: 'Sức chứa',
            dataIndex: 'capacity',
            key: 'capacity',
        },
        {
            title: 'Vĩ độ',
            dataIndex: 'latitude',
            key: 'latitude',
            render: (value) => value ?? <span className="text-gray-400 italic">Chưa có</span>,
        },
        {
            title: 'Kinh độ',
            dataIndex: 'longitude',
            key: 'longitude',
            render: (value) => value ?? <span className="text-gray-400 italic">Chưa có</span>,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
              <Tag color={status === '1' ? 'green' : 'volcano'}>
                {status === '1' ? 'Hoạt động' : 'Bảo trì'}
              </Tag>
            ),
            filters: [
              { text: 'Hoạt động', value: 1 },
              { text: 'Bảo trì', value: 0 },
            ],
            onFilter: (value, record) => record.status === value,
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

    const handleDetail = (room) => {
        console.log("Chi tiết phòng", room);
        // Chuyển đến trang chi tiết / hoặc hiển thị modal
    };

    const handleDelete = async (room) => {
        try {
            await fetch(`/api/rooms/${room.id}`, {
                method: 'DELETE',
            });
            message.success("Xoá thành công!");
            fetchRooms();
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
                        <h1 className="text-2xl font-bold">{t('Quản lý phòng học')}</h1>
                        <Space>
                            <Button
                                type="default"
                                icon={<ReloadOutlined />}
                                onClick={fetchRooms}
                            >
                                Làm mới
                            </Button>
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                href="/admin/rooms/create"
                            >
                                Thêm phòng
                            </Button>
                        </Space>
                    </div>

                    <Table
                        rowKey="id"
                        columns={columns}
                        dataSource={rooms}
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