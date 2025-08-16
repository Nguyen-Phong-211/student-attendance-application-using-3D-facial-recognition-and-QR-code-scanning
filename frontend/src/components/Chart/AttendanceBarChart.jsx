import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function AttendanceBarChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height="100%" className={'p-4'}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="attendance" fill="#3b82f6" />
      </BarChart>
    </ResponsiveContainer>
  );
}