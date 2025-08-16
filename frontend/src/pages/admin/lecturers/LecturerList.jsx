import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Layout, Input, Table, Button, Tag, Modal, Descriptions, Form, Select, Row, Col, DatePicker } from 'antd';
import {
    SearchOutlined,
    DownloadOutlined,
    ReloadOutlined,
    UserAddOutlined
} from '@ant-design/icons';
import { saveAs } from 'file-saver';
import Highlighter from 'react-highlight-words';
import Sidebar from '../../../components/Layout/Sidebar';
import Navbar from '../../../components/Layout/Navbar';
import * as XLSX from 'xlsx';
import api from '../../../api/axiosInstance';
import dayjs from 'dayjs';

const { Header } = Layout;

export default function LecturerList() {
    const [collapsed, setCollapsed] = useState(false);
    const [lecturers, setLecturers] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [searchedColumn, setSearchedColumn] = useState('');
    const searchInput = useRef(null);

    const [selectedLecturer, setSelectedLecturer] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [modalMode, setModalMode] = useState('view');
    const [departments, setDepartments] = useState([]);
    const [allSubjects, setAllSubjects] = useState([]);

    const [academic_years, setAcademicYear] = useState([]);
    const [semesters, setSemester] = useState([]);
    const [classes, setClass] = useState([]);

    const [form] = Form.useForm();

    useEffect(() => {
        document.title = 'Danh sách giảng viên';

        const token = localStorage.getItem("access_token");
        if (!token) {
            window.location.href = "/account/login";
            return;
        }

        fetchClass();
        fetchSemester();
        fetchAcademicYear();
        fetchDepartments();
        fetchSubjects();
        fetchLecturers();
    }, []);

    const fetchClass = async () => {
        try {
            const res = await api.get('classes/all');
            setClass(res.data);
        } catch (err) {
            console.error('Lỗi khi lấy danh sách lớp:', err);
        }
    }

    const fetchSemester = async () => {
        try {
            const res = await api.get('/semesters/all');
            setSemester(res.data);
        } catch (err) {
            console.error('Lỗi khi lấy danh sách học kỳ:', err);
        }
    }

    const fetchAcademicYear = async () => {
        try {
            const res = await api.get('/academic-years/all');
            setAcademicYear(res.data);
        } catch (err) {
            console.error('Lỗi khi lấy danh sách năm học:', err);
        }
    }

    const fetchDepartments = async () => {
        try {
            const res = await api.get('departments/all');
            setDepartments(res.data);
        } catch (err) {
            console.error('Lỗi khi lấy danh sách phòng ban:', err);
        }
    };

    const fetchSubjects = async () => {
        try {
            const res = await api.get('/subjects/all');
            setAllSubjects(res.data);
        } catch (error) {
            console.error('Lỗi khi tải danh sách môn:', error);
        }
    };

    const fetchLecturers = async () => {
        try {
            const res = await api.get('lecturers/lecturer-subject');
            const data = res.data;

            const transformed = data.map((lecturer) => ({
                key: lecturer.lecturer_id,
                lecturer_code: lecturer.lecturer_code,
                fullname: lecturer.fullname,
                phone: lecturer.account?.phone_number || '',
                email: lecturer.account?.email || '',
                gender: lecturer.gender === "1" ? "Nam" : lecturer.gender === "0" ? "Nữ" : "Khác",
                dob: dayjs(lecturer.dob).format('DD/MM/YYYY'),
                is_locked: lecturer.account?.is_locked,
                department: lecturer.department?.department_name,
                subjects: lecturer.subjects || [],
                department_id: lecturer.department?.department_id,
                subject_classes: lecturer.subject_classes || [],
            }));

            setLecturers(transformed);
        } catch (error) {
            console.error('Error fetching lecturers:', error);
        }
    };

    const getColumnSearchProps = (dataIndex) => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
            <div style={{ padding: 8 }}>
                <Input
                    ref={searchInput}
                    placeholder={`Tìm ${dataIndex}`}
                    value={selectedKeys[0]}
                    onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
                    style={{ width: 188, marginBottom: 8, display: 'block' }}
                />
                <Button
                    type="primary"
                    onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
                    icon={<SearchOutlined />}
                    size="small"
                    style={{ width: 90 }}
                >
                    Tìm
                </Button>
                <Button
                    onClick={() => handleReset(clearFilters)}
                    size="small"
                    style={{ width: 90, marginLeft: 8 }}
                >
                    Xoá
                </Button>
            </div>
        ),
        filterIcon: (filtered) => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
        onFilter: (value, record) => record[dataIndex]?.toString().toLowerCase().includes(value.toLowerCase()),
        render: (text) =>
            searchedColumn === dataIndex ? (
                <Highlighter
                    highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
                    searchWords={[searchText]}
                    autoEscape
                    textToHighlight={text ? text.toString() : ''}
                />
            ) : (
                text
            ),
    });

    const handleSearch = (selectedKeys, confirm, dataIndex) => {
        confirm();
        setSearchText(selectedKeys[0]);
        setSearchedColumn(dataIndex);
    };

    const handleReset = (clearFilters) => {
        clearFilters();
        setSearchText('');
    };

    const columns = [
        {
            title: 'Mã giảng viên',
            dataIndex: 'lecturer_code',
            key: 'lecturer_code',
            ...getColumnSearchProps('lecturer_code')
        },
        {
            title: 'Họ và tên',
            dataIndex: 'fullname',
            key: 'fullname',
            ...getColumnSearchProps('fullname')
        },
        {
            title: 'Số điện thoại',
            dataIndex: 'phone',
            key: 'phone',
            ...getColumnSearchProps('phone')
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            ...getColumnSearchProps('email')
        },
        {
            title: 'Giới tính',
            dataIndex: 'gender',
            key: 'gender',
            filters: [
                { text: 'Nam', value: 'Nam' },
                { text: 'Nữ', value: 'Nữ' },
                { text: 'Khác', value: 'Khác' }
            ],
            onFilter: (value, record) => record.gender === value
        },
        {
            title: 'Ngày sinh',
            dataIndex: 'dob',
            key: 'dob',
        },
        {
            title: 'Khoá tài khoản',
            dataIndex: 'is_locked',
            key: 'is_locked',
            render: (locked) => (
                <Tag color={locked ? 'red' : 'green'}>
                    {locked ? 'Bị khoá' : 'Không khoá'}
                </Tag>
            )
        },
        {
            title: 'Phòng ban',
            dataIndex: 'department',
            key: 'department',
            ...getColumnSearchProps('department')
        },
        {
            title: 'Thao tác',
            dataIndex: 'action',
            key: 'action',
            render: (_, record) => (
                <div className="flex gap-2">
                    <Button type="primary" size="small" onClick={() => {
                        setSelectedLecturer(record);
                        setModalMode('view');
                        setIsModalOpen(true);
                    }}>
                        Chi tiết
                    </Button>
                    <Button type="primary" size="small" onClick={() => handleEdit(record)}>
                        Cập nhật
                    </Button>
                </div>
            )
        }
    ];

    const exportExcel = () => {
        const excelData = lecturers.map((lecturer) => {
            const subjectsFormatted = lecturer.subjects?.map((s) =>
                `${s.subject_code} - ${s.subject_name} (${s.department?.department_name}) - ${s.total_credits} tín chỉ`
            ).join('; ') || '---';

            return {
                'Mã giảng viên': lecturer.lecturer_code,
                'Họ và tên': lecturer.fullname,
                'Số điện thoại': lecturer.phone,
                'Email': lecturer.email,
                'Giới tính': lecturer.gender,
                'Ngày sinh': lecturer.dob,
                'Khoá tài khoản': lecturer.is_locked ? 'Bị khoá' : 'Không khoá',
                'Phòng ban': lecturer.department,
                'Môn giảng dạy': subjectsFormatted,
            };
        });

        const worksheet = XLSX.utils.json_to_sheet(excelData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Danh sách GV');

        const file = new Blob([XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })], {
            type: 'application/octet-stream'
        });
        const now = new Date();
        const filename = `danh_sach_giang_vien_${now.toISOString().slice(0, 10)}.xlsx`;
        saveAs(file, filename);
    };

    const handleEdit = (lecturer) => {
        setSelectedLecturer(lecturer);
        setModalMode('edit');
        setIsModalOpen(true);

        setTimeout(() => {
            form.setFieldsValue({
                fullname: lecturer.fullname,
                phone: lecturer.phone,
                email: lecturer.email,
                gender: lecturer.gender,
                dob: dayjs(lecturer.dob, 'DD/MM/YYYY'),
                department: lecturer.department_id,
                subjects: lecturer.subject_classes?.map(s => s.subject.subject_id),
                academic_year: selectedLecturer?.subject_classes?.[0]?.subject?.academic_year?.academic_year_id,
                semester: selectedLecturer?.subject_classes?.[0]?.semester?.semester_id,
                class_id: selectedLecturer?.subject_classes?.[0]?.class_id?.class_id
            });
        }, 0);
    };

    const filteredSubjects = useMemo(() => {
        if (!selectedLecturer) return [];
        return allSubjects.filter(
            (s) => s.department?.department_id === selectedLecturer.department_id
        );
    }, [allSubjects, selectedLecturer]);    

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
            <Layout>
                <Header className="bg-white px-4 border-b">
                    <Navbar />
                </Header>
                <main className="mx-4 my-4 p-4 bg-white rounded shadow">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
                        <h1 className="text-xl font-semibold">Danh sách giảng viên</h1>
                        <div className="flex flex-wrap gap-2">
                            <Button icon={<ReloadOutlined />} onClick={fetchLecturers}>Làm mới</Button>
                            <Button type="primary" icon={<UserAddOutlined />} href="/admin/management/lecturer/list/create">
                                Thêm giảng viên
                            </Button>
                            <Button type="primary" icon={<DownloadOutlined />} onClick={exportExcel}>
                                Xuất Excel
                            </Button>
                        </div>
                    </div>
                    <Table
                        columns={columns}
                        dataSource={lecturers}
                        rowKey="lecturer_code"
                        bordered
                        pagination={{ pageSize: 10 }}
                        scroll={{ x: 1000 }}
                    />

                    <Modal
                        title={modalMode === 'edit' ? 'Cập nhật thông tin giảng viên' : 'Thông tin chi tiết giảng viên'}
                        width={1400}
                        open={isModalOpen}
                        onCancel={() => {
                            setIsModalOpen(false);
                            setModalMode('view');
                        }}
                        footer={
                            modalMode === 'edit'
                                ? [
                                    <Button key="cancel" onClick={() => setIsModalOpen(false)}>Hủy</Button>,
                                    <Button key="submit" type="primary" onClick={() => {
                                        // API Update
                                    }}>
                                        Lưu thay đổi
                                    </Button>
                                ]
                                : [
                                    <Button key="close" onClick={() => setIsModalOpen(false)}>Đóng</Button>
                                ]
                        }
                    >
                        {selectedLecturer ? (
                            modalMode === 'view' ? (
                                <Descriptions bordered column={2} size="small">
                                    <Descriptions.Item label="Mã giảng viên">{selectedLecturer.lecturer_code}</Descriptions.Item>
                                    <Descriptions.Item label="Họ và tên">{selectedLecturer.fullname}</Descriptions.Item>
                                    <Descriptions.Item label="Số điện thoại">{selectedLecturer.phone}</Descriptions.Item>
                                    <Descriptions.Item label="Email">{selectedLecturer.email}</Descriptions.Item>
                                    <Descriptions.Item label="Giới tính">{selectedLecturer.gender}</Descriptions.Item>
                                    <Descriptions.Item label="Ngày sinh">{selectedLecturer.dob}</Descriptions.Item>
                                    <Descriptions.Item label="Phòng ban">{selectedLecturer.department}</Descriptions.Item>
                                    <Descriptions.Item label="Khoá tài khoản">
                                        <Tag color={selectedLecturer.is_locked ? 'red' : 'green'}>
                                            {selectedLecturer.is_locked ? 'Bị khoá' : 'Không khoá'}
                                        </Tag>
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Môn giảng dạy" span={2}>
                                        {selectedLecturer.subject_classes && selectedLecturer.subject_classes.length > 0 ? (
                                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                                <thead>
                                                    <tr>
                                                        <th style={{ border: '1px solid #ddd', padding: 8 }}>Mã môn</th>
                                                        <th style={{ border: '1px solid #ddd', padding: 8 }}>Tên môn</th>
                                                        <th style={{ border: '1px solid #ddd', padding: 8 }}>Khoa</th>
                                                        <th style={{ border: '1px solid #ddd', padding: 8 }}>Tổng tín chỉ</th>
                                                        <th style={{ border: '1px solid #ddd', padding: 8 }}>Năm học</th>
                                                        <th style={{ border: '1px solid #ddd', padding: 8 }}>Dạy lớp</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {selectedLecturer.subject_classes.map((s, idx) => (
                                                        <tr key={idx}>
                                                            <td style={{ border: '1px solid #ddd', padding: 8 }}>
                                                                <a href={`/admin/management/subject/${s.subject.subject_code}`} className='underline'>{s.subject.subject_code}</a>
                                                            </td>
                                                            <td style={{ border: '1px solid #ddd', padding: 8 }}>{s.subject.subject_name}</td>
                                                            <td style={{ border: '1px solid #ddd', padding: 8 }}>
                                                                <a href={`/admin/management/academic/department/${s.subject.department.department_code}`} className='underline'>{s.subject.department.department_name}</a>
                                                            </td>
                                                            <td style={{ border: '1px solid #ddd', padding: 8 }}>{s.subject.total_credits}</td>
                                                            <td style={{ border: '1px solid #ddd', padding: 8 }}>
                                                                <a href={`/admin/management/academic/academic-year/${s.subject.academic_year.academic_year_code}`} className='underline'>{s.subject.academic_year.academic_year_name}</a>
                                                            </td>
                                                            <td style={{ border: '1px solid #ddd', padding: 8 }}>
                                                                <a href={`/admin/management/academic/class/${s.class_id.class_code}`} className='underline'>{s.class_id.class_name} - {s.class_id.class_code}</a>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        ) : (
                                            <Tag color="magenta">Chưa phân công</Tag>
                                        )}
                                    </Descriptions.Item>
                                </Descriptions>
                            ) : (
                                <Form
                                    form={form}
                                    layout="vertical"
                                >
                                    <Row gutter={16}>
                                        <Col xs={24} sm={12} md={8}>
                                            <Form.Item
                                                label="Họ và tên"
                                                name="fullname"
                                                rules={[{ required: true, message: 'Vui lòng không để trống trường họ và tên' }]}
                                            >
                                                <Input />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} sm={12} md={8}>
                                            <Form.Item
                                                label="Số điện thoại"
                                                name="phone"
                                                rules={[{ required: true, message: 'Vui lòng không để trống trường số điện thoại' }]}
                                            >
                                                <Input maxLength={10} minLength={10} />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} sm={12} md={8}>
                                            <Form.Item
                                                label="Email"
                                                name="email"
                                                rules={[{ required: true, type: 'email', message: 'Email không hợp lệ' }]}
                                            >
                                                <Input />
                                            </Form.Item>
                                        </Col>
                                    </Row>

                                    <Row gutter={16}>
                                        <Col xs={24} sm={12} md={8}>
                                            <Form.Item
                                                label="Giới tính"
                                                name="gender"
                                                rules={[{ required: true, message: 'Vui lòng không để trống trường giới tính' }]}
                                            >
                                                <Select>
                                                    <Select.Option value="Nam">Nam</Select.Option>
                                                    <Select.Option value="Nữ">Nữ</Select.Option>
                                                </Select>
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} sm={12} md={8}>
                                            <Form.Item
                                                label="Ngày sinh"
                                                name="dob"
                                                rules={[{ required: true, message: 'Vui lòng không để trống trường ngày sinh' }]}
                                            >
                                                <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} sm={12} md={8}>
                                            <Form.Item
                                                label="Phòng ban"
                                                name="department"
                                                rules={[{ required: true, message: 'Vui lòng không để trống trường khoa' }]}
                                            >
                                                <Select
                                                    placeholder="Chọn phòng ban"
                                                    options={departments.map((dep) => ({
                                                        label: dep.department_name,
                                                        value: dep.department_id
                                                    }))}
                                                />
                                            </Form.Item>
                                        </Col>
                                    </Row>

                                    <Row gutter={16}>
                                        <Col xs={24} sm={12} md={8}>
                                            <Form.Item
                                                label="Năm học"
                                                name="academic_year"
                                                rules={[{ required: true, message: 'Vui lòng không để trống trường năm học' }]}
                                            >
                                                <Select 
                                                    placeholder="Chọn năm học"
                                                    options={academic_years.map((year) => ({
                                                        label: year.academic_year_name,
                                                        value: year.academic_year_id
                                                    }))}
                                                />
                                                    
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} sm={12} md={8}>
                                            <Form.Item
                                                label="Học kỳ"
                                                name="semester"
                                                rules={[{ required: true, message: 'Vui lòng không để trống trường học kỳ' }]}
                                            >
                                                <Select
                                                    placeholder="Chọn học kỳ"
                                                    options={semesters.map((se) => ({
                                                        label: se.semester_name,
                                                        value: se.semester_id
                                                    }))}
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} sm={12} md={8}>
                                            <Form.Item
                                                label="Lớp"
                                                name="class_id"
                                                rules={[{ required: true, message: 'Vui lòng không để trống trường lớp' }]}
                                            >
                                                <Select 
                                                    placeholder="Chọn lớp"
                                                    options={classes.map((cls) => ({
                                                        label: cls.class_name,
                                                        value: cls.class_id
                                                    }))}
                                                />
                                            </Form.Item>
                                        </Col>
                                    </Row>

                                    <Row>
                                        <Col span={24}>
                                            <Form.Item
                                                label="Môn giảng dạy"
                                                name="subjects"
                                                rules={[{ required: true, message: 'Vui lòng chọn ít nhất 1 môn' }]}
                                            >
                                                <Select
                                                    mode="multiple"
                                                    style={{ width: '100%' }}
                                                    placeholder="Chọn các môn giảng dạy"
                                                    options={filteredSubjects.map((s) => ({
                                                        label: `${s.subject_code} - ${s.subject_name} (${s.department?.department_name}) - ${s.total_credits} tín chỉ`,
                                                        value: s.subject_id
                                                    }))}
                                                />
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                </Form>
                            )
                        ) : (
                            <p>Không có dữ liệu giảng viên.</p>
                        )}
                    </Modal>
                </main>
            </Layout>
        </Layout>
    );
}