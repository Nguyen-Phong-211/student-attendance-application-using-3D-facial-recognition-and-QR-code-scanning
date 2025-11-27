import React, { useState, useCallback } from "react";
import { Modal, Divider, Button, message, Tag } from "antd";
import { 
    CloseCircleOutlined, QrcodeOutlined, 
    SaveOutlined, ClockCircleOutlined, EnvironmentOutlined, 
    BookOutlined, TeamOutlined, UserOutlined, CalendarOutlined 
} from "@ant-design/icons";
import { QRCodeCanvas } from "qrcode.react";
import api from "../../../api/axiosInstance";

const InfoItem = ({ icon, label, value }) => (
    <p className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
        <strong className="text-gray-600 font-medium flex items-center">
            {icon && React.createElement(icon, { className: "mr-2 text-blue-500" })}
            {label}:
        </strong>
        <span className="text-gray-800 font-semibold text-right">{value}</span>
    </p>
);

export default function LessonQRCodeModal({
    visible,
    onClose,
    lesson,
}) {
    const [loading, setLoading] = useState(false);

    const qrValue = `QR-${lesson?.schedule_id}-${Date.now()}`; 

    const getQRImageBase64 = () => {
        const canvas = document.getElementById("qr-canvas");
        return canvas?.toDataURL("image/png");
    };

    const handleCreate = useCallback(async () => {
        if (!lesson || loading) return; 
        
        try {
            setLoading(true);
            const qrImageBase64 = getQRImageBase64();
            
            const lecturerRes = await api.get(
                `lecturers/schedules/by-schedule/${lesson.schedule_id}/`
            );

            const lecturerData = lecturerRes.data;
            const accountId = lecturerData?.account_id;
            
            const latitude = parseFloat(lecturerData.latitude) || 0;
            const longitude = parseFloat(lecturerData.longitude) || 0;
            const radius = 50; 

            if (!accountId) {
                message.error("Không tìm thấy ID tài khoản giảng viên để tạo QR.");
                return;
            }

            const payload = {
                qr_code: qrValue,
                qr_image_base64: qrImageBase64,
                expire_at: "23:59:59", 
                is_active: true,
                usage_count: 0,
                max_usage: 1, 
                radius: radius,
                latitude: latitude,
                longitude: longitude,
                created_by: accountId,
                schedule: lecturerData.schedule_id,
            };
            
            const res = await api.post(`lecturers/qr-checkins/`, payload);

            if (res.status === 201 || res.data?.id) {
                message.success("Mã QR đã được tạo và lưu thành công!");
                onClose();
            } else {
                message.warning("Lưu thất bại! Backend không trả về phản hồi hợp lệ.");
            }
        } catch (err) {
            console.error("Lỗi khi tạo QR:", err);
            message.error({
                content: "Không thể lưu vào CSDL. Vui lòng kiểm tra kết nối API!",
                icon: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />,
            });
        } finally {
            setLoading(false);
        }
    }, [lesson, qrValue, onClose, loading]); 

    if (!lesson) return null;

    const displayDate = lesson.displayDate?.format?.("DD/MM/YYYY") 
        ?? lesson.occurrence_start?.format?.("DD/MM/YYYY") 
        ?? 'N/A';
        
    const hasLocation = lesson.latitude && lesson.longitude && lesson.latitude !== '0' && lesson.longitude !== '0';
    
    return (
        <Modal
            title={<span className="text-2xl font-extrabold flex items-center"><QrcodeOutlined className="mr-3" /> Tạo Mã QR Điểm Danh</span>}
            open={visible}
            onCancel={onClose}
            centered
            width={750}
            footer={[
                <Button key="cancel" onClick={onClose} className="mr-2">
                    Hủy
                </Button>,
                <Button
                    key="create"
                    type="primary"
                    loading={loading}
                    onClick={handleCreate}
                    icon={<SaveOutlined />}
                >
                    {loading ? "Đang Lưu..." : "Tạo & Lưu QR"}
                </Button>,
            ]}
        >
            <div className="p-4 flex space-x-6">
                
                <div className="flex-shrink-0 w-1/3 flex flex-col items-center justify-center p-6 rounded-xl border border-dashed border-gray-300">
                    <QRCodeCanvas 
                        id="qr-canvas"
                        value={qrValue} 
                        size={180}
                        marginSize={true} 
                        level="H"
                    />
                    <p className="mt-4 font-bold text-gray-700 text-center">
                        Mã đã QR đã tạo
                    </p>
                    <Tag 
                        icon={<EnvironmentOutlined />} 
                        color={hasLocation ? "green" : "red"} 
                        className="mt-2"
                    >
                        {hasLocation ? "Có GPS" : "Không GPS"}
                    </Tag>
                </div>

                <div className="flex-grow w-2/3">
                    
                    <Divider orientation="left" className="!my-0 mb-4 text-base font-bold text-blue-600">
                        Chi tiết buổi học
                    </Divider>
                    
                    <div className="bg-white p-2 rounded-xl border border-gray-200 mt-4">
                        <InfoItem icon={BookOutlined} label="Môn học" value={lesson.subject_name} />
                        <InfoItem icon={TeamOutlined} label="Lớp" value={lesson.class_name} />
                        <InfoItem icon={UserOutlined} label="Giảng viên" value={lesson.lecturer_name} />
                        
                        <Divider className="!my-2" dashed />
                        <InfoItem icon={CalendarOutlined} label="Ngày" value={displayDate} />
                        <InfoItem icon={ClockCircleOutlined} label="Ca học" value={lesson.shift_name} />
                        <InfoItem icon={ClockCircleOutlined} label="Thời gian" value={`${lesson.lesson_start} - ${lesson.lesson_end}`} />
                        <InfoItem icon={EnvironmentOutlined} label="Phòng" value={lesson.room_name} />
                    </div>
                </div>
            </div>
        </Modal>
    );
}