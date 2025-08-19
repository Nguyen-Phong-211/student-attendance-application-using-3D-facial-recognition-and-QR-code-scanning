import React, { useEffect, useState } from "react";
import { Table, message, Checkbox, Spin } from "antd";
import api from "../../api/axiosInstance";
import DepartmentMajorSelect from "../../components/Account/DepartmentMajorSelect";
import AcademicYearSemesterSelect from "../../components/Account/AcademicYearSemesterSelect";

export default function CourseRegistrationForm({
    departments,
    majors,
    selectedDepartment,
    handleDepartmentChange,
    selectedAcademicYear,
    handleAcademicYearChange,
    academicYears,
    semesters,
}) {
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!selectedAcademicYear) return;
        setLoading(true);

        const fetchSubjects = async () => {
            try {
                const { data } = await api.get(
                    `subjects-registration/display/${selectedAcademicYear}/`
                );
                setSubjects(data || []);
            } catch (err) {
                console.error("Fetch subjects error:", err);
                message.error("Không tải được danh sách môn học");
                setSubjects([]);
            }
            setLoading(false);
        };

        fetchSubjects();
    }, [selectedAcademicYear]);

    const columns = [
        {
            title: "STT",
            render: (_, __, index) => index + 1,
            width: 70,
        },
        {
            title: "Tên môn học",
            dataIndex: "subject_name",
            key: "subject_name",
            filters: [...new Set(subjects.map((s) => s.subject_name))].map((name) => ({
                text: name,
                value: name,
            })),
            onFilter: (value, record) => record.subject_name.includes(value),
        },    
        {
            title: "Tên khoa",
            dataIndex: ["department", "department_name"],
            key: "department_name",
            filters: [
                ...new Set(subjects.map((s) => s.department.department_name))
            ].map((name) => ({
                text: name,
                value: name,
            })),
            onFilter: (value, record) =>
                record.department?.department_name === value,
        },            
        {
            title: "Tổng số chỉ",
            dataIndex: "total_credits",
            key: "total_credits",
            align: "center",
            filters: [
                { text: "≤ 2 chỉ", value: "small" },
                { text: "3-4 chỉ", value: "medium" },
                { text: "≥ 5 chỉ", value: "large" },
            ],
            onFilter: (value, record) => {
                if (value === "small") return record.total_credits <= 2;
                if (value === "medium") return record.total_credits >= 3 && record.total_credits <= 4;
                if (value === "large") return record.total_credits >= 5;
                return true;
            },
        },
        {
            title: "Chỉ lý thuyết",
            dataIndex: "theoretical_credits",
            key: "theoretical_credits",
            align: "center",
            sorter: (a, b) => a.theoretical_credits - b.theoretical_credits,
        },
        {
            title: "Chỉ thực hành",
            dataIndex: "practical_credits",
            key: "practical_credits",
            align: "center",
            sorter: (a, b) => a.practical_credits - b.practical_credits,
        },
        {
            title: "Chọn",
            key: "select",
            render: (_, record) => (
                <Checkbox onChange={(e) => console.log(record.subject_id, e.target.checked, record.academic_year.academic_year_id)} /> // record.subject_id, e.target.checked
            ),
        },
    ];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AcademicYearSemesterSelect
                    academicYears={academicYears}
                    semesters={semesters}
                    selectedAcademicYear={selectedAcademicYear}
                    handleAcademicYearChange={handleAcademicYearChange}
                />
                <DepartmentMajorSelect
                    departments={departments}
                    majors={majors}
                    selectedDepartment={selectedDepartment}
                    handleDepartmentChange={handleDepartmentChange}
                />
            </div>

            <Spin spinning={loading} tip="Đang tải dữ liệu..." size="large">
                <Table
                    rowKey="subject_id"
                    dataSource={subjects}
                    columns={columns}
                    pagination={false}
                    bordered
                />
            </Spin>
        </div>
    );
}