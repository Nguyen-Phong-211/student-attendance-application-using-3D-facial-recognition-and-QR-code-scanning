import React, { useEffect } from "react";
import { Button, Input, Card, Breadcrumb, Select, Slider, Switch } from "antd";
import Header from "../../components/Header/Header";
import {
  HomeOutlined,
  PhoneOutlined,
  MailOutlined,
  BellOutlined,
  BgColorsOutlined,
  GlobalOutlined,
  LockOutlined,
  SkinOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import Footer from "../../components/Footer";

const { Option } = Select;

export default function EmailNotificationPage() {
  const { t } = useTranslation();

  useEffect(() => {
    document.title = "ATTEND 3D - " + t("contact");
  }, [t]);

  return (
    <div className="min-h-screen bg-white text-gray-800 flex flex-col">
      <div className="w-full mx-auto px-6 flex-grow">
        <Header />

        <main className="mt-10 flex flex-col items-center">
          <div className="w-full px-4">
            <Breadcrumb
              items={[
                { href: "/", title: <HomeOutlined /> },
                {
                  href: "/general-setting",
                  title: (
                    <>
                      <PhoneOutlined /> <span>{t("general_setting")}</span>
                    </>
                  ),
                },
                { title: t("general_setting") },
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
                Thay đổi email đăng nhập của bạn.
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
              <Slider defaultValue={70} />
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
                className="w-full custom-select"
                size="large"
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
  );
}
