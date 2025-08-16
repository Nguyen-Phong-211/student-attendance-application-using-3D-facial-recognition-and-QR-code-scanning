import React, { useState, useEffect } from 'react';
import { Layout, Form, Input, Button, Select, message, Switch, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import Sidebar from '../../../components/Layout/Sidebar';
import Navbar from '../../../components/Layout/Navbar';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Header } = Layout;
const { Option } = Select;
const { Title } = Typography;

export default function SubjectCreate() {
    const { t } = useTranslation();
    const [collapsed, setCollapsed] = useState(false);
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [departments, setDepartments] = useState([]);
    const [academicYears, setAcademicYears] = useState([]);
    const [statusChecked, setStatusChecked] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        document.title = "ATTEND 3D - Thêm môn học";
        fetchDepartments();
        fetchAcademicYears();
    }, []);

    const fetchDepartments = async () => {
        const token = localStorage.getItem("access_token");
        try {
            const res = await fetch("http://127.0.0.1:8000/api/v1/departments/all/", {
                headers: { "Authorization": `Bearer ${token}` },
            });
            const data = await res.json();
            setDepartments(data);
        } catch {
            message.error("Không tải được danh sách khoa.");
        }
    };

    const fetchAcademicYears = async () => {
        const token = localStorage.getItem("access_token");
        try {
            const res = await fetch("http://127.0.0.1:8000/api/v1/academic-years/all/", {
                headers: { "Authorization": `Bearer ${token}` },
            });
            const data = await res.json();
            setAcademicYears(data);
        } catch {
            message.error("Không tải được danh sách năm học.");
        }
    };

    const onFinish = async (values) => {
        const token = localStorage.getItem("access_token");
        try {
            setLoading(true);
            const payload = {
                ...values,
                status: values.status ? '1' : '0',
            };

            const res = await fetch("http://127.0.0.1:8000/api/v1/subjects/create/", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                message.success("Tạo môn học thành công!");
                form.resetFields();
            } else {
                message.error("Tạo môn học thất bại.");
            }
        } catch {
            message.error("Lỗi khi gửi yêu cầu.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} t={t} />
            <Layout>
                <Header className="bg-white px-4 flex justify-between items-center border-b">
                    <Navbar />
                </Header>

                <main className="mx-4 my-4 p-4 sm:p-6 bg-white rounded shadow">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
                        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} className="w-[150px]">
                            Quay lại
                        </Button>
                        <Title level={3} className="!mb-0 text-xl sm:text-2xl">Thêm môn học mới</Title>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={onFinish}
                            initialValues={{ status: true }}
                        >
                            <Form.Item
                                label="Tên môn học"
                                name="subject_name"
                                rules={[{ required: true, message: 'Vui lòng nhập tên môn học.' }]}
                            >
                                <Input placeholder="VD: Cấu trúc dữ liệu" />
                            </Form.Item>

                            <Form.Item
                                label="Số tín chỉ lý thuyết"
                                name="theory_credit"
                                rules={[{ required: true, message: 'Vui lòng nhập số tín chỉ lý thuyết.' }]}
                            >
                                <Input type="number" placeholder="VD: 3" />
                            </Form.Item>

                            <Form.Item
                                label="Số tín chỉ thực hành"
                                name="practice_credit"
                                rules={[{ required: true, message: 'Vui lòng nhập số tín chỉ thực hành.' }]}
                            >
                                <Input type="number" placeholder="VD: 1" />
                            </Form.Item>

                            <Form.Item
                                label="Năm học"
                                name="academic_year"
                                rules={[{ required: true, message: 'Vui lòng chọn năm học.' }]}
                            >
                                <Select placeholder="Chọn năm học">
                                    {academicYears.map((year) => (
                                        <Option key={year.academic_year_id} value={year.academic_year_id}>
                                            {year.academic_year_name}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>

                            <Form.Item
                                label="Phòng ban"
                                name="department"
                                rules={[{ required: true, message: 'Vui lòng chọn phòng ban.' }]}
                            >
                                <Select placeholder="Chọn khoa">
                                    {departments.map((dept) => (
                                        <Option key={dept.department_id} value={dept.department_id}>
                                            {dept.department_name}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>

                            <Form.Item
                                label="Trạng thái"
                                colon={false}
                            >
                                <Form.Item name="status" valuePropName="checked" noStyle>
                                    <Switch onChange={setStatusChecked} />
                                </Form.Item>
                                <span className="ml-3 font-medium text-gray-700">
                                    {statusChecked ? 'Hoạt động' : 'Không hoạt động'}
                                </span>
                            </Form.Item>

                            <Form.Item>
                                <Button type="primary" htmlType="submit" loading={loading}>
                                    Tạo môn học
                                </Button>
                            </Form.Item>
                        </Form>
                    </div>
                </main>
            </Layout>
        </Layout>
    );
}