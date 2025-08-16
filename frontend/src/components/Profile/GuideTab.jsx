import React from "react";
import { Typography } from "antd";

const { Title } = Typography;

export default function GuideTab() {
    return (
        <div className="bg-white p-6 rounded-xl border">
            <Title level={4}>Hướng dẫn sử dụng</Title>
            <p className="text-gray-500">Hướng dẫn chi tiết...</p>
        </div>
    );
}