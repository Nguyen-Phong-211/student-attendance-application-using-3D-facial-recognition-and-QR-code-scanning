import React, { useEffect, useState, useCallback } from "react";
import { Layout, Card, Tabs, Spin, message } from "antd";
import { ScheduleOutlined } from "@ant-design/icons"; // CalendarOutlined
import Sidebar from "../../../components/Layout/Sidebar";
import Navbar from "../../../components/Layout/Navbar";
import Footer from "../../../components/Layout/Footer";
import api from "../../../api/axiosInstance";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import customParseFormat from "dayjs/plugin/customParseFormat";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isBetween from "dayjs/plugin/isBetween";

import WeekView from "../../../components/TimeTable/WeekViewLecturer";
// import MonthView from "../../../components/TimeTable/MonthView";
import LessonQRCodeModal from "./ModalQRCode";

import { getAccountId } from "../../../utils/auth";
import { buildWeekSchedule } from "../../../components/utils/utilsTimeTable";

dayjs.extend(customParseFormat);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);
dayjs.extend(isBetween);

const { Header, Content } = Layout;
// const { Title } = Typography;
const TIMEZONE = "Asia/Ho_Chi_Minh";

const checkQRCodeAvailability = (lesson, currentMoment) => {
    try {
        const lessonStartHourMin = dayjs(lesson.lesson_start_time, "HH:mm:ss").tz(TIMEZONE, true);
        const lessonEndHourMin = dayjs(lesson.lesson_end_time, "HH:mm:ss").tz(TIMEZONE, true);
    
        const baseDate = lesson.displayDate || lesson.occurrence_start || currentMoment.clone().startOf('day');

        const startDateTime = baseDate.clone()
            .hour(lessonStartHourMin.hour())
            .minute(lessonStartHourMin.minute())
            .second(0);
            
        const endDateTime = baseDate.clone()
            .hour(lessonEndHourMin.hour())
            .minute(lessonEndHourMin.minute())
            .second(0);
            
        return currentMoment.isBetween(startDateTime, endDateTime, 'minute', '[]');

    } catch (e) {
        console.error("Lỗi parse thời gian QR:", e);
        return false;
    }
};

