import React, { useState, useEffect } from "react";
import { Avatar, Button, Input, Typography, Select, DatePicker, message, Form, Alert } from "antd";
import { UserOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import api from "../../api/axiosInstance";

const { Title } = Typography;

export default function PersonalInfo({ formData, setFormData, accountId }) {
    const [isEditing, setIsEditing] = useState(false);
    const [form] = Form.useForm();

    const res = localStorage.getItem("user");
    const user = JSON.parse(res);
    const avatarUrl = user.avatar;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await api.get(`/students/${accountId}/`);
                setFormData(res.data);
            } catch (err) {
                if (err.response?.status === 404) {
                    setFormData(null);
                } else {
                    console.error(err);
                    message.error("Không lấy được thông tin cá nhân");
                }
            }
        };
    
        if (accountId) {
            fetchData();
        }
    }, [accountId, setFormData]);    

    const handleUpdate = async (values) => {
        try {
            await api.put(`/students/${accountId}/`, {
                ...values,
                dob: values.dob ? values.dob.format("YYYY-MM-DD") : null,
            });
            message.success("Cập nhật thành công");

            const res = await api.get(`/students/${accountId}/`);
            setFormData(res.data);

            setIsEditing(false);
        } catch (err) {
            console.error("Update error:", err.response?.data || err.message);

            if (err.response?.data?.dob) {
                form.setFields([
                    {
                        name: "dob",
                        errors: err.response.data.dob,
                    },
                ]);
            } else {
                message.error("Cập nhật thất bại. Vui lòng thử lại");
            }
        }
    };

    if (!formData) {
        return (
            <div className="bg-white rounded-xl p-8 border">
                <Alert
                    message="Chưa có thông tin. Vui lòng cập nhật"
                    type="warning"
                    showIcon
                    className="mb-4"
                />
                {!isEditing ? (
                    <Button
                        type="primary"
                        size="large"
                        className="rounded-full px-6"
                        onClick={() => setIsEditing(true)}
                    >
                        Cập nhật ngay
                    </Button>
                ) : (
                    <Form
                        layout="vertical"
                        onFinish={handleUpdate}
                        form={form}
                        autoComplete="off"
                    >
                        <Form.Item
                            name="fullname"
                            label="Họ và tên"
                            rules={[{ required: true, message: "Vui lòng nhập họ tên!" }]}
                        >
                            <Input size="large" style={{ borderWidth: 1.5, boxShadow: 'none' }} />
                        </Form.Item>
    
                        <Form.Item
                            name="phone_number"
                            label="Số điện thoại"
                            rules={[{ required: true, message: "Vui lòng nhập số điện thoại!" }]}
                        >
                            <Input size="large" style={{ borderWidth: 1.5, boxShadow: 'none' }} />
                        </Form.Item>
    
                        <Form.Item
                            name="email"
                            label="Email"
                            rules={[{ required: true, message: "Vui lòng nhập email!" }, { type: "email" }]}
                        >
                            <Input size="large" style={{ borderWidth: 1.5, boxShadow: 'none' }} />
                        </Form.Item>
    
                        <Form.Item
                            name="gender"
                            label="Giới tính"
                            rules={[{ required: true, message: "Vui lòng chọn giới tính!" }]}
                        >
                            <Select size="large" className="w-full custom-select">
                                <Select.Option value="1">Nam</Select.Option>
                                <Select.Option value="0">Nữ</Select.Option>
                            </Select>
                        </Form.Item>
    
                        <Form.Item
                            name="dob"
                            label="Ngày sinh"
                            rules={[{ required: true, message: "Vui lòng chọn ngày sinh!" }]}
                        >
                            <DatePicker format="YYYY-MM-DD" size="large" style={{ width: "100%", borderWidth: 1.5, boxShadow: 'none' }} />
                        </Form.Item>
    
                        <Button type="primary" size="large" onClick={() => form.submit()}>
                            Lưu thông tin
                        </Button>
                    </Form>
                )}
            </div>
        );
    }    

    return (
        <div className="bg-white rounded-xl p-8 border">
            <Title level={4}>Thông tin cá nhân</Title>
            <div className="flex flex-col items-center mt-4">
                {avatarUrl ? (
                    <img
                        src={avatarUrl}
                        alt="Avatar"
                        className="w-[100px] h-[100px] object-cover rounded-full mx-auto mb-4"
                    />
                ) : (
                    <Avatar size={64} icon={<UserOutlined />} className="mx-auto mb-4" />
                )}

                {!isEditing ? (
                    <div className="w-full max-w-lg space-y-4 mt-4">
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-gray-500">Họ và tên</span>
                            <span className="font-medium text-gray-900">{formData?.fullname}</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-gray-500">Mã số sinh viên</span>
                            <span className="font-medium text-gray-900">{formData?.student_code}</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-gray-500">Số điện thoại</span>
                            <span className="font-medium text-gray-900">{formData?.phone_number}</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-gray-500">Email</span>
                            <span className="font-medium text-gray-900">{formData?.email}</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-gray-500">Giới tính</span>
                            <span className="font-medium text-gray-900">{formData?.gender === '1' ? "Nam" : "Nữ"}</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-gray-500">Ngày sinh</span>
                            <span className="font-medium text-gray-900">
                                {new Date(formData?.dob).toLocaleDateString("vi-VN")}
                            </span>
                        </div>
                    </div>
                ) : (
                    <div className="w-full max-w-lg space-y-4 mt-4">
                        <Form
                            layout="vertical"
                            onFinish={handleUpdate}
                            initialValues={{
                                ...formData,
                                dob: formData.dob ? dayjs(formData.dob) : null,
                            }}
                            autoComplete="off"
                            form={form}
                        >
                            <Form.Item
                                name="fullname"
                                label="Họ và tên"
                                rules={[{ required: true, message: "Vui lòng nhập họ tên!" }]}
                            >
                                <Input size="large" minLength={5} style={{ borderWidth: 1.5, boxShadow: "none" }} />
                            </Form.Item>

                            <Form.Item
                                name="student_code"
                                label="Mã số sinh viên"
                            >
                                <Input size="large" disabled style={{ borderWidth: 1.5, boxShadow: "none" }} minLength={8} />
                            </Form.Item>

                            <Form.Item
                                name="phone_number"
                                label="Số điện thoại"
                                rules={[
                                    { required: true, message: "Vui lòng nhập số điện thoại!" },
                                    {
                                        pattern:
                                            /^(096|097|086|098|039|038|037|036|035|034|033|032|083|084|085|081|088|082|091|094|070|076|077|078|079|089|090|093|092|056|058|099|059|087)\d{7}$/,
                                        message: "Số điện thoại không hợp lệ!",
                                    },
                                ]}
                            >
                                <Input size="large" style={{ borderWidth: 1.5, boxShadow: "none" }} minLength={10} maxLength={10} />
                            </Form.Item>

                            <Form.Item
                                name="email"
                                label="Email"
                                rules={[
                                    { required: true, message: "Vui lòng nhập email!" },
                                    { type: "email", message: "Email không hợp lệ!" },
                                ]}
                            >
                                <Input size="large" type="email" style={{ borderWidth: 1.5, boxShadow: "none" }} />
                            </Form.Item>

                            <Form.Item
                                name="gender"
                                label="Giới tính"
                                rules={[{ required: true, message: "Vui lòng chọn giới tính!" }]}
                            >
                                <Select size="large" className="w-full custom-select">
                                    <Select.Option value="1">Nam</Select.Option>
                                    <Select.Option value="0">Nữ</Select.Option>
                                </Select>
                            </Form.Item>

                            <Form.Item
                                name="dob"
                                label="Ngày sinh"
                                rules={[{ required: true, message: "Vui lòng chọn ngày sinh!" }]}
                            >
                                <DatePicker format="YYYY-MM-DD" size="large" style={{ width: "100%", borderWidth: 1.5, boxShadow: "none" }} />
                            </Form.Item>
                        </Form>
                    </div>
                )}

                {!isEditing ? (
                    <Button
                        type="primary"
                        size="large"
                        className="mt-6 rounded-full px-6"
                        onClick={() => setIsEditing(true)}
                    >
                        Chỉnh sửa thông tin
                    </Button>
                ) : (
                    <Button
                        type="primary"
                        size="large"
                        className="mt-4 rounded-full px-6"
                        onClick={() => form.submit()}
                    >
                        Cập nhật
                    </Button>
                )}

            </div>
        </div>
    );
}