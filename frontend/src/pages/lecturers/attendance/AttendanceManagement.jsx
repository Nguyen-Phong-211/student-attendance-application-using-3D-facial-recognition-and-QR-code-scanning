import React, { useState, useEffect, useCallback } from 'react';
import { Layout, Select, Button, Space, message, Typography, DatePicker } from 'antd';
import { ReloadOutlined, FileExcelOutlined } from '@ant-design/icons';
import Sidebar from "../../../components/Layout/Sidebar";
import Navbar from '../../../components/Layout/Navbar';
import api from '../../../api/axiosInstance';
import { getAccountId } from '../../../utils/auth';
import dayjs from 'dayjs';
import FullScreenLoader from '../../../components/Spin/Spin';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import TableAttendanceListStudent from '../../../components/Table/AttendanceListStudent';

const { Header } = Layout;
const { Title } = Typography;

export default function AttendanceManagement() {
    const [collapsed, setCollapsed] = useState(false);
    const [loading, setLoading] = useState(false);

    const [classes, setClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState(null);

    const [subjects, setSubjects] = useState([]);
    const [selectedSubject, setSelectedSubject] = useState(null);

    const [selectedDate, setSelectedDate] = useState(dayjs());

    const [attendanceData, setAttendanceData] = useState([]);

    const [searchText, setSearchText] = useState("");
    const [searchedColumn, setSearchedColumn] = useState("");

    const accountId = getAccountId();

    // Fetch classes
    const fetchClasses = useCallback(async () => {
        try {
            setLoading(true);
            const res = await api.get(`attendance/lecturers/classes/${accountId}/`);
            setClasses(res.data);
        } catch (error) {
            console.error(error);
            message.error("Lỗi khi tải danh sách lớp học.");
        } finally {
            setLoading(false);
        }
    }, [accountId]);

    // Fetch subjects
    const fetchSubjects = async (classId) => {
        try {
            setLoading(true);
            const res = await api.get(`attendance/lecturers/filter/${classId}/subjects/${accountId}/`);
            setSubjects(res.data);
        } catch (error) {
            console.error(error);
            message.error("Lỗi khi tải danh sách môn học.");
        } finally {
            setLoading(false);
        }
    };

    // Fetch attendance
    const fetchAttendance = async () => {
        if (!selectedClass || !selectedSubject) {
            return message.warning("Vui lòng chọn lớp và môn.");
        }

        const dateParam = selectedDate ? selectedDate.format("YYYY-MM-DD") : null;

        try {
            setLoading(true);

            const res = await api.get("/attendance/lecturer/filter/by/list/student/", {
                params: {
                    subject_id: selectedSubject,
                    class_id: selectedClass,
                    account_id: accountId,
                    date: dateParam
                }
            });

            setAttendanceData(res.data);
            message.success("Tải dữ liệu điểm danh thành công!");

        } catch (error) {
            console.error(error);
            message.error("Lỗi khi tải dữ liệu điểm danh!");
        } finally {
            setLoading(false);
        }
    };

    const excelColumns = [
        { label: "Mã sinh viên", key: "student_code" },
        { label: "Họ tên", key: "fullname" },
        { label: "Môn học", key: "subject_name" },
        { label: "Lớp", key: "class_name" },
        { label: "Hình thức điểm danh", key: "attendance_type" },
        { label: "Thời gian điểm danh", key: "checkin_at" },
        { label: "Trạng thái", key: "attendance_status" },
    ];

    const random10Digits = () => {
        return Math.floor(1000000000 + Math.random() * 9000000000); 
    };

    // Export Excel
    const exportExcel = () => {
        if (attendanceData.length === 0) {
            return message.warning("Không có dữ liệu để xuất Excel!");
        }

        const exportData = attendanceData.map(item => {
            let obj = {};

            excelColumns.forEach(col => {
                if (col.key === "attendance_type") {
                    obj[col.label] = item[col.key] === "Q" ? "QR Code" : "Khuôn mặt";
                }
                else if (col.key === "attendance_status") {
                    obj[col.label] =
                        item[col.key] === "P" ? "Có mặt" :
                        item[col.key] === "A" ? "Vắng" :
                        "Muộn";
                }
                else if (col.key === "checkin_at") {
                    obj[col.label] = dayjs(item[col.key]).format("DD/MM/YYYY HH:mm");
                }
                else {
                    obj[col.label] = item[col.key];
                }
            });

            return obj;
        });

        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");

        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
        const subjectName = subjects.find(s => s.subject_id === selectedSubject)?.subject_name || "MonHoc";
        const fileName = `${subjectName.replace(/\s+/g, "_")}_${dayjs().format("HHmmssDDMMYYYY")}_${random10Digits()}.xlsx`;
        saveAs(blob, fileName);
    };

    useEffect(() => {
        document.title = "ATTEND 3D - Điểm danh sinh viên";
        fetchClasses();
    }, [fetchClasses]);

    const updateStatus = async (attendanceId, newStatus) => {
        try {
            setLoading(true);
            await api.patch(`/attendance/update/status/${attendanceId}/`, {
                status: newStatus
            });

            message.success("Cập nhật trạng thái thành công!");

            setAttendanceData(prev =>
                prev.map(item =>
                    item.attendance_id === attendanceId
                        ? { ...item, attendance_status: newStatus }
                        : item
                )
            );

        } catch (error) {
            console.error(error);
            message.error("Lỗi khi cập nhật trạng thái!");
        } finally {
            setLoading(false);
        }
    };

    const handleSelectClass = (value) => {
        setSelectedClass(value);
        setSelectedSubject(null);
        setAttendanceData([]);
        setSearchText("");
        setSearchedColumn("");
        fetchSubjects(value);
    };

    const handleSelectSubject = (value) => {
        setSelectedSubject(value);
        setAttendanceData([]);
        setSearchText("");
        setSearchedColumn("");
    };

    const handleChangeDate = (date) => {
        setSelectedDate(date);
        setAttendanceData([]);
        setSearchText("");
        setSearchedColumn("");
    };

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
            <Layout>
                <Header className="bg-white px-4 flex justify-between items-center border-b">
                    <Navbar />
                </Header>

                <main className="mx-4 my-4 p-4 sm:p-6 bg-white rounded shadow">
                    <div className="flex justify-between items-center mb-6">
                        <Title level={3} style={{ margin: 0 }}>Quản lý lớp học</Title>
                        <Button icon={<ReloadOutlined />} onClick={fetchClasses}>Làm mới</Button>
                    </div>

                    <Space size="large" className="mb-6" wrap>
                        <div>
                            <span className="font-semibold mr-2">Chọn lớp học:</span>
                            <Select
                                placeholder="Chọn lớp"
                                style={{ width: 200 }}
                                onChange={handleSelectClass}
                                value={selectedClass}
                                options={classes.map(c => ({ label: c.class_name, value: c.class_id }))}
                                className='custom-select'
                            />
                        </div>

                        <div>
                            <span className="font-semibold mr-2">Chọn môn học:</span>
                            <Select
                                placeholder="Chọn môn"
                                style={{ width: 200 }}
                                onChange={handleSelectSubject}
                                value={selectedSubject}
                                disabled={!selectedClass}
                                options={subjects.map(s => ({ label: s.subject_name, value: s.subject_id }))}
                                className='custom-select'
                            />
                        </div>

                        <div>
                            <span className="font-semibold mr-2">Thời gian:</span>
                            <DatePicker
                                format="DD/MM/YYYY"
                                style={{ width: 150 }}
                                value={selectedDate}
                                onChange={handleChangeDate}
                            />
                        </div>

                        <div>
                            <Button type='primary' onClick={fetchAttendance}>
                                Sử dụng bộ lọc
                            </Button>
                        </div>

                        <div>
                            <Button type="default" icon={<FileExcelOutlined />} onClick={exportExcel}>
                                Xuất Excel
                            </Button>
                        </div>
                    </Space>

                    <TableAttendanceListStudent
                        attendanceData={attendanceData}
                        loading={loading}
                        searchText={searchText}
                        setSearchText={setSearchText}
                        searchedColumn={searchedColumn}
                        setSearchedColumn={setSearchedColumn}
                        updateStatus={updateStatus}
                    />
                </main>
            </Layout>

            <FullScreenLoader loading={loading} />
        </Layout>
    );
}