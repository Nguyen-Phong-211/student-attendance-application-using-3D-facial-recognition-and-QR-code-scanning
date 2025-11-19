import React, { useEffect, useState, useCallback } from 'react';
import { Modal, Form, Select, Input, DatePicker, TimePicker, Button, App } from 'antd';
import { QRCodeCanvas } from 'qrcode.react';
import api from '../../../api/axiosInstance';

export default function CreateQRModal({ isModalVisible, setIsModalVisible, handleCreateQR, qrData }) {
  const [form] = Form.useForm();
  const { message } = App.useApp(); // lấy message từ context

  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [lecturers, setLecturers] = useState([]);

  const [selectedClassId, setSelectedClassId] = useState(null);
  const [selectedSubjectName, setSelectedSubjectName] = useState(null);

  useEffect(() => {
    if (isModalVisible) {
      fetchClasses();
      form.resetFields();
      setSubjects([]);
      setLecturers([]);
      setSelectedClassId(null);
      setSelectedSubjectName(null);
    }
  }, [isModalVisible]);

  const fetchClasses = useCallback(async () => {
    try {
      const res = await api.get('/lecturers/attendance/classes');
      const data = res.data || [];
      setClasses(
        data.map(c => ({
          label: c.class_name,
          value: c.class_id,
        }))
      );
    } catch (err) {
      console.error('Fetch classes error:', err);
      message.error('Không thể tải danh sách lớp');
      setClasses([]);
    }
  }, [message]);

  const handleClassChange = useCallback(async (classId) => {
    form.resetFields(['subject_name', 'lecturer_name', 'room_name', 'date', 'time']);
    setSelectedClassId(classId);
    setSelectedSubjectName(null);
    setSubjects([]);
    setLecturers([]);

    if (!classId) return;

    try {
      const res = await api.get(`/lecturers/attendance/subjects?class_id=${classId}`);
      const data = res.data || [];
      setSubjects(
        data.map(s => ({
          label: s.subject_name,
          value: s.subject_name,
        }))
      );
    } catch (err) {
      console.error('Fetch subjects error:', err);
      message.error('Không thể tải danh sách môn học');
      setSubjects([]);
    }
  }, [form, message]);

  const handleSubjectChange = useCallback(async (subjectName) => {
    form.resetFields(['lecturer_name', 'room_name', 'date', 'time']);
    setSelectedSubjectName(subjectName);
    setLecturers([]);

    if (!subjectName || !selectedClassId) return;

    try {
      const res = await api.get(
        `/lecturers/attendance/lecturers?subject_name=${encodeURIComponent(subjectName)}&class_id=${selectedClassId}`
      );

      const lecturerList = (res.data.lecturers || []).map(l => ({
        label: l.lecturer_name,
        value: l.lecturer_name,
      }));

      setLecturers(lecturerList);

      if (res.data.room_name) {
        form.setFieldsValue({ room_name: res.data.room_name });
      }
    } catch (err) {
      console.error('Fetch lecturers error:', err);
      message.error('Không thể tải danh sách giảng viên');
      setLecturers([]);
    }
  }, [form, message, selectedClassId]);

  return (
    <Modal
      title="Tạo QR điểm danh"
      open={isModalVisible}
      onCancel={() => setIsModalVisible(false)}
      footer={[
        <Button key="cancel" onClick={() => setIsModalVisible(false)}>
          Đóng
        </Button>,
        <Button key="create" type="primary" onClick={handleCreateQR}>
          Tải ảnh QR
        </Button>,
      ]}
      centered
      styles={{
        body: { maxHeight: '80vh', overflowY: 'auto' },
      }}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="class_id"
          label="Mã lớp"
          rules={[{ required: true, message: 'Chọn lớp!' }]}
        >
          <Select
            showSearch
            placeholder="Chọn lớp"
            allowClear
            options={classes}
            onChange={handleClassChange}
            filterOption={(input, option) =>
              option?.label?.toLowerCase().includes(input.toLowerCase())
            }
          />
        </Form.Item>

        <Form.Item
          name="subject_name"
          label="Tên môn học"
          rules={[{ required: true, message: 'Chọn môn học!' }]}
        >
          <Select
            showSearch
            placeholder="Chọn môn học"
            allowClear
            disabled={!selectedClassId}
            options={subjects}
            onChange={handleSubjectChange}
            filterOption={(input, option) =>
              option?.label?.toLowerCase().includes(input.toLowerCase())
            }
          />
        </Form.Item>

        <Form.Item
          name="lecturer_name"
          label="Giảng viên"
          rules={[{ required: true, message: 'Chọn giảng viên!' }]}
        >
          <Select
            showSearch
            placeholder="Chọn giảng viên"
            allowClear
            disabled={!selectedSubjectName}
            options={lecturers}
            filterOption={(input, option) =>
              option?.label?.toLowerCase().includes(input.toLowerCase())
            }
          />
        </Form.Item>

        <Form.Item name="room_name" label="Phòng học">
          <Input readOnly />
        </Form.Item>

        <Form.Item
          name="date"
          label="Ngày"
          rules={[{ required: true, message: 'Ngày học là bắt buộc!' }]}
        >
          <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
        </Form.Item>

        <Form.Item
          name="time"
          label="Thời gian"
          rules={[{ required: true, message: 'Thời gian là bắt buộc!' }]}
        >
          <TimePicker style={{ width: '100%' }} format="HH:mm" />
        </Form.Item>
      </Form>

      {qrData && (
        <div className="mt-4 text-center">
          <QRCodeCanvas value={JSON.stringify(qrData)} size={180} />
          <div className="mt-2 text-left">
            <p><strong>Mã lớp:</strong> {qrData.class_id}</p>
            <p><strong>Tên lớp:</strong> {qrData.class_name}</p>
            <p><strong>Tên môn học:</strong> {qrData.subject_name}</p>
            <p><strong>Giảng viên:</strong> {qrData.lecturer_name}</p>
            <p><strong>Phòng học:</strong> {qrData.room_name}</p>
            <p><strong>Ngày / Thời gian:</strong> {qrData.date} {qrData.time}</p>
          </div>
        </div>
      )}
    </Modal>
  );
}
