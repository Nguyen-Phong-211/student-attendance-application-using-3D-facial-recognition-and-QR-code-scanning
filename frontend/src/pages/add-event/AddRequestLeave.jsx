import React, { useEffect, useState } from "react";
import {
    Breadcrumb,
    Typography,
    Card,
    Button,
    Table,
    Input,
    Space,
    Badge
} from "antd";
import Header from "../../components/Layout/Header";
import { HomeOutlined, PlusCircleOutlined, DiffOutlined, SearchOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';
import Footer from "../../components/Layout/Footer";

const { Title, Paragraph } = Typography;

export default function ContactPage() {
    useEffect(() => {
        document.title = "ATTEND 3D - Xin nghỉ phép";
    }, []);

    const [data] = useState([
        {
            key: '1',
            subjectName: 'Vật lý đại cương',
            teacherName: 'Nguyễn Văn A',
            titleRequestLeave: 'Bệnh',
            fromDate: '12:30 02-01-2025',
            toDate: '15:30 02-01-2025',
            status: 'Đã duyệt',
        },
        {
            key: '2',
            teacherName: 'Nguyễn Văn B',
            subjectName: 'Toán cao cấp 1',
            titleRequestLeave: 'Bệnh',
            fromDate: '12:30 02-01-2025',
            toDate: '12:30 02-01-2025',
            status: 'Chờ duyệt',
        },
        {
            key: '3',
            teacherName: 'Nguyễn Văn C',
            subjectName: 'Nhập môn dữ liệu lớn',
            titleRequestLeave: 'Phòng Nhân sự',
            fromDate: '12:30 02-01-2025',
            toDate: '12:30 02-01-2025',
            status: 'Từ chối',
        },
    ]);

    const [searchText, setSearchText] = useState('');
    const [searchedColumn, setSearchedColumn] = useState('');
    let searchInput = null;

    const getColumnSearchProps = (dataIndex) => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
            <div style={{ padding: 8 }}>
                <Input
                    ref={node => { searchInput = node; }}
                    placeholder={`Tìm kiếm ${dataIndex}`}
                    value={selectedKeys[0]}
                    onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
                    style={{ marginBottom: 8, display: 'block' }}
                />
                <Space>
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
                        style={{ width: 90 }}
                    >
                        Làm mới
                    </Button>
                </Space>
            </div>
        ),
        filterIcon: filtered => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
        onFilter: (value, record) =>
            record[dataIndex]
                ? record[dataIndex].toString().toLowerCase().includes(value.toLowerCase())
                : '',
                filterDropdownProps: {
                    onOpenChange: (open) => {
                        if (open) {
                            setTimeout(() => searchInput?.select(), 100);
                        }
                    },
                },
        render: text =>
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
        setSearchText(selectedKeys[0] || '');
        setSearchedColumn(dataIndex);
    };

    const handleReset = (clearFilters) => {
        clearFilters();
        setSearchText('');
    };

    const columns = [
        {
            title: 'Tên môn học',
            dataIndex: 'subjectName',
            key: 'subjectName',
            ...getColumnSearchProps('subjectName'),
        },
        {
            title: 'Giảng viên bộ môn',
            dataIndex: 'teacherName',
            key: 'teacherName',
            ...getColumnSearchProps('teacherName'),
        },
        {
            title: 'Tiêu đề',
            dataIndex: 'titleRequestLeave',
            key: 'titleRequestLeave',
            filters: [
                { text: 'Phòng Kinh Doanh', value: 'Phòng Kinh Doanh' },
                { text: 'Phòng IT', value: 'Phòng IT' },
                { text: 'Phòng Nhân sự', value: 'Phòng Nhân sự' },
            ],
            onFilter: (value, record) => record.department.indexOf(value) === 0,
        },
        {
            title: 'Từ ngày',
            dataIndex: 'fromDate',
            key: 'fromDate',
            sorter: (a, b) => new Date(a.fromDate) - new Date(b.fromDate),
        },
        {
            title: 'Đến ngày',
            dataIndex: 'toDate',
            key: 'toDate',
            sorter: (a, b) => new Date(a.toDate) - new Date(b.toDate),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            filters: [
                { text: 'Đã duyệt', value: 'approved' },
                { text: 'Chờ duyệt', value: 'pending' },
                { text: 'Từ chối', value: 'rejected' },
            ],
            onFilter: (value, record) => record.status === value,
            render: (status) => {
                const statusMap = {
                    approved: <Badge status="success" text="Đã duyệt" />,
                    pending: <Badge status="warning" text="Chờ duyệt" />,
                    rejected: <Badge status="error" text="Từ chối" />,
                };
                return statusMap[status] || status;
            }
        }
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
                                { href: '/add-event/request-leave', title: <><PlusCircleOutlined /> <span>Tạo sự kiện</span></> },
                                { title: 'Danh sách nghỉ phép của bạn' },
                            ]}
                        />
                    </div>

                    <div className="w-full p-5 rounded-lg mt-6">
                        <Card title={<Title level={3}>Tạo đơn sinh nghỉ phép</Title>} className="p-2">
                            <div className="flex justify-center mt-6">
                                <div className="border rounded-lg p-4 bg-white text-center">
                                    <Button
                                        icon={<DiffOutlined />}
                                        size="large"
                                        block
                                        type="primary"
                                        href="/add-event/request-leave/request"
                                    >
                                        Tạo đơn xin nghỉ phép
                                    </Button>
                                    <Paragraph className="mt-2 text-sm text-gray-500">
                                        Vui lòng click vào nút bên trên để tạo đơn xin nghỉ phép
                                    </Paragraph>
                                </div>
                            </div>
                        </Card>
                    </div>

                    <div className="w-full p-5 rounded-lg mt-6">
                        <Card title={<Title level={3}>Danh sách môn học bạn nghỉ phép</Title>} className="p-2">
                            <Table
                                columns={columns}
                                dataSource={data}
                                pagination={{ pageSize: 10 }}
                                scroll={{ x: 1000 }}
                            />
                        </Card>
                    </div>
                </main>
            </div>

            <Footer />
        </div>
    );
}