import { Table, Checkbox, Tag } from "antd";

const TableNotificationList = ({ notifications, markAsRead, t }) => {

    const columns = [
        {
            title: "Cập nhật trạng thái",
            dataIndex: "checkbox",
            key: "checkbox",
            render: (_, record) => (
                <Checkbox
                    checked={record.is_read === "1"}
                    disabled={record.is_read === "1"}
                    onChange={() => markAsRead(record.notification_id)}
                />
            ),
        },
        {
            title: "Thông báo",
            dataIndex: "title",
            key: "title",
            render: (_, record) => (
                <div>
                    <div className="font-medium">{record.title}</div>
                    <div
                        className="text-gray-500"
                        dangerouslySetInnerHTML={{ __html: record.content }}
                        style={{ whiteSpace: "pre-wrap" }}
                    />
                </div>
            ),
        },
        {
            title: "Thời gian",
            dataIndex: "created_at",
            key: "created_at",
            width: 180,
            render: (value) => (
                <span className="text-sm text-gray-400">
                    {new Date(value).toLocaleString()}
                </span>
            ),
        },
        {
            title: "Trạng thái",
            dataIndex: "is_read",
            key: "is_read",
            width: 120,
            render: (value) =>
                value === "0" ? (
                    <Tag color="red">Chưa đọc</Tag>
                ) : (
                    <Tag color="green">Đã đọc</Tag>
                ),
        },
    ];

    return (
        <Table
            rowKey="notification_id"
            dataSource={notifications}
            columns={columns}
            pagination={true}
            scroll={{ x: true }}
        />
    );
};

export default TableNotificationList;