import React from "react";
import { Modal, Descriptions } from "antd";
import dayjs from "dayjs";

const ModalContactDetail = ({ detailModalVisible, setDetailModalVisible, selectedContact }) => {
    return (
        <Modal
            open={detailModalVisible}
            title="Chi tiết liên hệ"
            footer={null}
            onCancel={() => setDetailModalVisible(false)}
            width={700}
        >
            {selectedContact && (
                <Descriptions column={1} bordered>
                    {selectedContact.status !== 'REPLIED' ? (
                        <>
                            <Descriptions.Item label="Họ và tên">{selectedContact.fullname}</Descriptions.Item>
                            <Descriptions.Item label="Email">{selectedContact.email}</Descriptions.Item>
                            <Descriptions.Item label="Số điện thoại">{selectedContact.phone_number}</Descriptions.Item>
                            <Descriptions.Item label="Nội dung">{selectedContact.message}</Descriptions.Item>
                            <Descriptions.Item label="Trạng thái">{selectedContact.status}</Descriptions.Item>
                            <Descriptions.Item label="Tạo lúc">
                                {dayjs(selectedContact.created_at).format('DD/MM/YYYY HH:mm:ss')}
                            </Descriptions.Item>
                        </>
                    ) : (
                        <>
                            <Descriptions.Item label="Họ và tên">{selectedContact.fullname}</Descriptions.Item>
                            <Descriptions.Item label="Email">{selectedContact.email}</Descriptions.Item>
                            <Descriptions.Item label="Số điện thoại">{selectedContact.phone_number}</Descriptions.Item>
                            <Descriptions.Item label="Nội dung">{selectedContact.message}</Descriptions.Item>
                            <Descriptions.Item label="Trạng thái">{selectedContact.status}</Descriptions.Item>
                            <Descriptions.Item label="Phản hồi">{selectedContact.response || '-'}</Descriptions.Item>
                            <Descriptions.Item label="Tạo lúc">
                                {dayjs(selectedContact.created_at).format('DD/MM/YYYY HH:mm:ss')}
                            </Descriptions.Item>
                            <Descriptions.Item label="Cập nhật lúc">
                                {dayjs(selectedContact.updated_at).format('DD/MM/YYYY HH:mm:ss')}
                            </Descriptions.Item>
                        </>
                    )}
                </Descriptions>
            )}
        </Modal>
    );
};

export default ModalContactDetail;