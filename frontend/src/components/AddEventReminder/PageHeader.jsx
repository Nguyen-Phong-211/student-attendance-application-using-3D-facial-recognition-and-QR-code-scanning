import React from "react";
import { Breadcrumb } from "antd";
import { HomeOutlined, PlusCircleOutlined } from "@ant-design/icons";

export default function PageHeader() {
    return (
        <div className="w-full px-4">
            <Breadcrumb
                items={[
                    { href: '/', title: <HomeOutlined /> },
                    {
                        href: '/add-event/add-reminder',
                        title: <>
                            <PlusCircleOutlined /> <span>Tạo sự kiện</span>
                        </>
                    },
                    { title: 'Tạo nhắc điểm danh' },
                ]}
            />
        </div>
    );
}