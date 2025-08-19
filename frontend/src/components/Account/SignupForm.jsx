import React from "react";
import { Form, Button, Typography } from "antd";
import PhoneInput from "./PhoneInput";
import EmailInput from "./EmailInput";
import PasswordInput from "./PasswordInput";
import RoleSelect from "./RoleSelect";

const { Title } = Typography;

export default function SignupForm({ onFinish, loading, apiErrors, randomId }) {
    return (
        <Form
            name="signup"
            onFinish={onFinish}
            layout="vertical"
            method="POST"
            autoComplete="off"
        >
            <Title level={2} className="text-center mb-8 text-gray-800">
                Đăng ký
            </Title>

            <PhoneInput apiErrors={apiErrors} />
            <EmailInput apiErrors={apiErrors} />
            <PasswordInput />
            <RoleSelect />

            <Form.Item>
                <Button type="primary" htmlType="submit" block size="large" loading={loading}>
                    Đăng ký
                </Button>
            </Form.Item>

            <div className="text-center">
                <span className="text-gray-600">Bạn đã có tài khoản? </span>
                <a href={`/account/login/${randomId}`} className="text-blue-600 hover:underline">
                    Đăng nhập
                </a>
            </div>
        </Form>
    );
}