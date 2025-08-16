import React, { useState } from "react";
import { Table, Button, Tag, Modal, Descriptions, Typography } from "antd";

const { Title } = Typography;

const sampleAttendance = [
    {
        id: 1,
        subject: "Lập trình Web",
        time: "2025-03-12 08:00",
        method: "QR Code",
        status: "Thành công",
        lecturer: "ThS. Nguyễn Văn A",
        room: "P.101 - C1",
        session: "Ca 1 (7h30 - 9h30)",
        year: "2024 - 2025",
        semester: "Học kỳ 2",
    },
    {
        id: 2,
        subject: "Hệ thống thông tin",
        time: "2025-03-14 13:30",
        method: "Face",
        status: "Thất bại",
        lecturer: "TS. Trần Thị B",
        room: "P.203 - D2",
        session: "Ca 3 (13h30 - 15h30)",
        year: "2024 - 2025",
        semester: "Học kỳ 2",
    },
];

export default function AttendanceHistory() {

    const [detail, setDetail] = useState(null);

    const columns = [
        {
            title: "Môn học",
            dataIndex: "subject",
            key: "subject",
            sorter: (a, b) => a.subject.localeCompare(b.subject),
            filters: [
                { text: "Toán", value: "Toán" },
                { text: "Lý", value: "Lý" },
                { text: "Hóa", value: "Hóa" },
            ],
            onFilter: (value, record) => record.subject.includes(value),
        },
        {
            title: "Giờ điểm danh",
            dataIndex: "time",
            key: "time",
            sorter: (a, b) => new Date(a.time) - new Date(b.time),
        },
        {
            title: "Hình thức",
            dataIndex: "method",
            key: "method",
            filters: [
                { text: "Online", value: "Online" },
                { text: "Offline", value: "Offline" },
            ],
            onFilter: (value, record) => record.method === value,
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            filters: [
                { text: "Thành công", value: "Thành công" },
                { text: "Thất bại", value: "Thất bại" },
            ],
            onFilter: (value, record) => record.status === value,
            render: (text) =>
                text === "Thành công" ? (
                    <Tag color="green">{text}</Tag>
                ) : (
                    <Tag color="red">{text}</Tag>
                ),
        },
        {
            title: "Thao tác",
            key: "action",
            render: (_, record) => (
                <Button type="link" onClick={() => setDetail(record)}>
                    Xem chi tiết
                </Button>
            ),
        },
    ];

    return (
        <div className="bg-white p-6 rounded-xl border">
            <Title level={4}>Lịch sử điểm danh</Title>
            <Table
                columns={columns}
                dataSource={sampleAttendance}
                rowKey="id"
                pagination={{ pageSize: 10 }}
                scroll={{ x: "max-content" }}
            />

            <Modal
                open={!!detail}
                onCancel={() => setDetail(null)}
                footer={null}
                title="Chi tiết điểm danh"
            >
                {detail && (
                    <Descriptions
                        bordered
                        column={1}
                        size="middle"
                        styles={{ content: { color: "#555" }, label: { fontWeight: "bold", width: "150px" } }}
                    >
                        <Descriptions.Item label="Môn học">{detail.subject}</Descriptions.Item>
                        <Descriptions.Item label="Giờ điểm danh">{detail.time}</Descriptions.Item>
                        <Descriptions.Item label="Hình thức">{detail.method}</Descriptions.Item>

                        <Descriptions.Item label="Trạng thái">
                            {detail.status === "Thất bại" ? (
                                <Tag color="red">{detail.status}</Tag>
                            ) : (
                                <Tag color="green">{detail.status}</Tag>
                            )}
                        </Descriptions.Item>
                        <Descriptions.Item label="Giảng viên">{detail.lecturer}</Descriptions.Item>
                        <Descriptions.Item label="Phòng học">{detail.room}</Descriptions.Item>
                        <Descriptions.Item label="Ca học">{detail.session}</Descriptions.Item>
                        <Descriptions.Item label="Năm học">{detail.year}</Descriptions.Item>
                        <Descriptions.Item label="Học kỳ">{detail.semester}</Descriptions.Item>
                    </Descriptions>
                )}
            </Modal>
        </div>
    );
}