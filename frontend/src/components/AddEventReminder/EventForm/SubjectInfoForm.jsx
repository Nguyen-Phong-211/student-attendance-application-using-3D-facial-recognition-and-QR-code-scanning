import React from "react";
import { Form, Input, Select, Typography } from "antd";
import { useWatch } from 'antd/es/form/Form';

const { Title } = Typography;

export default function SubjectInfoForm({ form, subjects, academicYears, semesters }) {

    const selectedAcademicYear = useWatch('academicYear', form);
    const selectedSemester = useWatch('semester', form);
    const filteredSubjects = subjects;

    return (
        <div className="p-4">
            <Title level={4}>Thông tin môn học</Title>

            <Form.Item
                label="Năm học"
                rules={[{ required: true, message: 'Vui lòng chọn năm học và học kỳ!' }]}
                name={'academicYear'}
                className="mt-5"
                hidden
            >
                <Select
                    options={academicYears.map(item => ({
                        label: `${item.academic_year_name}`,
                        value: item.academic_year_id
                    }))}
                    placeholder="Chọn năm học"
                    size="large"
                    className="w-full custom-select"
                />
            </Form.Item>

            <Form.Item
                label="Học kỳ"
                rules={[{ required: true, message: 'Vui lòng chọn học kỳ!' }]}
                name={'semester'}
                className="mt-5"
                hidden
            >
                <Select
                    options={semesters.map(item => ({
                        label: item.semester_name,
                        value: item.semester_id
                    }))}
                    placeholder={
                        selectedAcademicYear ? "Chọn học kỳ" : "Vui lòng chọn năm học trước"
                    }
                    disabled={!selectedAcademicYear}
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
                    options={filteredSubjects.map(item => ({
                        label: `${item.subject_name}`,
                        value: item.subject_id
                    }))}
                    placeholder={
                        selectedSemester
                            ? "Chọn môn học"
                            : "Vui lòng chọn năm học trước"
                    }
                    disabled={!selectedSemester}
                    size="large"
                    className="w-full custom-select"
                    showSearch
                    filterOption={(input, option) =>
                        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                    }
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
                name="roomName"
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
                name="slotName"
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