import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, Breadcrumb, Tabs, Calendar, Tag, Table, Typography, Spin, Button, Space, Radio, Popconfirm } from "antd";
import { HomeOutlined, ScheduleOutlined, ClockCircleOutlined, SelectOutlined, UserOutlined, PushpinOutlined, FireOutlined } from "@ant-design/icons";
import Footer from "../../components/Layout/Footer";
import api from "../../api/axiosInstance";
import TimerCountdown from "../../components/TimerCountdown";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import customParseFormat from "dayjs/plugin/customParseFormat";
import Header from "../../components/Layout/Header";
dayjs.extend(customParseFormat);
dayjs.extend(utc);
dayjs.extend(timezone);

const { Title, Text } = Typography;

export default function TimeTablePage() {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState("week");
    const [scheduleData, setScheduleData] = useState([]);
    const [loading, setLoading] = useState(true);

    const [openId, setOpenId] = useState(null);
    const [selectedMethod, setSelectedMethod] = useState(null);

    useEffect(() => {
        document.title = "ATTEND 3D - " + t("timetable");

        fetchSchedule();
    }, [t]);

    const fetchSchedule = async () => {
        const user = localStorage.getItem("user");
        const accountId = user ? JSON.parse(user).account_id : null;
        try {
            const res = await api.get(
                "students/schedules/" + accountId + "/"
            );
            const data = res.data;
            setScheduleData(data);
        } catch (error) {
            console.error("Error fetching schedule:", error);
        } finally {
            setLoading(false);
        }
    };

    const getShift = (time) => {
        const hour = parseInt(time.split(":")[0]);
        if (hour < 12) return "morning";
        if (hour < 18) return "afternoon";
        return "evening";
    };

    const buildWeekSchedule = (data) => {
        const days = {
            1: "Monday",
            2: "Tuesday",
            3: "Wednesday",
            4: "Thursday",
            5: "Friday",
            6: "Saturday",
            7: "Sunday",
        };

        // Khởi tạo
        const weekSchedule = {
            morning: { Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [], Saturday: [], Sunday: [] },
            afternoon: { Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [], Saturday: [], Sunday: [] },
            evening: { Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [], Saturday: [], Sunday: [] },
        };

        data.forEach((item) => {
            const dayName = days[item.day_of_week];
            const shift = getShift(item.lesson_start);
            if (dayName && weekSchedule[shift]) {
                weekSchedule[shift][dayName].push({
                    subject: item.subject_name,
                    slotName: item.slot_name,
                    lessonType: item.lesson_type,
                    time: `${item.lesson_start} - ${item.lesson_end}`,
                    lectureName: item.lecturer_name,
                    roomName: item.room_name,
                    color: "blue",
                    occurrence_start: item.occurrence_start,
                    occurrence_end: item.occurrence_end
                });
            }
        });

        return weekSchedule;
    };

    const weekSchedule = buildWeekSchedule(scheduleData);

    const WeekView = () => {
        const columns = [
            {
                title: "Ca học",
                dataIndex: "shift",
                key: "shift",
                align: "center",
                width: 120,
                fixed: "left",
                className: "bg-gray-50 font-semibold",
            },
            { title: "Thứ 2", dataIndex: "Monday", key: "Monday", align: "center" },
            { title: "Thứ 3", dataIndex: "Tuesday", key: "Tuesday", align: "center" },
            { title: "Thứ 4", dataIndex: "Wednesday", key: "Wednesday", align: "center" },
            { title: "Thứ 5", dataIndex: "Thursday", key: "Thursday", align: "center" },
            { title: "Thứ 6", dataIndex: "Friday", key: "Friday", align: "center" },
            { title: "Thứ 7", dataIndex: "Saturday", key: "Saturday", align: "center" },
            { title: "Chủ nhật", dataIndex: "Sunday", key: "Sunday", align: "center" },
        ];

        const handleConfirm = () => {
            console.log("Chọn hình thức cho lesson", openId, ":", selectedMethod);
            setOpenId(null);
            setSelectedMethod(null);
            // TODO: gọi API hoặc chuyển trang điểm danh tương ứng
        };

        const handleCancel = () => {
            setOpenId(null);
            setSelectedMethod(null);
        };

        const renderCell = (data) => {
            if (!data || data.length === 0) return <Text type="secondary">—</Text>;

            return (
                <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 190, textAlign: "left" }}>
                    {data.map((item, idx) => {
                        // parse occurrence_start — convert to local time if it's UTC
                        const start = dayjs.tz(item.occurrence_start, "YYYY-MM-DD HH:mm:ss", "Asia/Ho_Chi_Minh");
                        const end = dayjs.tz(item.occurrence_end, "YYYY-MM-DD HH:mm:ss", "Asia/Ho_Chi_Minh");
                        const endCountdown = start.add(10, "minute");
                        const now = dayjs().tz("Asia/Ho_Chi_Minh");

                        const uniqueId = `${item.subject}-${item.slotName}-${item.occurrence_start}`;
                        let isExpired = false;

                        let countdownNode = (
                            <Text type="warning" style={{ fontSize: 12, fontWeight: 700 }}>
                                Chưa đến giờ điểm danh
                            </Text>
                        );

                        if (now.isBefore(start)) {
                            countdownNode = (
                                <Text type="warning" style={{ fontSize: 12, fontWeight: 700 }}>
                                    Chưa đến giờ điểm danh
                                </Text>
                            );
                        } else if (now.isAfter(end)) {
                            isExpired = true;
                            countdownNode = (
                                <Text type="danger" style={{ fontSize: 12, fontWeight: 700 }}>
                                    Hết giờ điểm danh
                                </Text>
                            );
                        } else if (now.isAfter(start) && now.isBefore(endCountdown)) {
                            countdownNode = <TimerCountdown end={endCountdown} />;
                        } else {
                            isExpired = true;
                            countdownNode = (
                                <Text type="danger" style={{ fontSize: 12, fontWeight: 700 }}>
                                    Hết giờ điểm danh
                                </Text>
                            );
                        }

                        return (
                            <Card
                                key={idx}
                                size="small"
                                style={{
                                    borderLeft: `4px solid ${item.color || "blue"}`,
                                    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
                                }}
                                styles={{ body: { padding: 8 } }}
                            >
                                <Tag color={item.color || "blue"} style={{ fontWeight: 500, marginBottom: 6 }}>
                                    {item.subject} ({item.lessonType || item.lesson_type})
                                </Tag>

                                <div style={{ fontSize: 12 }}>
                                    <PushpinOutlined /> {item.slot_name || item.slotName}
                                </div>

                                <div style={{ fontSize: 12 }}>
                                    <ClockCircleOutlined /> Thời gian: {item.time}
                                </div>

                                <div style={{ fontSize: 12 }}>
                                    <UserOutlined /> Giảng viên: {item.lectureName || item.lecturer_name}
                                </div>

                                <div style={{ fontSize: 12 }}>
                                    <SelectOutlined /> Phòng học: {item.roomName || item.room_name}
                                </div>

                                <div style={{ fontSize: 12, fontWeight: 500, marginTop: 6 }}>
                                    Thời gian điểm danh: {countdownNode}
                                </div>

                                <div>
                                    {isExpired ? (
                                        <Button type="link" style={{ fontSize: 12, fontWeight: 500 }}>
                                            Liên hệ với giảng viên
                                        </Button>
                                    ) : (
                                        <Popconfirm
                                            title="Chọn hình thức điểm danh"
                                            description={
                                                <Radio.Group
                                                    onChange={(e) => setSelectedMethod(e.target.value)}
                                                    value={selectedMethod}
                                                >
                                                    <Space direction="vertical">
                                                        <Radio value="qr">QR Code</Radio>
                                                        <Radio value="face">Check In Face</Radio>
                                                    </Space>
                                                </Radio.Group>
                                            }
                                            open={openId === uniqueId}
                                            onConfirm={handleConfirm}
                                            onCancel={handleCancel}
                                            okButtonProps={{ disabled: !selectedMethod }}
                                            okText="Xác nhận"
                                            cancelText="Hủy"
                                            placement="bottom"
                                        >
                                            <Button
                                                type="link"
                                                size="small"
                                                style={{ marginTop: 6, fontSize: 12, fontWeight: 500 }}
                                                onClick={() => setOpenId(uniqueId)}
                                            >
                                                Điểm danh
                                            </Button>
                                        </Popconfirm>
                                    )}
                                </div>

                            </Card>
                        );
                    })}
                </div>
            );
        };

        const dataSource = [
            {
                key: "morning",
                shift: "Sáng",
                Monday: renderCell(weekSchedule.morning.Monday),
                Tuesday: renderCell(weekSchedule.morning.Tuesday),
                Wednesday: renderCell(weekSchedule.morning.Wednesday),
                Thursday: renderCell(weekSchedule.morning.Thursday),
                Friday: renderCell(weekSchedule.morning.Friday),
                Saturday: renderCell(weekSchedule.morning.Saturday),
                Sunday: renderCell(weekSchedule.morning.Sunday),
            },
            {
                key: "afternoon",
                shift: "Chiều",
                Monday: renderCell(weekSchedule.afternoon.Monday),
                Tuesday: renderCell(weekSchedule.afternoon.Tuesday),
                Wednesday: renderCell(weekSchedule.afternoon.Wednesday),
                Thursday: renderCell(weekSchedule.afternoon.Thursday),
                Friday: renderCell(weekSchedule.afternoon.Friday),
                Saturday: renderCell(weekSchedule.afternoon.Saturday),
                Sunday: renderCell(weekSchedule.afternoon.Sunday),
            },
            {
                key: "evening",
                shift: "Tối",
                Monday: renderCell(weekSchedule.evening.Monday),
                Tuesday: renderCell(weekSchedule.evening.Tuesday),
                Wednesday: renderCell(weekSchedule.evening.Wednesday),
                Thursday: renderCell(weekSchedule.evening.Thursday),
                Friday: renderCell(weekSchedule.evening.Friday),
                Saturday: renderCell(weekSchedule.evening.Saturday),
                Sunday: renderCell(weekSchedule.evening.Sunday),
            },
        ];

        return (
            <div className="overflow-x-auto">
                <Table columns={columns} dataSource={dataSource} pagination={false} bordered scroll={{ x: "max-content" }} size="middle" />
            </div>
        );
    };

    const MonthView = () => {
        const getListData = (value) => {
            const dateStr = value.format("YYYY-MM-DD");
            return scheduleData.filter((item) => item.occurrence_start.startsWith(dateStr));
        };

        const dateCellRender = (value) => {
            const listData = getListData(value);
            return (
                <div style={{ display: "flex", flexDirection: "column", gap: 4, minHeight: 60 }}>
                    {listData.map((item, index) => {
                        const start = dayjs.tz(item.occurrence_start, "YYYY-MM-DD HH:mm:ss", "Asia/Ho_Chi_Minh");
                        const end = dayjs.tz(item.occurrence_end, "YYYY-MM-DD HH:mm:ss", "Asia/Ho_Chi_Minh");
                        const endCountdown = start.add(10, "minute");
                        const now = dayjs().tz("Asia/Ho_Chi_Minh");

                        let contentNode;

                        if (now.isBefore(start)) {
                            contentNode = (
                                <Text type="warning" style={{ fontSize: 12, fontWeight: 500 }}>
                                    {item.subject_name} ({item.lesson_type}) - Chưa đến giờ điểm danh
                                </Text>
                            );
                        } else if (now.isAfter(end)) {
                            contentNode = (
                                <Text type="danger" style={{ fontSize: 12, fontWeight: 500 }}>
                                    {item.subject_name} ({item.lesson_type}) - Hết giờ điểm danh
                                </Text>
                            );
                        } else if (now.isAfter(start) && now.isBefore(endCountdown)) {
                            contentNode = (
                                <div style={{ fontSize: 12, fontWeight: 500 }}>
                                    {item.subject_name} ({item.lesson_type}) - <TimerCountdown end={endCountdown} />
                                </div>
                            );
                        } else {
                            contentNode = (
                                <Text type="danger" style={{ fontSize: 12, fontWeight: 500 }}>
                                    {item.subject_name} ({item.lesson_type}) - Hết giờ điểm danh
                                </Text>
                            );
                        }

                        return (
                            <div
                                key={index}
                            >
                                <FireOutlined /> {" "} {contentNode}
                            </div>
                        );
                    })}
                </div>
            );
        };

        return (
            <div className="mt-4">
                <Calendar
                    cellRender={dateCellRender}
                />
            </div>
        );
    };

    const items = [
        { key: "week", label: "Theo tuần", children: loading ? <Spin /> : <WeekView /> },
        { key: "month", label: "Theo tháng", children: loading ? <Spin /> : <MonthView /> },
    ];

    return (
        <div className="min-h-screen bg-white text-black flex flex-col">
            <div className="w-full mx-auto px-6 flex-grow">
                <Header />
                <main className="m-auto mt-10 px-4">
                    <div className="w-full px-2 mb-6">
                        <Breadcrumb
                            items={[
                                { href: "/", title: <><HomeOutlined /> <span>{"Trang chủ"}</span></> },
                                { href: "/timetable", title: <><ScheduleOutlined /> <span>{"Lịch học"}</span></> },
                            ]}
                        />
                    </div>
                    <Card
                        title={<Title level={4} style={{ margin: 0 }}>{t("timetable")}</Title>}
                        className="rounded-lg"
                    >
                        <Tabs activeKey={activeTab} onChange={(key) => setActiveTab(key)} tabBarGutter={32} type="line" size="large" items={items} />
                    </Card>
                </main>
            </div>
            <Footer />
        </div>
    );
}