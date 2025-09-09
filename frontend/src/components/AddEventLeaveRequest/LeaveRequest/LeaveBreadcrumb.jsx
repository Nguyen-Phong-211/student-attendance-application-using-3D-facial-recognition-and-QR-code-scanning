import React from 'react';
import { Breadcrumb } from 'antd';
import { HomeOutlined, PlusCircleOutlined, AuditOutlined } from '@ant-design/icons';

export default function LeaveBreadcrumb() {
    return (
        <Breadcrumb
            items={[
                { href: "/", title: <><HomeOutlined /> <span>{"Trang chủ"}</span></> },
                { href: '', title: <><PlusCircleOutlined /> <span>Tạo sự kiện</span></> },
                { href: '/add-event/request-leave', title: <><AuditOutlined /> <span>Xin nghỉ phép</span></> },
                { href: '/add-event/request-leave/request', title: 'Tạo đơn xin nghỉ phép' },
            ]}
        />
    );
}