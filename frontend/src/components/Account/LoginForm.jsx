import React from "react";
import { Form, Button } from "antd";
import { ContactsOutlined } from "@ant-design/icons";
import LoginFormItems from "./LoginFormItems";
import LoginFooterLinks from "./LoginFooterLinks";
import { useAuth } from "../../auth/AuthContext";

const LoginForm = ({ messageApi, executeRecaptcha, navigate, randomId, loading, setLoading }) => {
    const [form] = Form.useForm();
    const { login } = useAuth();

    const onFinish = async (values) => {
        if (!executeRecaptcha) {
            messageApi.error("Lỗi reCAPTCHA.");
            return;
        }

        try {
            setLoading(true);
            const captchaToken = await executeRecaptcha("login_action");
            if (!captchaToken) {
                messageApi.error("Vui lòng xác minh reCAPTCHA.");
                return;
            }
            // Call the login function from AuthContext
            const loggedInUser = await login({ ...values, captcha: captchaToken });

            messageApi.success("Đăng nhập thành công!");

            const params = new URLSearchParams(window.location.search);
            const redirect = params.get("redirect");

            if (redirect) {
                navigate(redirect);
            } else {
                if (loggedInUser?.role === "admin") {
                    navigate("/admin/dashboard");
                } else {
                    navigate("/");
                }
            }
        } catch (error) {
        
            const errMsg =
                error?.response?.data?.errors?.non_field_errors?.[0] || 
                error?.response?.data?.detail ||
                "Đăng nhập thất bại. Vui lòng thử lại!";

            messageApi.error(errMsg);
        }

        setLoading(false);
    };

    return (
        <Form
            name="login"
            layout="vertical"
            method="POST"
            form={form}
            onFinish={onFinish}
            autoComplete="off"
        >
            <LoginFormItems />
            <LoginFooterLinks randomId={randomId} />
            <Form.Item>
                <Button type="primary" htmlType="submit" block size="large" loading={loading}>
                    Đăng nhập
                </Button>
            </Form.Item>

            <div className="text-center">
                <span className="text-gray-600">Chưa có tài khoản? </span>
                <a
                    href={`/account/signup/${randomId}`}
                    className="text-blue-600 hover:underline"
                >
                    Đăng ký
                </a>
            </div>
            <div className="text-gray-600 text-center mt-4 border-[1.5px] rounded-[10px] border-gray-200 py-2 hover:bg-gray-100">
                <a href="mailto:zephyrnguyen.vn@gmail.com">
                    <ContactsOutlined /> Liên hệ quản trị viên nếu quên mật khẩu.
                </a>
            </div>
        </Form>
    );
};

export default LoginForm;