import React, { useState, useEffect } from 'react';
import { Modal, Descriptions, Button, Input, message } from 'antd';
import dayjs from 'dayjs';

export default function LeaveRequestModal({
  visible,
  onClose,
  data,
  isStudentView = false,
  onApprove,
  onReject,
}) {
  const [localStatus, setLocalStatus] = useState(data?.status || '');
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    setLocalStatus(data?.status || '');
    setRejectReason('');
  }, [data]);

  const formatDate = (date) => (date ? dayjs(date).format('DD/MM/YYYY') : '-');
  const isPending = localStatus === 'P';
  const BACKEND_URL = "http://127.0.0.1:8000";

  const handleApproveClick = async () => {
    await onApprove?.(data);
    setLocalStatus('A');
  };

  const handleRejectClick = async () => {
    if (!rejectReason.trim()) {
      message.error('Nhập lý do từ chối');
      return;
    }
    await onReject?.(data, rejectReason);
    setLocalStatus('R');
  };

  if (!data) return null;

  let imageList = [];
  try {
    if (typeof data.images_urls === 'string') {
      imageList = JSON.parse(data.images_urls);
    } else if (Array.isArray(data.images_urls)) {
      imageList = data.images_urls;
    }
  } catch (err) {
    console.error("Parse JSON lỗi:", err);
  }

  return (
    <Modal
      title="Chi tiết đơn xin nghỉ"
      open={visible}
      onCancel={onClose}
      centered
      width={700}
      footer={[
        !isStudentView && isPending && (
          <Button key="approve" type="primary" onClick={handleApproveClick}>
            Duyệt
          </Button>
        ),
        !isStudentView && isPending && (
          <Button key="reject" danger onClick={handleRejectClick}>
            Từ chối
          </Button>
        ),
        <Button key="close" onClick={onClose}>
          Đóng
        </Button>,
      ].filter(Boolean)}
    >
      <Descriptions column={1} bordered>
        <Descriptions.Item label="Mã đơn">{data.leave_request_code}</Descriptions.Item>
        <Descriptions.Item label="Mã sinh viên">{data.student_id}</Descriptions.Item>
        <Descriptions.Item label="Tên sinh viên">{data.student_name}</Descriptions.Item>
        <Descriptions.Item label="Lớp">{data.class_name}</Descriptions.Item>
        <Descriptions.Item label="Môn học">{data.subject_name}</Descriptions.Item>
        <Descriptions.Item label="Lý do">{data.reason}</Descriptions.Item>
        <Descriptions.Item label="Ngày bắt đầu">{formatDate(data.start_date)}</Descriptions.Item>
        <Descriptions.Item label="Ngày kết thúc">{formatDate(data.end_date)}</Descriptions.Item>

        <Descriptions.Item label="Tệp đính kèm">
          {data.attachment ? (
            <a
              href={`${BACKEND_URL}/media/${data.attachment.replace(/^\/?media\//, '')}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {data.attachment.split('/').pop()}
            </a>
          ) : (
            '-'
          )}
        </Descriptions.Item>

        <Descriptions.Item label="Hình ảnh">
          {imageList.length > 0 ? (
            <ul style={{ paddingLeft: 20, margin: 0 }}>
              {imageList.map((url, index) => (
                <li key={`${index}-${url}`}>
                  <a
                    href={`${BACKEND_URL}${url.startsWith('/media') ? '' : '/media/'}${url.replace(/^\/?media\//, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {url.split('/').pop()}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            '-'
          )}
        </Descriptions.Item>

        <Descriptions.Item label="Trạng thái">
          {localStatus === 'A' ? (
            <span style={{ color: 'green' }}>Đã duyệt</span>
          ) : localStatus === 'R' ? (
            <span style={{ color: 'red' }}>Từ chối</span>
          ) : (
            <span style={{ color: 'orange' }}>Đang chờ</span>
          )}
        </Descriptions.Item>

        {isPending && !isStudentView && (
          <Descriptions.Item label="Lý do từ chối">
            <Input
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Nhập lý do từ chối"
            />
          </Descriptions.Item>
        )}
      </Descriptions>
    </Modal>
  );
}
