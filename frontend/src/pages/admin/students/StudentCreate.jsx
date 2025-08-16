import React, { useState, useEffect } from 'react';
import {
    Layout, Form, Input, Button, DatePicker, Select, Switch, message, Typography
} from 'antd';
import Sidebar from '../../../components/Layout/Sidebar';
import Navbar from '../../../components/Layout/Navbar';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeftOutlined
} from '@ant-design/icons';
import api from '../../../api/axiosInstance';


const { Header } = Layout;
const { Title } = Typography;
const { Option } = Select;

export default function StudentCreate() {
    const [collapsed, setCollapsed] = useState(false);
    const [form] = Form.useForm();
    const [departments, setDepartments] = useState([]);
    const [majors, setMajors] = useState([]);
    const [selectedDepartmentId, setSelectedDepartmentId] = useState(null);
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        document.title = 'Thêm sinh viên';
        fetchDepartments();
        fetchMajors();
    }, []);

    const fetchDepartments = async () => {
        const res = await api.get('departments/all/');
        const data = await res.data;
        setDepartments(data);
    };

    const filteredMajors = majors.filter(m => m.department?.department_id === selectedDepartmentId);

    const fetchMajors = async () => {
        const res = await api.get('majors/all/');
        const data = await res.data;
        setMajors(data);
    };

    const onFinish = async (values) => {
        setLoading(true); 
        try {
            const token = localStorage.getItem("access_token");
            // console.log(token);
            const response = await fetch('http://127.0.0.1:8000/api/v1/students/acreated', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...values,
                    dob: values.dob.format('YYYY-MM-DD')
                }),
            });

            if (response.ok) {
                message.success('Thêm sinh viên thành công!');
                form.resetFields();
            } else {
                const errorData = await response.json();
                message.error(`Lỗi: ${errorData.message || 'Không thể thêm sinh viên'}`);
            }
        } catch (error) {
            message.error('Có lỗi khi gửi yêu cầu');
        } finally {
            setLoading(false); 
        }
    };

    const generatePassword = () => {
        const length = 10;
        const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~";
        let password = "";
        for (let i = 0, n = charset.length; i < length; ++i) {
            password += charset.charAt(Math.floor(Math.random() * n));
        }
        return password;
    };

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
            <Layout>
                <Header className="bg-white px-4 border-b">
                    <Navbar />
                </Header>
                <main className="mx-4 my-4 p-6 bg-white rounded shadow">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} className='w-[150px]'>
                                Quay lại
                            </Button>
                            <Title level={3} className="!mb-0 text-xl sm:text-2xl">Tạo tài khoản sinh viên</Title>
                        </div>
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={onFinish}
                        autoComplete="off"
                        className='mt-6'
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                            <Form.Item label="Họ và tên" name="fullname" rules={[{ required: true }]}>
                                <Input placeholder="Nhập họ và tên" />
                            </Form.Item>

                            <Form.Item 
                                label="Số điện thoại" 
                                name="phone_number" 
                                rules={[
                                    { required: true },
                                    {
                                        pattern: /^(096|097|086|098|039|038|037|036|035|034|033|032|083|084|085|081|088|082|091|094|070|076|077|078|079|089|090|093|092|056|058|099|059|087)\d{7}$/,
                                        message: 'Số điện thoại không hợp lệ!'
                                    }
                                ]}>
                                <Input placeholder="Nhập số điện thoại" minLength={10} maxLength={10} />
                            </Form.Item>

                            <Form.Item label="Email" name="email" rules={[{ type: 'email' }, {required: true}]}>
                                <Input placeholder="Nhập email" />
                            </Form.Item>

                            <Form.Item
                                label="Mật khẩu"
                                name="password"
                                rules={[
                                    { required: true, message: 'Vui lòng nhập mật khẩu!' },
                                    { min: 8, message: 'Mật khẩu phải có ít nhất 8 ký tự' }
                                ]}
                            >
                                <Input.Password
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        form.setFieldsValue({ password: e.target.value });
                                    }}
                                    placeholder="Nhập hoặc tạo mật khẩu"
                                    addonAfter={
                                        <Button
                                            type="link"
                                            style={{ padding: '0 8px', height: '100%' }}
                                            onClick={() => {
                                                const newPassword = generatePassword();
                                                setPassword(newPassword);
                                                form.setFieldsValue({ password: newPassword });
                                            }}
                                        >
                                            Tạo
                                        </Button>
                                    }
                                />
                            </Form.Item>

                            <Form.Item label="Giới tính" name="gender" rules={[{ required: true }]}>
                                <Select placeholder="Chọn giới tính">
                                    <Option value="1">Nam</Option>
                                    <Option value="2">Nữ</Option>
                                </Select>
                            </Form.Item>

                            <Form.Item 
                                label="Ngày sinh" 
                                name="dob" 
                                rules={[
                                    { required: true },
                                    () => ({
                                        validator(_, value) {
                                            if (!value) return Promise.resolve();

                                            const today = dayjs();
                                            const age = today.diff(value, "year");

                                            if (age < 17) {
                                            return Promise.reject(new Error("Tuổi phải lớn hơn hoặc bằng 17"));
                                            }

                                            return Promise.resolve();
                                        },
                                    }),
                                ]}>
                                <DatePicker format="YYYY-MM-DD" style={{ width: '100%' }} />
                            </Form.Item>
                            
                            <Form.Item label="Trạng thái" name="status" rules={[{ required: true }]}>
                                <Select placeholder="Chọn trạng thái">
                                    <Option value="1">Đang học</Option>
                                </Select>
                            </Form.Item>

                            <Form.Item label="Khoa" name="department_id" rules={[{ required: true }]}>
                                <Select
                                    placeholder="Chọn khoa"
                                    onChange={(value) => {
                                        form.setFieldsValue({ major_id: null });
                                        setSelectedDepartmentId(value);
                                    }}
                                >
                                    {departments.map(dep => (
                                        <Option key={dep.department_id} value={dep.department_id}>
                                            {dep.department_name}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>

                            <Form.Item label="Chuyên ngành" name="major_id" rules={[{ required: true }]}>
                                <Select placeholder="Chọn chuyên ngành" disabled={!selectedDepartmentId}>
                                    {filteredMajors.length > 0 ? (
                                        filteredMajors.map(major => (
                                            <Option key={major.major_id} value={major.major_id}>
                                                {major.major_name}
                                            </Option>
                                        ))
                                    ) : (
                                        selectedDepartmentId && <Option disabled>Không có chuyên ngành</Option>
                                    )}
                                </Select>
                            </Form.Item>

                            <Form.Item label="Khoá tài khoản" name="is_locked" valuePropName="checked">
                                <Switch checkedChildren="Khoá" unCheckedChildren="Mở" />
                            </Form.Item>
                        </div>
                        <Form.Item>
                            <Button type="primary" htmlType="submit" loading={loading}>Thêm sinh viên</Button>
                        </Form.Item>
                    </Form>
                </main>
            </Layout>
        </Layout>
    );
}