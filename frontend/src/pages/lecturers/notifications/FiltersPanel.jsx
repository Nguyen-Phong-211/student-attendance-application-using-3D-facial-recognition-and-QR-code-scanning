import React from 'react';
import { Button, DatePicker } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';

const { RangePicker } = DatePicker;

export default function FiltersPanel({
    dateRange, setDateRange,
    readStatus, setReadStatus,
    fetchNotifications,
    selectedRowKeys,
    handleMarkAsRead
}) {
    return (
        <div className="flex flex-wrap gap-2 items-center mb-4">
            <RangePicker
                onChange={(dates) => setDateRange(dates || [])}
                format="DD/MM/YYYY"
                className="w-full sm:w-auto"
            />
            <Button
                type={readStatus === 'all' ? 'primary' : 'default'}
                onClick={() => setReadStatus('all')}
            >
                Tất cả
            </Button>
            <Button
                type={readStatus === 'read' ? 'primary' : 'default'}
                onClick={() => setReadStatus('read')}
            >
                Đã đọc
            </Button>
            <Button
                type={readStatus === 'unread' ? 'primary' : 'default'}
                onClick={() => setReadStatus('unread')}
            >
                Chưa đọc
            </Button>
            <Button icon={<ReloadOutlined />} onClick={fetchNotifications}>
                Làm mới
            </Button>
            <Button
                type="default"
                disabled={selectedRowKeys.length === 0}
                onClick={handleMarkAsRead}
            >
                Đánh dấu đã đọc
            </Button>
        </div>
    );
}