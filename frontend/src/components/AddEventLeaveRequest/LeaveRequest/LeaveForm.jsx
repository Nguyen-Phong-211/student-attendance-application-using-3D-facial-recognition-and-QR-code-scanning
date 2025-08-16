import React from 'react';
import { Button, DatePicker, Form, Input, Select } from 'antd';
import { useWatch } from 'antd/es/form/Form';

const { RangePicker } = DatePicker;

export default function LeaveForm({form, academicYears, semesters, subjects }) {

    const selectedAcademicYear = useWatch('academicYear', form);

    const filteredSemesters = semesters.filter(
        semester => semester.academic_year === selectedAcademicYear
    );

    const filteredSubjects = subjects.filter(
        subject => subject.academic_year.academic_year_id === selectedAcademicYear
    );

    return (
        <>
            <Form.Item
                label="Năm học"
                rules={[{ required: true, message: 'Vui lòng chọn năm học!' }]}
                name={'academicYear'}
                className="mt-5"
            >
                <Select
                    options={academicYears.map(item => ({
                        label: `${item.academic_year_name}`,
                        value: item.academic_year_id
                    }))}
                    allowClear
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
            >
                <Select
                    options={filteredSemesters.map(item => ({
                        label: item.semester_name,
                        value: item.semester_id
                    }))}
                    allowClear
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
                        selectedAcademicYear
                            ? "Chọn môn học"
                            : "Vui lòng chọn năm học trước"
                    }
                    disabled={!selectedAcademicYear}
                    size="large"
                    className="w-full custom-select"
                    showSearch
                    filterOption={(input, option) =>
                        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                />
            </Form.Item>

            <Form.Item label="Tên giảng viên" name={'teacher'}>
                <Input
                    size="large"
                    className="w-full"
                    readOnly
                    style={{ cursor: 'not-allowed', borderWidth: 1.5, boxShadow: 'none' }}
                />
            </Form.Item>

            <Form.Item
                label="Lý do"
                name="personalLeave"
                rules={[{ required: true, message: 'Vui lòng nhập nội dung sự kiện!' }]}
            >
                <Input.TextArea
                    size="large"
                    placeholder="Nhập nội lý do nghỉ phép"
                    rows={5}
                    style={{ borderWidth: 1.5, boxShadow: 'none' }}
                />
            </Form.Item>

            <Form.Item
                label="Thời gian nghỉ phép"
                name="rangeDate"
                rules={[
                    { required: true, message: 'Vui lòng chọn thời gian nghỉ phép!' },
                    {
                        validator(_, value) {
                            const [start, end] = value || [];
                            if (start && end && end.diff(start, 'minute') < 180) {
                                return Promise.reject(
                                    new Error('Ngày nghỉ phép phải lớn hơn 3 giờ')
                                );
                            }
                            return Promise.resolve();
                        },
                    },
                ]}
            >
                <RangePicker
                    showTime={{ format: 'HH:mm' }}
                    size="large"
                    format="HH:mm DD/MM/YYYY"
                    className="w-full"
                    style={{ borderWidth: 1.5, boxShadow: 'none' }}
                />
            </Form.Item>

            <Form.Item className="mt-6">
                <Button type="primary" htmlType="submit" size="large" className="w-full md:w-auto">
                    Gửi đơn
                </Button>
            </Form.Item>
        </>
    );
}