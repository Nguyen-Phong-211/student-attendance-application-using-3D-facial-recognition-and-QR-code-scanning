// NotificationTable.js
import React, { useRef } from 'react';
import { Table, Input, Button, Space } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';

export default function NotificationTable({
    filteredNotifications,
    loading,
    selectedRowKeys,
    onSelectChange,
    columns,
    searchText,
    setSearchText,
    searchedColumn,
    setSearchedColumn
}) {
    const searchInput = useRef(null);

    const getColumnSearchProps = dataIndex => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
            <div style={{ padding: 8 }}>
                <Input
                    ref={searchInput}
                    placeholder={`Tìm ${dataIndex}`}
                    value={selectedKeys[0]}
                    onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
                    style={{ width: 188, marginBottom: 8, display: 'block' }}
                />
                <Space>
                    <Button
                        type="primary"
                        icon={<SearchOutlined />}
                        size="small"
                        onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
                    >
                        Tìm
                    </Button>
                    <Button onClick={() => handleReset(clearFilters)} size="small">
                        Xoá
                    </Button>
                </Space>
            </div>
        ),
        filterIcon: filtered => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
        onFilter: (value, record) =>
            record[dataIndex]?.toString().toLowerCase().includes(value.toLowerCase()),
        render: text =>
            searchedColumn === dataIndex ? (
                <Highlighter
                    highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
                    searchWords={[searchText]}
                    autoEscape
                    textToHighlight={text ? text.toString() : ''}
                />
            ) : text
    });

    const handleSearch = (selectedKeys, confirm, dataIndex) => {
        confirm();
        setSearchText(selectedKeys[0]);
        setSearchedColumn(dataIndex);
    };

    const handleReset = clearFilters => {
        clearFilters();
        setSearchText('');
    };

    const tableColumns = columns.map(col => {
        if (['title', 'content'].includes(col.dataIndex)) {
            return { ...col, ...getColumnSearchProps(col.dataIndex) };
        }
        return col;
    });

    return (
        <Table
            rowKey="notification_id"
            columns={tableColumns}
            dataSource={filteredNotifications}
            loading={loading}
            rowSelection={{
                selectedRowKeys,
                onChange: onSelectChange
            }}
            pagination={{ pageSize: 10 }}
            bordered
            scroll={{ x: 'max-content' }}
        />
    );
}