import React from "react";
import { Form, Input } from "antd";
import { IdcardOutlined } from "@ant-design/icons";

const LoginFormItems = () => (
    <>
        <Form.Item
            label="Số điện thoại"
            name="phone_number"
            rules={[
                { required: true, message: "Vui lòng nhập số điện thoại!" },
                {
                    pattern: /^(096|097|086|098|039|038|037|036|035|034|033|032|083|084|085|081|088|082|091|094|070|076|077|078|079|089|090|093|092|056|058|099|059|087)\d{7}$/,
                    message: "Số điện thoại không hợp lệ!",
                },
            ]}
        >
            <Input
                size="large"
                suffix={<IdcardOutlined />}
                placeholder="Nhập số điện thoại"
                maxLength={10}
                autoComplete="off"
                style={{ borderWidth: 1.5, boxShadow: "none" }}
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
                autoComplete="off"
                style={{ borderWidth: 1.5, boxShadow: "none" }}
            />
        </Form.Item>
    </>
);

export default LoginFormItems;