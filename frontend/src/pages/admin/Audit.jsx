import React, { useState, useEffect } from 'react';
import {
    Layout, Button, message, Tag, Typography, Space
} from 'antd';
import Sidebar from '../../components/Layout/Sidebar';
import Navbar from '../../components/Layout/Navbar';
import dayjs from 'dayjs';
import api from '../../api/axiosInstance';
import {logout} from '../../utils/auth';
import TabAuditTransaction from '../../components/Tab/AuditTransaction';

const { Header } = Layout;
const { Title } = Typography;

export default function Audit() {
    useEffect(() => {
        document.title = "ATTEND 3D - Giám sát hệ thống";
    }, []);

    const [collapsed, setCollapsed] = useState(false);
    const [loading, setLoading] = useState(false);
    const [loginLogs, setLoginLogs] = useState([]);
    const [auditLogs, setAuditLogs] = useState([]);

    // Fetch API login logs
    const fetchLoginLogs = async () => {
        setLoading(true);
        try {
            const res = await api.get("audits/admin/login-logs/all/");
            setLoginLogs(res.data || []);
        } catch (err) {
            console.error(err);
            message.error("Không thể tải dữ liệu nhật ký đăng nhập!");
        } finally {
            setLoading(false);
        }
    };

    // Fetch API audit logs
    const fetchAuditLogs = async () => {
        setLoading(true);
        try {
            const res = await api.get("audits/admin/audit-logs/all/");
            setAuditLogs(res.data || []);
        } catch (err) {
            console.error(err);
            message.error("Không thể tải dữ liệu nhật ký quản lý!");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {

        fetchLoginLogs();
        fetchAuditLogs();
    }, []);

    const handleLogout = async (record) => {
        try {
            await api.post(`accounts/admin/force-logout-user/${record.account}/`);
            message.success(`Đã đăng xuất toàn bộ thiết bị của ${record.email}`);
            
            logout();
            fetchLoginLogs();
        } catch (err) {
            message.error("Có lỗi khi đăng xuất người dùng!");
            console.error(err);
        }
    };

    const columnsLoginLogs = [
        {
            title: 'Code',
            dataIndex: 'login_code',
            key: 'login_code',
            width: 80,
        },
        {
            title: 'Tên người dùng',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Địa chỉ IP',
            dataIndex: 'ip_address',
            key: 'ip_address',
        },
        {
            title: 'Tên hệ điều hành',
            key: 'device_info.os',
            render: (record) => record.device_info?.os || '---',
        },
        {
            title: 'Tên thiết bị',
            key: 'device_type',
            render: (record) => {
                const device = record.device_info;
                if (!device) return '---';
                if (device.is_mobile) return 'Điện thoại';
                if (device.is_tablet) return 'Máy tính bảng';
                if (device.is_pc) return 'Máy tính';
                return 'Không xác định';
            },
        },
        {
            title: 'Thiết bị / User Agent',
            dataIndex: 'user_agent',
            key: 'user_agent',
            ellipsis: true,
        },
        {
            title: 'Trạng thái đăng nhập',
            dataIndex: 'status',
            key: 'status',
            render: (status) =>
                status === 'S' ? (
                    <Tag color="green">Thành công</Tag>
                ) : (
                    <Tag color="red">Thất bại</Tag>
                ),
        },
        {
            title: 'Thời gian đăng nhập',
            dataIndex: 'login_time',
            key: 'login_time',
            render: (login_time) =>
                login_time ? dayjs(login_time).format('HH:mm:ss DD/MM/YYYY') : '-',
        },
        {
            title: 'Thời gian đăng xuất',
            dataIndex: 'logout_time',
            key: 'logout_time',
            render: (logout_time) =>
                logout_time ? dayjs(logout_time).format('HH:mm:ss DD/MM/YYYY') : <Tag color='yellow'>Chưa đăng xuất</Tag>,
        },
        {
            title: 'Thao tác',
            dataIndex: 'action',
            key: 'action',
            render: (_, record) =>
                <Space>
                    <Button type='primary' onClick={() => handleLogout(record)}>
                        Đăng xuất
                    </Button>
                </Space>
        },
    ];

    const columnsAuditLogs = [
        {
            title: 'Code',
            dataIndex: 'log_code',
            key: 'log_code',
            width: 80,
        },
        {
            title: 'Thao tác',
            dataIndex: 'operation',
            key: 'operation',
            render: (operation) => {
                if (operation === "C") {
                    return <Tag color="green">Tạo mới</Tag>;
                } else if (operation === "U") {
                    return <Tag color="blue">Cập nhật</Tag>;
                } else if (operation === "D") {
                    return <Tag color="red">Xóa</Tag>;
                }
            }
        },
        {
            title: 'Dữ liệu thao tác cũ',
            dataIndex: 'old_data',
            key: 'old_data',
            render: (data) => JSON.stringify(data),
        },
        {
            title: 'Dữ liệu thao tác mới',
            dataIndex: 'new_data',
            key: 'new_data',
            render: (data) => JSON.stringify(data),
        },
        {
            title: 'Thời gian thực hiện',
            dataIndex: 'created_at',
            key: 'created_at',
            render: (time) => dayjs(time).format('HH:mm:ss DD/MM/YYYY'),
        },
        {
            title: 'Thao tác trên bảng',
            dataIndex: 'module_name',
            key: 'module_name',
        },
    ];

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
            <Layout>
                <Header className="bg-white px-4 flex justify-between items-center border-b">
                    <Navbar />
                </Header>

                <main className="mx-4 my-4 p-4 sm:p-6 bg-white rounded shadow">
                    <Title level={3}>Giám sát hệ thống</Title>
                    <TabAuditTransaction
                        fetchAuditLogs={fetchAuditLogs}
                        loading={loading}
                        columnsAuditLogs={columnsAuditLogs}
                        auditLogs={auditLogs}
                        fetchLoginLogs={fetchLoginLogs}
                        loginLogs={loginLogs}
                        columnsLoginLogs={columnsLoginLogs}
                    />
                </main>
            </Layout>
        </Layout>
    );
}