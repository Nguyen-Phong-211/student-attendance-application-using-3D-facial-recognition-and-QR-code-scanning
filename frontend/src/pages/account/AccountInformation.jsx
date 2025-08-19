import React, { useState, useEffect, useCallback } from "react";
import { Typography, Card, Button, Form, message, Steps } from "antd";
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
        localStorage.setItem("allInforUser", JSON.stringify(values));
        if (!user?.account_id) return message.error("Không tìm thấy thông tin tài khoản.");

        try {
            const payload = {
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

            await api.post("students/", payload);
            message.success("Cập nhật thông tin thành công!");
            navigate("/");
            window.location.reload();

        } catch (err) {
            console.error("Submit error:", err);
            message.error("Lỗi kết nối: " + (err.response?.data || err.message || err));
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

                            <Form form={form} layout="vertical" onFinish={onFinish} autoComplete="off">
                                {currentStep === 0 && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <UserForm form={form} />
                                        </div>
                                        <div>
                                            <div>
                                                <span className="text-red-500">*</span>&nbsp;<label>Trạng thái</label>&nbsp;
                                                <StatusTag user={user} />
                                                <div>
                                                    <AvatarUpload />
                                                </div>
                                            </div>

                                        </div>
                                    </div>
                                )}

                                {currentStep === 1 && (
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
                                    />
                                )}

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
                                                    await form.validateFields();
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
        </div>
    );
}