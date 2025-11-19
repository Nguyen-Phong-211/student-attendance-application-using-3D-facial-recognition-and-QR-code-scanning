import React from "react";
import { Table, Typography, Tooltip } from "antd";
import { QrcodeOutlined } from "@ant-design/icons";
import ScheduleCard from "./ScheduleCard";

const { Text } = Typography;

export default function WeekView({ weekSchedule, currentTime, onLessonClick }) {
  const startOfWeek = currentTime.startOf("week").add(1, "day"); // Bắt đầu từ Thứ 2

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
    },
    ...dayColumns.map((day, idx) => ({
      title: `${day.label} (${startOfWeek.add(idx, "day").format("DD/MM/YYYY")})`,
      dataIndex: day.key,
      key: day.key,
      align: "center",
    })),
  ];

  const renderCell = (data, shiftKey, dayIdx) => {
    if (!data || data.length === 0) {
      return <Text type="secondary">—</Text>;
    }

    const shiftLabel =
      shiftKey === "morning" ? "Sáng" : shiftKey === "afternoon" ? "Chiều" : "Tối";
    const dayDate = startOfWeek.add(dayIdx, "day");

    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 6,
          minWidth: 190,
          textAlign: "left",
        }}
      >
        {data.map((item, idx) => (
          <div key={idx} style={{ position: "relative" }}>
            <Tooltip title="Xem mã QR">
              <QrcodeOutlined
                style={{
                  position: "absolute",
                  top: 6,
                  right: 6,
                  fontSize: 18,
                  color: "#1677ff",
                  zIndex: 10,
                  cursor: "pointer",
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onLessonClick?.({
                    ...item,
                    shift: shiftLabel,
                    displayDate: dayDate,
                  });
                }}
              />
            </Tooltip>
            <ScheduleCard item={item} currentTime={currentTime} />
          </div>
        ))}
      </div>
    );
  };

  const dataSource = ["morning", "afternoon", "evening"].map((shiftKey) => ({
    key: shiftKey,
    shift:
      shiftKey === "morning" ? "Sáng" : shiftKey === "afternoon" ? "Chiều" : "Tối",
    Monday: renderCell(weekSchedule[shiftKey].Monday, shiftKey, 0),
    Tuesday: renderCell(weekSchedule[shiftKey].Tuesday, shiftKey, 1),
    Wednesday: renderCell(weekSchedule[shiftKey].Wednesday, shiftKey, 2),
    Thursday: renderCell(weekSchedule[shiftKey].Thursday, shiftKey, 3),
    Friday: renderCell(weekSchedule[shiftKey].Friday, shiftKey, 4),
    Saturday: renderCell(weekSchedule[shiftKey].Saturday, shiftKey, 5),
    Sunday: renderCell(weekSchedule[shiftKey].Sunday, shiftKey, 6),
  }));

  return (
    <Table
      columns={columns}
      dataSource={dataSource}
      pagination={false}
      bordered
      scroll={{ x: true }}
      size="middle"
    />
  );
}
