import React from "react";
import { Card, Col, Spin } from "antd";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const IllustrateChartStatistic = ({ attendanceData = [], leaveData = [], loading = false }) => {
    return (
        <>
            {/* Biểu đồ điểm danh */}
            <Col xs={24} lg={12}>
                <Card title="Tỷ lệ Điểm danh" className="shadow-xl" style={{ borderRadius: "16px" }}>
                    {loading ? (
                        <div className="flex justify-center items-center h-72">
                            <Spin size="large" />
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    dataKey="value"
                                    data={attendanceData || []} // đảm bảo không undefined
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                                >
                                    {attendanceData?.map((entry, index) => (
                                        <Cell key={index} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </Card>
            </Col>

            {/* Biểu đồ xin nghỉ phép */}
            <Col xs={24} lg={12}>
                <Card title="Tình trạng Đơn xin nghỉ phép" className="shadow-xl" style={{ borderRadius: "16px" }}>
                    {loading ? (
                        <div className="flex justify-center items-center h-72">
                            <Spin size="large" />
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    dataKey="value"
                                    data={leaveData || []} // đảm bảo không undefined
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                                >
                                    {leaveData?.map((entry, index) => (
                                        <Cell key={index} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </Card>
            </Col>
        </>
    );
};

export default IllustrateChartStatistic;