import React, { useState, useEffect } from 'react';
import { Layout, Select, Button, Space, message, Typography, Spin } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import Sidebar from '../../../components/Layout/Sidebar_lecturer';
import Navbar from '../../../components/Layout/Navbar';
import api from '../../../api/axiosInstance';
import { getAccountId } from '../../../utils/auth';
import AttendanceForm from '../Attend/Attendlist';

const { Header } = Layout;
const { Title } = Typography;

export default function ClassManagement() {
  const [collapsed, setCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);

  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);

  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);

  const accountId = getAccountId();

  const fetchClasses = async () => {
    try { 
      setLoading(true);
      const res = await api.get(`lecturers/classes/${accountId}/`);
      setClasses(res.data);
    } catch (error) {
      console.error(error);
      message.error("Lỗi khi tải danh sách lớp học.");
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async (classId) => {
    try {
      setLoading(true);
      const res = await api.get(`lecturers/classes/${classId}/subjects/${accountId}/`);
      setSubjects(res.data);
    } catch (error) {
      console.error(error);
      message.error("Lỗi khi tải danh sách môn học.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "ATTEND 3D - Quản lý lớp học";
    fetchClasses();
  }, []);

  const handleSelectClass = (value) => {
    setSelectedClass(value);
    setSelectedSubject(null);
    fetchSubjects(value);
  };

  const handleSelectSubject = (value) => {
    setSelectedSubject(value);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <Layout>
        <Header className="bg-white px-4 flex justify-between items-center border-b">
          <Navbar />
        </Header>
        <main className="mx-4 my-4 p-4 sm:p-6 bg-white rounded shadow">
          <div className="flex justify-between items-center mb-6">
            <Title level={3} style={{ margin: 0 }}>Quản lý lớp học</Title>
            <Button icon={<ReloadOutlined />} onClick={fetchClasses}>Làm mới</Button>
          </div>
          <Space size="large" className="mb-6" wrap>
            <div>
              <span className="font-semibold mr-2">Chọn lớp học:</span>
              <Select
                placeholder="Chọn lớp"
                style={{ width: 220 }}
                onChange={handleSelectClass}
                value={selectedClass}
                options={classes.map(c => ({ label: c.class_name, value: c.class_id }))}
              />
            </div>
            <div>
              <span className="font-semibold mr-2">Chọn môn học:</span>
              <Select
                placeholder="Chọn môn"
                style={{ width: 220 }}
                onChange={handleSelectSubject}
                value={selectedSubject}
                disabled={!selectedClass}
                options={subjects.map(s => ({ label: s.subject_name, value: s.subject_id }))}
              />
            </div>
          </Space>
          <Spin spinning={loading}>
            {selectedSubject ? (
              <AttendanceForm
                classId={selectedClass}
                subjectId={selectedSubject}
                accountId={accountId} 
              />
            ) : (
              <p className="text-gray-500 italic">Vui lòng chọn lớp học và môn học để xem danh sách sinh viên.</p>
            )}
          </Spin>
        </main>
      </Layout>
    </Layout>
  );
}
