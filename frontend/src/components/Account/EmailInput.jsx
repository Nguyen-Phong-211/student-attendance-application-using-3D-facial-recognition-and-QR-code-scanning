import React from "react";
import { Form, Input } from "antd";
import { ProfileOutlined } from "@ant-design/icons";

export default function EmailInput({ apiErrors }) {
    return (
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
                style={{ borderWidth: 1.5, boxShadow: 'none' }}
            />
        </Form.Item>
    );
}