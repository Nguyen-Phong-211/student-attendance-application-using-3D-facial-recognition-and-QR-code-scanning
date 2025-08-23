import React, { useState } from "react";
import { Modal } from "antd";
import { logout } from "../../utils/auth";

export default function LogoutTab() {

    function LogoutTab() {
        const [isModalVisible, setIsModalVisible] = useState(true);

        const handleCancel = () => {
            setIsModalVisible(false);
        };

        return (
            <>
                <Modal
                    title="Xác nhận đăng xuất"
                    open={isModalVisible}
                    onOk={logout}
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