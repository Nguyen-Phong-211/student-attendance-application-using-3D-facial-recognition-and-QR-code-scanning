import React, { useEffect } from "react";
import {
    Button,
    DatePicker,
    Form,
    Input,
    Radio,
    Breadcrumb,
    Typography,
    Card,
    Select,
} from "antd";
import Header from "../../components/Header/Header";
import { HomeOutlined, PlusCircleOutlined } from '@ant-design/icons';

const { Title } = Typography;

const { RangePicker } = DatePicker;


export default function ContactPage() {

    useEffect(() => {
        document.title = "ATTEND 3D - Tạo nhắc nhở điểm danh";
    }, []);

    const [form] = Form.useForm();

    const options = [
        { label: 'Có', value: 1 },
        { label: 'Không', value: 0 },
    ];

    const optionsRemind = [
        { label: 'Trước 5 phút', value: '1' },
        { label: 'Trước 10 phút', value: '2' },
        { label: 'Trước 15 phút', value: '3' },
        { label: 'Trước 20 phút', value: '4' }
    ];

    const optionsSublect = [
        { label: 'Toán cao cấp', value: '1' },
        { label: 'Vật lý đại cương', value: '2' },
        { label: 'Phân tích thiết kế hệ thống', value: '3' },
        { label: 'Nhập môn lập trình', value: '4' }
    ];

    const academicYear = [
        { label: '2022-2023 - Học kỳ 1', value: '1' },
        { label: '2022-2023 - Học kỳ 2', value: '2' },
        { label: '2023-2024 - Học kỳ 1', value: '3' },
        { label: '2023-2024 - Học kỳ 2', value: '4' },
    ];

    return (
        <div className="min-h-screen bg-white text-gray-800 flex flex-col">
            <div className="w-full mx-auto px-6 flex-grow">

                <Header />

                <main className="mt-10 flex flex-col items-center">
                    <div className="w-full px-4">
                        <Breadcrumb
                            items={[
                                { href: '/', title: <HomeOutlined /> },
                                { href: '/add-event/add-reminder', title: <><PlusCircleOutlined /> <span>Tạo sự kiện</span></> },
                                { title: 'Tạo nhắc điểm danh' },
                            ]}
                        />
                    </div>

                    <div className="w-full p-5 rounded-lg mt-6">
                        <Card title={<Title level={3}>Tạo thông tin sự kiện</Title>} className="p-2">
                            <Form
                                form={form}
                                initialValues={{ variant: 'filled', emailNotification: 1 }}
                                layout="vertical"
                                className="w-full"
                                name="formCreateEvent"
                                autoComplete="off"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <Form.Item
                                            label="Tiêu đề sự kiện"
                                            name="title"
                                            rules={[{ required: true, message: 'Vui lòng nhập tiêu đề sự kiện!' }]}
                                        >
                                            <Input size="large" placeholder="Nhập tiêu đề sự kiện" style={{ borderWidth: 1.5, boxShadow: 'none'}}/>
                                        </Form.Item>

                                        <Form.Item
                                            label="Nội dung sự kiện"
                                            name="content"
                                            rules={[{ required: true, message: 'Vui lòng nhập nội dung sự kiện!' }]}
                                        >
                                            <Input.TextArea size="large" placeholder="Nhập nội dung sự kiện" rows={5} style={{ borderWidth: 1.5, boxShadow: 'none'}} />
                                        </Form.Item>

                                        <Form.Item
                                            label="Ngày bắt đầu - Ngày kết thúc"
                                            name="rangeDate"
                                            rules={[
                                                { required: true, message: 'Vui lòng chọn thời gian!' },
                                                {
                                                    validator(_, value) {
                                                        const [start, end] = value || [];
                                                        if (start && end && end.diff(start, 'minute') < 30) {
                                                            return Promise.reject(
                                                                new Error('Ngày kết thúc phải lớn hơn ngày bắt đầu ít nhất 30 phút')
                                                            );
                                                        }
                                                        return Promise.resolve();
                                                    },
                                                },
                                            ]}
                                        >
                                            <RangePicker
                                                showTime={{ format: 'HH:mm' }}
                                                size="large"
                                                format="HH:mm DD/MM/YYYY"
                                                className="w-full"
                                                style={{ borderWidth: 1.5, boxShadow: 'none'}}
                                            />
                                        </Form.Item>

                                        <Form.Item
                                            name="emailNotification"
                                            rules={[{ required: true, message: 'Vui lòng chọn tùy chọn!' }]}
                                        >
                                            <label>
                                                <span className="text-red-500">*</span> Thông báo email
                                            </label>
                                            <Radio.Group options={options} className="ms-4" defaultValue={1} />
                                        </Form.Item>

                                        <Form.Item
                                            label="Thời gian remind sự kiện (Optional)"
                                            rules={[{ required: false }]}
                                            name={'timeEvent'}
                                        >
                                            <Select
                                                allowClear
                                                options={optionsRemind}
                                                placeholder="Chọn thời gian remind sự kiện"
                                                size="large"
                                                className="w-full custom-select"
                                            />
                                        </Form.Item>
                                    </div>

                                    <div className="p-4">
                                        <Title level={4}>Thông tin môn học</Title>

                                        <Form.Item
                                            label="Năm học và học kỳ"
                                            rules={[{ required: true, message: 'Vui lòng chọn năm học và học kỳ!' }]}
                                            name={'academicYear'}
                                            className="mt-5"
                                        >
                                            <Select
                                                options={academicYear}
                                                allowClear
                                                placeholder="Chọn năm học"
                                                size="large"
                                                className="w-full custom-select"
                                            />
                                        </Form.Item>

                                        <Form.Item
                                            label="Tên môn học"
                                            rules={[{ required: true, message: 'Vui lòng chọn môn học!' }]}
                                            name={'subject'}
                                            className="mt-5"
                                        >
                                            <Select
                                                allowClear
                                                options={optionsSublect}
                                                placeholder="Chọn tên môn học"
                                                size="large"
                                                className="w-full custom-select"
                                            />
                                        </Form.Item>

                                        <Form.Item
                                            label="Tên giảng viên"
                                            rules={[{ required: false }]}
                                            name={'teacher'}
                                        >
                                            <Input
                                                size="large"
                                                className="w-full"
                                                readOnly
                                                style={{ borderWidth: 1.5, boxShadow: 'none', cursor: 'not-allowed' }}
                                            />
                                        </Form.Item>

                                        <Form.Item
                                            label="Phòng học"
                                            name="location"
                                            rules={[{ required: false }]}
                                        >
                                            <Input 
                                                size="large"
                                                readOnly
                                                style={{ borderWidth: 1.5, boxShadow: 'none', cursor: 'not-allowed'}}
                                                className="w-full"
                                            />
                                        </Form.Item>

                                        <Form.Item
                                            label="Tiết học"
                                            name="timeStudy"
                                            rules={[{ required: false }]}
                                        >
                                            <Input 
                                                size="large"
                                                readOnly
                                                style={{ borderWidth: 1.5, boxShadow: 'none', cursor: 'not-allowed'}}
                                                className="w-full"
                                            />
                                        </Form.Item>
                                    </div>
                                </div>

                                <Form.Item className="mt-6">
                                    <Button type="primary" htmlType="submit" size="large" className="w-full md:w-auto">
                                        Gửi sự kiện
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
