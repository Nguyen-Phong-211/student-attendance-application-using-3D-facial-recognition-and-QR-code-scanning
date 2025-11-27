import React from "react";
import { Modal, Descriptions, Button, Input } from "antd";
import dayjs from "dayjs";

const formatDate = (date) => dayjs(date).format("DD/MM/YYYY");
const { TextArea } = Input;

const ModalLeaveRequestDetail = ({
    visible,
    onClose,
    data,
    setRejectReason,
    handleApproveClick,
    handleRejectClick
}) => {

    if (!data) return null;

    let imageList = [];
    if (data) {
        try {
            if (typeof data.images_urls === 'string') {
                imageList = JSON.parse(data.images_urls);
            } else if (Array.isArray(data.images_urls)) {
                imageList = data.images_urls;
            }
        } catch (err) {
            console.error("Parse JSON lỗi:", err);
            imageList = [];
        }
    }

    return (
        <Modal
            title="Chi tiết đơn xin nghỉ"
            open={visible}
            onCancel={onClose}
            centered
            width={1300}
            footer={
                data?.status === "A" ? (
                    <Button key="close" onClick={onClose}>
                        Đóng
                    </Button>
                ) : data?.status === "R" ? (
                    <Button key="close" onClick={onClose}>
                        Đóng
                    </Button>
                ) : (
                    [
                        <Button key="approve" type="primary" onClick={handleApproveClick}>
                            Duyệt
                        </Button>,
                        <Button key="reject" type="primary" danger onClick={handleRejectClick}>
                            Từ chối
                        </Button>,
                        <Button key="close" onClick={onClose}>
                            Đóng
                        </Button>
                    ]
                )
            }
        >
            <Descriptions column={3} bordered>
                <Descriptions.Item label="Mã đơn">{data.leave_request_code}</Descriptions.Item>
                <Descriptions.Item label="Mã sinh viên">{data.student_code}</Descriptions.Item>

                <Descriptions.Item label="Tên sinh viên">{data.fullname}</Descriptions.Item>
                <Descriptions.Item label="Lớp">{data.class_name}</Descriptions.Item>

                <Descriptions.Item label="Môn học">{data.subject_name}</Descriptions.Item>
                <Descriptions.Item label="Lý do">{data.reason}</Descriptions.Item>

                <Descriptions.Item label="Ngày bắt đầu">{formatDate(data.start_date)}</Descriptions.Item>
                <Descriptions.Item label="Ngày kết thúc">{formatDate(data.end_date)}</Descriptions.Item>

                <Descriptions.Item label="Tệp đính kèm">
                    {data.attachment_url ? (
                        <a
                            href={`${data.attachment_url}`}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {data.attachment_url.split('/').pop()}
                        </a>
                    ) : '-'}
                </Descriptions.Item>

                <Descriptions.Item label="Hình ảnh">
                    {imageList.length > 0 ? (
                        <div style={{ display: 'flex', gap: 10 }}>
                            {imageList.map((url, index) => (
                                <img
                                    key={index}
                                    src={url}
                                    alt={`image-${index}`}
                                    style={{
                                        width: 120,
                                        height: 'auto',
                                        borderRadius: 8,
                                        border: '1px solid #ddd',
                                        cursor: 'pointer'
                                    }}
                                    onClick={() => window.open(url, "_blank")}
                                />
                            ))}
                        </div>
                    ) : '-'}
                </Descriptions.Item>

                <Descriptions.Item label="Trạng thái">
                    {data?.status === 'A' ? (
                        <span style={{ color: 'green' }}>Đã duyệt</span>
                    ) : data?.status === 'R' ? (
                        <span style={{ color: 'red' }}>Từ chối</span>
                    ) : (
                        <span style={{ color: 'orange' }}>Đang chờ</span>
                    )}
                </Descriptions.Item>

                <Descriptions.Item label="Lý do từ chối">
                    {data?.status === 'R' ? (
                        data?.rejected_reason
                    ) : data?.status === 'A' ? (
                        data?.rejected_reason
                    ) : (
                        <TextArea
                            rows={2}
                            onChange={(e) => setRejectReason(e.target.value)}
                            placeholder="Nhập lý do từ chối"
                            style={{ borderWidth: 1.5, boxShadow: 'none' }}
                        />
                    )}
                </Descriptions.Item>
            </Descriptions>
        </Modal>
    );
};

export default ModalLeaveRequestDetail;