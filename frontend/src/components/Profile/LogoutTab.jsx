import React, { useState } from "react";
import { Modal } from "antd";

export default function LogoutTab() {

    function LogoutTab() {
        const [isModalVisible, setIsModalVisible] = useState(true);

        const handleOk = () => {
            console.log("Đã đăng xuất");
            setIsModalVisible(false);
        };

        const handleCancel = () => {
            setIsModalVisible(false);
        };

        return (
            <>
                <Modal
                    title="Xác nhận đăng xuất"
                    open={isModalVisible}
                    onOk={handleOk}
                    onCancel={handleCancel}
                    okText="Đăng xuất"
                    cancelText="Hủy"
                    okButtonProps={{ danger: true }}
                >
                    <p>Bạn có chắc chắn muốn đăng xuất không?</p>
                </Modal>
            </>
        );
    }

    return (
        <LogoutTab />
    );
}