import React, { useState, useEffect } from 'react';
import { Layout } from 'antd';
import { useTranslation } from 'react-i18next';
import AttendanceBarChart from '../../components/Chart/AttendanceBarChart';
import AttendancePieChart from '../../components/Chart/AttendancePieChart';
import AttendanceLineChart from '../../components/Chart/AttendanceLineChart';
import AttendanceAreaChart from '../../components/Chart/AttendanceAreaChart';
import AttendanceRadarChart from '../../components/Chart/AttendanceRadarChart';
import Sidebar from '../../components/Layout/Sidebar';
import Navbar from '../../components/Layout/Navbar';

const { Header } = Layout;

export default function Dashboard() {
    const { t } = useTranslation();
    const [collapsed, setCollapsed] = useState(false);
    const [searchValue, setSearchValue] = useState('');

    useEffect(() => {
        document.title = "ATTEND 3D - Dashboard";
    }, [t]);

    const summaryCards = [
        { icon: 'fas fa-users', color: 'text-blue-500', label: t('Total Students'), value: '1200' },
        { icon: 'fas fa-check-circle', color: 'text-green-500', label: t('Total Attendance Records'), value: '8450' },
        { icon: 'fas fa-calendar-check', color: 'text-yellow-500', label: t('Today\'s Attendance Rate'), value: '92%' },
        { icon: 'fas fa-exclamation-triangle', color: 'text-red-500', label: t('Failed Scans'), value: '12' },
    ];

    const attendanceData = [
        { name: 'Mon', attendance: 95 },
        { name: 'Tue', attendance: 88 },
        { name: 'Wed', attendance: 92 },
        { name: 'Thu', attendance: 85 },
        { name: 'Fri', attendance: 90 },
    ];

    const pieData = [
        { name: 'Đi học', value: 320 },
        { name: 'Vắng mặt', value: 80 },
    ];

    const lineData = [
        { date: '01/06', attendance: 90 },
        { date: '02/06', attendance: 85 },
        { date: '03/06', attendance: 88 },
        { date: '04/06', attendance: 92 },
        { date: '05/06', attendance: 87 },
    ];

    const areaData = [
        { class: 'Lớp A', total: 150 },
        { class: 'Lớp B', total: 180 },
        { class: 'Lớp C', total: 200 },
        { class: 'Lớp D', total: 170 },
    ];

    const radarData = [
        { faculty: 'CNTT', attendance: 98 },
        { faculty: 'Kinh tế', attendance: 85 },
        { faculty: 'Ngôn ngữ', attendance: 75 },
        { faculty: 'Luật', attendance: 90 },
        { faculty: 'Xã hội', attendance: 80 },
    ];

    console.log(localStorage.getItem('access_token'));

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} t={t} />

            <Layout>
                <Header className="bg-white px-4 flex flex-col sm:flex-row justify-between items-center gap-4 py-3 border-b">
                    <Navbar
                        searchValue={searchValue}
                        setSearchValue={setSearchValue}
                    />
                </Header>

                <main className="mx-4 my-4 p-4 sm:p-6 bg-white rounded shadow">
                    <h1 className="text-2xl font-bold mb-6">{t('Welcome to Dashboard')}</h1>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        {summaryCards.map((card, i) => (
                            <div key={i} className="p-4 rounded shadow flex items-center bg-white">
                                <div className={`text-3xl ${card.color} mr-4`}>
                                    <i className={card.icon}></i>
                                </div>
                                <div>
                                    <p className="text-sm">{card.label}</p>
                                    <p className="text-xl font-semibold">{card.value}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="w-full h-64 bg-white rounded shadow p-6 mb-4">
                        <h2 className="text-lg font-semibold mb-2">Thống kê điểm danh trong tuần</h2>
                        <AttendanceBarChart data={attendanceData} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="w-full h-64 bg-white rounded shadow p-6">
                            <h2 className="text-lg font-semibold mb-2">Tỉ lệ điểm danh</h2>
                            <AttendancePieChart data={pieData} />
                        </div>

                        <div className="w-full h-64 bg-white rounded shadow p-6">
                            <h2 className="text-lg font-semibold mb-2">Xu hướng điểm danh theo ngày</h2>
                            <AttendanceLineChart data={lineData} />
                        </div>
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
                        <div className="w-full h-64 bg-white rounded shadow p-6">
                            <h2 className="text-lg font-semibold mb-2">Điểm danh theo lớp</h2>
                            <AttendanceAreaChart data={areaData} />
                        </div>

                        <div className="w-full h-64 bg-white rounded shadow p-6">
                            <h2 className="text-lg font-semibold mb-2">So sánh điểm danh giữa các khoa</h2>
                            <AttendanceRadarChart data={radarData} />
                        </div>
                    </div>
                </main>
            </Layout>
        </Layout>
    );
}
