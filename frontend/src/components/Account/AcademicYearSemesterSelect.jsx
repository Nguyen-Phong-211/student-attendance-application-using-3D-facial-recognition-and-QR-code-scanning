import React from "react";
import { Form, Select } from "antd";

const { Option } = Select;

export default function AcademicYearSemesterSelect({ academicYears, semesters, selectedAcademicYear, handleAcademicYearChange, handleSemesterChange }) {
    return (
        <>
            <Form.Item label="Năm học" name="academic_year" rules={[{ required: true, message: "Vui lòng chọn năm học!" }]}>
                <Select
                    showSearch
                    size="large"
                    placeholder="Chọn năm học"
                    allowClear
                    onChange={handleAcademicYearChange}
                    filterOption={(input, option) => option?.children?.toLowerCase().includes(input.toLowerCase())}
                    className="w-full custom-select"
                >
                    {Array.isArray(academicYears) && academicYears.map((years) => (
                        <Option key={years.academic_year_id} value={years.academic_year_id}>
                            {years.academic_year_name}
                        </Option>
                    ))}
                </Select>
            </Form.Item>

            <Form.Item
                label="Học kỳ"
                name="semester"
                rules={[{ required: true, message: "Vui lòng chọn học kỳ!" }]}
            >
                <Select
                    showSearch
                    placeholder="Chọn học kỳ"
                    size="large"
                    disabled={!selectedAcademicYear}
                    allowClear
                    filterOption={(input, option) =>
                        option?.children?.toLowerCase().includes(input.toLowerCase())
                    }
                    className="w-full custom-select"
                    onChange={handleSemesterChange}
                >
                    {Array.isArray(semesters) && semesters.map(semes => (
                        <Option key={semes.semester_id} value={semes.semester_id}>
                            {semes.semester_name}
                        </Option>
                    ))}
                </Select>
            </Form.Item>
        </>
    );
}