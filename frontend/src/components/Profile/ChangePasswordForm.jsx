import React from "react";
import { Button, Form, Input, Typography } from "antd";

const { Title } = Typography;

export default function ChangePasswordForm() {
    return (
        <div className="bg-white p-6 rounded-xl border">
            <Title level={4}>Đổi mật khẩu</Title>
            <Form
                layout="vertical"
                onFinish={(values) => {
                    console.log("Form values:", values);
                }}
            >
                <Form.Item
                    label="Mật khẩu mới"
                    name="password"
                    rules={[
                        { required: true, message: "Vui lòng nhập mật khẩu mới!" },
                        {
                            min: 8,
                            message: "Mật khẩu phải có ít nhất 8 ký tự!",
                        },
                        {
                            pattern: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*()_+]*$/,
                            message: "Mật khẩu phải chứa cả chữ cái và số!",
                        },
                    ]}
                >
                    <Input.Password
                        placeholder="Nhập mật khẩu mới"
                        style={{ borderWidth: 1.5, boxShadow: 'none' }}
                        size="large"
                    />
                </Form.Item>

                <Form.Item
                    label="Xác nhận mật khẩu"
                    name="confirmPassword"
                    dependencies={["password"]}
                    rules={[
                        { required: true, message: "Vui lòng xác nhận mật khẩu!" },
                        ({ getFieldValue }) => ({
                            validator(_, value) {
                                if (!value || getFieldValue("password") === value) {
                                    return Promise.resolve();
                                }
                                return Promise.reject(
                                    new Error("Mật khẩu xác nhận không khớp!")
                                );
                            },
                        }),
                    ]}
                >
                    <Input.Password
                        placeholder="Xác nhận mật khẩu"
                        style={{ borderWidth: 1.5, boxShadow: 'none' }}
                        size="large"
                    />
                </Form.Item>

                <Form.Item shouldUpdate>
                    {({ getFieldValue, getFieldsError }) => {
                        const password = getFieldValue("password");
                        const confirmPassword = getFieldValue("confirmPassword");
                        const hasErrors = getFieldsError().some(({ errors }) => errors.length);

                        const isDisabled =
                            !password ||
                            !confirmPassword ||
                            password !== confirmPassword ||
                            hasErrors;

                        return (
                            <Button
                                type="primary"
                                htmlType="submit"
                                disabled={isDisabled}
                                security="high"
                                size="large"
                            >
                                Đổi mật khẩu
                            </Button>
                        );
                    }}
                </Form.Item>
            </Form>
        </div>
    );
}