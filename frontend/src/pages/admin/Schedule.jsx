import React, { useState, useEffect } from 'react';
import {
    Layout, Table, Button, Select, Tabs, message, Tag, Form, Input, Card, Typography
} from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import Sidebar from '../../components/Layout/Sidebar';
import Navbar from '../../components/Layout/Navbar';
import dayjs from 'dayjs';
import api from '../../api/axiosInstance';

const { Header } = Layout;
const { TabPane } = Tabs;
const { Title } = Typography;
const { TextArea } = Input;

export default function Schedule() {

    useEffect(() => {
        document.title = "ATTEND 3D - Quản lý lịch học";
    }, []);
    const [form] = Form.useForm();
    const [collapsed, setCollapsed] = useState(false);
    const [loading, setLoading] = useState(false);
    const [schedules, setSchedules] = useState([]);
    const [studentIdFilter, setStudentIdFilter] = useState('');
    const [studentCode, setStudentCode] = useState([]);

    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [selectedRows, setSelectedRows] = useState([]);

    const fetchSchedules = async (studentCode) => {
        if (!studentCode) return;
        setLoading(true);
        try {
            const res = await api.get(`students/admin/all/schedule/${studentCode}/`);
            setSchedules(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error(err);
            message.error('Không tải được lịch học.');
            setSchedules([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchStudentCode = async () => {
        setLoading(true);
        try {
            const res = await api.get('students/admin/all/student-codes/');
            setStudentCode(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error(err);
            message.error('Không tải được danh sách sinh viên.');
            setStudentCode([]);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchSchedules();
        fetchStudentCode();
    }, []);

    const columns = [
        {
            title: 'Trạng thái duyệt',
            dataIndex: 'register_status',
            key: 'register_status',
            render: (value) => {
                if (value === 'pending') {
                    return <Tag color="blue">Chưa duyệt</Tag>;
                } else if (value === 'approved') {
                    return <Tag color="green">Đã duyệt</Tag>;
                } else {
                    return <Tag color="red">Không duyệt</Tag>;
                }
            }
        },
        {
            title: 'Mã sinh viên',
            dataIndex: 'student_code',
            key: 'student_code',
        },
        {
            title: 'Tên sinh viên',
            dataIndex: 'student_name',
            key: 'student_name',
        },
        {
            title: 'Ngày đăng ký',
            dataIndex: 'created_at',
            key: 'created_at',
            render: (value) => value ? dayjs(value).format('HH:mm:ss DD/MM/YYYY') : '',
        },
        {
            title: 'Môn học',
            dataIndex: 'subject_name',
            key: 'subject_name',
        },
        {
            title: 'Giảng viên',
            dataIndex: 'lecturer_name',
            key: 'lecturer_name',
        },
        {
            title: 'Phòng học',
            dataIndex: 'room_name',
            key: 'room_name',
        },
        {
            title: 'Ca học',
            dataIndex: 'shift_name',
            key: 'shift_name',
        },
        {
            title: 'Tiết',
            dataIndex: 'slot_name',
            key: 'slot_name',
        },
        {
            title: 'Ngày trong tuần',
            dataIndex: 'day_of_week',
            key: 'day_of_week',
            render: (value) => value === 2 ? 'Thứ 2' : value === 3 ? 'Thứ 3' : value === 4 ? 'Thứ 4' : value === 5 ? 'Thứ 5' : value === 6 ? 'Thứ 6' : value === 7 ? 'Thứ 7' : value === 8 ? 'Chủ nhật' : '',
        },
        {
            title: 'Loại buổi',
            dataIndex: 'lesson_type',
            key: 'lesson_type',
        },
        {
            title: 'Thời gian',
            key: 'time',
            render: (_, record) => `${record.lesson_start} - ${record.lesson_end}`,
        },
    ];

    useEffect(() => {
        if (studentCode.length > 0) {
            form.setFieldsValue({
                reason: "Lịch học cơ bản của sinh viên " +
                    studentCode.map(code => `${code.student_code} - ${code.fullname}`).join(", ")
            });
        }

        if(studentCode?.register_status === 'pending') {
            form.setFieldsValue({
                reason: studentCode.map(code => `${code.reason}`)
            });
        }
    }, [studentCode, form]);

    const onFinish = async (values) => {
        try {
            const request_ids = selectedRows.map(row => row.subject_registration_request_id);
            const res = await api.put('students/admin/approve-schedule/', {
                request_ids,
                reason: values.reason,
            });
            message.success(res.data.message);
            fetchSchedules(studentIdFilter);
            form.resetFields();
            setSelectedRowKeys([]);
            setSelectedRows([]);
        } catch (err) {
            message.error("Duyệt thất bại. Vui lòng thử lại.");
        }
    };

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
            <Layout>
                <Header className="bg-white px-4 flex justify-between items-center border-b">
                    <Navbar />
                </Header>

                <main className="mx-4 my-4 p-4 sm:p-6 bg-white rounded shadow">
                    <h1 className="text-2xl font-bold mb-4">Quản lý lịch học</h1>

                    <Tabs defaultActiveKey="browse">
                        <TabPane tab="Duyệt lịch học" key="browse">
                            <div className="flex flex-wrap gap-2 items-center mb-4">
                                <Select
                                    placeholder="Lọc theo mã sinh viên"
                                    value={studentIdFilter || undefined}
                                    onChange={(value) => {
                                        setStudentIdFilter(value);

                                        if (value) {
                                            fetchSchedules(value);
                                        } else {
                                            setSchedules([]);
                                        }
                                    }}
                                    style={{ width: 400 }}
                                    allowClear
                                    options={studentCode.map(code => ({
                                        label: code?.student_code + ' - ' + code?.fullname,
                                        value: code?.student_code,
                                    }))}
                                    className='custom-select'
                                    filterOption={(input, option) =>
                                        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                    }
                                    showSearch
                                />

                                <Button icon={<ReloadOutlined />} onClick={() => fetchSchedules(studentIdFilter)} type='primary'>
                                    Làm mới
                                </Button>
                            </div>

                            <Table
                                rowKey="schedule_id"
                                columns={columns}
                                dataSource={schedules}
                                loading={loading}
                                pagination={{ pageSize: 10 }}
                                bordered
                                scroll={{ x: 'max-content' }}
                                rowSelection={{
                                    type: 'checkbox',
                                    selectedRowKeys: selectedRowKeys,
                                    onChange: (selectedKeys, selectedRows) => {
                                        setSelectedRowKeys(selectedKeys);
                                        setSelectedRows(selectedRows);
                                    },
                                }}
                            />
                            {
                                selectedRows.length > 0 && (
                                    <Card className='mt-4'>
                                        <Title level={5}>Duyệt lịch học cho sinh viên</Title>
                                        <Form
                                            form={form}
                                            layout="vertical"
                                            name='approve-schedule'
                                            onFinish={onFinish}
                                        >
                                            {/* {
                                                studentCode?.register_status === "pending" ? (
                                                    <> */}
                                                        <Form.Item
                                                            label="Lý do"
                                                            name="reason"
                                                            rules={[{ required: true, message: 'Vui lòng nhập lý do' }]}
                                                        >
                                                            <TextArea
                                                                rows={4}
                                                                style={{ borderWidth: 1.5, boxShadow: "none" }}
                                                            />
                                                        </Form.Item>

                                                        <Form.Item>
                                                            <Button type="primary" htmlType="submit">
                                                                Duyệt
                                                            </Button>
                                                        </Form.Item>
                                                    {/* </>
                                            //     ) : (
                                            //         <TextArea
                                            //             rows={4}
                                            //             value={studentCode?.reason}
                                            //             disabled
                                            //             style={{ borderWidth: 1.5, boxShadow: "none" }}
                                            //         />
                                            //     )
                                            // } */}
                                        </Form>
                                    </Card>
                                )
                            }
                        </TabPane>
                        <TabPane tab="Sửa lịch học" key="edit">
                            <p>Chức năng sửa lịch học sẽ triển khai sau.</p>
                        </TabPane>
                    </Tabs>
                </main>
            </Layout>
        </Layout>
    );
}