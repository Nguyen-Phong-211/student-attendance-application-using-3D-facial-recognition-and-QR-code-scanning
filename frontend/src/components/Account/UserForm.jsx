import React, { useEffect } from "react";
import { Form, Input, Radio, DatePicker } from "antd";
import dayjs from "dayjs";

export default function UserForm({ form }) {
    const generateStudentCode = () => {
        return Math.floor(1000000000 + Math.random() * 9000000000).toString();
    };

    useEffect(() => {
        const currentCode = form.getFieldValue("student_code");
        if (!currentCode) {
            form.setFieldsValue({
                student_code: generateStudentCode(),
            });
        }
    }, [form]);

    return (
        <>
            <Form.Item
                label="Họ và tên"
                name="fullname"
                rules={[{ required: true, message: "Vui lòng nhập họ tên!" }]}
                preserve={true}
            >
                <Input
                    placeholder="Nguyễn Văn A"
                    size="large"
                    style={{ borderWidth: 1.5, boxShadow: "none" }}
                />
            </Form.Item>
            <Form.Item
                name="student_code"
                rules={[{ required: true, message: "Vui lòng nhập mã số sinh viên!" }]}
                preserve={true}
                hidden
            >
                <Input />
            </Form.Item>

            <Form.Item
                label="Giới tính"
                name="gender"
                rules={[{ required: true, message: "Vui lòng chọn giới tính!" }]}
                preserve={true}
            >
                <Radio.Group
                    options={[
                        { value: 1, label: "Nam" },
                        { value: 2, label: "Nữ" },
                    ]}
                />
            </Form.Item>

            <Form.Item
                label="Ngày sinh"
                name="dob"
                rules={[
                    { required: true, message: "Vui lòng chọn ngày sinh!" },
                    () => ({
                        validator(_, value) {
                            if (!value) return Promise.resolve();
                            const age = dayjs().diff(value, "year");
                            if (age < 17) {
                                return Promise.reject(new Error("Tuổi phải lớn hơn hoặc bằng 17"));
                            }
                            return Promise.resolve();
                        },
                    }),
                ]}
                preserve={true}
            >
                <DatePicker
                    format="DD/MM/YYYY"
                    size="large"
                    placeholder="DD/MM/YYYY"
                    className="w-full"
                    disabledDate={(current) => current && current > dayjs()}
                    style={{ borderWidth: 1.5, boxShadow: "none" }}
                />
            </Form.Item>
        </>
    );
}