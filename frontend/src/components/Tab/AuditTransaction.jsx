import React from "react";
import { Tabs, Table, Button } from "antd";
import { ReloadOutlined } from '@ant-design/icons';

const { TabPane } = Tabs;

const TabAuditTransaction = ({
    fetchAuditLogs, loading, columnsAuditLogs, auditLogs,
    fetchLoginLogs, loginLogs, columnsLoginLogs
}) => {
    return (
        <Tabs defaultActiveKey="auditTransactions">
            <TabPane tab="Giám sát thao tác người dùng" key="auditTransactions">
                <div className="flex justify-end mb-3">
                    <Button
                        icon={<ReloadOutlined />}
                        onClick={fetchAuditLogs}
                        loading={loading}
                    >
                        Làm mới
                    </Button>
                </div>

                <Table
                    rowKey={"log_id"}
                    columns={columnsAuditLogs}
                    dataSource={auditLogs}
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                    bordered
                    scroll={{ x: 'max-content' }}
                />
            </TabPane>

            <TabPane tab="Giám sát đăng nhập người dùng" key="auditLogin">
                <div className="flex justify-end mb-3">
                    <Button
                        icon={<ReloadOutlined />}
                        onClick={fetchLoginLogs}
                        loading={loading}
                    >
                        Làm mới
                    </Button>
                </div>

                <Table
                    rowKey="login_code"
                    columns={columnsLoginLogs}
                    dataSource={loginLogs}
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                    bordered
                    scroll={{ x: 'max-content' }}
                />
            </TabPane>
        </Tabs>
    );
};

export default TabAuditTransaction;