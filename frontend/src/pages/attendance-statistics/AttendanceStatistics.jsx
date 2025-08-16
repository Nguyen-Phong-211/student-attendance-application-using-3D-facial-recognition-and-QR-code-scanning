import React, { useEffect, useState } from "react";
import { Table, Card, Breadcrumb, Tag, Progress } from "antd";
import {
  HomeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import Header from "../../components/Header/Header";
import { useTranslation } from "react-i18next";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function StudentAttendanceStatsPage() {
  const { t } = useTranslation();

  const [attendanceData] = useState([
    {
      key: "1",
      date: "2025-06-01",
      subject: "Toán cao cấp",
      status: "present",
    },
    {
      key: "2",
      date: "2025-06-03",
      subject: "Kỹ thuật lập trình",
      status: "absent",
    },
    {
      key: "3",
      date: "2025-06-05",
      subject: "Cơ sở dữ liệu",
      status: "leave",
    },
    {
      key: "4",
      date: "2025-06-07",
      subject: "Trí tuệ nhân tạo",
      status: "present",
    },
  ]);

  useEffect(() => {
    document.title = "ATTEND 3D - Thống kê điểm danh";
  }, [t]);

  const statusColors = {
    present: { text: "Có mặt", color: "green" },
    absent: { text: "Vắng", color: "red" },
    leave: { text: "Nghỉ phép", color: "orange" },
  };

  const columns = [
    {
      title: "Ngày",
      dataIndex: "date",
      key: "date",
    },
    {
      title: "Môn học",
      dataIndex: "subject",
      key: "subject",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={statusColors[status].color}>
          {statusColors[status].text}
        </Tag>
      ),
    },
  ];

  const total = attendanceData.length;
  const presentCount = attendanceData.filter(
    (d) => d.status === "present"
  ).length;
  const absentCount = attendanceData.filter(
    (d) => d.status === "absent"
  ).length;
  const leaveCount = attendanceData.filter((d) => d.status === "leave").length;
  const presentPercent = Math.round((presentCount / total) * 100);

  const absencePerSubject = attendanceData.reduce((acc, cur) => {
    if (cur.status === "absent") {
      acc[cur.subject] = (acc[cur.subject] || 0) + 1;
    }
    return acc;
  }, {});
  const absenceChartData = Object.keys(absencePerSubject).map((subject) => ({
    subject,
    absent: absencePerSubject[subject],
  }));

  return (
    <div className="min-h-screen bg-white text-gray-800 flex flex-col">
      <div className="w-full mx-auto px-6 flex-grow">
        <Header />

        <div className="mt-6">
          <Breadcrumb
            items={[
              { href: "/", title: <HomeOutlined /> },
              { href: "/attendance-statistics", title: "Thống kê điểm danh" },
              { title: "Thống kê điểm danh" },
            ]}
          />
        </div>

        <h1 className="text-2xl font-semibold mt-6 mb-4">Thống kê điểm danh</h1>

        {/* Tổng quan */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <div className="flex items-center space-x-3">
              <CheckCircleOutlined className="text-green-500 text-2xl" />
              <div>
                <p className="text-sm text-gray-500">Có mặt</p>
                <p className="text-lg font-bold">{presentCount} buổi</p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center space-x-3">
              <CloseCircleOutlined className="text-red-500 text-2xl" />
              <div>
                <p className="text-sm text-gray-500">Vắng</p>
                <p className="text-lg font-bold">{absentCount} buổi</p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center space-x-3">
              <InfoCircleOutlined className="text-orange-500 text-2xl" />
              <div>
                <p className="text-sm text-gray-500">Nghỉ phép</p>
                <p className="text-lg font-bold">{leaveCount} buổi</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Biểu đồ */}
        <Card title="Tỷ lệ có mặt">
          <Progress percent={presentPercent} status="active" />
        </Card>

        <Card title="Biểu đồ môn học bị vắng" className="mt-6">
          {absenceChartData.length === 0 ? (
            <p className="text-gray-500 text-sm">Không có dữ liệu vắng học.</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={absenceChartData}
                layout="vertical"
                margin={{ top: 10, right: 30, left: 10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" allowDecimals={false} />
                <YAxis type="category" dataKey="subject" width={150} />
                <Tooltip />
                <Bar dataKey="absent" fill="#f87171" barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card title="Chi tiết điểm danh" className="mt-6">
          <Table
            columns={columns}
            dataSource={attendanceData}
            pagination={{ pageSize: 5 }}
            scroll={{ x: 1000 }}
          />
        </Card>
      </div>

      <footer className="bg-gray-100 mt-10 py-2 px-5">
        <div className="text-center text-sm text-gray-500">
          © {new Date().getFullYear()} EDU FACE ID. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
