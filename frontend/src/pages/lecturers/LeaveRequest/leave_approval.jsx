import React, { useEffect, useState } from 'react';
import { Layout, Table, Button, Spin, message } from 'antd';
import { EyeOutlined, ReloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import Sidebar from '../../../components/Layout/Sidebar_lecturer';
import Navbar from '../../../components/Layout/Navbar';
import api from '../../../api/axiosInstance';
import LeaveRequestModal from '../LeaveRequest/LeaveRequestModal';

const { Header, Content } = Layout;

export default function LeaveRequestList() {
  const [collapsed, setCollapsed] = useState(false);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const lecturerId = localStorage.getItem('lecturer_id') || 3;

  useEffect(() => {
    document.title = 'ATTEND3D - Duyệt đơn nghỉ';
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/leaves/leave-requests/lecturer/${lecturerId}/`);
      const formatted = res.data.map(r => ({
        id: r.leave_request_id,
        leave_request_code: r.leave_request_code,
        student_id: r.student_id,
        student_name: r.fullname,
        subject_name: r.subject_name,
        class_name: r.class_name || '-',
        start_date: r.from_date,
        end_date: r.to_date,
        reason: r.reason,
        status: r.leave_request_status, 
        attachment: r.attachment,
        rejected_reason: r.rejected_reason,
      }));
      setRequests(formatted);
    } catch (err) {
      console.error(err);
      message.error('Không thể tải danh sách đơn nghỉ');
    } finally {
      setLoading(false);
    }
  };

  const handleView = (record) => {
    setSelectedRequest(record);
    setModalVisible(true);
  };

  const handleApprove = async (record) => {
    try {
      await api.put(`/leaves/leave-requests/${record.id}/approve/`);
      message.success(`Đã duyệt đơn của ${record.student_name}`);
      fetchRequests();
      setModalVisible(false);
    } catch (err) {
      console.error(err);
      message.error('Duyệt đơn thất bại');
    }
  };

  const handleReject = async (record, reason) => {
    try {
      await api.put(`/leaves/leave-requests/${record.id}/reject/`, { rejected_reason: reason });
      message.success(`Đã từ chối đơn của ${record.student_name}`);
      fetchRequests();
      setModalVisible(false);
    } catch (err) {
      console.error(err);
      message.error('Từ chối đơn thất bại');
    }
  };

  const columns = [
    { title: 'Mã yêu cầu', dataIndex: 'leave_request_code', key: 'leave_request_code' },
    { title: 'Mã SV', dataIndex: 'student_id', key: 'student_id' },
    { title: 'Tên SV', dataIndex: 'student_name', key: 'student_name' },
    { title: 'Lớp', dataIndex: 'class_name', key: 'class_name' },
    { title: 'Môn học', dataIndex: 'subject_name', key: 'subject_name' },
    { title: 'Từ ngày', dataIndex: 'start_date', render: d => dayjs(d).format('DD/MM/YYYY') },
    { title: 'Đến ngày', dataIndex: 'end_date', render: d => dayjs(d).format('DD/MM/YYYY') },
    { 
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: s => {
        switch(s) {
          case 'A': return <span style={{color:'green'}}>Đã duyệt</span>;
          case 'R': return <span style={{color:'red'}}>Từ chối</span>;
          case 'P':
          default: return <span style={{color:'orange'}}>Đang chờ</span>;
        }
      }
    },
    {
      title: 'Hành động',
      key: 'actions',
      render: (_, record) => (
        <Button
          icon={<EyeOutlined />}
          type="link"
          onClick={() => handleView(record)}
        >
          Xem
        </Button>
      )
    }
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <Layout>
        <Header className="bg-white px-4 border-b">
          <Navbar />
        </Header>

        <Content className="mx-4 my-4 p-4 bg-white rounded shadow">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl font-semibold">Danh sách đơn xin nghỉ</h1>
            <Button icon={<ReloadOutlined />} onClick={fetchRequests}>Làm mới</Button>
          </div>

          {loading ? (
            <Spin tip="Đang tải dữ liệu..." />
          ) : (
            <Table
              columns={columns}
              dataSource={requests}
              rowKey="id"
              bordered
              pagination={{ pageSize: 10 }}
            />
          )}
        </Content>
      </Layout>

      <LeaveRequestModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        data={selectedRequest}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </Layout>
  );
}
