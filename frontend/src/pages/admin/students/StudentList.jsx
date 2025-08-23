import React, { useState, useEffect, useRef } from 'react';
import { Layout, Input, Table, Button, Tag } from 'antd';
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

const { Header } = Layout;

export default function StudentList() {
    const [collapsed, setCollapsed] = useState(false);
    const [students, setStudents] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [searchedColumn, setSearchedColumn] = useState('');
    const searchInput = useRef(null);

    useEffect(() => {
        document.title = 'ATTEND3D - Danh sách sinh viên';

        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            const response = await api.get('students/list-all/');
            const data = response.data;
    
            const transformed = data.map((student) => ({
                key: student.student_id,
                student_code: student.student_code,
                fullname: student.fullname,
                phone: student.account?.phone_number || '',
                email: student.account?.email || '',
                gender: student.gender === "1" ? "Nam" : student.gender === "2" ? "Nữ" : "Khác",
                dob: student.dob,
                status: student.status === "1" ? "Đang học" : student.status === "2" ? "Tạm nghỉ" : "Đã tốt nghiệp",
                is_locked: student.account?.is_locked,
                department: student.department?.department_name,
                major: student.major?.major_name,
            }));
    
            setStudents(transformed);
        } catch (error) {
            console.error('Error fetching students:', error);
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
            title: 'Mã số sinh viên',
            dataIndex: 'student_code',
            key: 'student_code',
            ...getColumnSearchProps('student_code')
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
                { text: 'Nữ', value: 'Nữ' }
            ],
            onFilter: (value, record) => record.gender === value,
            render: (gender) => (
                <Tag color={gender === '1' ? 'blue' : 'red'}>
                    {gender === '1' ? 'Nam' : 'Nữ'}
                </Tag>
            )
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
                <Tag color={locked ? 'red' : 'green'}>{locked ? 'Bị khoá' : 'Không khoá'}</Tag>
            )
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            filters: [
                { text: 'Đang học', value: 'Đang học' },
                { text: 'Tạm nghỉ', value: 'Tạm nghỉ' },
                { text: 'Đã tốt nghiệp', value: 'Đã tốt nghiệp' }
            ],
            onFilter: (value, record) => record.status === value,
            render: (status) => {
                let color = 'blue';
                if (status === 'Tạm nghỉ') color = 'orange';
                if (status === 'Đã tốt nghiệp') color = 'green';
                return <Tag color={color}>{status}</Tag>;
            }
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
            title: 'Chuyên ngành',
            dataIndex: 'major',
            key: 'major',
            ...getColumnSearchProps('major')
        },
        
    ];

    const exportExcel = () => {
        const excelData = students.map((student) => ({
            'Mã số SV': student.student_code,
            'Họ và tên': student.fullname,
            'Số điện thoại': student.phone,
            'Email': student.email,
            'Giới tính': student.gender,
            'Ngày sinh': student.dob,
            'Trạng thái': student.status,
            'Khoá tài khoản': student.is_locked ? 'Bị khoá' : 'Không khoá',
            'Phòng ban': student.department,
            'Chuyên ngành': student.major
        }));
    
        const worksheet = XLSX.utils.json_to_sheet(excelData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Danh sách SV');
    
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const file = new Blob([excelBuffer], { type: 'application/octet-stream' });
    
        const now = new Date();
        const filename = `danh_sach_sinh_vien_${now.toISOString().slice(0, 10)}.xlsx`;
        saveAs(file, filename);
    };

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
            <Layout>
                <Header className="bg-white px-4 border-b">
                    <Navbar />
                </Header>
                <main className="mx-4 my-4 p-4 bg-white rounded shadow">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
                        <h1 className="text-xl font-semibold">Danh sách sinh viên</h1>
                        <div className="flex flex-wrap gap-2">
                            <Button onClick={fetchStudents} className="w-full sm:w-auto" icon={<ReloadOutlined />} >
                                Làm mới
                            </Button>
                            <Button
                                className="w-full sm:w-auto"
                                type="primary"
                                icon={<UserAddOutlined />}
                                href="/admin/students/list/create"
                            >
                                Thêm sinh viên
                            </Button>
                            <Button
                                className="w-full sm:w-auto"
                                type="primary"
                                icon={<DownloadOutlined />}
                                onClick={exportExcel}
                            >
                                Xuất Excel
                            </Button>
                        </div>
                    </div>
                    <Table
                        columns={columns}
                        dataSource={students}
                        rowKey="student_code"
                        bordered
                        pagination={{ pageSize: 10 }}
                        scroll={{ x: 'max-content' }}
                    />
                </main>
            </Layout>
        </Layout>
    );
}