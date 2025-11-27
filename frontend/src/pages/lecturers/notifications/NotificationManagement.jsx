// NotificationManagement.js
import React, { useState, useEffect, useCallback } from 'react';
import { Layout, Tag, message } from 'antd';
import Sidebar from "../../../components/Layout/Sidebar";
import Navbar from '../../../components/Layout/Navbar';
import api from '../../../api/axiosInstance';
import { getAccountId } from '../../../utils/auth';
import FiltersPanel from './FiltersPanel';
import NotificationTable from './NotificationTable';
import dayjs from 'dayjs';

const { Header } = Layout;

export default function NotificationManagement() {
    const [collapsed, setCollapsed] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [filteredNotifications, setFilteredNotifications] = useState([]);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [dateRange, setDateRange] = useState([]);
    const [readStatus, setReadStatus] = useState('all');
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [searchedColumn, setSearchedColumn] = useState('');

    const accountId = getAccountId();

    useEffect(() => { document.title = "ATTEND 3D - Thông báo"; }, []);

    const fetchNotifications = useCallback(async () => {
        if (!accountId) return;
        setLoading(true);
        try {
            const res = await api.get(`notifications/${accountId}/all/`);
            const data = Array.isArray(res.data) ? res.data : [];
            const sanitizedData = data
                .filter(n => n.notification_id || n.id)
                .map(n => ({ ...n, notification_id: n.notification_id || n.id }));
            setNotifications(sanitizedData);
            setSelectedRowKeys([]);
        } catch {
            message.error("Không tải được thông báo.");
            setNotifications([]);
            setSelectedRowKeys([]);
        } finally { setLoading(false); }
    }, [accountId]);

    useEffect(() => {
        fetchNotifications();
        const intervalId = setInterval(fetchNotifications, 5000);
        return () => clearInterval(intervalId);
    }, [fetchNotifications]);

    // Filter
    useEffect(() => {
        let filtered = [...notifications];
        if (readStatus === 'read') filtered = filtered.filter(n => n.is_read === '1' || n.is_read === true);
        if (readStatus === 'unread') filtered = filtered.filter(n => n.is_read === '0' || n.is_read === false);
        if (dateRange.length === 2) {
            const [start, end] = dateRange;
            filtered = filtered.filter(n => {
                const created = dayjs(n.created_at);
                return created.isAfter(start.startOf('day')) && created.isBefore(end.endOf('day'));
            });
        }
        setFilteredNotifications(filtered);
    }, [notifications, readStatus, dateRange]);

    const handleMarkAsRead = async () => {
        if (!accountId) return message.error("Không tìm thấy tài khoản.");
        const validIds = selectedRowKeys.filter(id => id != null);
        if (validIds.length === 0) return message.warning("Chọn thông báo hợp lệ để đánh dấu đã đọc.");
        try {
            const res = await api.post(`notifications/${accountId}/mark-read/`, { notification_id: validIds });
            const updatedCount = res.data?.updated_count || validIds.length;
            if (res.status === 200 && updatedCount > 0) {
                message.success(`Đã đánh dấu ${updatedCount} thông báo.`);
                fetchNotifications();
            } else { message.warning("Không có thông báo nào được cập nhật."); }
        } catch { message.error("Lỗi hệ thống."); }
    };

    const onSelectChange = keys => setSelectedRowKeys(keys);

    const columns = [
        { title: 'Tiêu đề', dataIndex: 'title', key: 'title' },
        { title: 'Nội dung', dataIndex: 'content', key: 'content' },
        {
            title: 'Trạng thái', dataIndex: 'is_read', key: 'is_read',
            filters: [
                { text: 'Đã đọc', value: '1' },
                { text: 'Chưa đọc', value: '0' }
            ],
            onFilter: (value, record) => String(record.is_read) === value,
            render: is_read => <Tag color={is_read === '1' ? 'blue' : 'red'}>{is_read === '1' ? 'Đã đọc' : 'Chưa đọc'}</Tag>
        },
        { title: 'Ngày tạo', dataIndex: 'created_at', key: 'created_at', render: date => dayjs(date).format('DD/MM/YYYY HH:mm') }
    ];

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} t={() => { }} />
            <Layout>
                <Header className="bg-white px-4 flex justify-between items-center border-b"><Navbar /></Header>
                <main className="mx-4 my-4 p-4 sm:p-6 bg-white rounded shadow">
                    <h1 className="text-2xl font-bold mb-4">Quản lý thông báo</h1>
                    <FiltersPanel
                        dateRange={dateRange} setDateRange={setDateRange}
                        readStatus={readStatus} setReadStatus={setReadStatus}
                        fetchNotifications={fetchNotifications}
                        selectedRowKeys={selectedRowKeys} handleMarkAsRead={handleMarkAsRead}
                    />
                    <NotificationTable
                        filteredNotifications={filteredNotifications}
                        loading={loading}
                        selectedRowKeys={selectedRowKeys}
                        onSelectChange={onSelectChange}
                        columns={columns}
                        searchText={searchText} setSearchText={setSearchText}
                        searchedColumn={searchedColumn} setSearchedColumn={setSearchedColumn}
                    />
                </main>
            </Layout>
        </Layout>
    );
}