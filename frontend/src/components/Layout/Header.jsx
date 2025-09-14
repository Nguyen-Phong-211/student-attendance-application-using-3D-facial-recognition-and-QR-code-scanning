import React, { useState, useEffect } from "react";
import { Button, Avatar, Dropdown, message, Popover, Badge, Drawer, Menu, Modal } from "antd";
import { HomeOutlined, PhoneOutlined, ScanOutlined, SettingOutlined, MenuOutlined, UserOutlined, LoginOutlined, BarChartOutlined, PlusCircleOutlined, WechatWorkOutlined, AuditOutlined, LogoutOutlined, UserSwitchOutlined, ScheduleOutlined, BellOutlined, } from "@ant-design/icons";

import Logo from "../../assets/general/face-recognition.png";
import i18n from "i18next";
import { useTranslation } from "react-i18next";
import api from "../../api/axiosInstance";
import { logout } from "../../utils/auth";
import { useLocation } from "react-router-dom";

export default function Header() {
    const [openDrawer, setOpenDrawer] = useState(false);
    const { t } = useTranslation();
    const [selectedKeys, setSelectedKeys] = useState([]);
    const [user, setUser] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const location = useLocation();

    useEffect(() => {
        const path = location.pathname;
        if (path === "/") setSelectedKeys(["home"]);
        else if (path.startsWith("/timetable")) setSelectedKeys(["timetable"]);
        else if (path.startsWith("/add-face")) setSelectedKeys(["add-face"]);
        else if (path.startsWith("/general-setting")) setSelectedKeys(["general-setting"]);
        else if (path.startsWith("/attendance-statistics")) setSelectedKeys(["statistic"]);
        else if (path.startsWith("/contact")) setSelectedKeys(["contact"]);
        else if (path.startsWith("/profile")) setSelectedKeys(["profile"]);
        else if (path.startsWith("/add-event/add-reminder")) setSelectedKeys(["add-reminder"]);
        else if (path.startsWith("/add-event/request-leave")) setSelectedKeys(["request-leave"]);
        else setSelectedKeys([]);
    }, [location]);

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
        }, 1000);

        return () => clearInterval(intervalId);
    }, [user?.account_id]);

    const handleLogout = () => {
        Modal.confirm({
            title: "Xác nhận đăng xuất",
            content: "Bạn có chắc chắn muốn đăng xuất không?",
            okText: "Đăng xuất",
            cancelText: "Hủy",
            onOk: async () => {
                try {
                    await logout();
                    message.success("Đăng xuất thành công");
                    window.location.href = "/account/login";
                } catch (err) {
                    message.error("Có lỗi khi đăng xuất");
                }
            },
        });
    };

    const items = [
        {
            key: "home",
            icon: <HomeOutlined />,
            label: <a href="/">{t("home")}</a>,
        },
        {
            key: "timetable",
            icon: <ScheduleOutlined />,
            label: <a href="/timetable">{t("timetable")}</a>,
        },
        {
            key: "user",
            icon: <UserOutlined />,
            label: t("setting"),
            children: !user
                ? [
                    {
                        key: "login-prompt",
                        label: <a href="/account/login">Đăng nhập để thực hiện các chức năng</a>,
                        icon: <LoginOutlined />,
                    },
                ]
                : [
                    {
                        key: "admin",
                        label: (
                            <a href="/admin/dashboard" target="_blank" rel="noopener noreferrer">
                                Admin
                            </a>
                        ),
                        icon: <UserSwitchOutlined />,
                    },
                    {
                        key: "add-face",
                        label: <a href="attendance/add-face">{t("add_face")}</a>,
                        icon: <ScanOutlined />,
                    },
                    {
                        key: "event",
                        label: t("create_event"),
                        icon: <PlusCircleOutlined />,
                        children: [
                            {
                                key: "add-reminder",
                                label: <a href="/add-event/add-reminder">{t("create_reminder")}</a>,
                                icon: <WechatWorkOutlined />,
                            },
                            {
                                key: "request-leave",
                                label: <a href="/add-event/request-leave">{t("request_leave")}</a>,
                                icon: <AuditOutlined />,
                            },
                        ],
                    },
                    {
                        key: "general-setting",
                        label: <a href="/general-setting">{t("general_setting")}</a>,
                        icon: <SettingOutlined />,
                    },
                    {
                        key: "statistic",
                        label: <a href="/attendance/statistics">{t("attendance_stat")}</a>,
                        icon: <BarChartOutlined />,
                    },
                    {
                        key: "contact",
                        label: <a href="/contact">{t("contact")}</a>,
                        icon: <PhoneOutlined />,
                    },
                    {
                        key: "logout",
                        onClick: handleLogout,
                        label: <span style={{ color: "red" }}>{t("logout")}</span>,
                        icon: <LogoutOutlined style={{ color: "red" }} />,
                    },
                ],
        },
        {
            key: "language",
            label: (
                <span>
                    <i className="fa-solid fa-language font-bold"></i>&nbsp;&nbsp;{t("language")}
                </span>
            ),
            children: [
                {
                    key: "vi",
                    label: (
                        <span className="flex items-center">
                            <img
                                src="https://flagcdn.com/w40/vn.png"
                                alt="Vietnam"
                                className="w-7 h-5 mr-2"
                            />
                            {t("vietnamese")}
                        </span>
                    ),
                },
                {
                    key: "en",
                    label: (
                        <span className="flex items-center">
                            <img
                                src="https://flagcdn.com/w40/gb.png"
                                alt="UK"
                                className="w-7 h-5 mr-2"
                            />
                            {t("english")}
                        </span>
                    ),
                },
            ],
        },
    ];

    const fetchNotifications = async (accountId) => {
        try {
            const res = await api.get(`notifications/${accountId}/unread/`);
            setNotifications(Array.isArray(res.data) ? res.data : []);
        } catch (error) {
            message.error("Không tải được thông báo.");
            setNotifications([]);
        }
    };

    const notificationContent = (
        <div className="max-w-xs">
            {Array.isArray(notifications) && notifications.length > 0 ? (
                <ul className="max-h-60 overflow-auto space-y-2">
                    {notifications.slice(0, 10).map((noti, index) => (
                        <li key={index} className="text-sm border-b pb-1">
                            <strong>{noti.title}</strong>
                            <div className="text-gray-600">{noti.content}</div>
                            <div className="text-xs text-gray-400">
                                {new Date(noti.created_at).toLocaleString()}
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-sm text-gray-500">Không có thông báo.</p>
            )}
            <a
                href={`/notifications/all`}
                className="block text-center mt-2 text-blue-500 hover:underline text-sm"
            >
                Xem tất cả
            </a>
        </div>
    );

    const userMenuItems = [
        {
            key: "profile",
            label: <a href="/profile">Profile</a>,
            icon: <UserOutlined />,
        },
        {
            key: "logout",
            label: (
                <span onClick={handleLogout} style={{ color: "red" }}>
                    {t("logout")}
                </span>
            ),
            icon: <LogoutOutlined style={{ color: "red" }} />,
        },
    ];

    return (
        <header className="flex justify-between items-center py-4 px-4 md:px-10 border-b border-gray-200 w-full">
            <div className="flex items-center space-x-3">
                <a href="/" className="flex items-center space-x-2 hover:opacity-90 transition">
                    <img src={Logo} alt="Logo" className="h-8 w-8 object-contain" />
                    <span className="text-xl md:text-2xl font-extrabold text-gray-800 tracking-wide">
                        FACE <span className="text-blue-600">CLASS</span>
                    </span>
                </a>
            </div>

            <div className="hidden md:flex flex-grow justify-between items-center ml-10 font-bold">
                <Menu
                    mode="horizontal"
                    items={items}
                    selectedKeys={selectedKeys}
                    onClick={({ key }) => {
                        if (key === "vi" || key === "en") {
                            i18n.changeLanguage(key);
                        } else {
                            setSelectedKeys([key]);
                        }
                    }}
                    className="flex-1 bg-transparent border-b-0 font-bold"
                />

                <div className="space-x-4 flex-shrink-0 flex items-center">
                    {!user ? (
                        <Button icon={<LoginOutlined />} type="primary" size="middle" href="/account/login">
                            {t("login")}
                        </Button>
                    ) : (
                        <>
                            <Popover
                                content={notificationContent}
                                title="Thông báo"
                                trigger="hover"
                                placement="bottomRight"
                                className="max-w-xs"
                            >
                                <Badge count={notifications.length} size="small">
                                    <BellOutlined style={{ fontSize: 20, cursor: "pointer" }} />
                                </Badge>
                            </Popover>

                            <Dropdown trigger={["hover"]} placement="bottomRight" menu={{ items: userMenuItems }}>
                                <div className="flex items-center gap-2 cursor-pointer">
                                    {user?.avatar ? (

                                        <img
                                            src={user?.avatar}
                                            alt="Avatar"
                                            className="h-10 w-10 rounded-full object-cover"
                                        />
                                    ) : (
                                        <Avatar icon={<UserOutlined />} />
                                    )}
                                </div>
                            </Dropdown>
                        </>
                    )}
                </div>
            </div>

            <div className="md:hidden">
                <Button icon={<MenuOutlined />} type="text" onClick={() => setOpenDrawer(true)} />
            </div>

            <Drawer title="Menu" className="font-bold" placement="right" onClose={() => setOpenDrawer(false)} open={openDrawer}>
                <Menu
                    mode="inline"
                    items={items}
                    onClick={({ key }) => {
                        if (key === "vi" || key === "en") {
                            i18n.changeLanguage(key);
                        }
                        setOpenDrawer(false);
                    }}
                />
            </Drawer>
        </header>
    );
}