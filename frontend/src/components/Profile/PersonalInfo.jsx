import React, { useState } from "react";
import { Avatar, Button, Input, Typography, Select, DatePicker } from "antd";
import { UserOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const { Title } = Typography;
const { Option } = Select;

export default function PersonalInfo() {
    const [isEditing, setIsEditing] = useState(false);

    const [formData, setFormData] = useState({
        fullName: "Nguyễn Phong",
        studentId: "21070601",
        phone: "0825025347",
        email: "phongnguyen.050503@gmail.com",
        gender: "Nam",
        dob: "2003-05-05",
        faculty: "Công nghệ thông tin",
        major: "Hệ thống thông tin",
    });

    const handleUpdate = () => {
        console.log("Thông tin mới:", formData);
        setIsEditing(false);
    };
    
    return (
        <div className="bg-white rounded-xl p-8 border">
            <Title level={4}>Thông tin cá nhân</Title>
            <div className="flex flex-col items-center mt-4">
                <Avatar size={80} icon={<UserOutlined />} className="mb-4" />

                {!isEditing ? (
                    <div className="w-full max-w-lg space-y-4 mt-4">
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-gray-500">Họ và tên</span>
                            <span className="font-medium text-gray-900">{formData.fullName}</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-gray-500">Mã số sinh viên</span>
                            <span className="font-medium text-gray-900">{formData.studentId}</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-gray-500">Số điện thoại</span>
                            <span className="font-medium text-gray-900">{formData.phone}</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-gray-500">Email</span>
                            <span className="font-medium text-gray-900">{formData.email}</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-gray-500">Giới tính</span>
                            <span className="font-medium text-gray-900">{formData.gender}</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-gray-500">Ngày sinh</span>
                            <span className="font-medium text-gray-900">
                                {new Date(formData.dob).toLocaleDateString("vi-VN")}
                            </span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-gray-500">Khoa</span>
                            <span className="font-medium text-gray-900">{formData.faculty}</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-gray-500">Chuyên ngành</span>
                            <span className="font-medium text-gray-900">{formData.major}</span>
                        </div>
                    </div>
                ) : (
                    <div className="w-full max-w-lg space-y-4 mt-4">
                        <Input
                            value={formData.fullName}
                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                            placeholder="Họ và tên"
                            size="large"
                            style={{ borderWidth: 1.5, boxShadow: 'none' }}
                            required
                        />
                        <Input
                            value={formData.studentId}
                            onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                            placeholder="Mã số sinh viên"
                            size="large"
                            style={{ borderWidth: 1.5, boxShadow: 'none' }}
                            required
                        />
                        <Input
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            placeholder="Số điện thoại"
                            size="large"
                            style={{ borderWidth: 1.5, boxShadow: 'none' }}
                            required
                        />
                        <Input
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="Email"
                            type="email"
                            size="large"
                            style={{ borderWidth: 1.5, boxShadow: 'none' }}
                            required
                        />
                        <Select
                            value={formData.gender}
                            onChange={(value) => setFormData({ ...formData, gender: value })}
                            className="w-full custom-select"
                            size="large"
                        >
                            <Option value="Nam">Nam</Option>
                            <Option value="Nữ">Nữ</Option>
                        </Select>
                        <DatePicker
                            value={formData.dob ? dayjs(formData.dob) : null}
                            onChange={(date, dateString) =>
                                setFormData({ ...formData, dob: dateString })
                            }
                            format="DD/MM/YYYY"
                            size="large"
                            style={{ width: "100%", borderWidth: 1.5, boxShadow: "none" }}
                            required
                        />

                        <Select
                            value={formData.faculty}
                            onChange={(e) => setFormData({ ...formData, faculty: e.target.value })}
                            placeholder="Khoa"
                            size="large"
                            className="w-full custom-select"
                        >
                            <Option value="Công nghệ thông tin">Công nghệ thông tin</Option>
                            <Option value="Khoa học tập trình">Khoa học tập trình</Option>
                        </Select>
                        <Select
                            value={formData.major}
                            onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                            placeholder="Chuyên ngành"
                            size="large"
                            className="w-full custom-select"
                            required
                        >
                            <Option value="Hệ thống thông tin">Hệ thống thông tin</Option>
                            <Option value="Phần mềm">Phần mềm</Option>
                        </Select>
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
                        className="mt-6 rounded-full px-6"
                        onClick={handleUpdate}
                    >
                        Cập nhật
                    </Button>
                )}
            </div>
        </div>
    );
}