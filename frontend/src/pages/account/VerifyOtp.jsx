import React, { useState, useEffect } from "react";
import { Button, message, Typography, Spin } from "antd";
import OtpInput from "../../components/Account/OtpInput";
import Logo from "../../assets/general/face-recognition.png";
import ImageOtp from "../../assets/general/otp.jpg";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import publicApi from "../../api/publicApi";

const { Title } = Typography;

const OTP_DURATION = 300; // 5 minutes

const VerifyOtp = () => {
    const navigate = useNavigate();
    const randomId = uuidv4();

    const [otpCode, setOtpCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [timeLeft, setTimeLeft] = useState(OTP_DURATION);
    const [expiryTime, setExpiryTime] = useState(() => {
        const saved = localStorage.getItem("otp_expiry");
        return saved ? parseInt(saved, 10) : Date.now() + OTP_DURATION * 1000;
    });
    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    useEffect(() => {
        document.title = "ATTEND 3D - Xác thực OTP";
    }, []);

    // Interval calculates timeLeft based on expiryTime
    useEffect(() => {
        const interval = setInterval(() => {
            const remaining = Math.max(Math.floor((expiryTime - Date.now()) / 1000), 0);
            setTimeLeft(remaining);
        }, 1000);

        return () => clearInterval(interval);
    }, [expiryTime]); // <--- listen expiryTime

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, "0")}`;
    };

    const handleVerify = async () => {
        if (otpCode.length !== 6) return message.error("Vui lòng nhập đủ 6 số OTP");

        const email = localStorage.getItem("otp_email");
        if (!email) return message.error("Không tìm thấy thông tin xác thực, vui lòng đăng ký lại");

        setLoading(true);
        try {
            const res = await publicApi.post("/accounts/verify_otp/", { email, otp: otpCode });
            const data = res.data;

            if (data.error) {
                message.error(data.error);
                setLoading(false);
                return;
            }

            localStorage.removeItem("pending_signup");
            localStorage.removeItem("otp_email");
            localStorage.removeItem("otp_expiry");

            message.success("Đăng ký thành công! Vui lòng đăng nhập lại");
            await sleep(2000);
            navigate(`/account/information/update/${randomId}`);
        } catch (err) {
            console.error(err);
            message.error("Lỗi kết nối");
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        const email = localStorage.getItem("otp_email");
        if (!email) return message.error("Không tìm thấy email để gửi lại OTP");

        try {
            const res = await publicApi.post("/accounts/send_otp/", { email });
            const data = res.data;

            if (data.error) return message.error(data.error);

            message.success("Đã gửi lại OTP thành công");

            const newExpiry = Date.now() + OTP_DURATION * 1000;
            localStorage.setItem("otp_expiry", newExpiry);
            setExpiryTime(newExpiry); // <-- update state, interval automatically use new value
        } catch (err) {
            console.error(err);
            message.error("Lỗi kết nối khi gửi lại OTP");
        }
    };

    return (
        <div className="h-screen w-full flex flex-col md:flex-row">
            <div className="w-full md:w-7/12 flex items-center justify-center">
                <img
                    src={ImageOtp}
                    alt="OTP Illustration"
                    className="w-[90%] h-[90%] object-cover rounded-lg"
                />
            </div>

            <div className="w-full md:w-5/12 flex items-center justify-center p-8 bg-white">
                <div className="w-full max-w-md text-center">
                    <img src={Logo} alt="Logo" className="mx-auto mb-5 w-[100px]" />
                    <Title level={3} className="text-center">Xác minh OTP</Title>

                    <div className="text-center mb-6 mt-6">
                        <OtpInput length={6} onComplete={setOtpCode} />
                    </div>

                    {timeLeft > 0 ? (
                        <p className="text-gray-500 mb-4">
                            Mã OTP sẽ hết hạn sau <strong>{formatTime(timeLeft)}</strong>
                        </p>
                    ) : (
                        <Button type="link" onClick={handleResendOtp} className="mb-4">
                            Gửi lại mã OTP
                        </Button>
                    )}

                    <Button
                        type="primary"
                        className="mt-4"
                        block
                        onClick={handleVerify}
                        loading={loading}
                        size="large"
                    >
                        Xác nhận
                    </Button>
                </div>
            </div>
            <Spin spinning={loading} fullscreen tip="Đang xử lý. Vui lòng chờ..." />
        </div>
    );
};

export default VerifyOtp;