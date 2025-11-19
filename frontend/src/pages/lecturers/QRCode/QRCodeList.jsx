import React, { useEffect, useState } from 'react';
import {Layout,Table,Button,Form,DatePicker,TimePicker,Select, Spin,App} from 'antd';
import { ReloadOutlined, DownloadOutlined, PlusOutlined } from '@ant-design/icons';
import { QRCodeCanvas } from 'qrcode.react';
import Sidebar from '../../../components/Layout/Sidebar_lecturer';
import Navbar from '../../../components/Layout/Navbar';
import * as XLSX from 'xlsx';
import api from '../../../api/axiosInstance';
import dayjs from 'dayjs';
import CreateQRModal from '../QRCode/QRCodeCreate';

const { Header } = Layout;

export default function QRCodeList() {
  const [collapsed, setCollapsed] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [qrData, setQrData] = useState(null);
  const [form] = Form.useForm();
  const { message } = App.useApp(); // ✅ Lấy message đúng cách

  useEffect(() => {
    document.title = 'ATTEND3D - Danh sách buổi học QR';
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const response = await api.get('/lecturers/attendance/sessions'); // ✅ bỏ dấu / cuối
      setSessions(response.data);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      message.error('Lỗi khi tải dữ liệu buổi học');
    } finally {
      setLoading(false);
    }
  };

  const exportExcel = () => {
    const excelData = sessions.map(s => ({
      'Mã lớp': s.class_id,
      'Tên lớp': s.class_name,
      'Tên môn học': s.subject_name,
      'Giảng viên': s.lecturer_name,
      'Phòng học': s.room_name,
      'Ngày / Thời gian': `${s.date} ${s.time}`,
      'Số sinh viên đã điểm danh': s.attendance_count
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Buổi học QR');
    XLSX.writeFile(workbook, `danh_sach_qr_${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  const handleCreateQR = () => {
    form.validateFields()
      .then(values => {
        const selectedSession = sessions.find(s =>
          s.class_id === values.class_id &&
          s.subject_name === values.subject_name &&
          s.lecturer_name === values.lecturer_name
        );

        if (selectedSession) {
          setQrData({
            class_id: selectedSession.class_id,
            class_name: selectedSession.class_name,
            subject_name: selectedSession.subject_name,
            lecturer_name: selectedSession.lecturer_name,
            room_name: selectedSession.room_name,
            date: values.date.format('YYYY-MM-DD'),
            time: values.time.format('HH:mm'),
            session_id: selectedSession.session_id
          });
        } else {
          message.error('Không tìm thấy thông tin buổi học phù hợp');
        }
      })
      .catch(() => {
        message.error('Vui lòng kiểm tra lại thông tin');
      });
  };

  const columns = [
    { title: 'Mã lớp', dataIndex: 'class_id', key: 'class_id' },
    { title: 'Tên lớp', dataIndex: 'class_name', key: 'class_name' },
    { title: 'Tên môn học', dataIndex: 'subject_name', key: 'subject_name' },
    { title: 'Giảng viên', dataIndex: 'lecturer_name', key: 'lecturer_name' },
    { title: 'Phòng học', dataIndex: 'room_name', key: 'room_name' },
    { title: 'Ngày / Thời gian', dataIndex: 'date', key: 'date', render: (_, record) => `${record.date} ${record.time}` },
    {
      title: 'QR Code',
      dataIndex: 'qr_code_url',
      key: 'qr_code',
      render: url => url ? <img src={url} alt="QR" style={{ width: 80, height: 80 }} /> : '-'
    },
    { title: 'Số SV đã điểm danh', dataIndex: 'attendance_count', key: 'attendance_count' },
  ];

  const selectedClassId = Form.useWatch('class_id', form);
  const selectedSubjectName = Form.useWatch('subject_name', form);

  const classOptions = [...new Map(
    sessions.map(s => [s.class_id, { label: `${s.class_id} - ${s.class_name}`, value: s.class_id }])
  ).values()];

  const subjectOptions = selectedClassId
    ? [...new Map(
        sessions.filter(s => s.class_id === selectedClassId)
                .map(s => [s.subject_name, { label: s.subject_name, value: s.subject_name }])
      ).values()]
    : [];

  const lecturerOptions = selectedClassId && selectedSubjectName
    ? [...new Map(
        sessions.filter(s => s.class_id === selectedClassId && s.subject_name === selectedSubjectName)
                .map(s => [s.lecturer_name, { label: s.lecturer_name, value: s.lecturer_name }])
      ).values()]
    : [];

  const handleLecturerChange = (lecturerName) => {
    const selected = sessions.find(s =>
      s.class_id === selectedClassId &&
      s.subject_name === selectedSubjectName &&
      s.lecturer_name === lecturerName
    );
    if (selected) {
      form.setFieldsValue({
        room_name: selected.room_name,
        date: dayjs(selected.date),
        time: dayjs(selected.time, 'HH:mm')
      });
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <Layout>
        <Header className="bg-white px-4 border-b">
          <Navbar />
        </Header>
        <main className="mx-4 my-4 p-4 bg-white rounded shadow">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl font-semibold">Danh sách buổi học - QR điểm danh</h1>
            <div className="flex gap-2">
              <Button icon={<ReloadOutlined />} onClick={fetchSessions}>Làm mới</Button>
              <Button icon={<PlusOutlined />} type="primary" onClick={() => { setIsModalVisible(true); setQrData(null); form.resetFields(); }}>Tạo QR</Button>
              <Button icon={<DownloadOutlined />} type="primary" onClick={exportExcel}>Xuất Excel</Button>
            </div>
          </div>

          {loading ? <Spin tip="Đang tải dữ liệu..." /> : (
            <Table
              columns={columns}
              dataSource={sessions}
              rowKey="session_id"
              bordered
              pagination={{ pageSize: 10 }}
              scroll={{ x: 'max-content' }}
            />
          )}

          <CreateQRModal
            isModalVisible={isModalVisible}
            setIsModalVisible={setIsModalVisible}
            form={form}
            classOptions={classOptions}
            subjectOptions={subjectOptions}
            lecturerOptions={lecturerOptions}
            selectedClassId={selectedClassId}
            selectedSubjectName={selectedSubjectName}
            handleLecturerChange={handleLecturerChange}
            handleCreateQR={handleCreateQR}
            qrData={qrData}
          />
        </main>
      </Layout>
    </Layout>
  );
}
