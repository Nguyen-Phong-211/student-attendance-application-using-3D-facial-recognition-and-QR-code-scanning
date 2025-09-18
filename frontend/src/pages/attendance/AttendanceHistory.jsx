import React, { useEffect, useState } from "react";
import { Table, Breadcrumb, Card, Button, Modal, Spin, Tag, message } from "antd";
import { HomeOutlined, CalendarOutlined } from "@ant-design/icons";
import Header from "../../components/Layout/Header";
import Footer from "../../components/Layout/Footer";
import api from "../../api/axiosInstance";

export default function AttendanceHistory() {
    const [loading, setLoading] = useState(false);
    const [history, setHistory] = useState([]);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [statistics, setStatistics] = useState({
        present: 0,
        absent: 0,
        late: 0,
        total: 0,
    });

    const user = JSON.parse(localStorage.getItem("user"));
    const accountId = user?.account_id;

    useEffect(() => {
        document.title = "Lịch sử điểm danh - ATTEND 3D";

        const fetchHistory = async () => {
            if (!accountId) return;
            setLoading(true);
            try {
                const res = await api.get(`/attendance/history/${accountId}/`);
                const data = Array.isArray(res.data) ? res.data : [];
                setHistory(data);

                const stats = { present: 0, absent: 0, late: 0, total: data.length };
                data.forEach((item) => {
                    if (item.status === "present") stats.present += 1;
                    else if (item.status === "absent") stats.absent += 1;
                    else if (item.status === "late") stats.late += 1;
                });
                setStatistics(stats);
            } catch (error) {
                console.error(error);
                message.error("Không tải được lịch sử điểm danh.");
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [accountId]);

    const columns = [
        {
            title: "Ngày điểm danh",
            dataIndex: "date",
            key: "date",
            render: (value) => new Date(value).toLocaleDateString(),
        },
        {
            title: "Môn học",
            dataIndex: "subject_name",
            key: "subject_name",
        },
        {
            title: "Lớp",
            dataIndex: "class_name",
            key: "class_name",
        },
        {
            title: "Giảng viên",
            dataIndex: "lecturer_name",
            key: "lecturer_name",
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            render: (value) => {
                if (value === "present") return <Tag color="green">Có mặt</Tag>;
                if (value === "absent") return <Tag color="red">Vắng</Tag>;
                if (value === "late") return <Tag color="orange">Đi muộn</Tag>;
                return <Tag>Không xác định</Tag>;
            },
        },
        {
            title: "Hành động",
            key: "action",
            render: (_, record) => (
                <Button type="link" onClick={() => handleViewDetail(record)}>
                    Xem chi tiết
                </Button>
            ),
        },
    ];

    const handleViewDetail = (record) => {
        setSelectedRecord(record);
        setModalVisible(true);
    };

    const handleModalClose = () => {
        setModalVisible(false);
        setSelectedRecord(null);
    };

    return (
        <div className="min-h-screen bg-white text-gray-800 flex flex-col">
            <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 flex-grow">
                <Header />
                <main className="mt-8 flex flex-col items-center w-full">
                    <div className="w-full mb-4">
                        <Breadcrumb
                            items={[
                                {
                                    href: "/",
                                    title: (
                                        <>
                                            <HomeOutlined /> <span>Trang chủ</span>
                                        </>
                                    ),
                                },
                                {
                                    href: "/attendance-history",
                                    title: (
                                        <>
                                            <CalendarOutlined /> <span>Lịch sử điểm danh</span>
                                        </>
                                    ),
                                },
                            ]}
                        />
                    </div>
                    <div className="w-full mb-4">
                        <Card title="Thống kê điểm danh" className="rounded">
                            <div className="flex gap-8">
                                <div>Số lần có mặt: {statistics.present}</div>
                                <div>Số lần vắng: {statistics.absent}</div>
                                <div>Số lần đi muộn: {statistics.late}</div>
                                <div>Tổng số buổi: {statistics.total}</div>
                            </div>
                        </Card>
                    </div>
                    <div className="w-full mt-4">
                        <Card
                            title="Lịch sử điểm danh"
                            className="rounded"
                        >
                            {loading ? (
                                <div className="flex justify-center p-6">
                                    <Spin />
                                </div>
                            ) : (
                                <Table
                                    rowKey={(record) => record.id || record.attendance_id}
                                    columns={columns}
                                    dataSource={history}
                                    pagination={{ pageSize: 10 }}
                                    scroll={{ x: true }}
                                />
                            )}
                        </Card>
                    </div>

                    <Modal
                        title="Chi tiết điểm danh"
                        open={modalVisible}
                        onCancel={handleModalClose}
                        footer={[
                            <Button key="close" onClick={handleModalClose}>
                                Đóng
                            </Button>,
                        ]}
                    >
                        {selectedRecord ? (
                            <div className="space-y-2">
                                <p><strong>Ngày điểm danh:</strong> {new Date(selectedRecord.date).toLocaleString()}</p>
                                <p><strong>Môn học:</strong> {selectedRecord.subject_name}</p>
                                <p><strong>Lớp:</strong> {selectedRecord.class_name}</p>
                                <p><strong>Giảng viên:</strong> {selectedRecord.lecturer_name}</p>
                                <p><strong>Trạng thái:</strong> {selectedRecord.status}</p>
                                <p><strong>Ghi chú:</strong> {selectedRecord.note || "Không có"}</p>
                            </div>
                        ) : (
                            <Spin />
                        )}
                    </Modal>
                </main>
            </div>
            <Footer />
        </div>
    );
}