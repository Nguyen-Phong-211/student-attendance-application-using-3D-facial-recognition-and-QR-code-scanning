import React, { useState, useEffect } from 'react';
import {
    Layout, Form, Select, Button, message, Typography, Card, Descriptions
} from 'antd';
import Sidebar from '../../../components/Layout/Sidebar';
import Navbar from '../../../components/Layout/Navbar';
import api from '../../../api/axiosInstance';

const { Header } = Layout;
const { Title } = Typography;
const { Option } = Select;

export default function SubjectAssignment() {
    const [collapsed, setCollapsed] = useState(false);
    const [form] = Form.useForm();

    const [lecturers, setLecturers] = useState([]);
    const [selectedLecturer, setSelectedLecturer] = useState(null);

    const [classes, setClasses] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [academicYears, setAcademicYears] = useState([]);
    const [semesters, setSemesters] = useState([]);

    const [selectedYear, setSelectedYear] = useState(null);
    const [selectedSemester, setSelectedSemester] = useState(null);

    const [filteredClasses, setFilteredClasses] = useState([]);
    const [filteredSubjects, setFilteredSubjects] = useState([]);

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        document.title = 'ATTEND 3D - Gán lớp học cho giảng viên';

        fetchAll();
    }, []);

    const fetchAll = async () => {
        const [lecturersRes, classesRes, subjectsRes, academicYearsRes, semestersRes] = await Promise.all([
            api.get('lecturers/all'),
            api.get('classes/all'),
            api.get('subjects/all'),
            api.get('academic-years/all/'),
            api.get('semesters/all/'),
        ]);

        setLecturers(lecturersRes.data);
        setClasses(classesRes.data);
        setSubjects(subjectsRes.data);
        setAcademicYears(academicYearsRes.data);
        setSemesters(semestersRes.data);
    };

    const handleLecturerChange = (lecturerId) => {
        const lecturer = lecturers.find(l => l.lecturer_id === lecturerId);
        setSelectedLecturer(lecturer);
        const deptId = lecturer?.department_id;
        setFilteredClasses(classes.filter(c => c.department_id === deptId));
        setFilteredSubjects(subjects.filter(s => s.department_id === deptId));
        form.setFieldsValue({ class_id: undefined, subject_id: undefined });
    };    

    const onFinish = async (values) => {
        setLoading(true);
        try {    
            await api.post('lecturers/assignment-class/',
                values
            );
    
            message.success('Gán giảng viên thành công!');
            form.resetFields();
    
        } catch (error) {
            message.error(error.response?.data?.message || 'Có lỗi khi gửi yêu cầu');
        } finally {
            setLoading(false);
        }
    };    

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
            <Layout>
                <Header className="bg-white px-4 border-b">
                    <Navbar />
                </Header>
                <main className="mx-4 my-4 p-6 bg-white rounded shadow">
                    <Title level={3}>Gán lớp học và môn học cho giảng viên</Title>

                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={onFinish}
                        autoComplete="off"
                        className="mt-6"
                    >
                        <Card title="1. Thông tin giảng viên" className="mb-4">
                            <Form.Item label="Chọn giảng viên" name="lecturer_id" rules={[{ required: true, message: ['Vui lòng chọn giảng viên'] }]}>
                                <Select
                                    showSearch
                                    allowClear
                                    placeholder="Chọn giảng viên"
                                    onChange={handleLecturerChange}
                                    filterOption={(input, option) =>
                                        String(option?.children).toLowerCase().includes(input.toLowerCase())
                                    }
                                    className='w-full custom-select'
                                    size='large'
                                >
                                    {lecturers.map(lecturer => (
                                        <Option key={lecturer.lecturer_id} value={lecturer.lecturer_id}>
                                            {lecturer.fullname} - {lecturer.account?.email}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>

                            {selectedLecturer && (
                                <Descriptions column={1} bordered size="small" className="mt-4">
                                    <Descriptions.Item label="Họ tên">{selectedLecturer.fullname}</Descriptions.Item>
                                    <Descriptions.Item label="Mã giảng viên">{selectedLecturer.lecturer_code}</Descriptions.Item>
                                    <Descriptions.Item label="Email">{selectedLecturer.account?.email}</Descriptions.Item>
                                    <Descriptions.Item label="Số điện thoại">{selectedLecturer.account?.phone_number}</Descriptions.Item>
                                    <Descriptions.Item label="Khoa">{selectedLecturer.department?.department_name}</Descriptions.Item>
                                </Descriptions>
                            )}

                        </Card>

                        <Card title="2. Thông tin lớp học" className="mb-4">
                            <div className="flex flex-wrap gap-4">
                                <Form.Item
                                    className="w-full md:flex-1"
                                    label="Chọn năm học"
                                    name="academic_year_id"
                                    rules={[{ required: true, message: ['Vui lòng chọn năm học'] }]}
                                >
                                    <Select
                                        placeholder="Chọn năm học"
                                        allowClear
                                        showSearch
                                        onChange={(value) => {
                                            setSelectedYear(value);
                                            form.setFieldsValue({ semester_id: undefined, class_id: undefined });
                                            setSelectedSemester(null);
                                        }}
                                        filterOption={(input, option) =>
                                            String(option?.children).toLowerCase().includes(input.toLowerCase())
                                        }
                                        className='w-full custom-select'
                                        size='large'
                                    >
                                        {academicYears.map(year => (
                                            <Option key={year.academic_year_id} value={year.academic_year_id}>
                                                {year.academic_year_name}
                                            </Option>
                                        ))}
                                    </Select>
                                </Form.Item>

                                <Form.Item
                                    className="w-full md:flex-1"
                                    label="Chọn học kỳ"
                                    name="semester_id"
                                    rules={[{ required: true, message: ['Vui lòng chọn học kỳ'] }]}
                                >
                                    <Select
                                        placeholder="Chọn học kỳ"
                                        allowClear
                                        disabled={!selectedYear}
                                        showSearch
                                        onChange={(value) => {
                                            setSelectedSemester(value);
                                            form.setFieldsValue({ class_id: undefined });
                                        }}
                                        filterOption={(input, option) =>
                                            String(option?.children).toLowerCase().includes(input.toLowerCase())
                                        }
                                        className='w-full custom-select'
                                        size='large'
                                    >
                                        {semesters
                                            .filter(sem => sem.academic_year === selectedYear)
                                            .map(sem => (
                                                <Option key={sem.semester_id} value={sem.semester_id}>
                                                    {sem.semester_name}
                                                </Option>
                                            ))}
                                    </Select>
                                </Form.Item>

                                <Form.Item
                                    className="w-full md:flex-1"
                                    label="Chọn lớp học"
                                    name="class_id"
                                    rules={[{ required: true, message: ['Vui lòng chọn lớp học'] }]}
                                >
                                    <Select
                                        placeholder="Chọn lớp học"
                                        allowClear
                                        disabled={!selectedSemester}
                                        showSearch
                                        filterOption={(input, option) =>
                                            String(option?.children).toLowerCase().includes(input.toLowerCase())
                                        }
                                        className='w-full custom-select'
                                        size='large'
                                    >
                                        {filteredClasses
                                            .filter(cls => cls.academic_year?.academic_year_id === selectedYear)
                                            .map(cls => (
                                                <Option key={cls.class_id} value={cls.class_id}>
                                                    {cls.class_name}
                                                </Option>
                                            ))}
                                    </Select>
                                </Form.Item>
                            </div>
                        </Card>

                        <Card title="3. Thông tin môn học">
                            <Form.Item label="Chọn môn học" name="subject_ids" rules={[{ required: true, message: ['Vui lòng chọn môn học'] }]}>
                                <Select
                                    placeholder="Chọn môn học"
                                    mode='multiple'
                                    allowClear
                                    disabled={!selectedLecturer && !selectedYear}
                                    showSearch
                                    filterOption={(input, option) =>
                                        String(option?.children).toLowerCase().includes(input.toLowerCase())
                                    }
                                    className='w-full custom-select'
                                    size='large'
                                >
                                    {filteredSubjects
                                        .filter(sub => sub.academic_year?.academic_year_id === selectedYear && sub.department.department_id === selectedLecturer.department.department_id)
                                        .map(sub => (
                                            <Option key={sub.subject_id} value={sub.subject_id}>
                                                {sub.subject_name}
                                            </Option>
                                        ))}
                                </Select>
                            </Form.Item>
                        </Card>

                        <Form.Item className="mt-4">
                            <Button type="primary" htmlType="submit" loading={loading} size='large'>Gán giảng viên</Button>
                        </Form.Item>
                    </Form>
                </main>
            </Layout>
        </Layout>
    );
}