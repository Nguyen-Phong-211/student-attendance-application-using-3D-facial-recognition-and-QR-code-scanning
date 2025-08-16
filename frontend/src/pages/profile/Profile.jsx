import React, { useEffect, useState } from "react";
import {
    UserOutlined,
    HistoryOutlined,
    NotificationOutlined,
    QuestionCircleOutlined,
    BugOutlined,
    LogoutOutlined,
    RightOutlined,
    HomeOutlined,
    SnippetsOutlined,
} from "@ant-design/icons";
import { Avatar, Breadcrumb, Button, Typography } from "antd";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer";

const { Title } = Typography;

const menuItems = [
    { key: "personal", label: "Thông tin cá nhân", icon: <UserOutlined /> },
    { key: "attendance", label: "Lịch sử điểm danh", icon: <HistoryOutlined /> },
    { key: "notification", label: "Thông báo", icon: <NotificationOutlined /> },
    { key: "guide", label: "Hướng dẫn sử dụng", icon: <QuestionCircleOutlined /> },
    { key: "report", label: "Báo cáo lỗi", icon: <BugOutlined /> },
    { key: "logout", label: "Đăng xuất", icon: <LogoutOutlined />, danger: true },
];

export default function ProfilePage() {
    const [selectedKey, setSelectedKey] = useState("personal");
    const [user, setUser] = useState({
        name: "Nguyễn Phong",
        phone: "0825025347",
        gender: "Nam",
        dob: "05-05-2003",
    });

    console.log(user);


    useEffect(() => {
        document.title = "ATTEND 3D - Thông tin tài khoản";

        const storedUser = localStorage.getItem("user");
        if (storedUser && storedUser !== "undefined") {
            try {
                setUser(JSON.parse(storedUser));
            } catch (err) {
                console.error("Error parsing user from localStorage:", err);
                localStorage.removeItem("user");
            }
        }
    }, []);

    const renderContent = () => {
        switch (selectedKey) {
            case "personal":
                return (
                    <div className="bg-white rounded-xl p-8 border">
                        <Title level={4}>Thông tin cá nhân</Title>
                        <div className="flex flex-col items-center mt-4">
                            <Avatar size={80} icon={<UserOutlined />} className="mb-4" />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-lg text-gray-500">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Họ và tên</span>
                                    <span className="font-medium">{user.name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Số điện thoại</span>
                                    <span className="font-medium">{user.phone}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Giới tính</span>
                                    <span className="font-medium">{user.gender}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Ngày sinh</span>
                                    <span className="font-medium">{user.dob}</span>
                                </div>
                            </div>
                            <Button type="primary" size="large" className="mt-6 rounded-full px-6">
                                Chỉnh sửa thông tin
                            </Button>
                        </div>
                    </div>
                );
            case "attendance":
                return (
                    <div className="bg-white p-6 rounded-xl border">
                        <Title level={4}>Lịch sử điểm danh</Title>
                        <p className="text-gray-500">Hiển thị lịch sử điểm danh tại đây...</p>
                    </div>
                );
            case "notification":
                return (
                    <div className="bg-white p-6 rounded-xl border">
                        <Title level={4}>Thông báo</Title>
                        <p className="text-gray-500">Thông báo gần đây...</p>
                    </div>
                );
            case "guide":
                return (
                    <div className="bg-white p-6 rounded-xl border">
                        <Title level={4}>Hướng dẫn sử dụng</Title>
                        <p className="text-gray-500">Hướng dẫn chi tiết...</p>
                    </div>
                );
            case "report":
                return (
                    <div className="bg-white p-6 rounded-xl border">
                        <Title level={4}>Báo cáo lỗi</Title>
                        <p className="text-gray-500">Biểu mẫu gửi lỗi...</p>
                    </div>
                );
            case "logout":
                return (
                    <div className="bg-white p-6 rounded-xl text-red-500 border">
                        <Title level={4}>Bạn đã đăng xuất</Title>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen flex flex-col">
            <div className="w-full mx-auto px-6 flex-grow">
                <Header />

                <main className="mt-10 flex flex-col">
                    <div className="w-full px-2 md:px-4 mb-4">
                        <Breadcrumb
                            items={[
                                { href: "/", title: <HomeOutlined /> },
                                {
                                    href: "/profile",
                                    title: (
                                        <>
                                            <SnippetsOutlined />
                                            <span> Thông tin tài khoản</span>
                                        </>
                                    ),
                                },
                                { title: "Thông tin tài khoản" },
                            ]}
                        />
                    </div>

                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="w-full md:w-1/4 bg-white rounded-xl shadow p-4">
                            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg p-4 text-white text-center mb-4">
                                <Avatar size={64} icon={<UserOutlined />} className="mx-auto mb-2" />
                                <div className="font-semibold text-lg">{user.name}</div>
                                <div className="text-sm">{user.phone}</div>
                            </div>

                            <ul className="space-y-2">
                                {menuItems.map((item) => (
                                    <li
                                        key={item.key}
                                        onClick={() => setSelectedKey(item.key)}
                                        className={`flex justify-between items-center p-3 rounded-lg cursor-pointer transition ${selectedKey === item.key
                                                ? "bg-blue-100 text-blue-700 font-semibold"
                                                : "hover:bg-gray-100"
                                            } ${item.danger ? "text-red-500 hover:bg-red-100" : ""}`}
                                    >
                                        <div className="flex items-center gap-2">
                                            {item.icon}
                                            <span>{item.label}</span>
                                        </div>
                                        <RightOutlined />
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="flex-1">{renderContent()}</div>
                    </div>
                </main>
            </div>

            <Footer />
        </div>
    );
}
