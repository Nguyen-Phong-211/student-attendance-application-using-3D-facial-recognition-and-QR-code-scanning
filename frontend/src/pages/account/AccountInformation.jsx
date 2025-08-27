import React, { useState, useEffect, useCallback } from "react";
import { Typography, Card, Button, Form, message, Steps, Spin } from "antd";
import { RightOutlined, LeftOutlined, CheckOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import api from "../../api/axiosInstance";

import UserForm from "../../components/Account/UserForm";
import StatusTag from "../../components/Account/StatusTag";
import CourseRegistrationForm from "../../components/Account/CourseRegistrationForm";
import AvatarUpload from "../../components/Account/AvatarUpload";

const { Title } = Typography;
const { Step } = Steps;

export default function AccountInformation() {
    const [form] = Form.useForm();
    const navigate = useNavigate();

    const [departments, setDepartments] = useState([]);
    const [majors, setMajors] = useState([]);
    const [selectedDepartment, setSelectedDepartment] = useState(null);
    const [user, setUser] = useState(null);
    const [currentStep, setCurrentStep] = useState(0);

    const [academicYears, setAcademicYears] = useState([]);
    const [semesters, setSemesters] = useState([]);
    const [selectedAcademicYear, setSelectedAcademicYear] = useState(null);

    const [selectedSchedules, setSelectedSchedules] = useState({});
    const [totalCredits, setTotalCredits] = useState(0);
    const [loading, setLoading] = useState(false);

    const next = () => setCurrentStep((prev) => prev + 1);
    const prev = () => setCurrentStep((prev) => prev - 1);

    const token = localStorage.getItem("user");

    useEffect(() => {
        document.title = "ATTEND 3D - Cập nhật thông tin tài khoản";

        const fetchDepartments = async () => {
            try {
                const res = await api.get("departments/all/");
                const data = res.data;
                if (Array.isArray(data)) setDepartments(data);
                else if (data?.results) setDepartments(data.results);
                else setDepartments([]);
            } catch (err) {
                console.error("Fetch departments error:", err);
                message.error("Không tải được danh sách khoa");
                setDepartments([]);
            }
        };

        const fetchAcademicYears = async () => {
            try {
                const res = await api.get("academic-years/all/");
                const data = res.data;
                if (Array.isArray(data)) setAcademicYears(data);
                else if (data?.results) selectedAcademicYear(data.results);
                else setAcademicYears([]);
            } catch (err) {
                console.error("Fetch academic years error:", err);
                message.error("Không tải được danh năm học");
                setAcademicYears([]);
            }
        };

        const loadUserFromStorage = () => {
            const storedUser = localStorage.getItem("user");
            if (storedUser && storedUser !== "undefined") {
                try {
                    const parsedUser = JSON.parse(storedUser);
                    setUser(parsedUser);
                    form.setFieldsValue({
                        email: parsedUser.email ?? undefined,
                        phone_number: parsedUser.phone_number ?? undefined,
                    });
                } catch (err) {
                    console.error("Error parsing user from localStorage:", err);
                    localStorage.removeItem("user");
                    setUser(null);
                }
            } else setUser(null);
        };

        fetchDepartments();
        loadUserFromStorage();
        fetchAcademicYears();
    }, [token, form, selectedAcademicYear]);

    const handleDepartmentChange = useCallback(
        async (value) => {
            setSelectedDepartment(value);
            setMajors([]);
            form.setFieldsValue({ major: undefined });

            if (!value) return;

            try {
                const { data } = await api.get(`majors/${value}/`);
                if (Array.isArray(data)) setMajors(data);
                else if (data?.results) setMajors(data.results);
                else setMajors([]);
            } catch (err) {
                console.error("Load majors error:", err);
                message.error("Không tải được danh sách chuyên ngành");
                setMajors([]);
            }
        },
        [form]
    );

    const handleAcademicYearChange = useCallback(
        async (value) => {
            setSelectedAcademicYear(value);
            setSemesters([]);
            form.setFieldsValue({ semester: undefined });

            if (!value) return;

            try {
                const { data } = await api.get(`semesters/${value}/`);
                if (Array.isArray(data)) setSemesters(data);
                else if (data?.results) setSemesters(data.results);
                else setSemesters([]);
            } catch (err) {
                console.error("Load semesters error:", err);
                message.error("Không tải được danh sách học kỳ");
                setSemesters([]);
            }
        },
        [form]
    );

    const onFinish = async (values) => {
        if (totalCredits < 15) {
            message.error("Bạn phải đăng ký ít nhất 15 tín chỉ!");
            return;
        }
    
        if (totalCredits > 23) {
            message.error("Bạn không được đăng ký quá 23 tín chỉ!");
            return;
        }
    
        try {
            setLoading(true);
    
            const studentPayload = {
                fullname: values.fullname,
                student_code: values.student_code || values.studentcode,
                gender: values.gender,
                dob: values.dob ? values.dob.format("YYYY-MM-DD") : null,
                email: values.email,
                phone: values.phone,
                major: values.major,
                account: user.account_id,
                status: "1",
                department: values.department,
            };
    
            const studentRes = await api.post("students/", studentPayload);

            if (!studentRes.data?.student_id) {
                message.error("Không lấy được sinh viên từ backend");
                return;
            }
   
            if (studentRes.data?.success === false) {
                message.error(studentRes.data?.message || "Cập nhật sinh viên thất bại");
                return;
            }
    
            const studentId = studentRes.data?.student_id;
            message.success(studentRes.data?.message || "Cập nhật thông tin sinh viên thành công!");
    
            if (values.avatar) {
                const formData = new FormData();
                formData.append("avatar", values.avatar);
    
                const avatarRes = await api.post(
                    `accounts/${user.account_id}/update_avatar/`,
                    formData,
                    { headers: { "Content-Type": "multipart/form-data" } }
                );
    
                if (avatarRes.data?.success === false) {
                    message.error(avatarRes.data?.message || "Cập nhật avatar thất bại");
                    return;
                }
    
                message.success(avatarRes.data?.message || "Cập nhật avatar thành công!");
            }
    
            const registrationRequests = Object.values(selectedSchedules).map((schedule) => ({
                student: studentId,
                subject: schedule.subject_id,
                semester: values.semester,
                reason: "Đăng ký môn học",
            }));
    
            for (const req of registrationRequests) {
                const regRes = await api.post("students/register-request/", req);
    
                if (regRes.data?.success === false) {
                    message.error(regRes.data?.message || "Đăng ký môn học thất bại");
                    return;
                }
            }

            await new Promise((resolve) => setTimeout(resolve, 3000));
    
            message.success("Đăng ký môn học thành công!");
            navigate("/");
            window.location.reload();
    
        } catch (err) {
            console.error("Submit error:", err);
            message.error(err.response?.data?.message || err.message || "Lỗi kết nối hệ thống");
        } finally {
            setLoading(false);
        }
    };    

    return (
        <div className="min-h-screen bg-white text-gray-800 flex flex-col">
            <div className="w-full mx-auto px-6 flex-grow">
                <main className="mt-4 flex flex-col items-center">
                    <div className="w-full p-5 rounded-lg mt-6">
                        <Card title={<Title level={3}>Cập nhật thông tin sinh viên</Title>} className="p-2">
                            <Steps current={currentStep} className="mb-6">
                                <Step title="Thông tin cá nhân" />
                                <Step title="Đăng ký môn học" />
                            </Steps>

                            <Form form={form} layout="vertical" onFinish={onFinish} autoComplete="off" preserve={true}>
                                <div style={{ display: currentStep === 0 ? "block" : "none" }}>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <UserForm form={form} />
                                        </div>
                                        <div>
                                            <div>
                                                <span className="text-red-500">*</span>&nbsp;<label>Trạng thái</label>&nbsp;
                                                <StatusTag user={user} />
                                                <div>
                                                    <Form.Item name="avatar">
                                                        <AvatarUpload />
                                                    </Form.Item>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: currentStep === 1 ? "block" : "none" }}>
                                    <CourseRegistrationForm
                                        form={form}
                                        departments={departments}
                                        majors={majors}
                                        selectedDepartment={selectedDepartment}
                                        handleDepartmentChange={handleDepartmentChange}
                                        selectedAcademicYear={selectedAcademicYear}
                                        handleAcademicYearChange={handleAcademicYearChange}
                                        academicYears={academicYears}
                                        semesters={semesters}
                                        selectedSchedules={selectedSchedules}
                                        setSelectedSchedules={setSelectedSchedules}
                                        totalCredits={totalCredits}
                                        setTotalCredits={setTotalCredits}
                                    />
                                </div>

                                <Form.Item className="mt-6">
                                    {currentStep > 0 && (
                                        <Button type="link" style={{ marginRight: 8 }} onClick={prev} size="large">
                                            <LeftOutlined /> Quay lại
                                        </Button>
                                    )}
                                    {currentStep < 1 && (
                                        <Button
                                            type="primary"
                                            size="large"
                                            onClick={async () => {
                                                try {
                                                    await form.validateFields([
                                                        "fullname",
                                                        "dob",
                                                        "gender",
                                                        "student_code"
                                                    ]);
                                                    next();
                                                } catch (err) {
                                                    message.error("Vui lòng điền đầy đủ thông tin trước khi tiếp tục!");
                                                }
                                            }}
                                        >
                                            Tiếp theo <RightOutlined />
                                        </Button>
                                    )}
                                    {currentStep === 1 && (
                                        <Button type="primary" htmlType="submit" size="large">
                                            Cập nhật tất cả <CheckOutlined />
                                        </Button>
                                    )}
                                </Form.Item>
                            </Form>
                        </Card>
                    </div>
                </main>
            </div>
            <Spin spinning={loading} fullscreen tip="Đang xử lý. Vui lòng chờ..." />
        </div>
    );
}