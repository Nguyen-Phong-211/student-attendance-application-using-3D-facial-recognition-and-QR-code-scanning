import React, { useState, useEffect } from 'react';
import {
    Layout, Table, Button, Modal, Form, Input, Select, Tag, Switch, message, Space
} from 'antd';
import { PlusOutlined, EditOutlined, LockOutlined } from '@ant-design/icons';
import Sidebar from '../../../components/Layout/Sidebar';
import Navbar from '../../../components/Layout/Navbar';
import api from '../../../api/axiosInstance';

const { Header } = Layout;
const { Option } = Select;

export default function AccountManagement() {
    const [collapsed, setCollapsed] = useState(false);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [openModal, setOpenModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [form] = Form.useForm();

    useEffect(() => {
        document.title = "ATTEND 3D - Quản lý người dùng";

        fetchAccounts();
    }, []);

    const fetchAccounts = async () => {
        setLoading(true);
        try {
            const response = await api.get("accounts/get-all-accounts/");
            setUsers(response.data);
        } catch (error) {
            message.error("Không thể tải dữ liệu người dùng");
        } finally {
            setLoading(false);
        }
    };

    const showEditModal = (user) => {
        setEditingUser(user);
        form.setFieldsValue(user);
        setOpenModal(true);
    };

    const handleSubmit = (values) => {
        if (editingUser) {
            const updated = users.map((u) => (u.id === editingUser.id ? { ...u, ...values } : u));
            setUsers(updated);
            message.success('Cập nhật thành công');
        } else {
            const newUser = {
                ...values,
                id: Date.now(),
                status: true,
            };
            setUsers([...users, newUser]);
            message.success('Thêm người dùng thành công');
        }
        form.resetFields();
        setEditingUser(null);
        setOpenModal(false);
    };

    const handleStatusChange = (userId, checked) => {
        setUsers((prev) =>
            prev.map((u) => (u.id === userId ? { ...u, status: checked } : u))
        );
        message.success('Cập nhật trạng thái thành công');
    };

    const columns = [
        {
            title: 'Email',
            dataIndex: 'email',
        },
        {
            title: 'Số điện thoại',
            dataIndex: 'phone_number',
        },
        {
            title: 'Loại tài khoản',
            dataIndex: 'user_type',
            render: (role) => <Tag color={role === 'Admin' ? 'red' : role === 'Teacher' ? 'blue' : 'green'}>{role}</Tag>,
        },
        {
            title: 'Kích hoạt',
            dataIndex: 'is_active',
            render: (status, record) => (
                <Switch
                    checked={status}
                    onChange={(checked) => handleStatusChange(record.account_id, checked)}
                />
            ),
        },
        {
            title: 'Khoá tài khoản',
            dataIndex: 'is_locked',
            render: (locked) => (
                <Tag color={locked ? 'red' : 'green'}>
                    {locked ? 'Đang khoá' : 'Hoạt động'}
                </Tag>
            ),
        },
        {
            title: 'Hành động',
            render: (_, record) => (
                <Space>
                    <Button icon={<EditOutlined />} onClick={() => showEditModal(record)}>
                        Sửa
                    </Button>
                    <Button icon={<LockOutlined />} onClick={() => showPasswordModal(record)}>
                        Đổi mật khẩu
                    </Button>
                </Space>
            ),
        },
    ];

    const [showPassword, setShowPassword] = useState(false);
    const [passwordForm] = Form.useForm();

    const showPasswordModal = (user) => {
        setEditingUser(user);
        setShowPassword(true);
        passwordForm.resetFields();
    };

    const handleChangePassword = (values) => {
        message.success(`Đổi mật khẩu cho ${editingUser.name} thành công`);
        setShowPassword(false);
    };

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
            <Layout>
                <Header className="bg-white px-4 flex justify-between items-center py-3 border-b">
                    <Navbar />
                </Header>

                <main className="mx-4 my-4 p-4 bg-white rounded shadow">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">Quản lý người dùng</h2>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => {
                                setEditingUser(null);
                                form.resetFields();
                                setOpenModal(true);
                            }}
                        >
                            Thêm người dùng
                        </Button>
                    </div>

                    <Table
                        dataSource={users}
                        columns={columns}
                        rowKey="account_id"
                        bordered
                        scroll={{ x: 'max-content' }}
                        loading={loading}
                    />

                    <Modal
                        open={openModal}
                        title={editingUser ? 'Cập nhật người dùng' : 'Thêm người dùng'}
                        onCancel={() => setOpenModal(false)}
                        onOk={() => form.submit()}
                    >
                        <Form layout="vertical" form={form} onFinish={handleSubmit} autoComplete='off'>
                            <Form.Item name="name" label="Họ tên" rules={[{ required: true }]}>
                                <Input type='text' size='large' style={{ borderWidth: 1.5, boxShadow: 'none'}} />
                            </Form.Item>
                            <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
                                <Input type='email' size='large' style={{ borderWidth: 1.5, boxShadow: 'none'}} />
                            </Form.Item>
                            {!editingUser && (
                                <Form.Item name="password" label="Mật khẩu" rules={[{ required: true }]}>
                                    <Input.Password size='large' style={{ borderWidth: 1.5, boxShadow: 'none'}} />
                                </Form.Item>
                            )}
                            <Form.Item name="role" label="Vai trò" rules={[{ required: true }]}>
                                <Select placeholder="Chọn vai trò" size='large' className='w-full custom-select'>
                                    <Option value="Admin">Admin</Option>
                                    <Option value="Teacher">Teacher</Option>
                                    <Option value="Student">Student</Option>
                                </Select>
                            </Form.Item>
                        </Form>
                    </Modal>

                    <Modal
                        open={showPassword}
                        title={`Đổi mật khẩu - ${editingUser?.name}`}
                        onCancel={() => setShowPassword(false)}
                        onOk={() => passwordForm.submit()}
                    >
                        <Form layout="vertical" form={passwordForm} onFinish={handleChangePassword} autoComplete='off'>
                            <Form.Item
                                name="newPassword"
                                label="Mật khẩu mới"
                                rules={[{ required: true, min: 6 }]}
                            >
                                <Input.Password size='large' style={{ borderWidth: 1.5, boxShadow: 'none'}} />
                            </Form.Item>
                            <Form.Item
                                name="confirmPassword"
                                label="Xác nhận mật khẩu"
                                dependencies={['newPassword']}
                                rules={[
                                    { required: true },
                                    ({ getFieldValue }) => ({
                                        validator(_, value) {
                                            if (!value || getFieldValue('newPassword') === value) {
                                                return Promise.resolve();
                                            }
                                            return Promise.reject(new Error('Mật khẩu không khớp'));
                                        },
                                    }),
                                ]}
                            >
                                <Input.Password size='large' style={{ borderWidth: 1.5, boxShadow: 'none'}} />
                            </Form.Item>
                        </Form>
                    </Modal>
                </main>
            </Layout>
        </Layout>
    );
}