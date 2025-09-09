import React, { useEffect } from "react";
import { Typography, Card, Breadcrumb, Input, Form, Button } from "antd";
// import Header from "../../components/Header/Header";
import { HomeOutlined, TeamOutlined } from '@ant-design/icons';

const { Title } = Typography;

export default function ContactPage() {

    useEffect(() => {
        document.title = "ATTEND 3D - Đổi mật khẩu";
    }, []);

    return (
        <div className="min-h-screen bg-white text-gray-800 flex flex-col">
            <div className="w-full mx-auto px-6 flex-grow">

                {/* <Header /> */}

                <main className="mt-10 flex flex-col items-center">
                    <div className="w-full px-4">
                        <Breadcrumb
                            items={[
                                { href: '/', title: <HomeOutlined /> },
                                { href: '/account/change-password', title: <><TeamOutlined /> <span>Đổi mật khẩu</span></> },
                                { title: 'Đổi mật khẩu' },
                            ]}
                        />
                    </div>

                    <div className="w-full p-5 rounded-lg mt-6">
                        <Card title={<Title level={3}>Đổi mật khẩu</Title>} className="p-2">
                            <div>
                                <div className="px-4 sm:px-0">
                                    <h3 className="text-sm text-red-500 italic">Vui lòng không tiết lộ mật khẩu dưới bất kì hình thức nào.</h3>
                                </div>
                                <div className="mt-5 border-gray-100">
                                    <dl className="divide-y divide-gray-100">
                                        <Form
                                            name="contact"
                                            layout="vertical"
                                            method="POST"
                                            autoComplete="off"
                                            onFinish={(values) => {
                                                console.log('Submit form đổi mật khẩu:', values);
                                            }}
                                        >
                                            <div className="px-4 py-1 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                                                <dt className="text-sm/6 font-medium text-gray-900">
                                                    Mật khẩu cũ <span className="text-red-500">*</span>
                                                </dt>
                                                <dd className="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">
                                                    <Form.Item
                                                        name="oldPassword"
                                                        rules={[{ required: true, message: 'Vui lòng nhập mật khẩu cũ!' }]}
                                                    >
                                                        <Input.Password size="large" placeholder="Nhập mật khẩu cũ" />
                                                    </Form.Item>
                                                </dd>
                                            </div>

                                            <div className="px-4 py-1 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                                                <dt className="text-sm/6 font-medium text-gray-900">
                                                    Mật khẩu mới <span className="text-red-500">*</span>
                                                </dt>
                                                <dd className="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">
                                                    <Form.Item
                                                        name="newPassword"
                                                        rules={[{ required: true, message: 'Vui lòng nhập mật khẩu mới!' }]}
                                                    >
                                                        <Input.Password size="large" placeholder="Nhập mật khẩu mới" />
                                                    </Form.Item>
                                                </dd>
                                            </div>

                                            <div className="px-4 py-1 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                                                <dt className="text-sm/6 font-medium text-gray-900">
                                                    Xác nhận mật khẩu mới <span className="text-red-500">*</span>
                                                </dt>
                                                <dd className="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">
                                                    <Form.Item
                                                        name="confirmPassword"
                                                        dependencies={['newPassword']}
                                                        rules={[
                                                            { required: true, message: 'Vui nhập mật khẩu mới để xác nhận!' },
                                                            ({ getFieldValue }) => ({
                                                                validator(_, value) {
                                                                    if (!value || getFieldValue('newPassword') === value) {
                                                                        return Promise.resolve();
                                                                    }
                                                                    return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                                                                },
                                                            }),
                                                        ]}
                                                    >
                                                        <Input.Password size="large" placeholder="Nhập lại mật khẩu mới" />
                                                    </Form.Item>
                                                </dd>
                                            </div>

                                            <Form.Item className="px-4 py-2 w-[100px] sm:px-0">
                                                <Button 
                                                    type="primary" 
                                                    htmlType="submit" 
                                                    block 
                                                    size="large" 
                                                    className="mt-2" >
                                                    Gửi
                                                </Button>
                                            </Form.Item>
                                        </Form>
                                    </dl>
                                </div>
                            </div>
                        </Card>

                    </div>
                </main>
            </div>

            <footer className="bg-gray-100 mt-10 py-2 px-5">
                <div className="text-center text-sm text-gray-500 mt-0">
                    © {new Date().getFullYear()} EDU FACE ID. All rights reserved.
                </div>
            </footer>
        </div>
    );
}
