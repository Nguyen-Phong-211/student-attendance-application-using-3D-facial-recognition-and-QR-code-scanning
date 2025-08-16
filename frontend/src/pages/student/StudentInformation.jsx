import React, { useState, useEffect, useCallback } from "react";
import {
  Typography,
  Card,
  Button,
  Input,
  message,
  Form,
  Select,
  Radio,
  DatePicker,
  Upload,
  Tag,
} from "antd";
import HeaderUpdate from "../../components/Header/HeaderUpdate";
import { InboxOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import Footer from "../../components/Footer";

const { Title } = Typography;
const { Option } = Select;
const { Dragger } = Upload;

export default function UpdateInformationPage() {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const [imageUrl, setImageUrl] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [majors, setMajors] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [avatarBase64, setAvatarBase64] = useState(null);
  const [user, setUser] = useState(null);

  const token = localStorage.getItem("access_token");

  const uploadProps = {
    name: "file",
    multiple: false,
    showUploadList: false,
    beforeUpload(file) {
      const isImage = file.type.startsWith("image/");
      const isLt2M = file.size / 1024 / 1024 < 2;

      if (!isImage) {
        message.error("Chỉ được chọn file ảnh!");
        return Upload.LIST_IGNORE;
      }

      if (!isLt2M) {
        message.error("Ảnh phải nhỏ hơn 2MB!");
        return Upload.LIST_IGNORE;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setImageUrl(e.target.result);
        setAvatarBase64(e.target.result);
      };
      reader.readAsDataURL(file);

      return false;
    },
  };
  useEffect(() => {
    document.title = "ATTEND 3D - Cập nhật thông tin tài khoản";

    const fetchDepartments = async () => {
      if (!token) return;
      try {
        const res = await fetch("http://127.0.0.1:8000/api/v1/departments/", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          console.error("Fetch departments failed:", res.status);
          throw new Error(`HTTP ${res.status}`);
        }

        const data = await res.json();
        setDepartments(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Fetch departments error:", err);
        message.error("Không tải được danh sách khoa");
        setDepartments([]); 
      }
    };

    const loadUserFromStorage = () => {
      const storedUser = localStorage.getItem("user");
      if (storedUser && storedUser !== "undefined") {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          form.setFieldsValue({
            email: parsedUser.email ?? undefined,
            phone_number: parsedUser.phone_number ?? undefined,
          });
        } catch (err) {
          console.error("Error parsing user from localStorage:", err);
          localStorage.removeItem("user");
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };

    fetchDepartments();
    loadUserFromStorage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  const handleDepartmentChange = useCallback(
    async (value) => {
      setSelectedDepartment(value);
      setMajors([]);
      form.setFieldsValue({ major: undefined });

      if (!value) return;

      try {
        const res = await fetch(
          `http://127.0.0.1:8000/api/v1/majors/${value}/`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) {
          console.error("Fetch majors failed:", res.status);
          if (res.status === 401) {
            message.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
            return;
          }
          throw new Error(`HTTP ${res.status}`);
        }

        const data = await res.json();

        if (Array.isArray(data)) {
          setMajors(data);
        } else if (data && Array.isArray(data.results)) {
          setMajors(data.results);
        } else if (data && data.major_id) {
          setMajors([data]);
        } else {
          setMajors([]);
        }
      } catch (err) {
        console.error("Load majors error:", err);
        message.error("Không tải được danh sách chuyên ngành");
        setMajors([]);
      }
    },
    [form, token]
  );

  const onFinish = async (values) => {
    localStorage.setItem("allInforUser", JSON.stringify(values));

    if (!user?.account_id) {
      return message.error("Không tìm thấy thông tin tài khoản. Vui lòng đăng nhập lại.");
    }

    try {
      const payload = {
        fullname: values.fullname,
        student_code: values.student_code || values.studentcode,
        gender: values.gender,
        dob: values.dob ? values.dob.format("YYYY-MM-DD") : null,
        email: values.email,
        phone: values.phone,
        major: values.major,
        account: user.account_id,
        status: "1",
        department: values.department,
      };

      const response = await fetch("http://127.0.0.1:8000/api/v1/students/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => null);
        return message.error("Lỗi: " + JSON.stringify(err || response.status));
      }

      message.success("Cập nhật thông tin thành công!");
      navigate("/");
      window.location.reload();

      if (avatarBase64 && user?.account_id) {
        try {
          await fetch(
            `http://127.0.0.1:8000/api/v1/accounts/${user.account_id}/update_avatar/`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ avatar_base64: avatarBase64 }),
            }
          );
        } catch (err) {
          console.error("Update avatar failed:", err);
        }
      }

      navigate("/");
      window.location.reload();
    } catch (err) {
      console.error("Submit error:", err);
      message.error("Lỗi kết nối: " + (err.message || err));
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-800 flex flex-col">
      <div className="w-full mx-auto px-6 flex-grow">
        <HeaderUpdate />

        <main className="mt-4 flex flex-col items-center">
          <div className="w-full p-5 rounded-lg mt-6">
            <Card title={<Title level={3}>Cập nhật thông tin sinh viên</Title>} className="p-2">
              <Form
                layout="vertical"
                form={form}
                name="update-user"
                onFinish={onFinish}
                initialValues={{ gender: 1 }}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Form.Item
                      label="Họ và tên"
                      name="fullname"
                      rules={[{ required: true, message: "Vui lòng nhập họ tên!" }]}
                    >
                      <Input placeholder="Nguyễn Văn A" size="large" />
                    </Form.Item>

                    <Form.Item
                      label="Mã số sinh viên"
                      name="student_code"
                      rules={[{ required: true, message: "Vui lòng nhập mã số sinh viên!" }]}
                    >
                      <Input size="large" />
                    </Form.Item>

                    <Form.Item
                      label="Giới tính"
                      name="gender"
                      rules={[{ required: true, message: "Vui lòng chọn giới tính!" }]}
                    >
                      <Radio.Group options={[{ value: 1, label: "Nam" }, { value: 2, label: "Nữ" }]} />
                    </Form.Item>

                    <Form.Item
                      label="Ngày sinh"
                      name="dob"
                      rules={[
                        { required: true, message: "Vui lòng chọn ngày sinh!" },
                        () => ({
                          validator(_, value) {
                            if (!value) return Promise.resolve();
                            const age = dayjs().diff(value, "year");
                            if (age < 17) {
                              return Promise.reject(new Error("Tuổi phải ≥ 17"));
                            }
                            return Promise.resolve();
                          },
                        }),
                      ]}
                    >
                      <DatePicker format="DD/MM/YYYY" size="large" className="w-full" disabledDate={(current) => current && current > dayjs()} />
                    </Form.Item>

                    <Form.Item label="Avatar (Optional)" name="avatar">
                      <Dragger {...uploadProps}>
                        <p className="ant-upload-drag-icon"><InboxOutlined /></p>
                        <p className="ant-upload-text">Click hoặc kéo ảnh vào đây để upload avatar</p>
                        <p className="ant-upload-hint">Kích thước &lt; 2MB</p>
                      </Dragger>
                    </Form.Item>

                    {imageUrl && <img src={imageUrl} alt="avatar" style={{ marginTop: 16, width: 200, borderRadius: 8 }} />}
                  </div>

                  <div>
                    <Form.Item label="Trạng thái">
                      <Tag color="green">Đang hoạt động</Tag>
                    </Form.Item>

                    <Form.Item label="Khoa" name="department" rules={[{ required: true, message: "Vui lòng chọn khoa!" }]}>
                      <Select
                        showSearch
                        size="large"
                        placeholder="Chọn khoa"
                        allowClear
                        onChange={handleDepartmentChange}
                        filterOption={(input, option) => option?.children?.toLowerCase().includes(input.toLowerCase())}
                      >
                        {Array.isArray(departments) && departments.map((dept) => (
                          <Option key={dept.department_id} value={dept.department_id}>
                            {dept.department_name}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>

                    <Form.Item label="Chuyên ngành" name="major" rules={[{ required: true, message: "Vui lòng chọn chuyên ngành!" }]}>
                      <Select
                        showSearch
                        placeholder="Chọn chuyên ngành"
                        size="large"
                        disabled={!selectedDepartment}
                        allowClear
                        filterOption={(input, option) => option?.children?.toLowerCase().includes(input.toLowerCase())}
                      >
                        {Array.isArray(majors) && majors.map((maj) => maj.major_id && (
                          <Option key={maj.major_id} value={maj.major_id}>
                            {maj.major_name}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </div>
                </div>

                <Form.Item>
                  <Button type="primary" htmlType="submit" size="large">Cập nhật</Button>
                </Form.Item>
              </Form>
            </Card>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}