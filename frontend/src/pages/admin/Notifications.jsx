import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Layout, Input, Table, Button, Space, Tag, DatePicker, message
} from 'antd';
import {
    SearchOutlined,
    ReloadOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import Sidebar from '../../components/Layout/Sidebar';
import Navbar from '../../components/Layout/Navbar';
import Highlighter from 'react-highlight-words';
import dayjs from 'dayjs';
import api from '../../api/axiosInstance';

const { Header } = Layout;
const { RangePicker } = DatePicker;

export default function NotificationManagement() {
    const { t } = useTranslation();
    const [collapsed, setCollapsed] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [searchedColumn, setSearchedColumn] = useState('');
    const searchInput = useRef(null);

    const [loading, setLoading] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [filteredNotifications, setFilteredNotifications] = useState([]);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [dateRange, setDateRange] = useState([]);
    const [readStatus, setReadStatus] = useState('all');
    const [user, setUser] = useState(null);

    useEffect(() => {
        let intervalId;

        const fetchUserAndNotifications = async () => {
            try {
                const res = await api.get("/accounts/me/", { withCredentials: true });
                setUser(res.data);

                if (res.data?.account_id) {
                    fetchNotifications(res.data.account_id);
                }
            } catch (err) {
                setUser(null);
            }
        };

        fetchUserAndNotifications();

        intervalId = setInterval(() => {
            if (user?.account_id) {
                fetchNotifications(user.account_id);
            }
        }, 5000);

        return () => clearInterval(intervalId);
    }, [user?.account_id]);

    const fetchNotifications = async (accountId) => {
        setLoading(true);
        try {
            const res = await api.get(`notifications/${accountId}/all/`);
            setNotifications(Array.isArray(res.data) ? res.data : []);
        } catch (error) {
            message.error("Không tải được thông báo.");
            setNotifications([]);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = useCallback(() => {
        let filtered = [...notifications];
    
        if (readStatus === 'read') {
            filtered = filtered.filter(n => n.is_read === '1' || n.is_read === true);
        } else if (readStatus === 'unread') {
            filtered = filtered.filter(n => n.is_read === '0' || n.is_read === false);
        }
    
        if (dateRange.length === 2) {
            const [start, end] = dateRange;
            filtered = filtered.filter(n => {
                const created = dayjs(n.created_at);
                return created.isAfter(start.startOf('day')) && created.isBefore(end.endOf('day'));
            });
        }
    
        setFilteredNotifications(filtered);
    }, [notifications, dateRange, readStatus]); 

    useEffect(() => {
        applyFilters();
    }, [applyFilters]);

    const getColumnSearchProps = (dataIndex) => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
            <div style={{ padding: 8 }}>
                <Input
                    ref={searchInput}
                    placeholder={`Tìm ${dataIndex}`}
                    value={selectedKeys[0]}
                    onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
                    style={{ width: 188, marginBottom: 8, display: 'block' }}
                />
                <Space>
                    <Button
                        type="primary"
                        icon={<SearchOutlined />}
                        size="small"
                        onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
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
            title: 'Tiêu đề',
            dataIndex: 'title',
            key: 'title',
            ...getColumnSearchProps('title'),
        },
        {
            title: 'Nội dung',
            dataIndex: 'content',
            key: 'content',
        },
        {
            title: 'Trạng thái',
            dataIndex: 'is_read',
            key: 'is_read',
            filters: [
                { text: 'Đã đọc', value: '1' },
                { text: 'Chưa đọc', value: '0' },
            ],
            onFilter: (value, record) =>
                String(record.is_read) === value,
            render: (is_read) => (
                <Tag color={is_read === '1' ? 'blue' : 'red'}>
                    {is_read === '1' ? 'Đã đọc' : 'Chưa đọc'}
                </Tag>
            )
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'created_at',
            key: 'created_at',
            render: (date) => dayjs(date).format('DD/MM/YYYY HH:mm'),
        },
    ];

    const handleMarkAsRead = async () => {
        const user = JSON.parse(localStorage.getItem('user'));
        const accountId = user?.account_id;
        try {
            const res = await api.post(`notifications/${accountId}/mark-read/`, { 
                notification_id: selectedRowKeys 
            });
    
            if (res.status === 200) {
                message.success("Đã đánh dấu đã đọc.");
                setSelectedRowKeys([]);
            } else {
                message.error("Không thể đánh dấu đã đọc.");
            }
        } catch (err) {
            console.error(err);
            message.error("Lỗi hệ thống.");
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
                    <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-6">
                        <h1 className="text-2xl font-bold">Quản lý thông báo</h1>

                        <div className="flex flex-wrap gap-2 items-center">
                            <RangePicker
                                onChange={(dates) => setDateRange(dates || [])}
                                format="DD/MM/YYYY"
                                className="w-full sm:w-auto"
                            />
                            <Button
                                type={readStatus === 'all' ? 'primary' : 'default'}
                                onClick={() => setReadStatus('all')}
                            >
                                Tất cả
                            </Button>
                            <Button
                                type={readStatus === 'read' ? 'primary' : 'default'}
                                onClick={() => setReadStatus('read')}
                            >
                                Đã đọc
                            </Button>
                            <Button
                                type={readStatus === 'unread' ? 'primary' : 'default'}
                                onClick={() => setReadStatus('unread')}
                            >
                                Chưa đọc
                            </Button>
                            <Button
                                icon={<ReloadOutlined />}
                                onClick={fetchNotifications}
                            >
                                Làm mới
                            </Button>
                            <Button
                                type="default"
                                disabled={selectedRowKeys.length === 0}
                                onClick={handleMarkAsRead}
                            >
                                Đánh dấu đã đọc
                            </Button>
                        </div>
                    </div>

                    <div className="w-full overflow-x-auto">
                        <Table
                            rowKey="notification_id"
                            columns={columns}
                            dataSource={filteredNotifications}
                            loading={loading}
                            rowSelection={{
                                selectedRowKeys,
                                onChange: setSelectedRowKeys
                            }}
                            pagination={{ pageSize: 10 }}
                            bordered
                            scroll={{ x: 'max-content' }}
                        />
                    </div>
                </main>
            </Layout>
        </Layout>
    );
}
