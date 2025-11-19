import React, { useState } from "react";
import { Modal, Divider, Button, message } from "antd";
import { QRCodeCanvas } from "qrcode.react";
import axios from "axios";

export default function LessonQRCodeModal({
  visible,
  onClose,
  lesson,
  baseURL = "http://127.0.0.1:8000/api/v1", 
}) {
  const [loading, setLoading] = useState(false);

  if (!lesson) return null;

  const qrValue = `QR-${lesson.schedule_id}-${Date.now()}`;

  const getQRImageBase64 = () => {
    const canvas = document.querySelector("canvas");
    return canvas?.toDataURL("image/png");
  };

  const handleCreate = async () => {
    try {
      setLoading(true);
      const qrImageBase64 = getQRImageBase64();

      const lecturerRes = await axios.get(
        `${baseURL}/lecturers/schedules/by-schedule/${lesson.schedule_id}/`
      );

      const lecturerData = lecturerRes.data;
      const lecturerId = lecturerData?.lecturer_id;
      const accountId = lecturerData?.account_id;

      if (!lecturerId || !accountId) {
        message.error("Không tìm thấy thông tin giảng viên!");
        return;
      }

      const payload = {
        qr_code: qrValue,
        qr_image_base64: qrImageBase64,
        expire_at: "23:59:59",
        is_active: true,
        usage_count: 0,
        max_usage: 1,
        radius: 50,
        latitude: lecturerData.latitude ?? 0,
        longitude: lecturerData.longitude ?? 0,
        created_by: accountId, 
        schedule: lecturerData.schedule_id,
      };
      const res = await axios.post(
        `${baseURL}/lecturers/qr-checkins/`,
        payload
      );

      if (res.status === 201 || res.data?.id) {
        message.success("Đã tạo và lưu mã QR thành công!");
        onClose();
      } else {
        message.error("Lưu thất bại! Kiểm tra lại backend.");
      }
    } catch (err) {
      console.error("Lỗi khi tạo QR:", err);
      message.error("Không thể lưu vào CSDL. Kiểm tra lại backend!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="📘 Mã QR Lịch Học"
      open={visible}
      onCancel={onClose}
      centered
      footer={[
        <Button key="cancel" onClick={onClose}>
          Hủy
        </Button>,
        <Button
          key="create"
          type="primary"
          loading={loading}
          onClick={handleCreate}
        >
          Tạo
        </Button>,
      ]}
    >
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <QRCodeCanvas value={qrValue} size={220} includeMargin />
        <p style={{ marginTop: 10, color: "#888" }}>
          Quét mã để điểm danh buổi học
        </p>
      </div>

      <Divider />

      <div
        style={{
          backgroundColor: "#fff",
          borderRadius: 10,
          padding: "16px 20px",
          boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
        }}
      >
        <p>
          <strong>Môn học:</strong> {lesson.subject_name}
        </p>
        <p>
          <strong>Lớp:</strong> {lesson.class_name}
        </p>
        <p>
          <strong>Phòng:</strong> {lesson.room_name}
        </p>
        <p>
          <strong>Ca học:</strong> {lesson.shift_name}
        </p>
        <p>
          <strong>Thời gian:</strong> {lesson.lesson_start} -{" "}
          {lesson.lesson_end}
        </p>
        <p>
          <strong>Ngày:</strong>{" "}
          {lesson.displayDate?.format?.("DD/MM/YYYY") ??
            lesson.occurrence_start?.format?.("DD/MM/YYYY")}
        </p>
        <p>
          <strong>Giảng viên:</strong> {lesson.lecturer_name}
        </p>
      </div>
    </Modal>
  );
}
