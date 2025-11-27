import React from "react";
import { Card, Row, Col, Select, Button } from "antd";
import { FilterOutlined, SyncOutlined } from "@ant-design/icons";
import DashboardSummaryCard from "../Cards/DashboardSummary";

const StatisticDetailClassSubject = ({
    handleSelectClass,
    selectedClass,
    classes,
    setSelectedSubject,
    selectedSubject,
    subjects,
    handleFilter,
    isFilterLoading,
    handleReset,
    detailedCards,
    loading,
}) => {
    return (
        <Card
            title="Thống kê Chi tiết (Theo Lớp/Môn)"
            className="shadow-xl"
            style={{ borderRadius: "16px" }}
            styles={{ bodyStyle: { padding: "16px"} }}
        >
            <Row
                gutter={[16, 16]}
                align="middle"
                className="mb-6 bg-gray-50 p-4 rounded-xl border border-dashed"
            >
                <Col xs={24} sm={12} md={7}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Chọn Lớp học:
                    </label>
                    <Select
                        placeholder="-- Chọn lớp học --"
                        style={{ width: "100%" }}
                        onChange={handleSelectClass}
                        value={selectedClass}
                        allowClear
                        options={classes.map((c) => ({
                            label: c.class_name,
                            value: c.class_id,
                        }))}
                        size="large"
                        className="custom-select"
                    />
                </Col>

                <Col xs={24} sm={12} md={7}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Chọn Môn học:
                    </label>
                    <Select
                        placeholder="-- Chọn môn học --"
                        style={{ width: "100%" }}
                        onChange={setSelectedSubject}
                        value={selectedSubject}
                        disabled={!selectedClass || subjects.length === 0}
                        allowClear
                        options={subjects.map((s) => ({
                            label: s.subject_name,
                            value: s.subject_id,
                        }))}
                        size="large"
                        notFoundContent={
                            selectedClass
                                ? "Không tìm thấy môn học nào."
                                : "Vui lòng chọn lớp trước."
                        }
                        className="custom-select"
                    />
                </Col>

                <Col
                    xs={24}
                    md={10}
                    className="flex gap-3 justify-end md:justify-start pt-6 md:pt-4"
                >
                    <Button
                        type="primary"
                        onClick={handleFilter}
                        loading={isFilterLoading}
                        disabled={!selectedClass || !selectedSubject}
                        icon={<FilterOutlined />}
                        size="large"
                        className="w-full md:w-auto mt-2"
                    >
                        {isFilterLoading ? "Đang Lọc..." : "Lọc Dữ liệu"}
                    </Button>
                    <Button
                        onClick={handleReset}
                        icon={<SyncOutlined />}
                        size="large"
                        className="w-full md:w-auto mt-2"
                    >
                        Reset
                    </Button>
                </Col>
            </Row>

            <Row gutter={[24, 24]}>
                {detailedCards.map((card, index) => (
                    <Col key={index} xs={24} sm={12} lg={8} xl={4}>
                        <DashboardSummaryCard
                            {...card}
                            loading={loading || isFilterLoading}
                        />
                    </Col>
                ))}
            </Row>
        </Card>
    );
};

export default StatisticDetailClassSubject;