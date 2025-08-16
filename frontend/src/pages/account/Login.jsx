import React, { useEffect } from "react";
import { Form, Button, Input, Typography, message } from "antd";
import loginImage from '../../assets/general/login.jpg';
import { IdcardOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { v4 as uuidv4 } from 'uuid';

const { Title } = Typography;

const Login = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();

  const navigate = useNavigate();
  const { executeRecaptcha } = useGoogleReCaptcha();

  const randomId = uuidv4();

  useEffect(() => {
    document.title = "ATTEND 3D - Đăng nhập";
  }, []);

  const onFinish = async (values) => {
    if (!executeRecaptcha) {
      messageApi.error("Lỗi reCAPTCHA.");
      return;
    }

    const captchaToken = await executeRecaptcha("login_action");

    try {
      const response = await fetch("http://127.0.0.1:8000/api/v1/accounts/login/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...values,
          captcha: captchaToken
        }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("access_token", data.access);
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("avatar_url", data.user.avatar);

        messageApi.success("Đăng nhập thành công!");

        const role = data.user?.role;
        const role_id = data.user?.role_id;
        if (role === 'superadmin' && role_id === 4) {
          navigate('/admin/dashboard');
        } else {
          navigate('/');
        }
      } else {
        if (data.errors?.non_field_errors) {
          messageApi.error(data.errors.non_field_errors[0]);
        } else if (data.errors?.phone_number) {
          messageApi.error("Tài khoản không tồn tại");
        } else {
          messageApi.error("Đăng nhập thất bại");
        }
      }
    } catch (error) {
      messageApi.error("Lỗi kết nối máy chủ");
    }
  };

  return (
    <div className="h-screen w-full flex flex-col md:flex-row">
      <div className="w-full md:w-7/12 flex items-center justify-center">
        <img
          src={loginImage}
          alt="Login illustration"
          className="w-[90%] h-[90%] object-contain"
        />
      </div>
      <div className="w-full md:w-5/12 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          <Title level={2} className="text-center mb-8 text-gray-800">Đăng nhập</Title>
          {contextHolder}
          <Form
            name="login"
            layout="vertical"
            method="POST"
            form={form}
            onFinish={onFinish}
            autoComplete="off"
          >
            <Form.Item
              label="Số điện thoại"
              name="phone_number"
              rules={[
                { required: true, message: 'Vui lòng nhập số điện thoại!' },
                {
                  pattern: /^(096|097|086|098|039|038|037|036|035|034|033|032|083|084|085|081|088|082|091|094|070|076|077|078|079|089|090|093|092|056|058|099|059|087)\d{7}$/,
                  message: 'Số điện thoại không hợp lệ!'
                }
              ]}
            >
              <Input
                size="large"
                suffix={<IdcardOutlined />}
                placeholder="Nhập số điện thoại"
                maxLength={10}
                autoComplete="off"
                style={{ borderWidth: 1.5, boxShadow: 'none'}}
              />
            </Form.Item>

            <Form.Item
              label="Mật khẩu"
              name="password"
              rules={[
                { required: true, message: 'Vui lòng nhập mật khẩu!' },
                {
                  pattern: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]+$/,
                  message: 'Mật khẩu phải chứa cả chữ và số!',
                },
              ]}
            >
              <Input.Password
                size="large"
                placeholder="Nhập mật khẩu"
                minLength={8}
                autoComplete="off"
                style={{ borderWidth: 1.5, boxShadow: 'none'}}
              />
            </Form.Item>

            <div className="text-right mb-4">
              <a href={`/account/forgot-password/${randomId}`} className="text-blue-600 hover:underline text-sm">
                Quên mật khẩu?
              </a>
            </div>

            <Form.Item>
              <Button type="primary" htmlType="submit" block size="large">
                Đăng nhập
              </Button>
            </Form.Item>

            <div className="text-center">
              <span className="text-gray-600">Chưa có tài khoản? </span>
              <a href={`/account/signup/${randomId}`} className="text-blue-600 hover:underline">
                Đăng ký
              </a>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default Login;