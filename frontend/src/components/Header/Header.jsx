import React, { useState, useEffect } from "react";
import {
  Button,
  Drawer,
  Avatar,
  Dropdown,
  message,
  Popover,
  Badge,
} from "antd";
import {
  HomeOutlined,
  CheckCircleOutlined,
  PhoneOutlined,
  ScanOutlined,
  SettingOutlined,
  MenuOutlined,
  UserOutlined,
  LoginOutlined,
  BarChartOutlined,
  PlusCircleOutlined,
  WechatWorkOutlined,
  AuditOutlined,
  LogoutOutlined,
  UserSwitchOutlined,
  ScheduleOutlined,
  BellOutlined,
} from "@ant-design/icons";

import Logo from "../../assets/general/face-recognition.png";
import DesktopMenu from "./DesktopMenu";
import MobileMenu from "./MobileMenu";
import i18n from "i18next";
import { useTranslation } from "react-i18next";
import api from '../../api/axiosInstance';
import { v4 as uuidv4 } from 'uuid';

export default function Header() {
  const [openDrawer, setOpenDrawer] = useState(false);
  const { t } = useTranslation();

  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const randomId = uuidv4();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser && storedUser !== "undefined") {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error("Error parsing user from localStorage:", err);
        localStorage.removeItem("user");
        setUser(null);
      }
    } else {
      setUser(null);
    }

    fetchNotifications();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.setItem("logout", Date.now());
    setUser(null);
    window.location.href = "/account/login";
  };

  const items = [
    {
      key: "home",
      icon: <HomeOutlined />,
      label: (
        <a href="/" className="text-base">
          {t("home")}
        </a>
      ),
    },
    {
      key: "attendance",
      icon: <CheckCircleOutlined />,
      label: (
        <a href="/attendance" className="text-base">
          {t("attendance")}
        </a>
      ),
    },
    {
      key: "timetable",
      icon: <ScheduleOutlined />,
      label: (
        <a href="/timetable" className="text-base">
          {t("timetable")}
        </a>
      ),
    },
    {
      key: "user",
      icon: <UserOutlined />,
      label: <span className="text-base">{t("setting")}</span>,
      children: !user
        ? [
          {
            key: "login-prompt",
            label: (
              <a href="/account/login">
                Đăng nhập để thực hiện các chức năng
              </a>
            ),
            icon: <LoginOutlined />,
          },
        ]
        : [
          {
            key: "admin",
            label: (
              <a
                href="/admin/dashboard"
                target="_blank"
                rel="noopener noreferrer"
              >
                Admin
              </a>
            ),
            icon: <UserSwitchOutlined />,
          },
          {
            key: "add-face",
            label: <a href="/add-face">{t("add_face")}</a>,
            icon: <ScanOutlined />,
          },
          {
            key: "event",
            label: <span>{t("create_event")}</span>,
            icon: <PlusCircleOutlined />,
            children: [
              {
                key: "add-reminder",
                label: (
                  <a href="/add-event/add-reminder">{t("create_reminder")}</a>
                ),
                icon: <WechatWorkOutlined />,
              },
              {
                key: "request-leave",
                label: (
                  <a href="/add-event/request-leave">{t("request_leave")}</a>
                ),
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
            label: (
              <a href="/attendance-statistics">{t("attendance_stat")}</a>
            ),
            icon: <BarChartOutlined />,
          },
          {
            key: "contact",
            label: (
              <a href="/contact">
                {t("contact")}
              </a>
            ),
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
        <span className="text-base">
          <i className="fa-solid fa-language"></i>&nbsp;&nbsp;{t("language")}
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

  const fetchNotifications = async () => {
    try {
      const res = await api.get('notifications/all/');
      const data = res.data;

      if (Array.isArray(data)) {
        setNotifications(data);
      } else {
        setNotifications([]);
      }
    } catch (error) {
      console.error("Lỗi khi tải thông báo:", error);
      setNotifications([]);
      message.error("Không tải được thông báo.");
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
        href={`/profile/${randomId}?tab=notifications`}
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
      label: <a href="/admin/account/logout">Đăng xuất</a>,
      icon: <LogoutOutlined />,
    },
  ];

  const avatar_url = localStorage.getItem("avatar_url");

  return (
    <header className="flex justify-between items-center py-6 border-b border-gray-200 w-full">
      <div className="flex items-center space-x-4">
        <a
          href="/"
          className="flex items-center space-x-3 hover:opacity-90 transition"
        >
          <img src={Logo} alt="Logo" className="h-10 w-10 object-contain" />
          <span className="text-2xl font-bold text-gray-800 tracking-wide">
            FACE <span>CLASS</span>
          </span>
        </a>
      </div>

      <div className="hidden md:flex flex-grow justify-between items-center ml-10">
        <DesktopMenu
          items={items}
          onClick={({ key }) => {
            if (key === "vi" || key === "en") {
              i18n.changeLanguage(key);
            }
          }}
        />

        <div className="space-x-4 flex-shrink-0">
          {!user ? (
            <Button
              icon={<LoginOutlined />}
              type="primary"
              size="large"
              href="/account/login"
            >
              {t("login")}
            </Button>
          ) : (
            <div className="flex items-center space-x-4">
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

              <Dropdown
                trigger={["hover"]}
                placement="bottomRight"
                menu={{ items: userMenuItems }}
              >
                <div className="flex items-center gap-2 cursor-pointer">
                  {avatar_url ? (
                    <img src={avatar_url} alt="Avatar" height={40} width={40} />
                  ) : <Avatar icon={<UserOutlined />} />}
                </div>
              </Dropdown>
            </div>
          )}
        </div>
      </div>

      <div className="md:hidden">
        <Button icon={<MenuOutlined />} onClick={() => setOpenDrawer(true)} />
      </div>

      <Drawer
        title="Menu"
        placement="left"
        onClose={() => setOpenDrawer(false)}
        open={openDrawer}
      >
        <MobileMenu items={items} />
        <div className="mt-4 space-y-2">
          {!user ? (
            <>
              <Button
                block
                type="primary"
                href="/account/login"
                icon={<LoginOutlined />}
                size="large"
              >
                Đăng nhập
              </Button>
            </>
          ) : (
            <div className="flex flex-col space-y-2">
              <span>Xin chào, {user.fullname}</span>
            </div>
          )}
        </div>
      </Drawer>
    </header>
  );
}
