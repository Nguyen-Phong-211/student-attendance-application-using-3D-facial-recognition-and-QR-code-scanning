import React from "react";
import { Card } from "antd";
import { Spin } from "antd";

const DashboardSummaryCard = ({ title, value, icon, color, loading }) => (
    <Card
        className="shadow-lg hover:shadow-xl transition-shadow duration-300 transform hover:scale-[1.02]"
        style={{
            borderRadius: "16px",
            height: 140,
        }}
        styles={{ body: { padding: "16px" } }}
    >
        <div className="flex flex-col h-full justify-between">
            <div className="flex items-center justify-start">
                <div className={`p-3 rounded-full ${color.bg} ${color.icon}`}>
                    {React.cloneElement(icon, { style: { fontSize: "20px" } })}
                </div>
                <div className="text-sm font-medium text-gray-500 ml-3">{title}</div>
            </div>
            <div className="text-3xl font-bold mt-2 text-right">
                {loading ? <Spin size="small" /> : value ?? 0}
            </div>
        </div>
    </Card>
);

export default DashboardSummaryCard;