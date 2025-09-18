import React, { useEffect, useState } from "react";
import { Card, Form, Typography, Button, message } from "antd";
import EventInfoForm from "./EventInfoForm";
import SubjectInfoForm from "./SubjectInfoForm";
import api from "../../../api/axiosInstance";
import { useWatch } from 'antd/es/form/Form';

const { Title } = Typography;

export default function EventForm() {
    const [form] = Form.useForm();

    const [academicYears, setAcademicYears] = useState([]);
    const [semesters, setSemesters] = useState([]);
    // const [loading, setLoading] = useState(false);

    const selectedAcademicYear = useWatch('academicYear', form);
    const selectedSemester = useWatch('semester', form);
    const [subjects, setSubjects] = useState([]);
    const [reminderData, setReminderData] = useState(null);
    const selectedSubject = useWatch('subject', form);
    const selectedRange = useWatch('rangeDate', form);
    const selectedTimeEvent = useWatch('timeEvent', form);

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
                // const currentSemester = sems.find(s => s.is_current) || sems[0];

                if (currentYear) { //  && currentSemester
                    form.setFieldsValue({
                        academicYear: currentYear.academic_year_id,
                        // semester: currentSemester.semester_id
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
                        semester: currentSemester?.semester_id
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
        const fetchReminderData = async () => {
            if (!selectedSubject || !selectedSemester || !selectedAcademicYear) return;

            if(selectedSubject) {
                try {
                    const user = JSON.parse(localStorage.getItem('user'));
                    const accountId = user?.account_id;
    
                    const res = await api.get(
                        `reminders/${accountId}/${selectedSubject}/${selectedAcademicYear}/${selectedSemester}/`
                    );
    
                    if (Array.isArray(res.data) && res.data.length > 0) {
                        setReminderData(res.data[0]);
    
                        const lecturerName = res.data[0]?.lecturer_name || '';
                        const roomName = res.data[0]?.room_name || '';
                        const slotName = res.data[0]?.slot_name || '';
    
                        form.setFieldsValue({ teacher: lecturerName, roomName: roomName, slotName: slotName });
                    } else {
                        setReminderData(null);
                        form.setFieldsValue({ teacher: '', roomName: '', slotName: '' });
                        message.error("Lỗi khi lấy thông tin lịch học.");
                    }
    
                } catch (error) {
                    message.error("Lỗi khi lấy thông tin lịch học.");
                    setReminderData(null);
                    form.setFieldsValue({ teacher: '', roomName: '', slotName: '' });
                }
            }
        };

        fetchReminderData();
    }, [selectedSubject, selectedSemester, selectedAcademicYear, form]);

    useEffect(() => {
        if (!selectedTimeEvent) return;
      
        const range = form.getFieldValue("rangeDate");
        if (!range || !range[0]) return;
      
        const [start, end] = range;
        const reminderMinutes = parseInt(selectedTimeEvent, 10) || 30;
      
        const adjustedStart = start.add(reminderMinutes, "minute");
        if (!end && !start.isSame(adjustedStart)) {
          form.setFieldsValue({
            rangeDate: [adjustedStart, end || null],
          });
        }
      }, [selectedTimeEvent, form]);      
      
    return (
        <div className="w-full p-5 rounded-lg mt-6">
            <Card title={<Title level={3}>Tạo thông tin sự kiện</Title>} className="p-2">
                <Form
                    form={form}
                    initialValues={{ variant: 'filled', emailNotification: 1 }}
                    layout="vertical"
                    name="formCreateEvent"
                    autoComplete="off"

                    onFinish={async (values) => {
                        try {
                            const user = JSON.parse(localStorage.getItem('user'));
                            const accountId = user?.account_id;
                
                            const payload = {
                                title: values.title,
                                content: values.content,
                                start_date: values.rangeDate[0].toISOString(),
                                end_date: values.rangeDate[1].toISOString(),
                                email_notification: values.emailNotification,
                                time_reminder: values.timeEvent ? `${values.timeEvent}:00` : "00:00:00",
                                subject: values.subject,
                                student_account: accountId,
                            };
                
                            await api.post("reminders/", payload);
                
                            message.success("Tạo sự kiện thành công!");
                            form.resetFields({
                                title: '',
                                content: '',
                                rangeDate: '',
                                emailNotification: 1,
                                timeEvent: '',
                                subject: '',
                            });
                
                        } catch (error) {
                            console.error(error);
                            message.error("Lỗi khi tạo sự kiện!");
                        }
                    }}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <EventInfoForm
                            form={form}
                            reminderData={reminderData}
                            selectedRange={selectedRange}
                            selectedTimeEvent={selectedTimeEvent}
                            selectedSubject={selectedSubject}
                        />
                        <SubjectInfoForm 
                            form={form}
                            academicYears={academicYears}
                            semesters={semesters}
                            subjects={subjects}
                            selectedSemester={selectedSemester}
                            selectedSubject={selectedSubject}
                            reminderData={reminderData}
                        />
                    </div>

                    <Form.Item className="mt-3">
                        <Button type="primary" htmlType="submit" size="large" className="w-full md:w-auto">
                            Gửi sự kiện
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
}