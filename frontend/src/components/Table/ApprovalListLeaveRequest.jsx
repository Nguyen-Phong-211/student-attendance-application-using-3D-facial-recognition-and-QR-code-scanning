import React from "react";
import { Table, Button } from "antd";
import dayjs from "dayjs";
import { EyeOutlined } from '@ant-design/icons';

const TableApprovalListLeaveRequest = ({ requests, loading , handleView }) => {

    const columns = [
        { title: 'Mã yêu cầu', dataIndex: 'leave_request_code', key: 'leave_request_code' },
        { title: 'Mã sinh viên', dataIndex: 'student_code', key: 'student_code' },
        { title: 'Lớp', dataIndex: 'class_name', key: 'class_name' },
        { title: 'Từ ngày', dataIndex: 'start_date', render: d => dayjs(d).format('DD/MM/YYYY') },
        { title: 'Đến ngày', dataIndex: 'end_date', render: d => dayjs(d).format('DD/MM/YYYY') },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: s => {
                switch (s) {
                    case 'A': return <span style={{ color: 'green' }}>Đã duyệt</span>;
                    case 'R': return <span style={{ color: 'red' }}>Từ chối</span>;
                    case 'P':
                    default: return <span style={{ color: 'orange' }}>Đang chờ</span>;
                }
            }
        },
        {
            title: 'Hành động',
            key: 'actions',
            render: (_, record) => (
                <>
                    <Button
                        icon={<EyeOutlined />}
                        type="link"
                        onClick={() => handleView(record)}
                    >
                        Xem
                    </Button>
                </>
            )
        }
    ];

    return (
        <Table
            columns={columns}
            dataSource={requests}
            rowKey="leave_request_code"
            bordered
            pagination={{ pageSize: 10 }}
            scroll={{ x: true }}
            loading={loading}
        />
    );
};

export default TableApprovalListLeaveRequest;