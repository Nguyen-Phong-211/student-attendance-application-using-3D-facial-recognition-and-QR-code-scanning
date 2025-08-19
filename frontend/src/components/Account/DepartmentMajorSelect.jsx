import React from "react";
import { Form, Select } from "antd";

const { Option } = Select;

export default function DepartmentMajorSelect({ departments, majors, selectedDepartment, handleDepartmentChange }) {
    return (
        <>
            <Form.Item label="Khoa" name="department" rules={[{ required: true, message: "Vui lòng chọn khoa!" }]}>
                <Select
                    showSearch
                    size="large"
                    placeholder="Chọn khoa"
                    allowClear
                    onChange={handleDepartmentChange}
                    filterOption={(input, option) => option?.children?.toLowerCase().includes(input.toLowerCase())}
                    className="w-full custom-select"
                >
                    {Array.isArray(departments) && departments.map((dept) => (
                        <Option key={dept.department_id} value={dept.department_id}>
                            {dept.department_name}
                        </Option>
                    ))}
                </Select>
            </Form.Item>

            <Form.Item label="Chuyên ngành" name="major" rules={[{ required: true, message: "Vui lòng chọn chuyên ngành!" }]}>
                <Select
                    showSearch
                    placeholder="Chọn chuyên ngành"
                    size="large"
                    disabled={!selectedDepartment}
                    allowClear
                    filterOption={(input, option) => option?.children?.toLowerCase().includes(input.toLowerCase())}
                    className="w-full custom-select"
                >
                    {Array.isArray(majors) && majors.map((maj) => maj.major_id && (
                        <Option key={maj.major_id} value={maj.major_id}>
                            {maj.major_name}
                        </Option>
                    ))}
                </Select>
            </Form.Item>
        </>
    );
}