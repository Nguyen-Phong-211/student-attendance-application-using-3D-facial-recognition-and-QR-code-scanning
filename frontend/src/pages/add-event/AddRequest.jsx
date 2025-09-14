import React, { useEffect, useState } from "react";
import { Form, Card, message, Spin } from "antd";
import { useWatch } from 'antd/es/form/Form';
import LayoutWrapper from "../../components/AddEventLeaveRequest/LayoutWrapper";
import PageHeader from "../../components/AddEventLeaveRequest/PageHeader";
import LeaveBreadcrumb from "../../components/AddEventLeaveRequest/LeaveRequest/LeaveBreadcrumb";
import LeaveForm from "../../components/AddEventLeaveRequest/LeaveRequest/LeaveForm";
import LeavePreview from "../../components/AddEventLeaveRequest/LeaveRequest/LeavePreview";
import api from "../../api/axiosInstance";

export default function AddRequest() {
    useEffect(() => {
        document.title = "ATTEND 3D - Tạo đơn xin nghỉ phép";
    }, []);

    const [form] = Form.useForm();

    const selectedAcademicYear = useWatch('academicYear', form);
    const teacher = useWatch('teacher', form);
    const personalLeave = useWatch('personalLeave', form);
    const rangeDate = useWatch('rangeDate', form);
    const selectedSubject = useWatch('subject', form);
    const selectedSemester = useWatch('semester', form);
    const [loading, setLoading] = useState(false);

    const [academicYears, setAcademicYears] = useState([]);
    const [semesters, setSemesters] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [leaveData, setLeaveData] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [academicRes, semesterRes] = await Promise.all([
                    api.get('academic-years/all/'),
                    api.get('semesters/all/')
                ]);

                const years = academicRes.data;
                const sems = semesterRes.data;

                setAcademicYears(years);
                setSemesters(sems);

                const currentYear = years.find(y => y.is_current) || years[0];
                const currentSemester = sems.find(s => s.is_current) || sems[0];

                if (currentYear && currentSemester) {
                    form.setFieldsValue({
                        academicYear: currentYear.academic_year_id,
                        semester: currentSemester.semester_id
                    });
                }

            } catch (error) {
                message.error("Lỗi khi tải dữ liệu.");
            }
        };

        fetchData();
    }, [form]);

    useEffect(() => {
        const fetchSemesters = async () => {
            if (!selectedAcademicYear) {
                setSemesters([]);
                return;
            }
            try {
                const res = await api.get(`semesters/${selectedAcademicYear}/`);
                setSemesters(res.data);

                const currentSemester = res.data.find(s => s.is_current) || res.data[0];
                if (currentSemester) {
                    form.setFieldsValue({
                        semester: currentSemester.semester_id
                    });
                }

            } catch (error) {
                message.error("Lỗi khi tải học kỳ.");
            }
        };

        fetchSemesters();
    }, [selectedAcademicYear, form]);

    useEffect(() => {
        const fetchSubjects = async () => {
            if (!selectedSemester) {
                setSubjects([]);
                return;
            }
            try {
                const user = JSON.parse(localStorage.getItem('user'));
                const accountId = user?.account_id;
                const res = await api.get(
                    `students/subjects/by-semester/${accountId}/${selectedSemester}/`
                );
                setSubjects(res.data);
            } catch (error) {
                message.error("Lỗi khi tải môn học.");
            }
        };

        fetchSubjects();
    }, [selectedSemester]);

    useEffect(() => {
        const fetchLeaveData = async () => {
            if (!selectedSubject || !selectedSemester || !selectedAcademicYear) return;

            try {
                const user = JSON.parse(localStorage.getItem('user'));
                const accountId = user?.account_id;

                const res = await api.get(
                    `leaves/leave-request/${accountId}/${selectedSubject}/${selectedAcademicYear}/${selectedSemester}/`
                );

                if (res.data && res.data.length > 0) {
                    setLeaveData(res.data[0]);
                    const lecturerName = res.data[0].lecturer_name || '';
                    form.setFieldsValue({ teacher: lecturerName });
                } else {
                    setLeaveData(null);
                    form.setFieldsValue({ teacher: '' });
                }

            } catch (error) {
                message.error("Lỗi khi lấy thông tin giảng viên.");
                setLeaveData(null);
                form.setFieldsValue({ teacher: '' });
            }
        };

        fetchLeaveData();
    }, [selectedSubject, selectedSemester, selectedAcademicYear, form]);

    const today = new Date();
    const formattedDate = `Tp.HCM, ngày ${today.getDate()} tháng ${today.getMonth() + 1} năm ${today.getFullYear()}`;

    return (
        <LayoutWrapper>
            <main className="mt-10 flex flex-col items-center">
                <div className="w-full px-4">
                    <LeaveBreadcrumb />
                </div>

                <div className="w-full p-5 rounded-lg mt-6">
                    <Card title={<PageHeader text="Tạo đơn xin nghỉ phép" />} className="p-2">
                        <Form
                            form={form}
                            initialValues={{ variant: 'filled', emailNotification: 1 }}
                            layout="vertical"
                            className="w-full"
                            onFinish={async (values) => {
                                if(leaveData?.max_leave_days > 0) {
                                    try {
                                        setLoading(true);
    
                                        const payload = {
                                            student: leaveData?.student_id,
                                            subject: values.subject,
                                            reason: values.personalLeave,
                                            from_date: values.rangeDate[0].toISOString(),
                                            to_date: values.rangeDate[1].toISOString(),
                                            academic_year: values.academicYear,
                                            semester: values.semester,
                                            leave_data: leaveData, 
                                        };

                                        console.log(payload);
    
                                        await api.post("leaves/leave-requests/", payload);
    
                                        message.success("Gửi đơn thành công!");
                                        setLoading(false);
                                        form.resetFields();
                                    } catch (error) {
                                        console.error(error);
                                        message.error("Gửi đơn thất bại!");
                                        setLoading(false);
                                    } finally {
                                        setLoading(false);
                                    }
                                } else {
                                    message.error("Bạn đã hết ngày xin nghỉ phép!");
                                }
                            }}
                            onFinishFailed={(errorInfo) => {
                                console.log("Failed:", errorInfo);
                                message.error("Vui lòng điền đầy đủ và chính xác thông tin!");
                            }}
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <LeaveForm
                                        form={form}
                                        academicYears={academicYears}
                                        semesters={semesters}
                                        subjects={subjects}
                                        selectedSemester={selectedSemester}
                                        leaveData={leaveData}
                                        selectedSubject={selectedSubject}
                                        loading={loading}
                                    />
                                </div>
                                <div className="p-4">
                                    <LeavePreview
                                        form={form}
                                        academicYears={academicYears}
                                        semesters={semesters}
                                        subjects={subjects}
                                        selectedAcademicYear={selectedAcademicYear}
                                        selectedSubject={selectedSubject}
                                        rangeDate={rangeDate}
                                        personalLeave={personalLeave}
                                        teacher={teacher}
                                        formattedDate={formattedDate}
                                        leaveData={leaveData}
                                        selectedSemester={selectedSemester}
                                        images={useWatch('images', form)}
                                    />
                                </div>
                            </div>
                        </Form>
                    </Card>
                </div>
                <Spin spinning={loading} fullscreen tip="Đang xử lý. Vui lòng chờ..." />
            </main>
        </LayoutWrapper>
    );
}
