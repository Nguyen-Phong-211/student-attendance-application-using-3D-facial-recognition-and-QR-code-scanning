import React, { useState, useEffect } from "react";
import { Breadcrumb, Card, Input, Button, List, Checkbox, message, Typography, Spin, Modal, Descriptions, } from "antd";
import {
    HomeOutlined,
    CheckSquareOutlined,
    PlusOutlined,
    BookOutlined,
    ClockCircleOutlined,
    UserOutlined,
    QrcodeOutlined,
    SmileOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import Header from "../../components/Layout/Header";
import Footer from "../../components/Layout/Footer";
import api from "../../api/axiosInstance";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import isBetween from "dayjs/plugin/isBetween";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isBetween);

const { Text } = Typography;

export default function ToDoList() {
    const { t } = useTranslation();

    const [loading, setLoading] = useState(true);
    const [scheduleData, setScheduleData] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [newTask, setNewTask] = useState("");

    // Modal state
    const [openModal, setOpenModal] = useState(false);
    const [selectedSchedule, setSelectedSchedule] = useState(null);

    useEffect(() => {
        document.title = "ATTEND 3D - Danh sách nhiệm vụ";
        fetchSchedule();
    }, [t]);

    // load tasks when opening page
    useEffect(() => {
        try {
            const saved = localStorage.getItem("tasks");
            if (saved && saved !== "undefined") {
                setTasks(JSON.parse(saved));
            }
        } catch (err) {
            console.error("Error parsing tasks from localStorage:", err);
            setTasks([]);
        }
    }, []);

    // Every time tasks change, save it.
    useEffect(() => {
        localStorage.setItem("tasks", JSON.stringify(tasks));
    }, [tasks]);

    // Warning when user reloads / closes tab / closes browser
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (tasks.length > 0) {
                e.preventDefault();
                e.returnValue = "Bạn có chắc chắn muốn thoát? Nhiệm vụ sẽ bị xóa.";
            }
        };

        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, [tasks]);

    // Delete task when actually closing tab
    useEffect(() => {
        const handleUnload = () => {
            if (tasks.length > 0) {
                localStorage.removeItem("tasks");
            }
        };
        return () => {
            window.removeEventListener("unload", handleUnload);
        };
    }, [tasks]);

    const fetchSchedule = async () => {
        const user = localStorage.getItem("user");
        const accountId = user ? JSON.parse(user).account_id : null;
        try {
            const res = await api.get("students/schedules/" + accountId + "/");
            setScheduleData(res.data || []);
        } catch (error) {
            console.error("Error fetching schedule:", error);
        } finally {
            setLoading(false);
        }
    };

    // Filter today's schedule based on day_of_week
    const todaySchedules = scheduleData.filter((item) => {
        let today = dayjs().tz("Asia/Ho_Chi_Minh").day();
        let mappedToday = today === 0 ? 8 : today + 1;
        return parseInt(item.day_of_week, 10) === mappedToday;
    });

    const addTask = () => {
        if (!newTask.trim()) {
            message.warning("Vui lòng nhập nhiệm vụ!");
            return;
        }
        setTasks([
            ...tasks,
            { id: Date.now(), title: newTask, done: false, type: "task" },
        ]);
        setNewTask("");
        message.success("Đã thêm nhiệm vụ!");
    };
    // Toggle task done/undone
    const toggleTask = (id) => {
        setTasks(
            tasks.map((task) =>
                task.id === id ? { ...task, done: !task.done } : task
            )
        );
    };
    // Delete task
    const deleteTask = (id) => {
        setTasks(tasks.filter((task) => task.id !== id));
        message.success("Đã xóa nhiệm vụ!");
    };
    // Open attendance modal
    const openAttendanceModal = (schedule) => {
        setSelectedSchedule(schedule);
        setOpenModal(true);
    };

    return (
        <div className="min-h-screen bg-white text-gray-800 flex flex-col">
            <div className="w-full mx-auto px-6 flex-grow">
                <Header />
                <main className="mt-10 flex flex-col items-center">
                    <div className="w-full px-4">
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
                                    href: "/todo",
                                    title: (
                                        <>
                                            <CheckSquareOutlined />{" "}
                                            <span>To-Do List</span>
                                        </>
                                    ),
                                },
                            ]}
                        />
                    </div>

                    <div className="w-full mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card
                            className="rounded"
                            title={
                                <div className="flex items-center gap-2">
                                    <BookOutlined /> Nhiệm vụ điểm danh hôm nay
                                </div>
                            }
                        >
                            {loading ? (
                                <Spin />
                            ) : todaySchedules.length === 0 ? (
                                <Text type="secondary">
                                    Hôm nay bạn không có lịch học nào 🎉
                                </Text>
                            ) : (
                                <List
                                    className="border rounded-lg p-4 hover:shadow-sm"
                                    dataSource={todaySchedules}
                                    renderItem={(item) => {
                                        const now = dayjs().tz("Asia/Ho_Chi_Minh");

                                        // check semester
                                        const semesterStart = dayjs(item.semeter_start_date);
                                        const semesterEnd = dayjs(item.semester_end_date).endOf("day");
                                        if (!now.isBetween(semesterStart, semesterEnd, null, "[]")) {
                                            return null; // do not render if today is not a semester
                                        }

                                        // Build start/end for today
                                        let start, end;
                                        if (parseInt(item.repeat_weekly, 10) === 1) {
                                            const [sh, sm] = (item.lesson_start || "00:00:00").split(":");
                                            const [eh, em] = (item.lesson_end || "00:00:00").split(":");
                                            start = now.clone().hour(parseInt(sh, 10)).minute(parseInt(sm, 10)).second(0);
                                            end = now.clone().hour(parseInt(eh, 10)).minute(parseInt(em, 10)).second(0);
                                            if (!end.isAfter(start)) end = end.add(1, "day");
                                        } else {
                                            start = dayjs.utc(item.occurrence_start).tz("Asia/Ho_Chi_Minh");
                                            end = dayjs.utc(item.occurrence_end).tz("Asia/Ho_Chi_Minh");
                                        }

                                        // helper format
                                        const fmtRemaining = (minutes) => {
                                            if (minutes <= 0) return "0m";
                                            const h = Math.floor(minutes / 60);
                                            const m = minutes % 60;
                                            return (h > 0 ? `${h}h ` : "") + `${m}m`;
                                        };

                                        let statusText = "";
                                        let disabled = false;

                                        if (now.isBefore(start)) {
                                            const diffMin = start.diff(now, "minute");
                                            statusText = `Chưa đến giờ (còn ${fmtRemaining(diffMin)})`;
                                            disabled = true;
                                        } else if (now.isAfter(start) && now.isBefore(start.add(20, "minute"))) {
                                            const diffMin = Math.max(0, start.add(20, "minute").diff(now, "minute"));
                                            statusText = `Trong 20 phút đầu — còn ${diffMin} phút để điểm danh`;
                                            disabled = false;
                                        } else if (now.isAfter(start)) {
                                            if (now.isBefore(end)) {
                                                const diffMin = Math.max(0, end.diff(now, "minute"));
                                                statusText = `Đang diễn ra — còn ${fmtRemaining(diffMin)} đến khi kết thúc`;
                                                disabled = false;
                                            } else {
                                                statusText = "Đã kết thúc";
                                                disabled = true;
                                            }
                                        }

                                        const startDisplay = start.format("HH:mm");
                                        const endDisplay = end.format("HH:mm");
                                        const dateDisplay = start.format("DD/MM/YYYY");

                                        return (
                                            <List.Item
                                                className="rounded-lg p-3 sm:p-4 md:p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
                                                actions={[
                                                    <Button
                                                        type="primary"
                                                        onClick={() => openAttendanceModal(item)}
                                                        disabled={disabled}
                                                        className="w-full sm:w-auto"
                                                    >
                                                        Điểm danh
                                                    </Button>,
                                                ]}
                                            >
                                                <div className="w-full">
                                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                                                        <div>
                                                            <Text strong className="text-sm sm:text-base md:text-lg">
                                                                {item.subject_name} ({item.lesson_type})
                                                            </Text>
                                                            <div className="text-xs sm:text-sm text-gray-600 mt-1">
                                                                <ClockCircleOutlined /> {startDisplay} - {endDisplay} &nbsp;|&nbsp;
                                                                <UserOutlined /> {item.lecturer_name}
                                                            </div>
                                                        </div>

                                                        <div className="text-xs sm:text-sm text-gray-500">{dateDisplay}</div>
                                                    </div>
                                                    <div className="mt-2 text-xs sm:text-sm">
                                                        <span
                                                            className={`font-medium ${disabled ? "text-gray-500" : "text-blue-600"
                                                                }`}
                                                        >
                                                            {statusText}
                                                        </span>
                                                    </div>
                                                    <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm text-gray-700">
                                                        <div>
                                                            <b>Lớp:</b> {item.class_name}
                                                        </div>
                                                        <div>
                                                            <b>Phòng:</b> {item.room_name}
                                                        </div>
                                                        <div>
                                                            <b>Tiết:</b> {item.slot_name}
                                                        </div>
                                                        <div>
                                                            <b>Loại:</b> {item.lesson_type}
                                                        </div>
                                                    </div>
                                                </div>
                                            </List.Item>

                                        );
                                    }}
                                />

                            )}
                        </Card>
                        <Card
                            className="rounded"
                            title={
                                <div className="flex items-center gap-2">
                                    <CheckSquareOutlined /> Nhiệm vụ khác
                                </div>
                            }
                        >
                            <div className="flex gap-2 mb-4">
                                <Input
                                    placeholder="Thêm nhiệm vụ..."
                                    value={newTask}
                                    onChange={(e) => setNewTask(e.target.value)}
                                    onPressEnter={addTask}
                                    size="large"
                                    style={{ borderWidth: 1.5, boxShadow: "none" }}
                                />
                                <Button
                                    type="primary"
                                    icon={<PlusOutlined />}
                                    onClick={addTask}
                                    size="large"
                                >
                                    Thêm
                                </Button>
                            </div>

                            <List
                                dataSource={tasks}
                                renderItem={(task) => (
                                    <List.Item
                                        actions={[
                                            <Button
                                                type="link"
                                                danger
                                                onClick={() => deleteTask(task.id)}
                                            >
                                                Xóa
                                            </Button>,
                                        ]}
                                    >
                                        <Checkbox
                                            checked={task.done}
                                            onChange={() => toggleTask(task.id)}
                                        >
                                            <Text delete={task.done}>
                                                {task.title}
                                            </Text>
                                        </Checkbox>
                                    </List.Item>
                                )}
                            />
                        </Card>
                    </div>
                </main>
            </div>
            <Footer />
            <Modal
                title="Chọn hình thức điểm danh"
                open={openModal}
                onCancel={() => setOpenModal(false)}
                footer={null}
            >
                {selectedSchedule && (
                    <>
                        <Descriptions bordered size="small" column={1}>
                            <Descriptions.Item label="Môn học">
                                {selectedSchedule.subject_name}
                            </Descriptions.Item>
                            <Descriptions.Item label="Lớp">
                                {selectedSchedule.class_name}
                            </Descriptions.Item>
                            <Descriptions.Item label="Giảng viên">
                                {selectedSchedule.lecturer_name}
                            </Descriptions.Item>
                        </Descriptions>
                        <div className="flex justify-around mt-4">
                            <Button
                                type="primary"
                                icon={<QrcodeOutlined />}
                                onClick={() => message.success("Điểm danh bằng QR")}
                            >
                                QR Code
                            </Button>
                            <Button
                                type="dashed"
                                icon={<SmileOutlined />}
                                onClick={() =>
                                    message.success("Điểm danh bằng khuôn mặt")
                                }
                            >
                                Check-in Face
                            </Button>
                        </div>
                    </>
                )}
            </Modal>
        </div>
    );
}