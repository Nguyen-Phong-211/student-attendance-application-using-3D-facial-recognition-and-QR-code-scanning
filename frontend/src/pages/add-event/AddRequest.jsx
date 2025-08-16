import React, { useEffect } from "react";
import {
    Button,
    DatePicker,
    Form,
    Input,
    Breadcrumb,
    Typography,
    Card,
    Select,
} from "antd";
import Header from "../../components/Header/Header";
import { HomeOutlined, PlusCircleOutlined, AuditOutlined } from '@ant-design/icons';
import { useWatch } from 'antd/es/form/Form';

const { Title } = Typography;

const { RangePicker } = DatePicker;


export default function ContactPage() {

    useEffect(() => {
        document.title = "ATTEND 3D - Tạo đơn xin nghỉ phép";
    }, []);

    const [form] = Form.useForm();

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

    const selectedAcademicYear = useWatch('academicYear', form);
    const teacher = useWatch('teacher', form);
    const personalLeave = useWatch('personalLeave', form);
    const rangeDate = useWatch('rangeDate', form);
    const selectedSubject = useWatch('subject', form);

    const today = new Date();

    const formattedDate = `Tp.HCM, ngày ${today.getDate()} tháng ${today.getMonth() + 1} năm ${today.getFullYear()}`;


    return (
        <div className="min-h-screen bg-white text-gray-800 flex flex-col">
            <div className="w-full mx-auto px-6 flex-grow">

                <Header />

                <main className="mt-10 flex flex-col items-center">
                    <div className="w-full px-4">
                        <Breadcrumb
                            items={[
                                { href: '/', title: <HomeOutlined /> },
                                { href: '', title: <><PlusCircleOutlined /> <span>Tạo sự kiện</span></> },
                                { href: '/add-event/request-leave', title: <><AuditOutlined /> <span>Xin nghỉ phép</span></> },
                                { href: '/add-event/request-leave/request', title: 'Tạo đơn xin nghỉ phép' },
                            ]}
                        />
                    </div>

                    <div className="w-full p-5 rounded-lg mt-6">
                        <Card title={<Title level={3}>Tạo đơn xin nghỉ phép</Title>} className="p-2">
                            <Form
                                form={form}
                                initialValues={{ variant: 'filled', emailNotification: 1 }}
                                layout="vertical"
                                className="w-full"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
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
                                                style={{ cursor: 'not-allowed', borderWidth: 1.5, boxShadow: 'none' }}
                                            />
                                        </Form.Item>

                                        <Form.Item
                                            label="Lý do"
                                            name="personalLeave"
                                            rules={[{ required: true, message: 'Vui lòng nhập nội dung sự kiện!' }]}
                                        >
                                            <Input.TextArea 
                                                size="large" 
                                                placeholder="Nhập nội lý do nghỉ phép" 
                                                rows={5} 
                                                style={{ borderWidth: 1.5, boxShadow: 'none' }}
                                            />
                                        </Form.Item>

                                        <Form.Item
                                            label="Thời gian nghỉ phép"
                                            name="rangeDate"
                                            rules={[
                                                { required: true, message: 'Vui lòng chọn thời gian nghỉ phép!' },
                                                {
                                                    validator(_, value) {
                                                        const [start, end] = value || [];
                                                        if (start && end && end.diff(start, 'minute') < 180) {
                                                            return Promise.reject(
                                                                new Error('Ngày nghỉ phép phải lớn hơn 3 giờ')
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
                                                style={{ borderWidth: 1.5, boxShadow: 'none' }}
                                            />
                                        </Form.Item>

                                        <Form.Item className="mt-6">
                                            <Button type="primary" htmlType="submit" size="large" className="w-full md:w-auto">
                                                Gửi đơn
                                            </Button>
                                        </Form.Item>
                                    </div>

                                    <div className="p-4">

                                        <Card className="p-8">
                                            <div className="prose max-w-full">
                                                <p className="text-center font-bold text-lg uppercase">Cộng hoà xã hội chủ nghĩa Việt Nam</p>
                                                <p className="text-center font-bold text-base">Độc lập - Tự do - Hạnh phúc</p>
                                                <div className="border-t border-black w-40 mx-auto my-2"></div>

                                                <p className="text-center font-bold text-2xl mt-6 uppercase">Đơn xin nghỉ phép</p>

                                                <p className="mt-6"><strong>Kính gửi: </strong> Giảng viên {teacher}</p>

                                                <div className="grid grid-cols-2 gap-8 mt-4">
                                                    <p><strong>Em tên là: </strong> Nguyễn Văn A</p>
                                                    <p><strong>Mã số sinh viên: </strong> 21080701</p>
                                                </div>

                                                <div className="grid grid-cols-2 gap-8">
                                                    <p><strong>Lớp: </strong> DHHTTT13B</p>
                                                    <p><strong>Khoa: </strong> Công nghệ thông tin</p>
                                                </div>

                                                <div className="space-y-4 mt-4">
                                                    <p><strong>Năm học - Học kỳ: </strong> {
                                                        academicYear.find(item => item.value === selectedAcademicYear)?.label || ''
                                                    }</p>
                                                    <p><strong>Môn học: </strong> {
                                                        optionsSublect.find(item => item.value === selectedSubject)?.label || ''
                                                    }</p>
                                                    <p><strong>Thời gian nghỉ phép: </strong> 
                                                        {
                                                            rangeDate ? (
                                                                `${rangeDate[0].format('HH:mm DD/MM/YYYY')} - ${rangeDate[1].format('HH:mm DD/MM/YYYY')}`
                                                            ) : (
                                                                ''
                                                            )
                                                        }
                                                    </p>
                                                    <p><strong>Lý do: </strong> {personalLeave}</p>
                                                </div>

                                                <p className="mt-4">Em xin cam kết việc nghỉ học trên là có lý do chính đáng và sẽ tự ôn tập, bổ sung kiến thức bị thiếu trong thời gian nghỉ.</p>
                                                <p className="mt-4">Em xin chân thành cảm ơn!</p>

                                                <div className="mt-8 flex justify-end">
                                                    <div className="text-center">
                                                        <p>{formattedDate}</p>
                                                        <p><strong>Người làm đơn</strong></p>
                                                        <p className="italic">(Ký và ghi rõ họ tên)</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </Card>
                                    </div>
                                </div>
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
