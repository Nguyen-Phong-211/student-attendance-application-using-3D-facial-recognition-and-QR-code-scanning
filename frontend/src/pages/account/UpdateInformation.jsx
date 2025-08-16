import React, { useState, useEffect } from "react";
import { Typography, Card, Breadcrumb, Button, Input, message, Form, Select, Radio, DatePicker, Upload, Tag } from "antd";
import Header from "../../components/Header/Header";
import { HomeOutlined, SnippetsOutlined, EditOutlined, InboxOutlined } from '@ant-design/icons';
import dayjs from "dayjs";

const { Title } = Typography;

export default function UpdateInformationPage() {

    const [user, setUser] = useState(null);
    const [form] = Form.useForm();
    const { Option } = Select;
    const { Dragger } = Upload;
    const [imageUrl, setImageUrl] = useState(null);
    const [fileList] = useState([]);

    const props = {
        name: 'file',
        multiple: false,
        showUploadList: false,
        action: 'https://httpbin.org/post',
        fileList,
        beforeUpload(file) {
            const isImage = file.type.startsWith('image/');
            const isLt2M = file.size / 1024 / 1024 < 2;

            if (!isImage) {
                message.error('Chỉ được chọn file ảnh!');
                return Upload.LIST_IGNORE;
            }

            if (!isLt2M) {
                message.error('Ảnh phải nhỏ hơn 2MB!');
                return Upload.LIST_IGNORE;
            }

            const reader = new FileReader();
            reader.onload = e => {
                setImageUrl(e.target.result);
            };
            reader.readAsDataURL(file);

            return false;
        },
    };

    useEffect(() => {
        document.title = "ATTEND 3D - Cập nhật thông tin tài khoản";

        const storedUser = localStorage.getItem('user');
        if (storedUser && storedUser !== 'undefined') {
            try {
                const parsed = JSON.parse(storedUser);
                setUser(parsed);

                setTimeout(() => {
                    form.setFieldsValue({
                        fullname: parsed.fullname,
                        email: parsed.email,
                        phone: parsed.phone,
                        class_name: parsed.class_name,
                        faculty: parsed.faculty,
                        studentcode: parsed.studentcode
                    });
                }, 0);
            } catch (err) {
                console.error('Error parsing user from localStorage:', err);
                localStorage.removeItem('user');
                setUser(null);
            }
        } else {
            setUser(null);
        }
    }, [form]);

    return (
        <div className="min-h-screen bg-white text-gray-800 flex flex-col">
            <div className="w-full mx-auto px-6 flex-grow">

                <Header />

                <main className="mt-10 flex flex-col items-center">
                    <div className="w-full px-4">
                        <Breadcrumb
                            items={[
                                { href: '/', title: <HomeOutlined /> },
                                { href: '/account/information-account', title: <><SnippetsOutlined /> <span>Thông tin tài khoản</span></> },
                                { href: '/account/information-account/update', title: <><EditOutlined /> <span>Cập nhật thông tin</span></> },
                                { title: 'Cập nhật tài khoản' },
                            ]}
                        />
                    </div>

                    <div className="w-full p-5 rounded-lg mt-6">
                        <Card title={<Title level={3}>Cập nhật thông tin sinh viên</Title>} className="p-2">
                            <Form
                                layout="vertical"
                                form={form}
                                name="update-user"
                                onFinish={(values) => {
                                    message.success("Cập nhật thông tin thành công!");

                                    const updatedUser = { ...user, ...values };
                                    localStorage.setItem('user', JSON.stringify(updatedUser));
                                    setUser(updatedUser);
                                }}
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <Form.Item
                                            label="Họ và tên"
                                            name="fullname"
                                            rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}
                                        >
                                            <Input placeholder="Nguyễn Văn A" size="large" />
                                        </Form.Item>

                                        <Form.Item
                                            label="Mã số sinh viên"
                                            name="studentcode"
                                            rules={[{ required: true, message: 'Vui lòng nhập mã số sinh viên!' }]}
                                        >
                                            <Input placeholder="XXXXXXX" size="large" />
                                        </Form.Item>

                                        <Form.Item
                                            label="Giới tính"
                                            name="gender"
                                            rules={[{ required: true, message: 'Vui lòng chọn giới tính!' }]}
                                        >
                                            <Radio.Group
                                                name="gender"
                                                options={[
                                                    { value: 1, label: 'Nam', key: '1' },
                                                    { value: 2, label: 'Nữ', key: '2' },
                                                ]}
                                            />
                                        </Form.Item>

                                        <Form.Item
                                            label="Ngày sinh"
                                            name="dob"
                                            rules={[
                                                { required: true, message: 'Vui lòng chọn ngày sinh!' },
                                                () => ({
                                                    validator(_, value) {
                                                        if (!value) return Promise.resolve();

                                                        const today = dayjs();
                                                        const age = today.diff(value, 'year');

                                                        if (age < 17) {
                                                            return Promise.reject(new Error('Tuổi phải lớn hơn hoặc bằng 17'));
                                                        }

                                                        return Promise.resolve();
                                                    },
                                                }),
                                            ]}
                                        >
                                            <DatePicker
                                                format="DD/MM/YYYY"
                                                size="large"
                                                className="w-[100%]"
                                                disabledDate={current => current && current > dayjs()}
                                            />
                                        </Form.Item>

                                        <Form.Item
                                            label="Email"
                                            name="email"
                                            rules={[{ required: true, type: 'email', message: 'Email không hợp lệ!' }]}
                                        >
                                            <Input placeholder="abc@gmail.com" size="large" />
                                        </Form.Item>

                                        <Form.Item
                                            label="Số điện thoại"
                                            name="phone"
                                            rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}
                                        >
                                            <Input placeholder="0123456789" size="large" />
                                        </Form.Item>

                                        <Form.Item
                                            label="Avatar"
                                            name="avatar"
                                            rules={[{ required: false }]}
                                        >
                                            <Dragger {...props}>
                                                <p className="ant-upload-drag-icon">
                                                    <InboxOutlined />
                                                </p>
                                                <p className="ant-upload-text">
                                                    Click vào khu vực này để upload avatar
                                                </p>
                                                <p className="ant-upload-hint">
                                                    Vui lòng chọn hình có kích thước dưới 2MB
                                                </p>
                                            </Dragger>

                                            {imageUrl && (
                                                <img
                                                    src={imageUrl}
                                                    alt="avatar"
                                                    style={{ marginTop: 16, width: 200, borderRadius: '8px' }}
                                                />
                                            )}
                                        </Form.Item>
                                    </div>

                                    <div>
                                        <Form.Item label="Trạng thái">
                                            <Tag color="green">Đang hoạt động</Tag>
                                        </Form.Item>

                                        <Form.Item label="Khoa" name="faculty" rules={[{ required: true, message: 'Vui lòng chọn khoa!' }]}>
                                            <Select placeholder="Chọn khoa" size="large">
                                                <Option value="Công nghệ thông tin">Công nghệ thông tin</Option>
                                                <Option value="Kinh tế">Kinh tế</Option>
                                                <Option value="Ngôn ngữ Anh">Ngôn ngữ Anh</Option>
                                                <Option value="Luật">Luật</Option>
                                            </Select>
                                        </Form.Item>

                                        <Form.Item label="Lớp" name="class_name" rules={[{ required: true, message: 'Vui lòng chọn lớp!' }]}>
                                            <Select placeholder="Chọn lớp" size="large">
                                                <Option value="20CNTT1">20CNTT1</Option>
                                                <Option value="20CNTT2">20CNTT2</Option>
                                                <Option value="20KT1">20KT1</Option>
                                                <Option value="20NN1">20NN1</Option>
                                            </Select>
                                        </Form.Item>
                                    </div>

                                </div>

                                <Form.Item>
                                    <Button type="primary" htmlType="submit" size="large">
                                        Cập nhật
                                    </Button>
                                </Form.Item>
                            </Form>
                        </Card>
                    </div>
                </main>
            </div>

            <footer className="bg-gray-100 mt-20 py-2 px-5">
                <div className="text-center text-sm text-gray-500 mt-0">
                    © {new Date().getFullYear()} EDU FACE ID. All rights reserved.
                </div>
            </footer>
        </div>
    );
}


