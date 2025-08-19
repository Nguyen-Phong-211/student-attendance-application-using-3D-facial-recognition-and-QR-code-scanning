import React from "react";
import { Form, Input } from "antd";
import { PhoneOutlined } from "@ant-design/icons";

export default function PhoneInput({ apiErrors }) {
    return (
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
                style={{ borderWidth: 1.5, boxShadow: 'none' }}
            />
        </Form.Item>
    );
}