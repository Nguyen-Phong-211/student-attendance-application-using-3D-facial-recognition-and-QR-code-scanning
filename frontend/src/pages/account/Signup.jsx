import React, { useEffect, useState } from "react";
import { Form, Button, Input, Typography, message, Radio } from "antd";
import signupImage from "../../assets/general/signup.jpg";
import { PhoneOutlined, ProfileOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

const { Title } = Typography;

const Signup = () => {
  const [, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState(false);
  const [apiErrors, setApiErrors] = useState({});
  const navigate = useNavigate();
  const randomId = uuidv4();

  useEffect(() => {
    document.title = "ATTEND 3D - Đăng ký";
  }, []);

  const onFinish = async (values) => {
    setLoading(true);
    setApiErrors({});
    try {
      const res = await fetch("http://127.0.0.1:8000/api/v1/accounts/send_otp/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const data = await res.json();

      if (!res.ok) {
        let messages = [];
        if (data.error && typeof data.error === "object") {
          messages = Object.values(data.error)
            .map((arr) => (Array.isArray(arr) ? arr.join(", ") : arr))
            .filter(Boolean);
        } else if (data.error && typeof data.error === "string") {
          messages = [data.error];
        }
        if (messages.length === 0) {
          messages = ["Đăng ký không thành công."];
        }
        messages.forEach((msg) => message.error(msg));
        setLoading(false);
        return;
      }

      localStorage.setItem("pending_signup", JSON.stringify(values));
      localStorage.setItem("user", JSON.stringify(values));
      localStorage.setItem("otp_email", values.email);
      setLoading(false);
      navigate(`/account/verify-otp/${randomId}`);
    } catch (err) {
      console.error(err);
      setLoading(false);
      message.error("Lỗi gửi OTP.");
    }
  };

  const options = [
    { label: "Sinh viên", value: 3 },
    { label: "Giảng viên", value: 2 },
  ];

  return (
    <div className="h-screen w-full flex flex-col md:flex-row">
      <div className="w-full md:w-7/12 flex items-center justify-center">
        <img
          src={signupImage}
          alt="Signup illustration"
          className="w-[90%] h-[90%] object-cover rounded-lg"
        />
      </div>
      <div className="w-full md:w-5/12 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          {contextHolder}
          <Title level={2} className="text-center mb-8 text-gray-800">
            Đăng ký
          </Title>

          <Form
            name="signup"
            onFinish={onFinish}
            layout="vertical"
            method="POST"
            autoComplete="off"
          >
            <Form.Item
              label="Số điện thoại"
              name="phone_number"
              validateStatus={apiErrors.phone_number ? "error" : ""}
              help={apiErrors.phone_number?.[0]}
              rules={[
                { required: true, message: "Vui lòng nhập số điện thoại!" },
                {
                  pattern:
                    /^(096|097|086|098|039|038|037|036|035|034|033|032|083|084|085|081|088|082|091|094|070|076|077|078|079|089|090|093|092|056|058|099|059|087)\d{7}$/,
                  message: "Số điện thoại không hợp lệ!",
                },
              ]}
            >
              <Input
                size="large"
                suffix={<PhoneOutlined />}
                placeholder="Nhập số điện thoại"
                maxLength={10}
                style={{ borderWidth: 1.5, boxShadow: 'none'}}
              />
            </Form.Item>

            <Form.Item
              label="Email"
              name="email"
              validateStatus={apiErrors.email ? "error" : ""}
              help={apiErrors.email?.[0]}
              rules={[
                { required: true, message: "Vui lòng nhập email!" },
                { type: "email", message: "Email không đúng định dạng!" },
              ]}
            >
              <Input
                size="large"
                suffix={<ProfileOutlined />}
                placeholder="Nhập email"
                style={{ borderWidth: 1.5, boxShadow: 'none'}}
              />
            </Form.Item>

            <Form.Item
              label="Mật khẩu"
              name="password"
              rules={[
                { required: true, message: "Vui lòng nhập mật khẩu!" },
                {
                  pattern: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]+$/,
                  message: "Mật khẩu phải chứa cả chữ và số!",
                },
              ]}
            >
              <Input.Password
                size="large"
                placeholder="Nhập mật khẩu"
                minLength={8}
                style={{ borderWidth: 1.5, boxShadow: 'none'}}
              />
            </Form.Item>

            <Form.Item
              label="Bạn là"
              name="role"
              rules={[{ required: true, message: "Vui lòng chọn vai trò!" }]}
            >
              <Radio.Group
                options={options}
                optionType="button"
                buttonStyle="solid"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                block
                size="large"
                loading={loading}
              >
                Đăng ký
              </Button>
            </Form.Item>

            <div className="text-center">
              <span className="text-gray-600">Bạn đã có tài khoản? </span>
              <a
                href={`/account/login/${randomId}`}
                className="text-blue-600 hover:underline"
              >
                Đăng nhập
              </a>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default Signup;