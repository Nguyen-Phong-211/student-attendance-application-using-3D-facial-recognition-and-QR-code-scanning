import React, { useState, useEffect } from "react";
import { Button, message, Typography } from "antd";
import OtpInput from "../../components/Auth/OtpInput";
import Logo from "../../assets/general/face-recognition.png";
import ImageOtp from "../../assets/general/otp.jpg"; 
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

const { Title } = Typography;

const VerifyOtp = () => {
  useEffect(() => {
    document.title = "ATTEND 3D - Xác thực OTP";
  }, []);

  const navigate = useNavigate();
  const randomId = uuidv4();
  const [otpCode, setOtpCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); 

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const handleVerify = () => {
    if (otpCode.length !== 6) {
      return message.error("Vui lòng nhập đủ 6 số OTP");
    }

    const tempUserId = localStorage.getItem("pending_signup");
    const email = localStorage.getItem("otp_email");

    if (!email || !tempUserId) {
      return message.error("Không tìm thấy thông tin xác thực, vui lòng đăng ký lại");
    }

    setLoading(true);

    fetch("http://127.0.0.1:8000/api/v1/accounts/verify_otp/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: email,
        otp: otpCode,
      }),
    })
      .then(async (res) => {
        const data = await res.json();
        setLoading(false);
        if (!res.ok) {
          return message.error(data.error || "Xác minh thất bại");
        }

        localStorage.setItem("access_token", data.access_token);
        localStorage.removeItem("account_id", data.account_id);
        localStorage.setItem("user", JSON.stringify(data.user));

        localStorage.removeItem("pending_signup");
        localStorage.removeItem("otp_email");

        message.success("Đăng ký thành công!");
        navigate(`/student/information/${randomId}`);
      })
      .catch(() => {
        message.error("Lỗi kết nối");
        setLoading(false);
      });
  };

  const handleResendOtp = () => {
    const email = localStorage.getItem("otp_email");
    if (!email) {
      return message.error("Không tìm thấy email để gửi lại OTP");
    }

    fetch("http://127.0.0.1:8000/api/v1/accounts/send_otp/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          return message.error(data.error || "Gửi lại OTP thất bại");
        }
        message.success("Đã gửi lại OTP thành công");
        setTimeLeft(300);
      })
      .catch(() => {
        message.error("Lỗi kết nối khi gửi lại OTP");
      });
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
          <Title level={3} className="text-center">
            Xác minh OTP
          </Title>

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
    </div>
  );
};

export default VerifyOtp;