import React, { useEffect, useState, useCallback } from "react";
import { Layout, Card, Row, Col, message } from "antd";
import {
    TeamOutlined,
    UserOutlined,
    CheckCircleOutlined,
    FileTextOutlined,
    BookOutlined,
    CloseCircleOutlined,
} from "@ant-design/icons";
import Sidebar from "../../components/Layout/Sidebar";
import Navbar from "../../components/Layout/Navbar";
import api from "../../api/axiosInstance";
import { getAccountId } from "../../utils/auth";
import DashboardSummaryCard from "../../components/Cards/DashboardSummary";
import StatisticDetailClassSubject from "../../components/Cards/StatisticDetailClassSubject";
import IllustateChartStatistic from "../../components/Cards/IllustrateChartStatistic";

const { Header, Content } = Layout;

export default function LecturerDashboard() {
    const [collapsed, setCollapsed] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isFilterLoading, setIsFilterLoading] = useState(false);
    const [searchValue, setSearchValue] = useState("");

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
    });

    const accountId = getAccountId();

    const fetchOverviewData = async () => {
        try {
            setLoading(true);
            const overviewRes = await api.get("lecturers/dashboard/overview/");
            setData((prev) => ({ ...prev, ...overviewRes.data }));
        } catch (err) {
            console.error("Lỗi tải dữ liệu tổng quan:", err);
            message.error("Không thể tải dữ liệu tổng quan ban đầu.");
        } finally {
            setLoading(false);
        }
    };

    const fetchClasses = useCallback(async () => {
        try {
            const res = await api.get(`attendance/lecturers/classes/${accountId}/`);
            setClasses(res.data);
        } catch (error) {
            console.error(error);
            message.error("Lỗi khi tải danh sách lớp học.");
        }
    }, [accountId]);

    const fetchSubjects = async (classId) => {
        try {
            setSubjects([]);
            setSelectedSubject(null);
            const res = await api.get(
                `attendance/lecturers/classes/${classId}/subjects/${accountId}/`
            );
            setSubjects(res.data);
        } catch (error) {
            console.error(error);
            message.error("Lỗi khi tải danh sách môn học.");
        }
    };

    useEffect(() => {
        document.title = "ATTEND 3D - Dashboard";
        fetchOverviewData();
        fetchClasses();
    }, [fetchClasses]);

    const handleSelectClass = (value) => {
        setSelectedClass(value);
        setSelectedSubject(null);
        if (value) {
            fetchSubjects(value);
        } else {
            setSubjects([]);
        }
    };

    const handleFilter = async () => {
        if (!selectedClass || !selectedSubject) {
            message.warning("Vui lòng chọn **Lớp học** và **Môn học** để lọc.");
            return;
        }

        setIsFilterLoading(true);
        try {
            const statsRes = await api.get("attendance/lecturers/dashboard/statistics/", {
                params: {
                    class_id: selectedClass,
                    subject_id: selectedSubject,
                },
            });

            const leaveRes = await api.get(
                `attendance/lecturers/${accountId}/classes/${selectedClass}/subjects/${selectedSubject}/leave-stats/`
            );

            setData((prev) => ({
                ...prev,
                ...statsRes.data,
                pending: leaveRes.data.pending_requests || 0,
                approved: leaveRes.data.approved_requests || 0,
                rejected: leaveRes.data.rejected_requests || 0,
            }));

            message.success("Đã cập nhật dữ liệu thống kê cho Lớp/Môn đã chọn!");
        } catch (err) {
            console.error("Lỗi lọc dữ liệu:", err);
            message.error("Không thể lọc dữ liệu thống kê.");
        } finally {
            setIsFilterLoading(false);
        }
    };

    const handleReset = () => {
        setSelectedClass(null);
        setSelectedSubject(null);
        setSubjects([]);
        fetchOverviewData();
        message.success("Đã đặt lại về dữ liệu tổng quan!");
    };

    const generalCards = [
        {
            title: "Tổng số lớp đang dạy",
            value: data.totalClasses,
            icon: <TeamOutlined />,
            color: { bg: "bg-blue-100", icon: "text-blue-600" },
        },
        {
            title: "Tổng số môn đang dạy",
            value: data.totalSubjects,
            icon: <BookOutlined />,
            color: { bg: "bg-green-100", icon: "text-green-600" },
        },
        {
            title: "Tổng số sinh viên",
            value: data.totalStudents,
            icon: <UserOutlined />,
            color: { bg: "bg-purple-100", icon: "text-purple-600" },
        },
    ];

    const detailedCards = [
        {
            title: "Tổng số buổi ĐD",
            value: data.totalAttendance,
            icon: <FileTextOutlined />,
            color: { bg: "bg-indigo-100", icon: "text-indigo-600" },
        },
        {
            title: "Có mặt",
            value: data.totalPresent,
            icon: <CheckCircleOutlined />,
            color: { bg: "bg-green-100", icon: "text-green-600" },
        },
        {
            title: "Vắng mặt",
            value: data.totalAbsent,
            icon: <CloseCircleOutlined />,
            color: { bg: "bg-red-100", icon: "text-red-600" },
        },
        {
            title: "Đơn nghỉ (Chưa duyệt)",
            value: data.pending,
            icon: <FileTextOutlined />,
            color: { bg: "bg-yellow-100", icon: "text-yellow-600" },
        },
        {
            title: "Đơn nghỉ (Đã duyệt)",
            value: data.approved,
            icon: <CheckCircleOutlined />,
            color: { bg: "bg-blue-100", icon: "text-blue-600" },
        },
        {
            title: "Đơn nghỉ (Từ chối)",
            value: data.rejected,
            icon: <CloseCircleOutlined />,
            color: { bg: "bg-gray-100", icon: "text-gray-600" },
        },
    ];

    return (
        <Layout style={{ minHeight: "100vh" }}>
            <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
            <Layout>
                <Header className="bg-white px-4 flex justify-between items-center border-b shadow-sm sticky top-0 z-10">
                    <Navbar searchValue={searchValue} setSearchValue={setSearchValue} />
                </Header>

                <Content className="p-6 bg-gray-50">
                    <h1 className="text-3xl font-bold text-gray-800 mb-6">
                        <span role="img" aria-label="dashboard">
                        </span>{" "}
                        Dashboard Giảng viên
                    </h1>

                    <Card
                        title="Tổng quan Chung"
                        className="shadow-xl mb-6"
                        style={{ borderRadius: "16px" }}
                        styles={{ root: { border: 'none' } }}
                    >
                        <Row gutter={[24, 24]}>
                            {generalCards.map((card, index) => (
                                <Col key={index} xs={24} sm={12} lg={8} xl={8}>
                                    <DashboardSummaryCard {...card} loading={loading} />
                                </Col>
                            ))}
                        </Row>
                    </Card>

                    <StatisticDetailClassSubject
                        handleSelectClass={handleSelectClass}
                        selectedClass={selectedClass}
                        classes={classes}
                        setSelectedSubject={setSelectedSubject}
                        selectedSubject={selectedSubject}
                        subjects={subjects}
                        handleFilter={handleFilter}
                        isFilterLoading={isFilterLoading}
                        handleReset={handleReset}
                        detailedCards={detailedCards}
                        loading={loading}
                    />

                    <Row gutter={[24, 24]} className="mt-6">
                        <IllustateChartStatistic
                            attendanceData={[
                                { name: "Đã điểm danh", value: data.totalPresent, color: "#4CAF50" },
                                { name: "Vắng", value: data.totalAbsent, color: "#F44336" },
                            ]}
                            leaveData={[
                                { name: "Chờ duyệt", value: data.pending, color: "#FFC107" },
                                { name: "Được duyệt", value: data.approved, color: "#4CAF50" },
                                { name: "Từ chối", value: data.rejected, color: "#F44336" },
                            ]}
                            loading={loading}
                        />
                    </Row>
                </Content>
            </Layout>
        </Layout>
    );
}