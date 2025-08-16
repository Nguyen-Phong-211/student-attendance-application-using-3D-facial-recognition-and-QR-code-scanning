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

export default function ClassAssignment() {
    const [collapsed, setCollapsed] = useState(false);
    const [form] = Form.useForm();

    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);

    const [classes, setClasses] = useState([]);
    const [filteredClasses, setFilteredClasses] = useState([]);

    const [academic_years, setAcademicYear] = useState([]);
    const [selectedYear, setSelectedYear] = useState(null);

    const [semesters, setSemester] = useState([]);
    const [selectedSemester, setSelectedSemester] = useState(null);

    const [subjects, setSubjects] = useState([]);
    const [filteredSubjects, setFilteredSubjects] = useState([]);

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        document.title = 'Gán sinh viên vào lớp/môn học';

        const token = localStorage.getItem("access_token");
        if (!token) {
            window.location.href = "/account/login";
            return;
        }

        fetchAll();
    }, []);

    const fetchAll = async () => {
        const [studentsRes, classesRes, subjectsRes, academicYearsRes, semestersRes] = await Promise.all([
            api.get('students/list-all/'),
            api.get('classes/all/'),
            api.get('subjects/all/'),
            api.get('academic-years/all/'),
            api.get('semesters/all/'),
        ]);

        setStudents(studentsRes.data);
        setClasses(classesRes.data);
        setSubjects(subjectsRes.data);
        setAcademicYear(academicYearsRes.data);
        setSemester(semestersRes.data);
    };

    const handleStudentChange = (studentId) => {
        const student = students.find(s => s.student_id === studentId);
        setSelectedStudent(student);
    
        if (student) {
            const deptId = student.department?.department_id;
    
            setFilteredClasses(classes.filter(c => c.department?.department_id === deptId));
            setFilteredSubjects(subjects.filter(s => s.department?.department_id === deptId));
        } else {
            setFilteredClasses([]);
            setFilteredSubjects([]);
        }
    
        form.setFieldsValue({ class_id: undefined, subject_id: undefined });
    };    

    const onFinish = async (values) => {
        setLoading(true);
        try {
            const token = localStorage.getItem("access_token");
            const response = await fetch('http://127.0.0.1:8000/api/v1/class-students/assign', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(values),
            });

            if (response.ok) {
                message.success('Gán thành công!');
                form.resetFields();
                setSelectedStudent(null);
                setFilteredClasses([]);
                setFilteredSubjects([]);

            } else {
                const errorData = await response.json();
                message.error(`Lỗi: ${errorData.message || 'Không thể gán sinh viên'}`);
            }
        } catch (error) {
            message.error('Có lỗi khi gửi yêu cầu');
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
                    <Title level={3}>Gán sinh viên vào lớp học và môn học</Title>

                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={onFinish}
                        autoComplete="off"
                        className="mt-6"
                    >
                        <Card title="1. Thông tin sinh viên" className="mb-4">
                            <Form.Item label="Chọn sinh viên" name="student_id" rules={[{ required: true }]}>
                                <Select
                                    showSearch
                                    allowClear
                                    placeholder="Chọn sinh viên"
                                    onChange={handleStudentChange}
                                    filterOption={(input, option) =>
                                        String(option?.children).toLowerCase().includes(input.toLowerCase())
                                    }
                                >
                                    {students.map(student => (
                                        <Option key={student.student_id} value={student.student_id}>
                                            {student.fullname} - {student.student_code}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>

                            {selectedStudent && (
                                <Descriptions column={1} bordered size="small">
                                    <Descriptions.Item label="Họ tên">{selectedStudent.fullname}</Descriptions.Item>
                                    <Descriptions.Item label="Email">{selectedStudent.account?.email}</Descriptions.Item>
                                    <Descriptions.Item label="Số điện thoại">{selectedStudent.account?.phone_number}</Descriptions.Item>
                                    <Descriptions.Item label="Khoa">{selectedStudent.department?.department_name}</Descriptions.Item>
                                    <Descriptions.Item label="Chuyên ngành">{selectedStudent.major?.major_name}</Descriptions.Item>
                                </Descriptions>
                            )}
                        </Card>

                        <Card title="2. Thông tin lớp học" className="mb-4">
                            <div className="flex flex-wrap gap-4">
                                <Form.Item
                                    className="w-full md:flex-1"
                                    label="Chọn năm học"
                                    name="academic_year_id"
                                    rules={[{ required: true, message: 'Vui lòng chọn năm học' }]}
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
                                    >
                                        {academic_years.map(year => (
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
                                    rules={[{ required: true, message: 'Vui lòng chọn học kỳ' }]}
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
                                    rules={[{ required: true, message: 'Vui lòng chọn lớp học' }]}
                                >
                                    <Select
                                        placeholder="Chọn lớp học"
                                        allowClear
                                        disabled={!selectedSemester}
                                        showSearch
                                        filterOption={(input, option) =>
                                            String(option?.children).toLowerCase().includes(input.toLowerCase())
                                        }
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
                            <Form.Item label="Chọn môn học" name="subject_id" rules={[{ required: true }]}>
                                <Select
                                    placeholder="Chọn môn học"
                                    allowClear
                                    showSearch
                                    filterOption={(input, option) =>
                                        String(option?.children).toLowerCase().includes(input.toLowerCase())
                                    }
                                >
                                    {filteredSubjects
                                        .filter(sub => sub.academic_year?.academic_year_id  === selectedYear)
                                        .map(sub => (
                                            <Option key={sub.subject_id} value={sub.subject_id}>
                                                {sub.subject_name}
                                            </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Card>

                        <Form.Item className="mt-4">
                            <Button type="primary" htmlType="submit" loading={loading}>Gán sinh viên</Button>
                        </Form.Item>
                    </Form>
                </main>
            </Layout>
        </Layout>
    );
}