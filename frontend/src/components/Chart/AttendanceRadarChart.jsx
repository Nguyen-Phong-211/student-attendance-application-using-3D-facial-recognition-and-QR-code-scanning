import React from 'react';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function AttendanceRadarChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height="100%" className={'p-4'}>
        <RadarChart outerRadius={80} data={data}>
            <PolarGrid />
            <PolarAngleAxis dataKey="faculty" />
            <Radar name="Điểm danh" dataKey="attendance" stroke="#f59e0b" fill="#fcd34d" fillOpacity={0.6} />
            <Tooltip />
        </RadarChart>
    </ResponsiveContainer>
  );
}