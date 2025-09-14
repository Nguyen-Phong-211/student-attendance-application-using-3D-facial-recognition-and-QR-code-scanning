import React from 'react';
import { Button, DatePicker, Form, Input, Select, Upload, message } from 'antd';
import { useWatch } from 'antd/es/form/Form';
import { PlusOutlined } from '@ant-design/icons';
import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

dayjs.extend(isSameOrBefore);

const { RangePicker } = DatePicker;

export default function LeaveForm({ form, academicYears, semesters, subjects, leaveData, selectedSubject, loading }) {

    const selectedAcademicYear = useWatch('academicYear', form);
    const selectedSemester = useWatch('semester', form);
    const filteredSubjects = subjects;

    return (
        <>
            <Form.Item
                label="Năm học"
                rules={[{ required: true, message: 'Vui lòng chọn năm học!' }]}
                name={'academicYear'}
                className="mt-5"
                // hidden
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
                    // defaultValue={academicYears.map(item => ({
                    //     label: `${item.academic_year_name}`,
                    //     value: item.academic_year_id
                    // }))}
                />
            </Form.Item>

            <Form.Item
                label="Học kỳ"
                rules={[{ required: true, message: 'Vui lòng chọn học kỳ!' }]}
                name={'semester'}
                className="mt-5"
                // hidden
            >
                <Select
                    options={semesters.map(item => ({
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
                    // defaultValue={semesters.map(item => ({
                    //     label: item.semester_name,
                    //     value: item.semester_id
                    // }))}
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
                            if (!value || value.length !== 2) {
                                return Promise.reject(
                                    new Error('Vui lòng chọn cả ngày bắt đầu và ngày kết thúc!')
                                );
                            }

                            const [start, end] = value;

                            // Nếu thiếu 1 trong 2 ngày
                            if (!start || !end) {
                                return Promise.reject(
                                    new Error('Vui lòng chọn cả ngày bắt đầu và ngày kết thúc!')
                                );
                            }

                            const today = dayjs().startOf('day');

                            // Ngày phải lớn hơn hoặc bằng hôm nay
                            if (start.isBefore(today, 'day') || end.isBefore(today, 'day')) {
                                return Promise.reject(
                                    new Error('Ngày nghỉ phép phải lớn hơn hoặc bằng ngày hôm nay!')
                                );
                            }

                            // Ngày kết thúc phải sau ngày bắt đầu
                            if (end.isBefore(start, 'day')) {
                                return Promise.reject(
                                    new Error('Ngày kết thúc phải sau ngày bắt đầu!')
                                );
                            }

                            // Check theo lịch học (day_of_week)
                            if (leaveData && leaveData.day_of_week) {
                                const mapDayOfWeek = {
                                    2: 1, 3: 2, 4: 3, 5: 4, 6: 5, 7: 6, 8: 0
                                };
                                const requiredDay = mapDayOfWeek[leaveData.day_of_week];

                                if (start.day() !== requiredDay || end.day() !== requiredDay) {
                                    return Promise.reject(
                                        new Error(
                                            `Ngày bắt đầu/kết thúc phải rơi vào thứ ${leaveData.day_of_week}!`
                                        )
                                    );
                                }
                            }

                            // Check by semester
                            if (leaveData?.start_date_semester && leaveData?.end_date_semester) {
                                const startSemester = dayjs(leaveData.start_date_semester);
                                const endSemester = dayjs(leaveData.end_date_semester);

                                if (
                                    start.isBefore(startSemester, 'day') ||
                                    end.isAfter(endSemester, 'day')
                                ) {
                                    return Promise.reject(
                                        new Error(
                                            `Ngày nghỉ phải nằm trong khoảng ${startSemester.format(
                                                'DD/MM/YYYY'
                                            )} - ${endSemester.format('DD/MM/YYYY')}`
                                        )
                                    );
                                }
                            }

                            return Promise.resolve();
                        },
                    },
                ]}
            >
                <RangePicker
                    showTime={{ format: 'HH:mm' }}
                    disabled={!selectedSubject}
                    allowEmpty={[true, true]}
                    size="large"
                    format="HH:mm DD/MM/YYYY"
                    className="w-full"
                    style={{ borderWidth: 1.5, boxShadow: 'none' }}
                />
            </Form.Item>

            <Form.Item
                label="Ảnh minh chứng"
                name="images"
                getValueFromEvent={(e) => {
                    // e.fileList is an array of uploaded files
                    return e && e?.fileList;
                }}
            >
                <Upload
                    listType="picture-card"
                    accept='image/*'
                    multiple
                    maxCount={3}
                    beforeUpload={(file) => {
                        const isImage = file.type.startsWith('image/');
                        if (!isImage) {
                            message.error(`${file.name} không phải là file ảnh!`);
                        }
                        const isLt2M = file.size / 1024 / 1024 <= 2;
                        if (!isLt2M) {
                            message.error(`${file.name} phải nhỏ hơn 2MB!`);
                        }
                        return false; 
                    }}
                >
                    <div>
                        <PlusOutlined />
                        <div style={{ marginTop: 8 }}>Tải ảnh</div>
                    </div>
                </Upload>
            </Form.Item>

            <Form.Item className="mt-6">
                <Button type="primary" htmlType="submit" size="large" loading={loading} className="w-full md:w-auto">
                    Gửi đơn
                </Button>
            </Form.Item>
        </>
    );
}