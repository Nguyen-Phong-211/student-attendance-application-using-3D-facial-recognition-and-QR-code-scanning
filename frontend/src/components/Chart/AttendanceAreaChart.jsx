import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function AttendanceAreaChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height="100%" className={'p-4'}>
        <AreaChart data={data}>
            <XAxis dataKey="class" />
            <YAxis />
            <Tooltip />
            <Area type="monotone" dataKey="total" stroke="#0ea5e9" fill="#bae6fd" />
        </AreaChart>
    </ResponsiveContainer>
  );
}