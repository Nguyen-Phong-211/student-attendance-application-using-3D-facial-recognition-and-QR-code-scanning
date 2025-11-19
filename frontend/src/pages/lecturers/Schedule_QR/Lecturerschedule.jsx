import React, { useEffect, useState, useCallback } from "react";
import { Layout, Card, Tabs, Typography, Spin, message } from "antd";
import Sidebar from "../../../components/Layout/Sidebar_lecturer";
import Navbar from "../../../components/Layout/Navbar";
import Footer from "../../../components/Layout/Footer";
import api from "../../../api/axiosInstance";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import customParseFormat from "dayjs/plugin/customParseFormat";
import WeekView from "../../../components/TimeTable/WeekViewLecturer";
import MonthView from "../../../components/TimeTable/MonthView";
import { getAccountId } from "../../../utils/auth";
import { buildWeekSchedule } from "../../../components/utils/utilsTimeTable";
import LessonQRCodeModal from "../Schedule_QR/QRCodeForm";

dayjs.extend(customParseFormat);
dayjs.extend(utc);
dayjs.extend(timezone);

const { Header, Content } = Layout;
const { Title } = Typography;

export default function TeachingSchedule() {
  const [collapsed, setCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("week");
  const [scheduleData, setScheduleData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(dayjs().tz("Asia/Ho_Chi_Minh"));
  const lecturer_id = getAccountId();

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState(null);

  const handleLessonClick = (lesson) => {
    setSelectedLesson(lesson);
    setModalVisible(true);
  };

  const fetchSchedule = useCallback(async () => {
    setLoading(true);
    try {
      let res;

      if (activeTab === "month") {
        res = await api.get(`lecturers/schedules/${lecturer_id}/month/`);
      } else {
        res = await api.get(`lecturers/schedules/${lecturer_id}/`);
      }

      const data = res.data || [];

      const mappedData = data.map((item) => {
        const start = item.occurrence_start
          ? dayjs(item.occurrence_start).tz("Asia/Ho_Chi_Minh")
          : null;

        const repeatWeekly =
          item.repeat_weekly === true ||
          item.repeat_weekly === "True" ||
          item.repeat_weekly === 1;

        let displayDates = [];

        if (repeatWeekly) {
          const startOfMonth = currentTime.startOf("month");
          const endOfMonth = currentTime.endOf("month");
          const lessonDay = parseInt(item.day_of_week, 10);

          for (let d = 1; d <= endOfMonth.date(); d++) {
            const day = startOfMonth.date(d);
            const dayOfWeek = day.day() === 0 ? 7 : day.day();
            if (dayOfWeek === lessonDay) displayDates.push(day);
          }
        } else if (start) {
          displayDates.push(start);
        }

        const lessonStart = dayjs(item.lesson_start_time, "HH:mm:ss")
          .tz("Asia/Ho_Chi_Minh", true)
          .format("HH:mm");
        const lessonEnd = dayjs(item.lesson_end_time, "HH:mm:ss")
          .tz("Asia/Ho_Chi_Minh", true)
          .format("HH:mm");

        return {
          ...item,
          lesson_start: lessonStart,
          lesson_end: lessonEnd,
          semester_start_date: item.semester_start_date || "2025-01-01",
          semester_end_date: item.semester_end_date || "2025-12-31",
          occurrence_start: start,
          repeat_weekly: repeatWeekly,
          displayDates,
        };
      });

      setScheduleData(mappedData);
    } catch (error) {
      console.error("Error fetching lecturer schedule:", error);
      message.error("Lỗi khi lấy lịch dạy.");
    } finally {
      setLoading(false);
    }
  }, [lecturer_id, currentTime, activeTab]);

  useEffect(() => {
    document.title = "ATTEND 3D - Lịch dạy";
    fetchSchedule();
  }, [fetchSchedule, activeTab]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(dayjs().tz("Asia/Ho_Chi_Minh"));
    }, 1000 * 120);
    return () => clearInterval(interval);
  }, []);

  const weekSchedule = buildWeekSchedule(scheduleData, currentTime);

  const items = [
    {
      key: "week",
      label: "Theo tuần",
      children: loading ? (
        <Spin />
      ) : (
        <WeekView
          weekSchedule={weekSchedule}
          currentTime={currentTime}
          onLessonClick={handleLessonClick}
        />
      ),
    },
    {
      key: "month",
      label: "Theo tháng",
      children: loading ? (
        <Spin />
      ) : (
        <MonthView
          scheduleData={scheduleData}
          currentTime={currentTime}
          onLessonClick={handleLessonClick} 
        />
      ),
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <Layout>
        <Header className="bg-white px-4 border-b">
          <Navbar />
        </Header>
        <Content className="mx-4 my-4">
          <Card
            title={<Title level={4}>Lịch dạy giảng viên</Title>}
            className="rounded-lg"
          >
            <Tabs activeKey={activeTab} onChange={setActiveTab} items={items} />
          </Card>
        </Content>
        <Footer />
      </Layout>

      <LessonQRCodeModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        lesson={selectedLesson}
      />
    </Layout>
  );
}
