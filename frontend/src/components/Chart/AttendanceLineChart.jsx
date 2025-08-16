import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function AttendanceLineChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height="100%" className={'p-4'}>
        <LineChart data={data}>
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="attendance" stroke="#6366f1" strokeWidth={2} />
        </LineChart>
    </ResponsiveContainer>
  );
}
