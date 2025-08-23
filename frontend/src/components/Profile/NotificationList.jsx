import React, { useState, useEffect } from "react";
import { Table, Tag, Button, Row, Col, Spin, Typography, message } from "antd";
import api from '../../api/axiosInstance';

const { Title } = Typography;


export default function NotificationList() {

    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [loading, setLoading] = useState(false);
    const [notifications, setNotifications] = useState([]);

    const user = JSON.parse(localStorage.getItem('user'));
    const accountId = user?.account_id;

    useEffect(() => {
        let isMounted = true;
        let intervalId;
    
        const fetchNotifications = async () => {
            try {
                const res = await api.get(`notifications/${accountId}/all/`);
                if (isMounted) {
                    setNotifications(res.data);
                }
            } catch (error) {
                message.error("Lỗi khi tải danh sách thông báo.");
            } finally {
                if (isMounted) setLoading(false);
            }
        };
    
        if (accountId) {
            fetchNotifications();
            intervalId = setInterval(fetchNotifications, 5000); // 5s 1 lần
        }
    
        return () => {
            isMounted = false;
            clearInterval(intervalId);
        };
    }, [accountId]);    

    const handleMarkAsRead = async () => {
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
        <div className="bg-white p-6 rounded-xl border">
            <Row justify="space-between" align="middle" className="mb-4">
                <Col>
                    <Title level={4} style={{ margin: 0 }}>Thông báo</Title>
                </Col>
                <Col>
                    <Button type="primary" disabled={selectedRowKeys.length === 0}
                        onClick={handleMarkAsRead}>
                        Đánh dấu đọc tất cả
                    </Button>
                </Col>
            </Row>

            {loading ? (
                <Spin />
            ) : notifications.length > 0 ? (
                <Table
                    dataSource={notifications}
                    rowKey="notification_id"
                    pagination={{ pageSize: 10 }}
                    bordered
                    rowSelection={{
                        selectedRowKeys,
                        onChange: setSelectedRowKeys
                    }}
                >
                    <Table.Column
                        title="Tiêu đề"
                        dataIndex="title"
                        key="title"
                        filterSearch
                        filters={[
                            ...Array.from(
                                new Set(notifications.map((n) => n.title))
                            ).map((t) => ({ text: t, value: t })),
                        ]}
                        onFilter={(value, record) => record.title.includes(value)}
                    />

                    <Table.Column
                        title="Nội dung"
                        dataIndex="content"
                        key="content"
                        filterSearch
                        filters={[
                            ...Array.from(
                                new Set(notifications.map((n) => n.content))
                            ).map((c) => ({ text: c, value: c })),
                        ]}
                        onFilter={(value, record) => record.content.includes(value)}
                    />

                    <Table.Column
                        title="Ngày tạo"
                        dataIndex="created_at"
                        key="created_at"
                        render={(created_at) =>
                            new Date(created_at).toLocaleString("vi-VN")
                        }
                        sorter={(a, b) =>
                            new Date(a.created_at) - new Date(b.created_at)
                        }
                    />
                    <Table.Column
                        title="Trạng thái"
                        dataIndex="is_read"
                        key="is_read"
                        render={(is_read) =>
                            is_read === "0" ? <Tag color="red">Chưa đọc</Tag> : <Tag color="green">Đã đọc</Tag>
                        }
                        align="center"
                    />
                </Table>
            ) : (
                <p>Không có thông báo nào.</p>
            )}
        </div>
    );
}