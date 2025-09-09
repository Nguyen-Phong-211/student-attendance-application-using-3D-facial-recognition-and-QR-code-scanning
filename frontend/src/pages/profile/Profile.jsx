import React, { useEffect, useState } from "react";
import {
    UserOutlined,
    QuestionCircleOutlined,
    LogoutOutlined,
    RightOutlined,
    HomeOutlined,
    SnippetsOutlined,
    UnlockOutlined
} from "@ant-design/icons";
import { Avatar, Breadcrumb, message, Alert } from "antd";
import Footer from "../../components/Layout/Footer";
import PersonalInfo from "../../components/Profile/PersonalInfo";
import ChangePasswordForm from "../../components/Profile/ChangePasswordForm";
import LogoutTab from "../../components/Profile/LogoutTab";
import GuideTab from "../../components/Profile/GuideTab";
import api from "../../api/axiosInstance";
import Header from "../../components/Layout/Header";

const menuItems = [
    { key: "personal", label: "Thông tin cá nhân", icon: <UserOutlined /> },
    { key: "changePassword", label: "Đổi mật khẩu", icon: <UnlockOutlined /> },
    { key: "guide", label: "Hướng dẫn sử dụng", icon: <QuestionCircleOutlined /> },
    { key: "logout", label: "Đăng xuất", icon: <LogoutOutlined />, danger: true },
];

export default function ProfilePage() {
    const [selectedKey, setSelectedKey] = useState("personal");
    const [formData, setFormData] = useState(null);

    const res = localStorage.getItem("user");
    const user = JSON.parse(res);
    const accountId = user.account_id;
    const avatarUrl = user.avatar;

    useEffect(() => {
        document.title = "ATTEND 3D - Thông tin tài khoản";

        const fetchData = async () => {
            try {
                const res = await api.get(`/students/${accountId}/`);
                setFormData(res.data);
            } catch (err) {
                console.error(err);
                message.error("Không lấy được thông tin cá nhân");
            }
        };

        if (accountId) {
            fetchData();
        }
    }, [accountId]);

    const renderContent = () => {
        switch (selectedKey) {
            case "personal":
                return (
                    <PersonalInfo formData={formData} setFormData={setFormData} accountId={accountId} />
                );
            case "changePassword":
                return (
                    <ChangePasswordForm />
                );
            case "guide":
                return (
                    <GuideTab />
                );
            case "logout":
                return (
                    <LogoutTab />
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
                                { href: "/", title: <><HomeOutlined /> <span>{"Trang chủ"}</span></> },
                                {
                                    href: "/profile",
                                    title: (
                                        <>
                                            <SnippetsOutlined />
                                            <span> Thông tin tài khoản</span>
                                        </>
                                    ),
                                },
                            ]}
                        />
                    </div>
                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="w-full md:w-1/4 bg-white rounded-xl shadow p-4">
                            <div className="shadow rounded-lg p-4 text-gray-600 text-center mb-4">
                                {avatarUrl ? (
                                    <img
                                        src={avatarUrl}
                                        alt="Avatar"
                                        className="w-16 h-16 object-cover rounded-full mx-auto mb-2"
                                    />
                                ) : (
                                    <Avatar size={64} icon={<UserOutlined />} className="mx-auto mb-2" />
                                )}
                                {formData ? (
                                    <>
                                        <div className="font-semibold text-lg">{formData.fullname || "Đang tải..."}</div>
                                        <div className="text-sm">{formData.phone_number || "Đang tải..."}</div>
                                    </>
                                ) : (
                                    <Alert
                                        message="Chưa có thông tin. Vui lòng cập nhật"
                                        type="warning"
                                        showIcon
                                        className="mb-4 mt-4"
                                    />
                                )}
                            </div>

                            <ul className="space-y-2">
                                {menuItems.map((item) => (
                                    <li
                                        key={item.key}
                                        onClick={() => setSelectedKey(item.key)}
                                        className={`flex justify-between items-center p-3 rounded-lg cursor-pointer transition ${selectedKey === item.key
                                            ? "bg-blue-100 text-gray-600 font-semibold"
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