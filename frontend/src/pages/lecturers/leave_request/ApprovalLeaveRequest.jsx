import React, { useEffect, useState, useCallback } from 'react';
import { Layout, Button, message } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import Sidebar from "../../../components/Layout/Sidebar";
import Navbar from '../../../components/Layout/Navbar';
import api from '../../../api/axiosInstance';
import { getAccountId } from '../../../utils/auth';
import TableApprovalListLeaveRequest from '../../../components/Table/ApprovalListLeaveRequest';
import ModalModalLeaveRequestDetail from '../../../components/Modal/LeaveRequestDetail';

const { Header, Content } = Layout;

export default function LeaveRequestList() {
    const [collapsed, setCollapsed] = useState(false);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const lecturerId = getAccountId();

    const fetchRequests = useCallback(
        async () => {
            setLoading(true);
            try {
                const res = await api.get(`/leaves/leave-requests/lecturer/${lecturerId}/`);
                const formatted = res.data;
                setRequests(formatted);
            } catch (err) {
                console.error(err);
                message.error('Không thể tải danh sách đơn nghỉ');
            } finally {
                setLoading(false);
            }
        }, [lecturerId]
    );

    useEffect(() => {
        document.title = 'ATTEND3D - Duyệt đơn nghỉ';
        fetchRequests();
    }, [fetchRequests]);

    const handleView = (record) => {
        setSelectedRequest(record);
        setModalVisible(true);
    };

    const handleCloseModal = () => {
        setSelectedRequest(null);
        setModalVisible(false);
        setRejectReason('');
    };

    const handleApproveClick = async (record) => {
        try {
            await api.put(`/leaves/leave-requests/${record.leave_request_id}/approve/`);
            message.success(`Đã duyệt đơn của ${record.fullname}`);
            fetchRequests();
            setModalVisible(false);
        } catch (err) {
            console.error(err);
            message.error('Duyệt đơn thất bại');
        }
    };

    const handleRejectClick = async (record, reason) => {
        if (!reason?.trim()) {
            message.error('Nhập lý do từ chối');
            return;
        }
        try {
            await api.put(`/leaves/leave-requests/${record.leave_request_id}/reject/`, { rejected_reason: reason });
            message.success(`Đã từ chối đơn của ${record.fullname}`);
            fetchRequests();
            setModalVisible(false);
        } catch (err) {
            console.error(err);
            message.error('Từ chối đơn thất bại');
        }
    };

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
            <Layout>
                <Header className="bg-white px-4 flex justify-between items-center border-b">
                    <Navbar />
                </Header>

                <Content className="mx-4 my-4 p-4 bg-white rounded shadow">
                    <div className="flex justify-between items-center mb-4">
                        <h1 className="text-xl font-semibold">Danh sách đơn xin nghỉ</h1>
                        <Button icon={<ReloadOutlined />} onClick={fetchRequests}>Làm mới</Button>
                    </div>

                    <TableApprovalListLeaveRequest
                        requests={requests}
                        loading={loading}
                        handleView={handleView}
                    />
                </Content>
            </Layout>

            {selectedRequest && (
                <ModalModalLeaveRequestDetail
                    visible={modalVisible}
                    onClose={handleCloseModal}
                    data={selectedRequest}
                    isStudentView={false}
                    isPending={selectedRequest?.status === 'P'}
                    handleApproveClick={() => handleApproveClick(selectedRequest)}
                    handleRejectClick={() => handleRejectClick(selectedRequest, rejectReason)}
                    rejectReason={rejectReason}
                    setRejectReason={setRejectReason}
                />
            )}
        </Layout>
    );
}