import React, { useState, useEffect } from 'react';
import { Layout, Form, Input, Button, Checkbox, Typography, Card, message } from 'antd';
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../../components/Layout/Sidebar';
import Navbar from '../../../components/Layout/Navbar';

const { Header } = Layout;
const { Title } = Typography;

export default function RoleCreate() {
    const [collapsed, setCollapsed] = useState(false);
    const [form] = Form.useForm();
    const navigate = useNavigate();

    const permissions = [
        { label: 'Xem người dùng', value: 'view_users' },
        { label: 'Thêm người dùng', value: 'add_users' },
        { label: 'Chỉnh sửa người dùng', value: 'edit_users' },
        { label: 'Xóa người dùng', value: 'delete_users' },
        { label: 'Xem vai trò', value: 'view_roles' },
        { label: 'Thêm vai trò', value: 'add_roles' },
        { label: 'Phân quyền', value: 'assign_permissions' },
    ];

    useEffect(() => {
        document.title = "ATTEND 3D - Create Role";
    }, []);

    const onFinish = (values) => {
        console.log('New role:', values);
        message.success('Vai trò đã được thêm thành công!');
        form.resetFields();
        // navigate('/admin/roles'); // Bỏ comment khi có router
    };

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
            <Layout>
                <Header className="bg-white px-4 flex flex-col sm:flex-row justify-between items-center gap-4 py-3 border-b">
                    <Navbar />
                </Header>

                <main className="mx-4 my-4 p-4 sm:p-6 bg-white rounded shadow">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-4">
                            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
                                Quay lại
                            </Button>
                            <Title level={3} className="!mb-0">Thêm Vai Trò</Title>
                        </div>
                    </div>

                    <Card>
                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={onFinish}
                        >
                            <Form.Item
                                label="Tên vai trò"
                                name="role_name"
                                rules={[{ required: true, message: 'Vui lòng nhập tên vai trò' }]}
                            >
                                <Input placeholder="Nhập tên vai trò, ví dụ: Quản trị viên" size='large' />
                            </Form.Item>

                            <Form.Item
                                label="Danh sách quyền"
                                name="permissions"
                                rules={[{ required: true, message: 'Vui lòng chọn ít nhất một quyền' }]}
                            >
                                <Checkbox.Group style={{ width: '100%' }}>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                                        {permissions.map((perm) => (
                                            <Checkbox key={perm.value} value={perm.value}>
                                                {perm.label}
                                            </Checkbox>
                                        ))}
                                    </div>
                                </Checkbox.Group>
                            </Form.Item>

                            <Form.Item>
                                <Button
                                    type="primary"
                                    icon={<SaveOutlined />}
                                    htmlType="submit"
                                    size="large"
                                >
                                    Lưu Vai Trò
                                </Button>
                            </Form.Item>
                        </Form>
                    </Card>
                </main>
            </Layout>
        </Layout>
    );
}