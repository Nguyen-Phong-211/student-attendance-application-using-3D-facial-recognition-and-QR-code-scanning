import React, { useEffect, useState } from "react";
import { Layout, Card, Row, Col, Select, Button, Spin, message } from "antd";
import {
  TeamOutlined,
  UserOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
  BookOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import Sidebar from "../../components/Layout/Sidebar_lecturer";
import Navbar from "../../components/Layout/Navbar";
import api from "../../api/axiosInstance";
import { getAccountId } from "../../utils/auth";
import AttendanceLineChart from "../../components/Chart/AttendanceLineChart";
import AttendanceAreaChart from "../../components/Chart/AttendanceAreaChart";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Table } from "antd";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const { Header } = Layout;
const { Option } = Select;

export default function LecturerDashboard() {
  const [collapsed, setCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchValue, setSearchValue] = useState("");

  // Dựa theo ClassManagement
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);

  const [data, setData] = useState({
    totalClasses: 0,
    totalSubjects: 0,
    totalStudents: 0,
    totalAttendance: 0,
    totalPresent: 0,
    totalAbsent: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    attendanceByDate: [],
    attendanceByClass: [],
    
  });

  const accountId = getAccountId();

  useEffect(() => {
    document.title = "Báo cáo giảng viên - Attend 3D";
    fetchOverviewData();
    fetchClasses();
  }, []);

  // Lấy dữ liệu tổng quan
  const fetchOverviewData = async () => {
    try {
      setLoading(true);
      const overviewRes = await api.get("lecturers/dashboard/overview/");
      setData((prev) => ({ ...prev, ...overviewRes.data }));
    } catch (err) {
      console.error("❌ Lỗi tải dữ liệu tổng quan:", err);
    } finally {
      setLoading(false);
    }
  };

  // Lấy danh sách lớp giảng viên đang dạy
  const fetchClasses = async () => {
    try {
      const res = await api.get(`lecturers/classes/${accountId}/`);
      setClasses(res.data);
    } catch (error) {
      console.error(error);
      message.error("Lỗi khi tải danh sách lớp học.");
    }
  };

  // Lấy danh sách môn học theo lớp
  const fetchSubjects = async (classId) => {
    try {
      const res = await api.get(
        `lecturers/classes/${classId}/subjects/${accountId}/`
      );
      setSubjects(res.data);
    } catch (error) {
      console.error(error);
      message.error("Lỗi khi tải danh sách môn học.");
    }
  };

  // Khi chọn lớp
  const handleSelectClass = (value) => {
    setSelectedClass(value);
    setSelectedSubject(null);
    if (value) fetchSubjects(value);
  };

  // Khi chọn môn
  const handleSelectSubject = (value) => {
    setSelectedSubject(value);
  };

  // Lọc thống kê (chỉ thay đổi ở đây)
  const handleFilter = async () => {
    if (!selectedClass || !selectedSubject) {
      message.warning("Vui lòng chọn lớp và môn học để lọc.");
      return;
    }

    setLoading(true);
    try {
      // Gọi API thống kê chung (điểm danh,...)
      const res = await api.get("lecturers/dashboard/statistics/", {
        params: {
          class_id: selectedClass,
          subject_id: selectedSubject,
        },
      });

      // Gọi API thống kê đơn nghỉ phép
      const leaveRes = await api.get(
        `lecturers/${accountId}/classes/${selectedClass}/subjects/${selectedSubject}/leave-stats/`
      );

      // Cập nhật dữ liệu
      setData((prev) => ({
        ...prev,
        ...res.data,
        pending: leaveRes.data.pending_requests || 0,
        approved: leaveRes.data.approved_requests || 0,
        rejected: leaveRes.data.rejected_requests || 0,
      }));

      message.success("Đã cập nhật dữ liệu thống kê!");
    } catch (err) {
      console.error("❌ Lỗi lọc dữ liệu:", err);
      message.error("Không thể lọc dữ liệu thống kê.");
    } finally {
      setLoading(false);
    }
  };

  // Component hiển thị thẻ thống kê
  const SummaryCard = ({ title, value, icon, color }) => (
    <Card
      bordered={false}
      className="shadow-md hover:shadow-lg transition-all duration-200"
      style={{
        textAlign: "center",
        borderRadius: "12px",
        backgroundColor: "#fff",
        height: 150,
      }}
    >
      <div className="flex flex-col items-center justify-center h-full">
        <div className={`text-3xl mb-1 ${color}`}>{icon}</div>
        <div className="text-base font-semibold text-gray-600">{title}</div>
        <div className="text-2xl font-bold mt-1">
          {loading ? <Spin /> : value ?? 0}
        </div>
      </div>
    </Card>
  );

  return (
    <Layout style={{ minHeight: "100vh", background: "#f9fafc" }}>
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <Layout>
        <Header className="bg-white px-4 flex justify-between items-center border-b">
          <Navbar searchValue={searchValue} setSearchValue={setSearchValue} />
        </Header>

        <main className="m-4">
          {/* Tổng số lớp, môn và sinh viên */}
          <Card
            bordered={false}
            style={{
              background: "#f4f6f9",
              borderRadius: "14px",
              padding: "24px",
            }}
          >
            <Row gutter={[16, 16]} justify="center">
              <Col xs={24} sm={12} lg={6}>
                <SummaryCard
                  title="Tổng số lớp đang dạy"
                  value={data?.totalClasses || 0}
                  icon={<TeamOutlined />}
                  color="text-blue-500"
                />
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <SummaryCard
                  title="Tổng số môn đang dạy"
                  value={data?.totalSubjects || 0}
                  icon={<BookOutlined />}
                  color="text-green-500"
                />
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <SummaryCard
                  title="Tổng số sinh viên"
                  value={data?.totalStudents || 0}
                  icon={<UserOutlined />}
                  color="text-purple-500"
                />
              </Col>
            </Row>
          </Card>

          {/*Bộ lọc */}
          <Card
            bordered={false}
            className="mt-6"
            style={{
              background: "#f4f6f9",
              borderRadius: "14px",
              padding: "24px",
            }}
          >
            <Row gutter={[16, 16]} justify="center" align="middle" className="mb-4">
              <Col xs={24} sm={8} md={6}>
                <Select
                  placeholder="Chọn lớp học"
                  style={{ width: "100%" }}
                  onChange={handleSelectClass}
                  value={selectedClass}
                  allowClear
                  options={classes.map((c) => ({
                    label: c.class_name,
                    value: c.class_id,
                  }))}
                />
              </Col>

              <Col xs={24} sm={8} md={6}>
                <Select
                  placeholder="Chọn môn học"
                  style={{ width: "100%" }}
                  onChange={handleSelectSubject}
                  value={selectedSubject}
                  disabled={!selectedClass}
                  allowClear
                  options={subjects.map((s) => ({
                    label: s.subject_name,
                    value: s.subject_id,
                  }))}
                />
              </Col>

              <Col xs={24} sm={8} md={6} className="flex gap-2 justify-center">
                <Button type="primary" onClick={handleFilter}>
                  Lọc
                </Button>
                <Button
                  onClick={() => {
                    // Xóa lựa chọn
                    setSelectedClass(null);
                    setSelectedSubject(null);
                    
                    // Xóa dữ liệu thống kê hiện tại (nếu có)
                    setData({
                      pending: 0,
                      approved: 0,
                      rejected: 0,
                      attendanceByDate: [],
                      attendanceByClass: [],
                    });

                    // Gọi lại API tổng quan ban đầu
                    fetchOverviewData();

                    //message.success("Đã đặt lại dữ liệu ban đầu!");
                  }}
                >
                  Reset
                </Button>
              </Col>
            </Row>

            {/* Các thẻ thống kê */}
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} lg={4}>
                <SummaryCard
                  title="Tổng số buổi điểm danh"
                  value={data?.totalAttendance || 0}
                  icon={<CheckCircleOutlined />}
                  color="text-green-500"
                />
              </Col>
              <Col xs={24} sm={12} lg={4}>
                <SummaryCard
                  title="Có mặt"
                  value={data?.totalPresent || 0}
                  icon={<CheckCircleOutlined />}
                  color="text-blue-500"
                />
              </Col>
              <Col xs={24} sm={12} lg={4}>
                <SummaryCard
                  title="Vắng mặt"
                  value={data?.totalAbsent || 0}
                  icon={<CloseCircleOutlined />}
                  color="text-red-500"
                />
              </Col>
              <Col xs={24} sm={12} lg={4}>
                <SummaryCard
                  title="Đơn nghỉ chưa duyệt"
                  value={data?.pending || 0}
                  icon={<FileTextOutlined />}
                  color="text-yellow-500"
                />
              </Col>
              <Col xs={24} sm={12} lg={4}>
                <SummaryCard
                  title="Đơn đã duyệt"
                  value={data?.approved || 0}
                  icon={<BookOutlined />}
                  color="text-blue-400"
                />
              </Col>
              <Col xs={24} sm={12} lg={4}>
                <SummaryCard
                  title="Đơn bị từ chối"
                  value={data?.rejected || 0}
                  icon={<CloseCircleOutlined />}
                  color="text-gray-500"
                />
              </Col>
            </Row>
          </Card>

          {/* Biểu đồ tròn */}
          <Row gutter={[24, 24]} className="mt-6">
            {/* Biểu đồ điểm danh */}
            <Col xs={24} lg={12}>
              <Card title="Biểu đồ điểm danh" bordered={false}>
                {loading ? (
                  <div className="flex justify-center items-center h-64">
                    <Spin />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        dataKey="value"
                        data={[
                          { name: "Có mặt", value: data.totalPresent },
                          { name: "Vắng mặt", value: data.totalAbsent },
                        ]}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                      >
                        <Cell fill="#00C49F" />
                        <Cell fill="#FF8042" />
                      </Pie>
                      <Tooltip
                        formatter={(value, name, props) => {
                          const total = data.totalPresent + data.totalAbsent;
                          const percent = total ? ((value / total) * 100).toFixed(1) : 0;
                          return [`${value} (${percent}%)`, name];
                        }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </Card>
            </Col>

            {/* Biểu đồ xin nghỉ phép */}
            <Col xs={24} lg={12}>
              <Card title="Biểu đồ xin nghỉ phép" bordered={false}>
                {loading ? (
                  <div className="flex justify-center items-center h-64">
                    <Spin />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        dataKey="value"
                        data={[
                          { name: "Chưa duyệt", value: data.pending },
                          { name: "Đã duyệt", value: data.approved },
                          { name: "Từ chối", value: data.rejected },
                        ]}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                      >
                        <Cell fill="#FFD700" />
                        <Cell fill="#4CAF50" />
                        <Cell fill="#F44336" />
                      </Pie>
                      <Tooltip
                        formatter={(value, name, props) => {
                          const total = data.pending + data.approved + data.rejected;
                          const percent = total ? ((value / total) * 100).toFixed(1) : 0;
                          return [`${value} (${percent}%)`, name];
                        }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </Card>
            </Col>
          </Row>
        </main>
      </Layout>
    </Layout>
  );
}
