import React, { useEffect, useState } from "react";
import { Button, Input, Card, Breadcrumb, Select, Slider, Switch, ConfigProvider, theme } from "antd";
import { HomeOutlined, PhoneOutlined, MailOutlined, BellOutlined, BgColorsOutlined, GlobalOutlined, LockOutlined, SkinOutlined, } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import Footer from "../../components/Layout/Footer";
import Header from "../../components/Layout/Header";

const { Option } = Select;

export default function EmailNotificationPage() {
    const { t } = useTranslation();
    const [themeMode, setThemeMode] = useState(
        localStorage.getItem("theme") || "light"
    );

    const [brightness, setBrightness] = useState(
        parseInt(localStorage.getItem("brightness")) || 100
    );

    useEffect(() => {
        document.title = "ATTEND 3D - " + t("contact");

        document.body.style.filter = `brightness(${brightness}%)`;
    }, [t, brightness]);

    useEffect(() => {
        if (themeMode === "dark") {
            document.documentElement.classList.add("dark");
        } else if (themeMode === "light") {
            document.documentElement.classList.remove("dark");
        } else if (themeMode === "auto") {
            const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");
            if (prefersDark.matches) {
                document.documentElement.classList.add("dark");
            } else {
                document.documentElement.classList.remove("dark");
            }
        }
        localStorage.setItem("theme", themeMode);
    }, [themeMode]);

    return (
        <ConfigProvider
            theme={{
                algorithm:
                    themeMode === "dark"
                        ? theme.darkAlgorithm
                        : theme.defaultAlgorithm,
            }}
        >
            <div className="min-h-screen bg-white text-gray-800 flex flex-col">
                <div className="w-full mx-auto px-6 flex-grow">
                    <Header />
                    <main className="mt-10 flex flex-col items-center">
                        <div className="w-full px-4">
                            <Breadcrumb
                                items={[
                                    { href: "/", title: <><HomeOutlined /> <span>{"Trang chủ"}</span></> },
                                    {
                                        href: "/general-setting",
                                        title: (
                                            <>
                                                <PhoneOutlined /> <span>{t("general_setting")}</span>
                                            </>
                                        ),
                                    }
                                ]}
                            />
                        </div>

                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            <Card
                                title={
                                    <div className="flex items-center gap-2">
                                        <MailOutlined /> Email
                                    </div>
                                }
                            >
                                <p className="mb-2 text-sm text-gray-500">
                                    Thay đổi email xác thực của bạn.
                                </p>
                                <Input
                                    placeholder="example@email.com"
                                    type="email"
                                    size="large"
                                    style={{ borderWidth: 1.5, boxShadow: "none" }}
                                />
                                <Button type="primary" className="mt-3" size="large">
                                    Lưu
                                </Button>
                            </Card>

                            <Card
                                title={
                                    <div className="flex items-center gap-2">
                                        <BellOutlined /> Thông báo
                                    </div>
                                }
                            >
                                <p className="mb-2 text-sm text-gray-500">
                                    Bật/tắt thông báo cho tài khoản này.
                                </p>
                                <Switch defaultChecked />
                            </Card>

                            <Card
                                title={
                                    <div className="flex items-center gap-2">
                                        <BgColorsOutlined /> Độ sáng màn hình
                                    </div>
                                }
                            >
                                <p className="mb-2 text-sm text-gray-500">
                                    Điều chỉnh độ sáng giao diện.
                                </p>
                                <Slider
                                    value={brightness}
                                    min={50}
                                    max={150}
                                    onChange={(val) => {
                                        setBrightness(val);
                                        localStorage.setItem("brightness", val);
                                        document.body.style.filter = `brightness(${val}%)`;
                                    }}
                                />
                            </Card>

                            <Card
                                title={
                                    <div className="flex items-center gap-2">
                                        <GlobalOutlined /> Ngôn ngữ
                                    </div>
                                }
                            >
                                <p className="mb-2 text-sm text-gray-500">
                                    Chọn ngôn ngữ hiển thị.
                                </p>
                                <Select
                                    defaultValue="vi"
                                    className="w-full custom-select"
                                    size="large"
                                >
                                    <Option value="vi">Tiếng Việt</Option>
                                    <Option value="en">English</Option>
                                </Select>
                            </Card>

                            <Card
                                title={
                                    <div className="flex items-center gap-2">
                                        <LockOutlined /> Bảo mật
                                    </div>
                                }
                            >
                                <p className="mb-2 text-sm text-gray-500">
                                    Cập nhật mật khẩu hoặc bật xác thực 2 yếu tố.
                                </p>
                                <Button className="w-full mb-2" size="large" type="primary">
                                    Đổi mật khẩu
                                </Button>
                                <Switch /> <span className="ml-2">Bật xác thực 2 lớp</span>
                            </Card>

                            <Card
                                title={
                                    <div className="flex items-center gap-2">
                                        <SkinOutlined /> Giao diện
                                    </div>
                                }
                            >
                                <p className="mb-2 text-sm text-gray-500">
                                    Chuyển đổi giữa chế độ sáng và tối.
                                </p>
                                <Select
                                    defaultValue="light"
                                    value={themeMode}
                                    className="w-full custom-select"
                                    size="large"
                                    onChange={(val) => setThemeMode(val)}
                                >
                                    <Option value="light">Sáng</Option>
                                    <Option value="dark">Tối</Option>
                                    <Option value="auto">Tự động</Option>
                                </Select>
                            </Card>

                            <Card
                                title={
                                    <div className="flex items-center gap-2">
                                        <LockOutlined /> Đăng xuất tự động
                                    </div>
                                }
                            >
                                <p className="mb-2 text-sm text-gray-500">
                                    Thiết lập thời gian không hoạt động trước khi tự động đăng xuất.
                                </p>
                                <Select
                                    defaultValue={0}
                                    className="w-full custom-select"
                                    size="large"
                                >
                                    <Option value={0}>Không</Option>
                                    <Option value={5}>5 phút</Option>
                                    <Option value={15}>15 phút</Option>
                                    <Option value={30}>30 phút</Option>
                                    <Option value={60}>60 phút</Option>
                                </Select>
                            </Card>

                            <Card
                                title={
                                    <div className="flex items-center gap-2">
                                        <LockOutlined /> Quyền riêng tư
                                    </div>
                                }
                            >
                                <p className="mb-2 text-sm text-gray-500">
                                    Quản lý chia sẻ thông tin cá nhân.
                                </p>
                                <Switch defaultChecked />{" "}
                                <span className="ml-2">Cho phép hiển thị email</span>
                                <br />
                                <Switch className="mt-2" />{" "}
                                <span className="ml-2">Ẩn trạng thái hoạt động</span>
                            </Card>

                            <Card
                                title={
                                    <div className="flex items-center gap-2">
                                        <BellOutlined /> Âm thanh thông báo
                                    </div>
                                }
                            >
                                <p className="mb-2 text-sm text-gray-500">
                                    Bật âm thanh khi có thông báo mới.
                                </p>
                                <Switch defaultChecked />
                            </Card>
                        </div>
                    </main>
                </div>
                <Footer />
            </div>
        </ConfigProvider>
    );
}