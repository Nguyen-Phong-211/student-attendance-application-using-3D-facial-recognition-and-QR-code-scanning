import React, { useState } from "react";
import { Button, Typography, message } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../api/axiosInstance";
import OtpInput from "./OtpInput";

const { Title } = Typography;

export default function VerifyOtpForm() {
    const [loading, setLoading] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const { email, password } = location.state || {};

    if (!email || !password) {
        return <p>Thiếu thông tin. Vui lòng quay lại bước trước.</p>;
    }

    const handleVerify = async (otp) => {
        setLoading(true);
        try {
            await api.post("accounts/auth/verify-otp-change-password/", {
                email,
                otp,
                new_password: password,
                confirm_password: password,
            });

            message.success("Đổi mật khẩu thành công. Vui lòng đăng nhập lại.");
            navigate("/login");
        } catch (err) {
            message.error(
                err.response?.data?.otp ||
                    err.response?.data?.detail ||
                    "OTP không hợp lệ."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl border text-center">
            <Title level={4}>Nhập mã OTP</Title>
            <p>Mã OTP đã được gửi tới email: {email}</p>

            <div className="my-4 flex justify-center">
                <OtpInput length={6} onComplete={handleVerify} />
            </div>

            <Button
                type="primary"
                loading={loading}
                onClick={() => message.info("Vui lòng nhập đủ OTP")}
            >
                Xác nhận
            </Button>
        </div>
    );
}