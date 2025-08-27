import React from "react";
import { Form, Input, Radio, DatePicker } from "antd";
import dayjs from "dayjs";

export default function UserForm({ form }) {
    return (
        <>
            <Form.Item
                label="Họ và tên"
                name="fullname"
                rules={[{ required: true, message: "Vui lòng nhập họ tên!" }]}
                preserve={true}
            >
                <Input placeholder="Nguyễn Văn A" size="large" style={{ borderWidth: 1.5, boxShadow: 'none' }} />
            </Form.Item>

            <Form.Item
                label="Mã số sinh viên"
                name="student_code"
                rules={[{ required: true, message: "Vui lòng nhập mã số sinh viên!" }]}
                preserve={true}
            >
                <Input size="large" placeholder="XXXXXXX" style={{ borderWidth: 1.5, boxShadow: 'none' }} />
            </Form.Item>

            <Form.Item
                label="Giới tính"
                name="gender"
                rules={[{ required: true, message: "Vui lòng chọn giới tính!" }]}
                preserve={true}
            >
                <Radio.Group options={[{ value: 1, label: "Nam" }, { value: 2, label: "Nữ" }]} />
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
                            if (age < 17) return Promise.reject(new Error("Tuổi phải ≥ 17"));
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
                    style={{ borderWidth: 1.5, boxShadow: 'none' }}
                />
            </Form.Item>
        </>
    );
}