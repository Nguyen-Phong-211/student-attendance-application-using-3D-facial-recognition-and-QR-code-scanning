import React, { useState, useEffect } from 'react';
import {
    Table,
    Button,
    Input,
    Space,
    Upload,
    message,
    Layout,
    Typography,
} from 'antd';
import {
    UploadOutlined,
    EditOutlined,
    DeleteOutlined,
    SaveOutlined,
    CloseOutlined,
    CheckCircleOutlined,
    ArrowLeftOutlined
} from '@ant-design/icons';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import Sidebar from '../../../components/Layout/Sidebar';
import Navbar from '../../../components/Layout/Navbar';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import api from '../../../api/axiosInstance';

const { Header, Content } = Layout;
const { Title } = Typography;

const StudentCreate = () => {
    const [students, setStudents] = useState([]);
    const [editingKey, setEditingKey] = useState('');
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [collapsed, setCollapsed] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const navigate = useNavigate();
    const { t } = useTranslation();
    const isEditing = (record) => record.key === editingKey;
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        document.title = "ATTEND 3D - Create Student";
    }, [t]);

    const edit = (record) => {
        setEditingKey(record.key);
    };

    const save = (key) => {
        setEditingKey('');
        message.success('Đã lưu thông tin sinh viên.');
    };

    const cancel = () => {
        setEditingKey('');
    };

    const handleDelete = (key) => {
        setStudents(students.filter((item) => item.key !== key));
        message.success('Đã xoá sinh viên.');
    };

    function excelDateToJSDate(serial) {
        const utc_days = Math.floor(serial - 25569);
        const utc_value = utc_days * 86400; 
        const date_info = new Date(utc_value * 1000);
        return date_info.toISOString().split('T')[0];
    }

    const handleFileUpload = (file) => {
        const ext = file.name.split('.').pop().toLowerCase();
        const reader = new FileReader();

        reader.onload = (e) => {
            let data = [];
            if (ext === 'csv') {
                const parsed = Papa.parse(e.target.result, { header: true });
                data = parsed.data;
            } else {
                const wb = XLSX.read(e.target.result, { type: 'binary' });
                const ws = wb.Sheets[wb.SheetNames[0]];
                data = XLSX.utils.sheet_to_json(ws);
            }

            const mapped = data.map((item, index) => ({
                key: `${index}-${Date.now()}`,
                student_code: item["Mã số sinh viên"],
                name: item["Họ và tên"],
                email: item["Email"],
                phone: item["Số điện thoại"],
                gender: item["Giới tính"],
                dob: typeof item["Ngày sinh"] === 'number'
                    ? excelDateToJSDate(item["Ngày sinh"])
                    : item["Ngày sinh"] || '',
                department: item["Khoa"],
                major: item["Chuyên ngành"]
            }));

            setStudents(mapped);
            message.success('Tải dữ liệu thành công!');
        };

        if (ext === 'csv') reader.readAsText(file);
        else reader.readAsBinaryString(file);

        return false;
    };

    const columns = [
        {
            title: 'Mã sinh viên',
            dataIndex: 'student_code',
            editable: true,
            render: (text, record) => isEditing(record) ? <Input defaultValue={text} /> : text,
        },
        {
            title: 'Họ và tên',
            dataIndex: 'name',
            editable: true,
            render: (text, record) => isEditing(record) ? <Input defaultValue={text} /> : text,
        },
        {
            title: 'Email',
            dataIndex: 'email',
            editable: true,
            render: (text, record) => isEditing(record) ? <Input defaultValue={text} /> : text,
        },
        {
            title: 'Số điện thoại',
            dataIndex: 'phone',
            editable: true,
            render: (text, record) => isEditing(record) ? <Input defaultValue={text} /> : text,
        },
        {
            title: 'Giới tính',
            dataIndex: 'gender',
            editable: true,
            render: (text, record) => isEditing(record) ? <Input defaultValue={text} /> : text,
        },
        {
            title: 'Ngày sinh',
            dataIndex: 'dob',
            editable: true,
            render: (text, record) => isEditing(record) ? <Input defaultValue={text} /> : text,
        },
        {
            title: 'Khoa',
            dataIndex: 'department',
            editable: true,
            render: (text, record) => isEditing(record) ? <Input defaultValue={text} /> : text,
        },
        {
            title: 'Chuyên ngành',
            dataIndex: 'major',
            editable: true,
            render: (text, record) => isEditing(record) ? <Input defaultValue={text} /> : text,
        },
        {
            title: 'Hành động',
            render: (_, record) => {
                const editable = isEditing(record);
                return editable ? (
                    <Space>
                        <Button icon={<SaveOutlined />} onClick={() => save(record.key)}>Xác nhận</Button>
                        <Button icon={<CloseOutlined />} onClick={cancel}>Huỷ</Button>
                    </Space>
                ) : (
                    <Space>
                        <Button icon={<EditOutlined />} onClick={() => edit(record)}>Sửa</Button>
                        <Button icon={<DeleteOutlined />} onClick={() => handleDelete(record.key)} danger>Xoá</Button>
                    </Space>
                );
            },
        },
    ];

    const handleConfirmCreateAccounts = async () => {
        if (selectedRowKeys.length === 0) {
            message.warning('Vui lòng chọn ít nhất một sinh viên!');
            return;
        }
    
        const selectedStudents = students.filter((item) =>
            selectedRowKeys.includes(item.key)
        );
    
        setLoading(true);
    
        try {
            const response = await api.post("accounts/bulk-create-students/", {
                body: JSON.stringify({ students: selectedStudents })
            });
    
            const data = response.data;

            message.success(`Tạo tài khoản thành công cho ${data.created.length} sinh viên!`);
            navigate(-1);
    
        } catch (error) {
            console.error("API Error:", error.response?.data || error.message);
            message.error("Có lỗi xảy ra khi tạo tài khoản.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
            <Layout>
                <Header className="bg-white px-4 flex flex-col sm:flex-row justify-between items-center gap-4 py-3 border-b">
                    <Navbar
                        searchValue={searchValue}
                        setSearchValue={setSearchValue}
                    />
                </Header>
                <Content className="p-4 sm:p-6 md:p-8 bg-white overflow-auto">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                            <Button type='link' icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} className='w-[150px]'>
                                Quay lại
                            </Button>
                            <Title level={3} className="!mb-0 text-xl sm:text-2xl">Tạo tài khoản sinh viên</Title>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <Upload
                                beforeUpload={handleFileUpload}
                                showUploadList={false}
                                accept=".xlsx"
                            >
                                <Button icon={<UploadOutlined />} type="primary" className="w-full sm:w-auto">
                                    Tải lên file XLSX
                                </Button>
                            </Upload>
                            <Button
                                icon={<CheckCircleOutlined />}
                                type="primary"
                                onClick={handleConfirmCreateAccounts}
                                className="w-full sm:w-auto"
                                loading={loading}
                            >
                                Xác nhận tạo tài khoản
                            </Button>
                        </div>
                    </div>



                    <div className="overflow-auto">
                        <Table
                            rowSelection={{
                                selectedRowKeys,
                                onChange: setSelectedRowKeys,
                            }}
                            columns={columns}
                            dataSource={students}
                            pagination={{ pageSize: 10 }}
                            scroll={{ x: 'max-content' }}
                            bordered
                        />
                    </div>
                </Content>
            </Layout>
        </Layout>
    );
};

export default StudentCreate;
