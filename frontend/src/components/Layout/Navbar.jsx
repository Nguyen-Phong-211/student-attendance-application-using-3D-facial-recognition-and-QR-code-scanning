import React, { useState, useEffect } from 'react';
import { Avatar, Badge, Dropdown, Popover, Input, Drawer, Button, message } from 'antd';
import {
    BellOutlined,
    LogoutOutlined,
    SettingOutlined,
    UserOutlined,
    MenuOutlined,
    SearchOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import api from '../../api/axiosInstance';

const Navbar = ({ changeLanguage, searchValue, setSearchValue }) => {
    const { t } = useTranslation();
    const [openDrawer, setOpenDrawer] = useState(false);
    const [user, setUser] = useState(null);
    const [notifications, setNotifications] = useState([]);

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
            <a href="/admin/notifications" className="block text-center mt-2 text-blue-500 hover:underline text-sm">
                Xem tất cả
            </a>
        </div>
    );

    const settingMenuItems = [
        {
            key: 'system',
            label: <a href="/admin/settings/system">Hệ thống</a>,
            icon: <SettingOutlined />,
        },
        {
            key: 'security',
            label: <a href="/admin/settings/security">Bảo mật</a>,
            icon: <UserOutlined />,
        },
        {
            type: 'group',
            label: 'Ngôn ngữ',
            children: [
                {
                    key: 'lang_vi',
                    label: 'Tiếng Việt',
                    icon: <span role="img">🇻🇳</span>,
                    onClick: () => changeLanguage('vi'),
                },
                {
                    key: 'lang_en',
                    label: 'English',
                    icon: <span role="img">🇺🇸</span>,
                    onClick: () => changeLanguage('en'),
                },
            ],
        },
    ];

    const userMenuItems = [
        {
            key: 'profile',
            label: <a href="/admin/account/profile">Profile</a>,
            icon: <UserOutlined />,
        },
        {
            key: 'logout',
            label: <a href="/admin/account/logout">Đăng xuất</a>,
            icon: <LogoutOutlined />,
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

                <Dropdown trigger={['hover']} placement="bottomRight" menu={{ items: settingMenuItems }}>
                    <SettingOutlined style={{ fontSize: 20, cursor: 'pointer' }} />
                </Dropdown>

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
                        <span className="font-medium hidden sm:block">Admin</span>
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
                    placeholder={t('Search lecturer...')}
                    prefix={<SearchOutlined />}
                    value={searchValue}
                    onChange={e => setSearchValue(e.target.value)}
                    allowClear
                    size="middle"
                    className="mb-4"
                />

                <div className="flex flex-col gap-4">
                    <Dropdown menu={{ items: settingMenuItems }} trigger={['click']}>
                        <Button icon={<SettingOutlined />} block>Settings</Button>
                    </Dropdown>

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
