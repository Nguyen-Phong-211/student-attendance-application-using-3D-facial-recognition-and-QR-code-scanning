import React from "react";
import { Form, Input } from "antd";

export default function PasswordInput() {
    return (
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
                style={{ borderWidth: 1.5, boxShadow: 'none' }}
            />
        </Form.Item>
    );
}