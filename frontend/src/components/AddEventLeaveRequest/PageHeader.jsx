import React from 'react';
import { Typography } from 'antd';

const { Title } = Typography;

export default function PageHeader({ text }) {
    return <Title level={3}>{text}</Title>;
}