import React, { useState, useEffect } from 'react';
import { Layout, Form, Input, Button, Select, message, Switch, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import Sidebar from '../../../components/Layout/Sidebar';
import Navbar from '../../../components/Layout/Navbar';
import {
    ArrowLeftOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../../../api/axiosInstance';

const { Header } = Layout;
const { Option } = Select;
const { Title } = Typography;

export default function ClassCreate() {
    const { t } = useTranslation();
    const [collapsed, setCollapsed] = useState(false);
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [departments, setDepartments] = useState([]);
    const [academicYears, setAcademicYears] = useState([]);
    const [statusChecked, setStatusChecked] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        document.title = "ATTEND 3D - Thêm lớp học";
        fetchDepartments();
        fetchAcademicYears();
    }, []);

    const fetchDepartments = async () => {
        try {
            const res = await api.get('departments/all/');
            const data = await res.data;
            setDepartments(data);
        } catch {
            message.error("Không tải được danh sách khoa.");
        }
    };

    const fetchAcademicYears = async () => {
        try {
            const res = await api.get('academic-years/all/');
            const data = await res.data;
            setAcademicYears(data);
        } catch {
            message.error("Không tải được danh sách năm học.");
        }
    };
    
    const onFinish = async (values) => {
        try {
            setLoading(true);
            const payload = {
                ...values,
                status: values.status ? '1' : '0',
            };
    
            await api.post('classes/create/', payload);
    
            message.success("Tạo lớp học thành công!");
            form.resetFields();
        } catch (error) {
            console.error(error);
            message.error("Tạo lớp học thất bại.");
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
                        <Title level={3} className="!mb-0 text-xl sm:text-2xl">Thêm lớp học mới</Title>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={onFinish}
                            initialValues={{ status: true }}
                        >

                            <Form.Item
                                label="Tên lớp"
                                name="class_name"
                                rules={[{ required: true, message: 'Vui lòng nhập tên lớp.' }]}
                            >
                                <Input placeholder="VD: CNTTKTMT2425587" />
                            </Form.Item>

                            <Form.Item
                                label="Khoa"
                                name="department"
                                rules={[{ required: true, message: 'Vui lòng chọn khoa.' }]}
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
                                label="Trạng thái" 
                                colon={false}
                                rules={[{ required: true, message: 'Vui lòng chọn trạng thái.' }]}
                            >
                                <Form.Item name="status" valuePropName="checked" noStyle>
                                    <Switch onChange={(checked) => setStatusChecked(checked)} />
                                </Form.Item>
                                <span className="ml-3 font-medium text-gray-700">
                                    {statusChecked ? 'Hoạt động' : 'Không hoạt động'}
                                </span>
                            </Form.Item>

                            <Form.Item>
                                <Button type="primary" htmlType="submit" loading={loading}>
                                    Tạo lớp học
                                </Button>
                            </Form.Item>
                        </Form>

                        <div className="border border-gray-200 p-4 rounded">
                            <Title level={5}>Hướng dẫn đặt tên lớp học</Title>
                            <ul className="list-disc ml-5">
                                <li>Dùng mã lớp dễ nhớ, ví dụ: <code>CNTTKTMT2425587</code></li>
                                <li>CNTT: Tên viết tắt của tên khoa</li>
                                <li>KTMT: Tên viết tắt của tên chuyên ngành</li>
                                <li>2425: Tên năm học 2024-2025</li>
                                <li>587: 3 số cuối ngẫu nhiên</li>
                            </ul>
                        </div>
                    </div>
                </main>

            </Layout>
        </Layout>
    );
}