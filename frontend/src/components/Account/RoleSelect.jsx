import React from "react";
import { Form, Radio } from "antd";

export default function RoleSelect() {
    const options = [
        { label: "Sinh viên", value: 3 },
        { label: "Giảng viên", value: 2 },
    ];

    return (
        <Form.Item
            label="Bạn là"
            name="role"
            rules={[{ required: true, message: "Vui lòng chọn vai trò!" }]}
        >
            <Radio.Group options={options} optionType="button" buttonStyle="solid" />
        </Form.Item>
    );
}