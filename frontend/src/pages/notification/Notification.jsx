import React, { useEffect, useState, useCallback } from "react";
import {
    Button,
    Breadcrumb,
    Card,
    Spin,
    message,
    Tag,
    Checkbox,
    Table,
} from "antd";
import { HomeOutlined, BellOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import Header from "../../components/Layout/Header";
import Footer from "../../components/Layout/Footer";
import api from "../../api/axiosInstance";

export default function NotificationPage() {
    const { t } = useTranslation();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("all");

    const user = JSON.parse(localStorage.getItem("user"));
    const accountId = user?.account_id;

    const fetchNotifications = useCallback(
        async (type) => {
            if (!accountId) return;
            setLoading(true);

            let url = `/notifications/${accountId}/all/`;
            if (type === "unread") url = `/notifications/${accountId}/unread/`;
            if (type === "read") url = `/notifications/${accountId}/read/`;

            try {
                const res = await api.get(url);
                setNotifications(Array.isArray(res.data) ? res.data : []);
            } catch (error) {
                console.error("API error:", error);
                message.error("Không tải được thông báo.");
                setNotifications([]);
            } finally {
                setLoading(false);
            }
        },
        [accountId]
    );

    useEffect(() => {
        fetchNotifications(activeTab);
    }, [accountId, activeTab, fetchNotifications, t]);

    const markAsRead = async (notificationId) => {
        try {
          await api.post(`/notifications/${accountId}/mark-read/`, {
            notification_id: notificationId,
          });
      
          setNotifications((prev) =>
            prev.map((n) =>
              n.notification_id === notificationId ? { ...n, is_read: "1" } : n
            )
          );
      
          message.success("Đã cập nhật trạng thái thông báo.");
        } catch (error) {
          console.error("Update error:", error);
          message.error("Không thể cập nhật thông báo.");
        }
    };      

    const columns = [
        {
            title: "Cập nhật trạng thái",
            dataIndex: "checkbox",
            key: "checkbox",
            render: (_, record) => (
              <Checkbox
                checked={record.is_read === "1"}
                disabled={record.is_read === "1"}
                onChange={() => markAsRead(record.notification_id)}
              />
            ),
        },
        {
            title: "Thông báo",
            dataIndex: "title",
            key: "title",
            render: (_, record) => (
                <div>
                    <div className="font-medium">{record.title}</div>
                    <div className="text-gray-500">{record.content}</div>
                </div>
            ),
        },
        {
            title: "Thời gian",
            dataIndex: "created_at",
            key: "created_at",
            width: 180,
            render: (value) => (
                <span className="text-sm text-gray-400">
                    {new Date(value).toLocaleString()}
                </span>
            ),
        },
        {
            title: "Trạng thái",
            dataIndex: "is_read",
            key: "is_read",
            width: 120,
            render: (value) =>
                value === "0" ? (
                    <Tag color="red">Chưa đọc</Tag>
                ) : (
                    <Tag color="green">Đã đọc</Tag>
                ),
        },
    ];

    return (
        <div className="min-h-screen bg-white text-gray-800 flex flex-col">
            <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 flex-grow">
                <Header />
                <main className="mt-8 flex flex-col items-center">
                    <div className="w-full mb-4">
                        <Breadcrumb
                            items={[
                                {
                                    href: "/",
                                    title: (
                                        <>
                                            <HomeOutlined /> <span>Trang chủ</span>
                                        </>
                                    ),
                                },
                                {
                                    href: "/notifications",
                                    title: (
                                        <>
                                            <BellOutlined /> <span>Thông báo</span>
                                        </>
                                    ),
                                },
                            ]}
                        />
                    </div>

                    <div className="w-full mt-4">
                        <Card
                            className="rounded"
                            title={
                                <div className="flex items-center gap-2 text-lg">
                                    <BellOutlined /> Thông báo
                                </div>
                            }
                            extra={
                                <div className="flex flex-wrap gap-2">
                                    <Button
                                        type={activeTab === "unread" ? "primary" : "default"}
                                        onClick={() => setActiveTab("unread")}
                                    >
                                        Chưa đọc
                                    </Button>
                                    <Button
                                        type={activeTab === "read" ? "primary" : "default"}
                                        onClick={() => setActiveTab("read")}
                                    >
                                        Đã đọc
                                    </Button>
                                    <Button
                                        type={activeTab === "all" ? "primary" : "default"}
                                        onClick={() => setActiveTab("all")}
                                    >
                                        Tất cả
                                    </Button>
                                </div>
                            }
                        >
                            {loading ? (
                                <div className="flex justify-center p-6">
                                    <Spin />
                                </div>
                            ) : (
                                <Table
                                    rowKey="notification_id"
                                    dataSource={notifications}
                                    columns={columns}
                                    pagination={true}
                                    scroll={{ x: true }}
                                />
                            )}
                        </Card>
                    </div>
                </main>
            </div>
            <Footer />
        </div>
    );
}