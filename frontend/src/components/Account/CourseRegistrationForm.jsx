import React, { useEffect, useState } from "react";
import { Table, message, Checkbox, Spin, Drawer } from "antd";
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
    semesters
}) {
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(false);

    const [selectedSemester, setSelectedSemester] = useState(null);
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [scheduleDetail, setScheduleDetail] = useState(null);
    const [selectedScheduleId, setSelectedScheduleId] = useState(null);

    const [checkedSubjects, setCheckedSubjects] = useState({});

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

    const handleSemesterChange = (value) => {
        setSelectedSemester(value);
    };

    const handleCheckboxChange = async (record, checked) => {
        setCheckedSubjects(prev => ({ ...prev, [record.subject_id]: checked }));

        if (!checked) {
            setDrawerVisible(false);
            setScheduleDetail(null);
            setSelectedSubject(null);
            return;
        }

        if (!selectedSemester) {
            message.warning("Vui lòng chọn học kỳ trước khi xem lịch học!");
            setCheckedSubjects(prev => ({ ...prev, [record.subject_id]: false }));
            return;
        }

        try {
            setLoading(true);
            const { data } = await api.get(
                `classes/schedules/${record.subject_id}/${selectedSemester}/`
            );
            setScheduleDetail(data);
            setSelectedSubject(record);
            setDrawerVisible(true);

            if (Array.isArray(data) && data.length === 0) {
                setCheckedSubjects(prev => ({ ...prev, [record.subject_id]: false }));
            }
        } catch (err) {
            console.error("Fetch schedule error:", err);
            message.error("Không tải được lịch học");
            setCheckedSubjects(prev => ({ ...prev, [record.subject_id]: false }));
        }
        setLoading(false);
    };

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
                <Checkbox
                    checked={checkedSubjects[record.subject_id] || false}
                    onChange={(e) => handleCheckboxChange(record, e.target.checked)}
                />
            )
        },
    ];

    const handleDrawerClose = () => {
        setDrawerVisible(false);

        if (Array.isArray(scheduleDetail) && scheduleDetail.length === 0 && selectedSubject) {
            setCheckedSubjects(prev => ({ ...prev, [selectedSubject.subject_id]: false }));
        }

        setScheduleDetail(null);
        setSelectedSubject(null);
    };

    const handleCheckboxChangeSchedule = (record, checked) => {
        if (checked) {
            setSelectedScheduleId(record.schedule_id);
        } else {
            setSelectedScheduleId(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AcademicYearSemesterSelect
                    academicYears={academicYears}
                    semesters={semesters}
                    selectedAcademicYear={selectedAcademicYear}
                    selectedSemester={selectedSemester}
                    handleAcademicYearChange={handleAcademicYearChange}
                    handleSemesterChange={handleSemesterChange}
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
                    scroll={{ x: "max-content" }}
                />
            </Spin>

            <Drawer
                title={`Chi tiết lịch học: ${selectedSubject?.subject_name || "Không xác định"} ${Array.isArray(scheduleDetail) && scheduleDetail.length === 0 ? "(Không có lịch học)" : ""
                    }`}
                placement="top"
                closable
                onClose={handleDrawerClose}
                open={drawerVisible}
                height={400}
            >
                {scheduleDetail ? (
                    <Table
                        rowKey="schedule_id"
                        dataSource={Array.isArray(scheduleDetail) ? scheduleDetail : [scheduleDetail]}
                        bordered
                        pagination={false}
                        scroll={{ x: "max-content" }}
                        columns={[
                            {
                                title: "Lớp",
                                dataIndex: ["class_id", "class_name"],
                                key: "class_name",
                            },
                            {
                                title: "Khoa",
                                dataIndex: ["class_id", "department", "department_name"],
                                key: "department_name",
                            },
                            {
                                title: "Phòng",
                                render: (_, record) => `${record.room?.room_name} (${record.room?.capacity} chỗ)`,
                            },
                            {
                                title: "Ca học",
                                render: (_, record) => `${record.slot?.shift?.shift_name}`,
                            },
                            {
                                title: "Thời gian",
                                render: (_, record) => `${record.slot?.slot_name} (${record.slot?.start_time} - ${record.slot?.end_time})`,
                            },
                            {
                                title: "Thời lượng",
                                render: (_, record) => `${record.slot?.duration_minutes} phút`,
                            },
                            {
                                title: "Ngày trong tuần",
                                dataIndex: "day_of_week",
                                key: "day_of_week",
                                render: (day) => `Thứ ${day}`,
                            },
                            {
                                title: "Giảng viên",
                                render: (_, record) => record.lecturer?.map(l => l.fullname).join(", "),
                            },
                            {
                                title: "Loại buổi học",
                                dataIndex: "lesson_type",
                                key: "lesson_type",
                            },
                            {
                                title: "Học kỳ",
                                dataIndex: ["subject", "academic_year", "academic_year_name"],
                                key: "academic_year_name",
                            },
                            {
                                title: "Đăng ký",
                                key: "select",
                                render: (_, record) => (
                                    <Checkbox
                                        checked={selectedScheduleId === record.schedule_id}
                                        onChange={(e) => handleCheckboxChangeSchedule(record, e.target.checked)}
                                    />
                                )
                            }                            
                        ]}
                    />
                ) : (
                    <p>Không có dữ liệu</p>
                )}
            </Drawer>
        </div>
    );
}