export default function TeachingSchedule() {
    const [collapsed, setCollapsed] = useState(false);
    const [activeTab, setActiveTab] = useState("week");
    const [scheduleData, setScheduleData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(dayjs().tz(TIMEZONE));
    
    const lecturer_id = getAccountId(); 

    const [modalVisible, setModalVisible] = useState(false);
    const [selectedLesson, setSelectedLesson] = useState(null);
    const [viewingMonth, ] = useState(dayjs().tz(TIMEZONE)); // setViewingMonth

    const handleLessonClick = (lesson) => {
        if (isQRCodeActive(lesson)) {
            setSelectedLesson(lesson);
            setModalVisible(true);
        } else {
            message.warning("Chỉ được tạo QR Code trong thời gian buổi học diễn ra.");
        }
    };

    const handleCloseModal = () => {
        setModalVisible(false);
        setTimeout(() => setSelectedLesson(null), 300); 
    };

    const fetchSchedule = useCallback(async () => {
        if (!lecturer_id) return;

        setLoading(true);
        try {
            const endpoint = activeTab === "month" 
                ? `lecturers/schedules/${lecturer_id}/month/` 
                : `lecturers/schedules/${lecturer_id}/`;
                
            const res = await api.get(endpoint);
            const data = res.data || [];

            const mappedData = data.map((item) => {
                
                const occurrenceStart = item.occurrence_start 
                    ? dayjs(item.occurrence_start).tz(TIMEZONE) 
                    : null;
                
                const lessonStart = dayjs(item.lesson_start_time, "HH:mm:ss")
                    .tz(TIMEZONE, true)
                    .format("HH:mm");
                const lessonEnd = dayjs(item.lesson_end_time, "HH:mm:ss")
                    .tz(TIMEZONE, true)
                    .format("HH:mm");

                const repeatWeekly = 
                    item.repeat_weekly === true || 
                    String(item.repeat_weekly).toLowerCase() === 'true' || 
                    item.repeat_weekly === 1;
                
                let displayDates = [];
                
                const semesterStart = dayjs(item.semester_start_date).tz(TIMEZONE).startOf('day');
                const semesterEnd = dayjs(item.semester_end_date).tz(TIMEZONE).endOf('day');
                
                const monthStart = viewingMonth.startOf("month"); 
                const monthEnd = viewingMonth.endOf("month");

                if (repeatWeekly) {
                    const lessonDay = parseInt(item.day_of_week, 10);
                    let checkDay = monthStart.isAfter(semesterStart) 
                        ? monthStart.clone() 
                        : semesterStart.clone();
                    
                    if (checkDay.isSameOrBefore(monthEnd) && checkDay.isSameOrBefore(semesterEnd)) {
                        const currentDayOfWeek = checkDay.day() === 0 ? 7 : checkDay.day(); 
                        let diff = lessonDay - currentDayOfWeek;
                        if (diff < 0) diff += 7;
                        
                        checkDay = checkDay.add(diff, 'day').startOf('day');
                    } else {
                        checkDay = monthEnd.add(1, 'day'); 
                    }

                    while (checkDay.isSameOrBefore(monthEnd) && checkDay.isSameOrBefore(semesterEnd)) {
                        displayDates.push(checkDay.clone()); 
                        checkDay = checkDay.add(7, 'day');
                    }

                } else if (occurrenceStart) {
                    if (occurrenceStart.isSame(viewingMonth, 'month') && 
                        occurrenceStart.isSameOrAfter(semesterStart) && 
                        occurrenceStart.isSameOrBefore(semesterEnd)) 
                    {
                        displayDates.push(occurrenceStart);
                    }
                }

                return {
                    ...item,
                    lesson_start: lessonStart, // "HH:mm"
                    lesson_end: lessonEnd,     // "HH:mm"
                    lesson_start_time: item.lesson_start_time, // "HH:mm:ss" (
                    lesson_end_time: item.lesson_end_time,     // "HH:mm:ss" 
                    occurrence_start: occurrenceStart,
                    repeat_weekly: repeatWeekly,
                    displayDates,
                    subject_name: item.subject_name || 'Không rõ',
                    class_name: item.class_name || 'N/A',
                };
            });

            setScheduleData(mappedData);
        } catch (error) {
            console.error("Lỗi khi lấy lịch dạy:", error);
            message.error("Không thể tải lịch dạy từ server.");
        } finally {
            setLoading(false);
        }
    }, [lecturer_id, activeTab, viewingMonth]); 

    const isQRCodeActive = (lesson) => {
        return checkQRCodeAvailability(lesson, currentTime);
    };
    
    useEffect(() => {
        if (lecturer_id) {
            fetchSchedule();
        }
        document.title = "ATTEND 3D - Lịch dạy";
    }, [fetchSchedule, lecturer_id]);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(dayjs().tz(TIMEZONE));
        }, 1000 * 30); // 30 seconds
        return () => clearInterval(interval);
    }, []);
    
    const weekSchedule = buildWeekSchedule(scheduleData, currentTime);

    const tabItems = [
        {
            key: "week",
            label: (
                <span className="flex items-center">
                    <ScheduleOutlined className="mr-1" /> Theo Tuần
                </span>
            ),
            children: loading ? (
                <div className="flex justify-center items-center h-64"><Spin size="large" /></div>
            ) : (
                <WeekView
                    weekSchedule={weekSchedule}
                    currentTime={currentTime}
                    onLessonClick={handleLessonClick}
                    isQRCodeActive={isQRCodeActive} 
                />
            ),
        },
        // {
        //     key: "month",
        //     label: (
        //         <span className="flex items-center">
        //             <CalendarOutlined className="mr-1" /> Theo Tháng
        //         </span>
        //     ),
        //     children: loading ? (
        //         <div className="flex justify-center items-center h-64"><Spin size="large" /></div>
        //     ) : (
        //         <MonthView
        //             scheduleData={scheduleData}
        //             currentViewDate={viewingMonth} 
        //             onLessonClick={handleLessonClick}
        //             onMonthChange={setViewingMonth}
        //             isQRCodeActive={isQRCodeActive} 
        //         />
        //     ),
        // },
    ];

    return (
        <Layout style={{ minHeight: "100vh" }} className="bg-gray-50">
            <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
            <Layout>
                <Header className="bg-white px-4 flex justify-between items-center border-b shadow-sm sticky top-0 z-10">
                    <Navbar />
                </Header>
                
                <Content className="p-4 sm:p-6">
                    <h1 className="text-3xl font-bold text-gray-800 mb-6">
                        <span role="img" aria-label="dashboard">
                        </span>{" "}
                        Lịch Dạy Giảng Viên
                    </h1>
                    <Card
                        className="shadow-xl rounded-xl border-none"
                        styles={{ head: { borderBottom: '1px solid #e5e7eb' }, root: { border: 'none' } }}
                    >
                        <Tabs 
                            activeKey={activeTab} 
                            onChange={setActiveTab} 
                            items={tabItems} 
                            size="large"
                            className="schedule-tabs"
                        />
                    </Card>
                </Content>
                <Footer />
            </Layout>

            <LessonQRCodeModal
                visible={modalVisible}
                onClose={handleCloseModal}
                lesson={selectedLesson}
            />
        </Layout>
    );
}