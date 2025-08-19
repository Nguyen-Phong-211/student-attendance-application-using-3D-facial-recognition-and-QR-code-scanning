import React, { useEffect, useState } from "react";
import Header from "../../components/Header/Header";
import { useTranslation } from 'react-i18next';
import {
  Card,
  Breadcrumb,
  Tabs,
  Calendar,
  Badge,
  Tag,
  Table,
  Typography
} from "antd";
import {
  HomeOutlined,
  ScheduleOutlined
} from '@ant-design/icons';
import Footer from "../../components/Footer";

const { Title, Text } = Typography;

const sampleSchedule = {
  morning: {
    Monday: { subject: "Toán", time: "07:00 - 08:30", lectureName: "Nguyễn Văn A", roomName: "A101", color: "blue" },
    Tuesday: { subject: "Hóa", time: "07:00 - 08:30", lectureName: "Nguyễn Văn B", roomName: "B202", color: "green" },
    Wednesday: null,
    Thursday: { subject: "Sinh", time: "10:00 - 11:30", lectureName: "Nguyễn Văn C", roomName: "C303", color: "purple" },
    Friday: null,
    Saturday: { subject: "Anh", time: "08:00 - 09:30", lectureName: "Nguyễn Văn D", roomName: "D404", color: "cyan" },
    Sunday: null
  },
  afternoon: {
    Monday: null,
    Tuesday: { subject: "Văn", time: "13:00 - 14:30", lectureName: "Nguyễn Văn E", roomName: "E505", color: "magenta" },
    Wednesday: null,
    Thursday: null,
    Friday: { subject: "Sử", time: "14:00 - 15:30", lectureName: "Nguyễn Văn F", roomName: "F606", color: "volcano" },
    Saturday: null,
    Sunday: { subject: "Địa", time: "15:00 - 16:30", lectureName: "Nguyễn Văn G", roomName: "G707", color: "geekblue" }
  },
  evening: {
    Monday: { subject: "Tin học", time: "18:00 - 19:30", lectureName: "Nguyễn Văn H", roomName: "H808", color: "gold" },
    Tuesday: null,
    Wednesday: { subject: "GDCD", time: "19:00 - 20:30", lectureName: "Nguyễn Văn I", roomName: "I909", color: "lime" },
    Thursday: null,
    Friday: null,
    Saturday: null,
    Sunday: null
  }
};

const monthlyEvents = [
  { date: "2025-06-09", subject: "Kiểm tra Toán" },
  { date: "2025-06-15", subject: "Thuyết trình Sinh học" }
];

