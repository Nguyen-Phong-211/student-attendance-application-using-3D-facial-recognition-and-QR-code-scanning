import React from "react";
import { Table, Button, Tag, Select } from "antd";
import Highlighter from "react-highlight-words";
import { SearchOutlined } from "@ant-design/icons";
import dayjs from 'dayjs';

const TableAttendanceListStudent = ({ loading, updateStatus, attendanceData, handleSearch, handleReset, searchedColumn, searchText }) => {

    const getColumnSearchProps = (dataIndex) => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
            <div style={{ padding: 8 }}>
                <input
                    placeholder={`Tìm kiếm ${dataIndex}`}
                    value={selectedKeys[0]}
                    onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onKeyDown={e => {
                        if (e.key === 'Enter') handleSearch(selectedKeys, confirm, dataIndex);
                    }}
                    style={{ marginBottom: 8, display: "block", padding: 6, width: 188 }}
                />

                <Button
                    type="primary"
                    icon={<SearchOutlined />}
                    size="small"
                    style={{ width: 90, marginRight: 8 }}
                    onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
                >
                    Tìm
                </Button>

                <Button
                    size="small"
                    style={{ width: 90 }}
                    onClick={() => handleReset(clearFilters)}
                >
                    Xóa
                </Button>
            </div>
        ),

        filterIcon: (filtered) => (
            <SearchOutlined style={{ color: filtered ? "#1677ff" : undefined }} />
        ),

        onFilter: (value, record) =>
            record[dataIndex]?.toString().toLowerCase().includes(value.toLowerCase()),

        render: (text) =>
            searchedColumn === dataIndex ? (
                <Highlighter
                    highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
                    searchWords={[searchText]}
                    autoEscape
                    textToHighlight={text ? text.toString() : ""}
                />
            ) : (
                text
            )
    });

    const columns = [
        {
            title: "Mã sinh viên",
            dataIndex: "student_code",
            key: "student_code",
            sorter: (a, b) => a.student_code.localeCompare(b.student_code),
            ...getColumnSearchProps("student_code")
        },
        {
            title: "Họ tên",
            dataIndex: "fullname",
            key: "fullname",
            sorter: (a, b) => a.fullname.localeCompare(b.fullname),
            ...getColumnSearchProps("fullname")
        },
        {
            title: "Môn học",
            dataIndex: "subject_name",
            key: "subject_name",
            ...getColumnSearchProps("subject_name")
        },
        {
            title: "Lớp",
            dataIndex: "class_name",
            key: "class_name",
            ...getColumnSearchProps("class_name")
        },
        {
            title: "Hình thức điểm danh",
            dataIndex: "attendance_type",
            key: "attendance_type",
            render: (value) =>
                value === "Q" ? (
                    <Tag color="blue">QR Code</Tag>
                ) : (
                    <Tag color="purple">Khuôn mặt</Tag>
                ),
        },
        {
            title: "Giờ điểm danh",
            dataIndex: "checkin_at",
            key: "checkin_at",
            render: (value) => dayjs(value).format("DD/MM/YYYY HH:mm")
        },
        {
            title: "Trạng thái",
            dataIndex: "attendance_status",
            key: "attendance_status",
            render: (value, record) => (
                <Select
                    defaultValue={value}
                    style={{ width: 120 }}
                    onChange={(val) => updateStatus(record.attendance_id, val)}
                    className='custom-select'
                    options={[
                        { label: "Có mặt", value: "P" },
                        { label: "Vắng", value: "A" },
                        { label: "Muộn", value: "L" },
                    ]}
                />
            ),
        },
    ];

    return (
        <Table
            dataSource={attendanceData.map((item, index) => ({
                key: index,
                ...item
            }))}
            loading={loading}
            columns={columns}
            pagination={{ pageSize: 10 }}
            bordered
            scroll={{ x: 'max-content' }}
        />
    );
};

export default TableAttendanceListStudent;