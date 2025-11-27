import React from "react";
import { Table, Button, Space, Tag } from "antd";

const TableListContact = ({ contacts, loading, setSelectedContact, setDetailModalVisible, setReplyModalVisible, getColumnSearchProps, form }) => {

    // Table columns
    const columns = [
        {
            title: 'Họ và tên',
            dataIndex: 'fullname',
            key: 'fullname',
            ...getColumnSearchProps('fullname'),
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            ...getColumnSearchProps('email'),
        },
        {
            title: 'Số điện thoại',
            dataIndex: 'phone_number',
            key: 'phone_number',
            ...getColumnSearchProps('phone_number'),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                let color = 'default';
                if (status === 'UNREAD') color = 'blue';
                else if (status === 'READ') color = 'orange';
                else if (status === 'REPLIED') color = 'green';
                return <Tag color={color}>{status}</Tag>;
            },
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Button type="link" onClick={() => { setSelectedContact(record); setDetailModalVisible(true); }}>
                        Xem chi tiết
                    </Button>
                    <Button 
                        type="primary" 
                        disabled={record.status === 'REPLIED'}
                        onClick={() => { setSelectedContact(record); form.setFieldsValue({ response: record.response }); setReplyModalVisible(true); }}
                    >
                        Phản hồi
                    </Button>
                </Space>
            ),
        }
    ];

    return (
        <Table
            rowKey="contact_id"
            columns={columns}
            dataSource={contacts}
            loading={loading}
            pagination={{ pageSize: 10 }}
            bordered
            scroll={{ x: 'max-content' }}
        />
    );
};

export default TableListContact;