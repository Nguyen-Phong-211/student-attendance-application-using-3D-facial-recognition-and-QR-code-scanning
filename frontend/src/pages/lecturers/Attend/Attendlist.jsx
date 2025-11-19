import React, { useState, useEffect } from "react";
import { Table, Select, Button, Space, Spin, message, Typography } from "antd";
import api from "../../../api/axiosInstance";
import dayjs from "dayjs";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const { Text } = Typography;

export default function AttendanceForm({ classId, subjectId, accountId }) {
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState([]);
  const [classInfo, setClassInfo] = useState({});
  const [subjectInfo, setSubjectInfo] = useState({});
  const [lecturerInfo, setLecturerInfo] = useState({});
  const [currentStart, setCurrentStart] = useState(dayjs().startOf("week").add(1, "day")); // Thứ 2
  const [currentEnd, setCurrentEnd] = useState(dayjs().startOf("week").add(7, "day")); // CN

  const formatDate = (date) => date.format("DD/MM/YYYY");

  //thông tin lớp, môn, giảng viên
  const fetchInfo = async () => {
    try {
      if (classId) {
        const resClass = await api.get(`/classes/${classId}/`);
        const data = resClass.data;
        setClassInfo({
          class_name: data.class_name || data.name || data.title || "Không rõ",
        });
      }

      if (subjectId) {
        const resSubject = await api.get(`/subjects/${subjectId}/`);
        const data = resSubject.data;
        setSubjectInfo({
          subject_name: data.subject_name || data.name || data.title || "Không rõ",
        });
      }

      if (accountId) {
        const resLecturer = await api.get(`/lecturers/by-account/${accountId}/`);
        const data = resLecturer.data;
        setLecturerInfo({
          fullname: data.fullname || data.name || data.account?.fullname || "Không rõ",
        });
      }
    } catch (err) {
      console.error("Lỗi tải thông tin:", err);
    }
  };

  const fetchAttendance = async (start, end) => {
    if (!classId || !subjectId || !accountId) return;
    try {
      setLoading(true);
      const res = await api.get(
        `classes/${classId}/subjects/${subjectId}/students/${accountId}/`,
        {
          params: {
            start_date: start.toISOString(),
            end_date: end.toISOString(),
          },
        }
      );
      const data = res.data.map((s) => ({
        ...s,
        status: s.status || "Chưa điểm danh",
      }));
      setStudents(data);

      
    } catch (err) {
      console.error("Lỗi fetch attendance:", err);
      message.error("Lỗi khi tải dữ liệu sinh viên.");
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInfo();
  }, [classId, subjectId, accountId]);

  useEffect(() => {
    fetchAttendance(currentStart, currentEnd);
  }, [classId, subjectId, accountId, currentStart, currentEnd]);

  const handleStatusChange = (studentId, value) => {
    setStudents((prev) =>
      prev.map((s) =>
        s.student_id === studentId ? { ...s, status: value } : s
      )
    );
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await api.post(`attendance/${classId}/${subjectId}/`, {
        students,
        start_date: currentStart.toISOString(),
        end_date: currentEnd.toISOString(),
      });
      message.success("✅ Đã lưu điểm danh!");
    } catch (err) {
      console.error(err);
      message.error("❌ Lỗi khi lưu điểm danh.");
    } finally {
      setLoading(false);
    }
  };

  // Xuất file Excel có phần thông tin đầu
  const handleExportExcel = () => {
    if (!students.length) {
      message.warning("Không có dữ liệu để xuất!");
      return;
    }

    // Phần header: thông tin lớp, môn, giảng viên, ngày xuất
    const header = [
      ["LỚP:", classInfo.class_name || "Chưa có thông tin"],
      ["MÔN HỌC:", subjectInfo.subject_name || "Chưa có thông tin"],
      ["GIẢNG VIÊN:", lecturerInfo.fullname || "Chưa có thông tin"],
      ["NGÀY XUẤT:", formatDate(dayjs())],
      [
        "THỜI GIAN:",
        `${formatDate(currentStart)} - ${formatDate(currentEnd)}`
      ],
      [],
    ];

    // Dữ liệu sinh viên
    const wsData = [
      ...header,
      ["STT", "Mã sinh viên", "Họ và tên", "Trạng thái điểm danh"],
      ...students.map((s, index) => [
        index + 1,
        s.student_code,
        s.fullname,
        s.status,
      ]),
    ];

    // Tạo file Excel
    const worksheet = XLSX.utils.aoa_to_sheet(wsData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Điểm danh");

    // Xuất file
    const fileName = `DiemDanh_${classInfo.class_name || "Lop"}_${
      subjectInfo.subject_name || "Mon"
    }_${dayjs().format("DDMMYYYY")}.xlsx`;

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, fileName);

    message.success("✅ Xuất danh sách điểm danh thành công!");
  };

  const handlePrevWeek = () => {
    setCurrentStart((prev) => prev.subtract(1, "week"));
    setCurrentEnd((prev) => prev.subtract(1, "week"));
  };

  const handleNextWeek = () => {
    setCurrentStart((prev) => prev.add(1, "week"));
    setCurrentEnd((prev) => prev.add(1, "week"));
  };

  const columns = [
    {
      title: "STT",
      render: (_, __, index) => index + 1,
      width: 60,
    },
    {
      title: "Mã sinh viên",
      dataIndex: "student_code",
      key: "student_code",
      width: 120,
    },
    {
      title: "Họ tên",
      dataIndex: "fullname",
      key: "fullname",
      width: 200,
    },
    {
      title: "Trạng thái",
      key: "status",
      width: 150,
      render: (_, record) => (
        <Select
          value={record.status || "Chưa điểm danh"}
          onChange={(val) => handleStatusChange(record.student_id, val)}
          style={{ width: "100%" }}
          options={[
            { label: "Chưa điểm danh", value: "Chưa điểm danh" },
            { label: "Có mặt", value: "Có mặt" },
            { label: "Vắng", value: "Vắng" },
            { label: "Muộn", value: "Muộn" },
          ]}
        />
      ),
    },
  ];

  return (
    <div>
      <Space style={{ marginBottom: 16, flexWrap: "wrap" }}>
        <Button onClick={handlePrevWeek}>← Tuần trước</Button>
        <Text strong>
          {formatDate(currentStart)} - {formatDate(currentEnd)}
        </Text>
        <Button onClick={handleNextWeek}>Tuần sau →</Button>

        <Button type="primary" onClick={handleSave}>
          💾 Lưu điểm danh
        </Button>

        <Button type="default" onClick={handleExportExcel}>
          📤 Xuất danh sách điểm danh
        </Button>
      </Space>

      <Spin spinning={loading}>
        <Table
          rowKey="student_id"
          columns={columns}
          dataSource={students}
          pagination={{ pageSize: 10 }}
          bordered
          scroll={{ x: 600 }}
        />
      </Spin>
    </div>
  );
}
