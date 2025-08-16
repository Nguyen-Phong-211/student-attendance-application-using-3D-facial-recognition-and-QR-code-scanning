import React, { useEffect, useState } from "react";
import { Form, Card, message } from "antd";
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

    const [academicYears, setAcademicYears] = useState([]);
    const [semesters, setSemesters] = useState([]);
    const [subjects, setSubjects] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [academicRes, semesterRes, subjects] = await Promise.all([
                    api.get('academic-years/all/'),
                    api.get('semesters/all/'),
                    api.get('subjects/all/')
                ]);
    
                setAcademicYears(academicRes.data);
                setSemesters(semesterRes.data);
                setSubjects(subjects.data);
            } catch (error) {
                message.error("Lỗi khi tải dữ liệu.");
            }
        };
    
        fetchData();
    }, []);    

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
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <LeaveForm
                                        form={form}
                                        academicYears={academicYears}
                                        semesters={semesters}
                                        subjects={subjects}
                                    />
                                </div>
                                <div className="p-4">
                                    <LeavePreview
                                        academicYears={academicYears}
                                        semesters={semesters}
                                        subjects={subjects}
                                        selectedAcademicYear={selectedAcademicYear}
                                        selectedSubject={selectedSubject}
                                        rangeDate={rangeDate}
                                        personalLeave={personalLeave}
                                        teacher={teacher}
                                        formattedDate={formattedDate}
                                    />
                                </div>
                            </div>
                        </Form>
                    </Card>
                </div>
            </main>
        </LayoutWrapper>
    );
}
