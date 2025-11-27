import React, { useState, useEffect, useCallback } from 'react';
import { Avatar, Badge, Dropdown, Popover, Input, Drawer, Button, message, Modal } from 'antd';
import {
    BellOutlined,
    LogoutOutlined,
    UserOutlined,
    MenuOutlined,
    SearchOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import api from '../../api/axiosInstance';
import { useNavigate } from 'react-router-dom';
import { getRoleAccountId } from '../../utils/auth';

const Navbar = ({ changeLanguage }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [openDrawer, setOpenDrawer] = useState(false);
    const [, setUser] = useState(null);
    const [notifications, setNotifications] = useState([]);

    const [data,] = useState([]);
    const [searchValue, setSearchValue] = useState("");

    const [, setFilteredData] = useState([]);

    useEffect(() => {
        let socket;

        const fetchUserAndNotifications = async () => {
            try {
                const res = await api.get("/accounts/me/", { withCredentials: true });
                setUser(res.data);

                if (res.data?.account_id) {
                    await fetchNotifications(res.data.account_id);

                    const wsScheme = window.location.protocol === "https:" ? "wss" : "ws";
                    socket = new WebSocket(`${wsScheme}://127.0.0.1:8000/ws/notifications/${res.data.account_id}/`);

                    socket.onopen = () => {
                        console.log("WebSocket connected to notifications");
                    };

                    socket.onmessage = (event) => {
                        try {
                            const data = JSON.parse(event.data);
                            console.log("🔔 New notification:", data);

                            setNotifications((prev) => [data, ...prev]);
                            message.info(`${data.title}`);
                        } catch (err) {
                            console.error("WS parse error:", err);
                        }
                    };

                    socket.onclose = () => {
                        console.log("WebSocket disconnected");
                    };

                    socket.onerror = (err) => {
                        console.error("WebSocket error:", err);
                    };
                }
            } catch (err) {
                setUser(null);
            }
        };

        fetchUserAndNotifications();

        return () => {
            if (socket) {
                socket.close();
            }
        };
    }, []);

    const fetchNotifications = async (accountId) => {
        try {
            const res = await api.get(`notifications/${accountId}/unread/`);
            setNotifications(Array.isArray(res.data) ? res.data : []);
        } catch (error) {
            message.error("Không tải được thông báo.");
            setNotifications([]);
        }
    };

    const removeHighlights = useCallback(() => {
        document.querySelectorAll('mark').forEach(el => {
            const parent = el.parentNode;
            parent.replaceChild(document.createTextNode(el.textContent), el);
            parent.normalize();
        });
    }, []);

    const highlightText = useCallback((term) => {
        removeHighlights();

        if (!term) return;

        const regex = new RegExp(`(${term})`, 'gi');
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
        const nodes = [];

        while (walker.nextNode()) {
            nodes.push(walker.currentNode);
        }

        nodes.forEach(node => {
            if (node.parentNode && !["SCRIPT", "STYLE"].includes(node.parentNode.nodeName)) {
                const text = node.nodeValue;
                if (regex.test(text)) {
                    const span = document.createElement('span');
                    span.innerHTML = text.replace(regex, `<mark style="background: #ffeb3b; color: black;">$1</mark>`);
                    node.parentNode.replaceChild(span, node);
                }
            }
        });
    }, [removeHighlights]);

    const handleLogout = () => {
        Modal.confirm({
            title: "Xác nhận đăng xuất",
            content: "Bạn có chắc chắn muốn đăng xuất không?",
            okText: "Đăng xuất",
            cancelText: "Hủy",
            okButtonProps: { danger: true },
            onOk: async () => {
                try {
                    await api.post("/accounts/logout/", {}, { withCredentials: true });
                    message.success("Đăng xuất thành công");
                    localStorage.removeItem("accessToken");
                    navigate("/account/login");
                } catch (err) {
                    message.error("Có lỗi khi đăng xuất");
                }
            },
        });
    };

    

    useEffect(() => {
        if (!searchValue?.trim()) {
            setFilteredData(data);
            return;
        }

        const lower = searchValue.toLowerCase();
        const result = data.filter(item =>
            Object.values(item).some(val =>
                String(val).toLowerCase().includes(lower)
            )
        );
        setFilteredData(result);
        highlightText(searchValue);
    }, [searchValue, data, highlightText]);

    const notificationContent = (
        <div className="max-w-xs">
            {Array.isArray(notifications) && notifications.length > 0 ? (
                <ul className="max-h-60 overflow-auto space-y-2">
                    {notifications.slice(0, 10).map((noti) => (
                        <li key={noti.notification_id} className="text-sm border-b pb-1">
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
            {getRoleAccountId() === 'admin' ? (
                <a href="/admin/notifications" className="block text-center mt-2 text-blue-500 hover:underline text-sm">
                    Xem tất cả
                </a>
            ) : (
                <a href="/lecturers/notifications" className="block text-center mt-2 text-blue-500 hover:underline text-sm">
                    Xem tất cả
                </a>
            )}
        </div>
    );

    const userMenuItems = getRoleAccountId() === 'admin' 
    ? [
        {
            key: "logout",
            label: (
                <span onClick={handleLogout} style={{ color: "red" }}>
                    {t("logout")}
                </span>
            ),
            icon: <LogoutOutlined style={{ color: "red" }} />,
        },
    ]
    : [
        {
            key: "profile",
            label: <a href="/lecturers/profile">{t("profile")}</a>,
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
        <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-5">
                <Input
                    placeholder={t('Search...')}
                    prefix={<SearchOutlined />}
                    value={searchValue}
                    onChange={e => setSearchValue(e.target.value)}
                    allowClear
                    size="large"
                    className="rounded-md w-full"
                    style={{ borderWidth: 1.5, boxShadow: 'none' }}
                />

                <Popover
                    content={notificationContent}
                    title='Thông báo'
                    trigger="hover"
                    placement="bottomRight"
                    overlayClassName="max-w-xs"
                >
                    <Badge count={notifications.length} size="small">
                        <BellOutlined style={{ fontSize: 20, cursor: 'pointer' }} />
                    </Badge>
                </Popover>

                <Dropdown trigger={['hover']} placement="bottomRight" menu={{ items: userMenuItems }}>
                    <div className="flex items-center gap-2 cursor-pointer">
                        {/* <span className="font-medium hidden sm:block">Admin</span> */}
                        <Avatar icon={<UserOutlined />} />
                    </div>
                </Dropdown>
            </div>

            <div className="sm:hidden">
                <Button
                    icon={<MenuOutlined />}
                    type="text"
                    onClick={() => setOpenDrawer(true)}
                />
            </div>

            <Drawer
                title="Menu"
                placement="right"
                onClose={() => setOpenDrawer(false)}
                open={openDrawer}
            >
                <Input
                    placeholder={t('Search ...')}
                    prefix={<SearchOutlined />}
                    allowClear
                    size="middle"
                    className="mb-4"
                />

                <div className="flex flex-col gap-4">

                    <Popover content={notificationContent} title={t('Notifications')} trigger="click">
                        <Button icon={<BellOutlined />} block>Notifications</Button>
                    </Popover>

                    <Dropdown menu={{ items: userMenuItems }} trigger={['click']}>
                        <Button icon={<UserOutlined />} block>Account</Button>
                    </Dropdown>
                </div>
            </Drawer>
        </div>
    );
};

export default Navbar;