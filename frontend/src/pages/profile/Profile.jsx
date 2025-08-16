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
    UnlockOutlined
} from "@ant-design/icons";
import { Avatar, Breadcrumb } from "antd";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer";
import PersonalInfo from "../../components/Profile/PersonalInfo";
import AttendanceHistory from "../../components/Profile/AttendanceHistory";
import NotificationList from "../../components/Profile/NotificationList";
import ChangePasswordForm from "../../components/Profile/ChangePasswordForm";
import ReportIssueForm from "../../components/Profile/ReportIssueForm";
import LogoutTab from "../../components/Profile/LogoutTab";
import GuideTab from "../../components/Profile/GuideTab";

const menuItems = [
    { key: "personal", label: "Thông tin cá nhân", icon: <UserOutlined /> },
    { key: "attendance", label: "Lịch sử điểm danh", icon: <HistoryOutlined /> },
    { key: "notification", label: "Thông báo", icon: <NotificationOutlined /> },
    { key: "changePassword", label: "Đổi mật khẩu", icon: <UnlockOutlined /> },
    { key: "report", label: "Báo cáo lỗi", icon: <BugOutlined /> },
    { key: "guide", label: "Hướng dẫn sử dụng", icon: <QuestionCircleOutlined /> },
    { key: "logout", label: "Đăng xuất", icon: <LogoutOutlined />, danger: true },
];

export default function ProfilePage() {
    const [selectedKey, setSelectedKey] = useState("personal");

    useEffect(() => {
        document.title = "ATTEND 3D - Thông tin tài khoản";
    }, [selectedKey]);

    const renderContent = () => {
        switch (selectedKey) {
            case "personal":
                return (
                    <PersonalInfo />
                );
            case "attendance":

                return (
                    <AttendanceHistory />
                );

            case "notification":
                return (
                    <NotificationList />
                );
            case "changePassword":
                return (
                    <ChangePasswordForm />
                );

            case "report":
                return (
                    <ReportIssueForm    />
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
                            <div className="shadow rounded-lg p-4 text-gray-600 text-center mb-4">
                                <Avatar size={64} icon={<UserOutlined />} className="mx-auto mb-2" />
                                <div className="font-semibold text-lg">Nguyễn Nguyễn Phong</div>
                                <div className="text-sm">0825025347</div>
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