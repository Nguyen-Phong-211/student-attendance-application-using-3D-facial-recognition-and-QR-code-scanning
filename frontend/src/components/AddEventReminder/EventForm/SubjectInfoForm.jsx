import React from "react";
import { Form, Input, Select, Typography } from "antd";

const { Title } = Typography;

export default function SubjectInfoForm() {
    const academicYear = [
        { label: '2022-2023 - Học kỳ 1', value: '1' },
        { label: '2022-2023 - Học kỳ 2', value: '2' },
        { label: '2023-2024 - Học kỳ 1', value: '3' },
        { label: '2023-2024 - Học kỳ 2', value: '4' },
    ];

    const optionsSublect = [
        { label: 'Toán cao cấp', value: '1' },
        { label: 'Vật lý đại cương', value: '2' },
        { label: 'Phân tích thiết kế hệ thống', value: '3' },
        { label: 'Nhập môn lập trình', value: '4' }
    ];

    return (
        <div className="p-4">
            <Title level={4}>Thông tin môn học</Title>

            <Form.Item
                label="Năm học và học kỳ"
                rules={[{ required: true, message: 'Vui lòng chọn năm học và học kỳ!' }]}
                name={'academicYear'}
                className="mt-5"
            >
                <Select
                    options={academicYear}
                    allowClear
                    placeholder="Chọn năm học"
                    size="large"
                    className="w-full custom-select"
                />
            </Form.Item>

            <Form.Item
                label="Tên môn học"
                rules={[{ required: true, message: 'Vui lòng chọn môn học!' }]}
                name={'subject'}
                className="mt-5"
            >
                <Select
                    allowClear
                    options={optionsSublect}
                    placeholder="Chọn tên môn học"
                    size="large"
                    className="w-full custom-select"
                />
            </Form.Item>

            <Form.Item
                label="Tên giảng viên"
                rules={[{ required: false }]}
                name={'teacher'}
            >
                <Input
                    size="large"
                    className="w-full"
                    readOnly
                    style={{ borderWidth: 1.5, boxShadow: 'none', cursor: 'not-allowed' }}
                />
            </Form.Item>

            <Form.Item
                label="Phòng học"
                name="location"
                rules={[{ required: false }]}
            >
                <Input
                    size="large"
                    readOnly
                    style={{ borderWidth: 1.5, boxShadow: 'none', cursor: 'not-allowed' }}
                    className="w-full"
                />
            </Form.Item>

            <Form.Item
                label="Tiết học"
                name="timeStudy"
                rules={[{ required: false }]}
            >
                <Input
                    size="large"
                    readOnly
                    style={{ borderWidth: 1.5, boxShadow: 'none', cursor: 'not-allowed' }}
                    className="w-full"
                />
            </Form.Item>
        </div>
    );
}