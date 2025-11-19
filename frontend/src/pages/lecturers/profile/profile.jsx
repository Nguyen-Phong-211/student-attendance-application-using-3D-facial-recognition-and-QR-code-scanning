import React, { useEffect, useState } from "react";
import {
  Tabs,
  Typography,
  Avatar,
  Button,
  Form,
  message,
  Upload,
  Image,
  Table,
  Spin,
  Modal,
  Alert,
  Tag,
  Layout,
} from "antd";
import {
  UserOutlined,
  UnlockOutlined,
  AuditOutlined,
  QuestionCircleOutlined,
  LogoutOutlined,
  UploadOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { v4 as uuidv4 } from "uuid";
import { useTranslation } from "react-i18next";
import Sidebar from "../../../components/Layout/Sidebar_lecturer";
import Navbar from "../../../components/Layout/Navbar";
import api from "../../../api/axiosInstance";
import { getAccountId, logout } from "../../../utils/auth";
import FormEditProfile from "../profile/EditProfile";

const { Header } = Layout;
const { Title } = Typography;

export default function LecturerProfilePage() {
  const { t } = useTranslation();
  const [collapsed, setCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(null);
  const [activeKey, setActiveKey] = useState("personal");

  const accountId = getAccountId();
  const randomId = uuidv4();

  useEffect(() => {
    document.title = "ATTEND 3D - Hồ sơ giảng viên";
    fetchData();
  }, [accountId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/lecturers/${accountId}/`);
      setFormData(res.data);
    } catch (err) {
      console.error(err);
      message.error("Không lấy được thông tin giảng viên");
    } finally {
      setLoading(false);
    }
  };

  const items = [
    {
      key: "personal",
      label: (
        <span>
          <UserOutlined /> Thông tin cá nhân
        </span>
      ),
      children: (
        <PersonalInfo
          formData={formData}
          setFormData={setFormData}
          accountId={accountId}
        />
      ),
    },
    {
      key: "changePassword",
      label: (
        <span>
          <UnlockOutlined /> Đổi mật khẩu
        </span>
      ),
      children: <ChangePasswordTab randomId={randomId} />,
    },
    {
      key: "login_log",
      label: (
        <span>
          <AuditOutlined /> Giám sát đăng nhập
        </span>
      ),
      children: <LoginLog accountId={accountId} />,
    },
    {
      key: "guide",
      label: (
        <span>
          <QuestionCircleOutlined /> Hướng dẫn sử dụng
        </span>
      ),
      children: <GuideTab />,
    },
    {
      key: "logout",
      label: (
        <span style={{ color: "red" }}>
          <LogoutOutlined /> Đăng xuất
        </span>
      ),
      children: <LogoutTab />,
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
     
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      <Layout>
    
        <Header className="bg-white px-4 flex justify-between items-center border-b">
          <Navbar />
        </Header>

        <main className="mx-4 my-4 p-4 sm:p-6 bg-white rounded shadow">
          <div className="flex justify-between items-center mb-6">
            <Title level={3} style={{ margin: 0 }}>
              Hồ sơ giảng viên
            </Title>
            <Button icon={<ReloadOutlined />} onClick={fetchData}>
              Làm mới
            </Button>
          </div>

          <Spin spinning={loading}>
            {formData ? (
              <Tabs
                type="card"
                activeKey={activeKey}
                onChange={(key) => setActiveKey(key)}
                items={items}
              />
            ) : (
              <Alert
                message="Không có dữ liệu giảng viên."
                type="warning"
                showIcon
              />
            )}
          </Spin>
        </main>
      </Layout>
    </Layout>
  );
}

/* --- Thông tin cá nhân --- */
function PersonalInfo({ formData, setFormData, accountId }) {
  const [isEditing, setIsEditing] = useState(false);
  const [form] = Form.useForm();
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [, setFileList] = useState([]);
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    if (formData) setAvatarUrl(formData?.avatar || user?.avatar || null);
  }, [formData, user?.avatar]);

  const handleUpdate = async (values) => {
    try {
      await api.put(`/lecturers/${accountId}/`, {
        ...values,
        dob: values.dob ? values.dob.format("YYYY-MM-DD") : null,
      });
      message.success("Cập nhật thành công");
      const res = await api.get(`/lecturers/${accountId}/`);
      setFormData(res.data);
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      message.error("Cập nhật thất bại");
    }
  };

  const handleUpload = async (options) => {
    const { file, onSuccess, onError } = options;
    const formData = new FormData();
    formData.append("avatar", file);

    try {
      const res = await api.post(`lecturers/${accountId}/update_avatar/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const newAvatar = res.data.avatar_url;
      setAvatarUrl(newAvatar);
      message.success("Cập nhật ảnh thành công!");
      const updatedUser = { ...user, avatar: newAvatar };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      onSuccess("ok");
    } catch (error) {
      message.error("Tải ảnh thất bại!");
      onError(error);
    }
  };

  return (
    <div>
      <Title level={4}>Thông tin giảng viên</Title>
      <div className="flex flex-col items-center mt-4">
        {avatarUrl ? (
          <>
            <Image
              src={avatarUrl}
              width={100}
              height={120}
              className="rounded-full"
            />
            <Upload
              customRequest={handleUpload}
              showUploadList={false}
              onChange={({ fileList }) => setFileList(fileList.slice(-1))}
              accept="image/*"
            >
              <Button icon={<UploadOutlined />} className="my-3">
                Cập nhật ảnh
              </Button>
            </Upload>
          </>
        ) : (
          <Avatar size={100} icon={<UserOutlined />} />
        )}

        {!isEditing ? (
          <>
            <div className="mt-6 w-full max-w-lg space-y-2">
              <InfoItem label="Họ và tên" value={formData?.fullname} />
              <InfoItem label="Mã giảng viên" value={formData?.lecturer_id} />
              <InfoItem label="Email" value={formData?.email} />
              <InfoItem label="Số điện thoại" value={formData?.phone_number} />
              <InfoItem
                                label="Giới tính"
                                value={
                                    formData?.gender === "M"
                                    ? "Nam"
                                    : formData?.gender === "F"
                                    ? "Nữ"
                                    : formData?.gender === "O"
                                    ? "Khác"
                                    : "Không xác định"
                                }
                            />
              <InfoItem
                label="Ngày sinh"
                value={
                  formData?.dob
                    ? new Date(formData?.dob).toLocaleDateString("vi-VN")
                    : "Không rõ"
                }
              />
            </div>
            <Button
              type="primary"
              className="mt-4"
              onClick={() => setIsEditing(true)}
            >
              Chỉnh sửa
            </Button>
          </>
        ) : (
          <FormEditProfile
            form={form}
            formData={formData}
            handleUpdate={handleUpdate}
          />
        )}
      </div>
    </div>
  );
}

const InfoItem = ({ label, value }) => (
  <div className="flex justify-between border-b pb-2">
    <span className="text-gray-500">{label}</span>
    <span className="font-medium">{value}</span>
  </div>
);

/* --- Đổi mật khẩu --- */
function ChangePasswordTab({ randomId }) {
  useEffect(() => {
    window.location.href = `/account/forgot-password/?redirect=${randomId}`;
  }, [randomId]);

  return <Spin tip="Đang chuyển hướng đến trang đổi mật khẩu..." />;
}

/* --- Nhật ký đăng nhập --- */
function LoginLog({ accountId }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await api.get(`audits/login-logs/${accountId}/`);
        setLogs(res.data);
      } catch {
        message.error("Không thể tải dữ liệu giám sát đăng nhập.");
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, [accountId]);

  const columns = [
    { title: "IP", dataIndex: "ip_address", key: "ip_address" },
    { title: "Trình duyệt", dataIndex: ["device_info", "browser"], key: "browser" },
    { title: "Phần mềm", dataIndex: ["device_info", "os"], key: "os" },
    {
      title: "Thiết bị",
      key: "device_type",
      render: (_, record) => {
        const device = record.device_info;
        if (!device) return "Không xác định";
        if (device.is_mobile) return "Điện thoại";
        if (device.is_tablet) return "Máy tính bảng";
        if (device.is_pc) return "Máy tính";
        return "Khác";
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (v) =>
        v === "S" ? (
          <span className="text-green-600">Thành công</span>
        ) : (
          <span className="text-red-500">Thất bại</span>
        ),
    },
    {
      title: "Đăng nhập",
      dataIndex: "login_time",
      render: (t) => new Date(t).toLocaleString(),
    },
    {
      title: "Đăng xuất",
      dataIndex: "logout_time",
      render: (t) =>
        t ? new Date(t).toLocaleString() : <Tag color="yellow">Chưa đăng xuất</Tag>,
    },
  ];

  return loading ? (
    <Spin className="flex justify-center" />
  ) : (
    <Table dataSource={logs} columns={columns} rowKey="login_code" />
  );
}

/* --- Tab Hướng dẫn --- */
function GuideTab() {
  return (
    <div className="p-6 rounded-xl border">
      <Title level={4}>Hướng dẫn sử dụng</Title>
      <p className="text-gray-500 mt-2">
        Đây là phần hướng dẫn chi tiết cách sử dụng hệ thống ATTEND 3D dành cho giảng viên.
      </p>
    </div>
  );
}

/* --- Tab Đăng xuất --- */
function LogoutTab() {
  const [isModalVisible, setIsModalVisible] = useState(true);

  return (
    <Modal
      title="Xác nhận đăng xuất"
      open={isModalVisible}
      onOk={logout}
      onCancel={() => setIsModalVisible(false)}
      okText="Đăng xuất"
      cancelText="Hủy"
      okButtonProps={{ danger: true }}
    >
      <p>Bạn có chắc chắn muốn đăng xuất không?</p>
    </Modal>
  );
}
