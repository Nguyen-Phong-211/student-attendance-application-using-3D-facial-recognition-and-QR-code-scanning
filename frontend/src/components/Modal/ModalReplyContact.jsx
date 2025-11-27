import React from "react";
import { Modal, Form, Input } from "antd";

const ModalReplyContact = ({ replyModalVisible, setReplyModalVisible, handleReplySubmit, loadingReply, form }) => {
    return (
        <Modal
            open={replyModalVisible}
            title="Phản hồi liên hệ"
            onOk={handleReplySubmit}
            onCancel={() => setReplyModalVisible(false)}
            loading={loadingReply}
        >
            <Form form={form} layout="vertical">
                <Form.Item
                    name="response"
                    label="Phản hồi"
                    rules={[{ required: true, message: 'Vui lòng nhập phản hồi!' }]}
                >
                    <Input.TextArea rows={4} placeholder="Nhập phản hồi..." style={{ borderWidth: 1.5, boxShadow: 'none' }} />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default ModalReplyContact;