export default function TimeTablePage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("week");

  useEffect(() => {
    document.title = "ATTEND 3D - " + t('timetable');
  }, [t]);

  const WeekView = () => {
    const columns = [
      {
        title: "Ca học",
        dataIndex: "shift",
        key: "shift",
        align: "center",
        width: 120,
        fixed: "left",
        className: "bg-gray-50 font-semibold"
      },
      { title: "Thứ 2", dataIndex: "Monday", key: "Monday", align: "center" },
      { title: "Thứ 3", dataIndex: "Tuesday", key: "Tuesday", align: "center" },
      { title: "Thứ 4", dataIndex: "Wednesday", key: "Wednesday", align: "center" },
      { title: "Thứ 5", dataIndex: "Thursday", key: "Thursday", align: "center" },
      { title: "Thứ 6", dataIndex: "Friday", key: "Friday", align: "center" },
      { title: "Thứ 7", dataIndex: "Saturday", key: "Saturday", align: "center" },
      { title: "Chủ nhật", dataIndex: "Sunday", key: "Sunday", align: "center" }
    ];

    const renderCell = (data) => {
      if (!data) return <Text type="secondary">—</Text>;

      const subjects = Array.isArray(data) ? data : [data];

      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 190, textAlign: "left" }}>
          {subjects.map((item, idx) => (
            <Card
              key={idx}
              size="small"
              style={{
                borderLeft: `4px solid ${item.color || "blue"}`,
                padding: "6px 8px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.08)"
              }}
              styles={{
                body: { padding: 0 }
              }}
            >

              <Tag color={item.color || "blue"} style={{ fontWeight: 500, marginBottom: 4 }}>
                Môn: {item.subject}
              </Tag>
              <div style={{ fontSize: 12 }}>Thời gian: {item.time}</div>
              <div style={{ fontSize: 12, color: "#555" }}>Giảng viên: {item.lectureName}</div>
              <div style={{ fontSize: 12, color: "#555" }}>Phòng học: {item.roomName}</div>
            </Card>
          ))}
        </div>
      );
    };

    const dataSource = [
      {
        key: "morning",
        shift: "Sáng",
        Monday: renderCell(sampleSchedule.morning.Monday),
        Tuesday: renderCell(sampleSchedule.morning.Tuesday),
        Wednesday: renderCell(sampleSchedule.morning.Wednesday),
        Thursday: renderCell(sampleSchedule.morning.Thursday),
        Friday: renderCell(sampleSchedule.morning.Friday),
        Saturday: renderCell(sampleSchedule.morning.Saturday),
        Sunday: renderCell(sampleSchedule.morning.Sunday)
      },
      {
        key: "afternoon",
        shift: "Chiều",
        Monday: renderCell(sampleSchedule.afternoon.Monday),
        Tuesday: renderCell(sampleSchedule.afternoon.Tuesday),
        Wednesday: renderCell(sampleSchedule.afternoon.Wednesday),
        Thursday: renderCell(sampleSchedule.afternoon.Thursday),
        Friday: renderCell(sampleSchedule.afternoon.Friday),
        Saturday: renderCell(sampleSchedule.afternoon.Saturday),
        Sunday: renderCell(sampleSchedule.afternoon.Sunday)
      },
      {
        key: "evening",
        shift: "Tối",
        Monday: renderCell(sampleSchedule.evening.Monday),
        Tuesday: renderCell(sampleSchedule.evening.Tuesday),
        Wednesday: renderCell(sampleSchedule.evening.Wednesday),
        Thursday: renderCell(sampleSchedule.evening.Thursday),
        Friday: renderCell(sampleSchedule.evening.Friday),
        Saturday: renderCell(sampleSchedule.evening.Saturday),
        Sunday: renderCell(sampleSchedule.evening.Sunday)
      }
    ];

    return (
      <div className="overflow-x-auto">
        <Table
          columns={columns}
          dataSource={dataSource}
          pagination={false}
          bordered
          scroll={{ x: true }}
          size="middle"
        />
      </div>
    );
  };


  const MonthView = () => {
    const getListData = (value) => {
      const dateStr = value.format("YYYY-MM-DD");
      return monthlyEvents.filter((event) => event.date === dateStr);
    };

    const dateCellRender = (value) => {
      const listData = getListData(value);
      return (
        <ul style={{ padding: 0, margin: 0, listStyle: "none" }}>
          {listData.map((item, index) => (
            <li key={index}>
              <Badge status="processing" text={item.subject} />
            </li>
          ))}
        </ul>
      );
    };

    return (
      <div className="mt-4">
        <Calendar cellRender={dateCellRender} />
      </div>
    );
  };

  const items = [
    { key: 'week', label: 'Theo tuần', children: <WeekView /> },
    { key: 'month', label: 'Theo tháng', children: <MonthView /> }
  ];

  return (
    <div className="min-h-screen bg-white text-black flex flex-col">
      <div className="w-full mx-auto px-6 flex-grow">
        <Header />
        <main className="m-auto mt-10 px-4">
          <div className="w-full px-2 mb-6">
            <Breadcrumb
              items={[
                { href: '/', title: <HomeOutlined /> },
                { href: '/timetable', title: <><ScheduleOutlined /> <span>{t('timetable')}</span></> },
                { title: t('timetable') },
              ]}
            />
          </div>
          <Card
            title={<Title level={4} style={{ margin: 0 }}>{t('timetable')}</Title>}
            className="rounded-lg"
          >
            <Tabs
              activeKey={activeTab}
              onChange={(key) => setActiveTab(key)}
              tabBarGutter={32}
              type="line"
              size="large"
              items={items}
            />
          </Card>
        </main>
      </div>
      <Footer />
    </div>
  );
}
