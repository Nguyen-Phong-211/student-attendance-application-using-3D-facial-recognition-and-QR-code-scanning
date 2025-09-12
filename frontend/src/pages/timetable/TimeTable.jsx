import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, Breadcrumb, Tabs, Calendar, Tag, Table, Typography, Spin, Button, Space, Radio, Popconfirm } from "antd";
import { HomeOutlined, ScheduleOutlined, ClockCircleOutlined, SelectOutlined, UserOutlined, PushpinOutlined, FireOutlined, HarmonyOSOutlined } from "@ant-design/icons";
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
    const [currentTime, setCurrentTime] = useState(dayjs().tz("Asia/Ho_Chi_Minh"));

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

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(dayjs().tz("Asia/Ho_Chi_Minh"));
        }, 1000 * 120);

        return () => clearInterval(interval);
    }, []);

    const getShift = (time) => {
        const hour = parseInt(time.split(":")[0]);
        if (hour < 12) return "morning";
        if (hour < 18) return "afternoon";
        return "evening";
    };

    const buildWeekSchedule = (data) => {
        const days = {
            2: "Monday",
            3: "Tuesday",
            4: "Wednesday",
            5: "Thursday",
            6: "Friday",
            7: "Saturday",
            8: "Sunday",
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
                    className: item.class_name,
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
        const startOfWeek = currentTime.startOf("week").add(1, "day");

        const dayColumns = [
            { key: "Monday", label: "Thứ 2" },
            { key: "Tuesday", label: "Thứ 3" },
            { key: "Wednesday", label: "Thứ 4" },
            { key: "Thursday", label: "Thứ 5" },
            { key: "Friday", label: "Thứ 6" },
            { key: "Saturday", label: "Thứ 7" },
            { key: "Sunday", label: "Chủ nhật" },
        ];

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
            ...dayColumns.map((day, idx) => {
                const dateLabel = startOfWeek.add(idx, "day").format("DD/MM/YYYY");
                return {
                    title: `${day.label} (${dateLabel})`,
                    dataIndex: day.key,
                    key: day.key,
                    align: "center",
                };
            }),
        ];

        const handleConfirm = () => {
            console.log("Chọn hình thức cho lesson", openId, ":", selectedMethod);
            setOpenId(null);
            setSelectedMethod(null);
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
                        const start = dayjs.utc(item.occurrence_start).tz("Asia/Ho_Chi_Minh");
                        const end = dayjs.utc(item.occurrence_end).tz("Asia/Ho_Chi_Minh");
                        const endCountdown = start.add(10, "minute");
                        const now = currentTime;
                        const diffHours = start.diff(now, "hour");

                        const uniqueId = `${item.subject}-${item.slotName}-${item.occurrence_start}`;
                        let isExpired = false;

                        let countdownNode = (
                            <Text type="warning" style={{ fontSize: 12, fontWeight: 700 }}>
                                Chưa đến giờ điểm danh
                            </Text>
                        );

                        if (now.isAfter(end)) {
                            // 1. Đã qua giờ học
                            countdownNode = (
                                <Text type="danger" style={{ fontSize: 12, fontWeight: 700 }}>
                                    Hết giờ điểm danh
                                </Text>
                            );
                        } else if (now.isBefore(start)) {
                            if (diffHours >= 24) {
                                // 2. Chưa tới ngày học
                                countdownNode = (
                                    <Text type="warning" style={{ fontSize: 12, fontWeight: 700 }}>
                                        Chưa đến giờ điểm danh
                                    </Text>
                                );
                            } else {
                                // 3. Trong vòng 24h trước giờ học
                                countdownNode = (
                                    <Text style={{ fontSize: 12, fontWeight: 700 }}>
                                        Còn lại {start.diff(now, "minute")} phút nữa điểm danh
                                    </Text>
                                );
                            }
                        } else if (now.isAfter(start) && now.isBefore(endCountdown)) {
                            // 4. Trong giờ học, trong 10p đầu
                            countdownNode = <TimerCountdown end={endCountdown} />;
                        } else {
                            // 5. Hết hạn điểm danh
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
                                    <HarmonyOSOutlined /> Lớp: {item.class_name || item.className}
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
                        const start = dayjs.utc(item.occurrence_start).tz("Asia/Ho_Chi_Minh");
                        const end = dayjs.utc(item.occurrence_end).tz("Asia/Ho_Chi_Minh");
                        const endCountdown = start.add(10, "minute");
                        const now = currentTime;

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