import React, { useEffect, useState } from "react";
import { message } from "antd";
import signupImage from "../../assets/general/signup.jpg";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

import SignupForm from "../../components/Account/SignupForm";
import publicApi from "../../api/publicApi";

const Signup = () => {
    const [, contextHolder] = message.useMessage();
    const [loading, setLoading] = useState(false);
    const [apiErrors, setApiErrors] = useState({});
    const navigate = useNavigate();
    const randomId = uuidv4();

    useEffect(() => {
        document.title = "ATTEND 3D - Đăng ký";
    }, []);

    const onFinish = async (values) => {
        setLoading(true);
        setApiErrors({});
        try {
            const res = await publicApi.post("/accounts/send_otp/", values);
            const data = res.data;

            if (data.error) {
                let messages = [];
                if (typeof data.error === "object") {
                    messages = Object.values(data.error)
                        .map((arr) => (Array.isArray(arr) ? arr.join(", ") : arr))
                        .filter(Boolean);
                } else if (typeof data.error === "string") {
                    messages = [data.error];
                }
                if (messages.length === 0) messages = ["Đăng ký không thành công."];
                messages.forEach((msg) => message.error(msg));
                setLoading(false);
                return;
            }

            localStorage.setItem("pending_signup", JSON.stringify(values));
            localStorage.setItem("user", JSON.stringify(values));
            localStorage.setItem("otp_email", values.email);

            setLoading(false);
            navigate(`/account/verify-otp/${randomId}`);
        } catch (err) {
            console.error(err);
            setLoading(false);
            message.error("Lỗi gửi OTP.");
        }
    };

    return (
        <div className="h-screen w-full flex flex-col md:flex-row">
            <div className="w-full md:w-7/12 flex items-center justify-center">
                <img
                    src={signupImage}
                    alt="Signup illustration"
                    className="w-[90%] h-[90%] object-cover rounded-lg"
                />
            </div>
            <div className="w-full md:w-5/12 flex items-center justify-center p-8 bg-white">
                <div className="w-full max-w-md">
                    {contextHolder}
                    <SignupForm
                        onFinish={onFinish}
                        loading={loading}
                        apiErrors={apiErrors}
                        randomId={randomId}
                    />
                </div>
            </div>
        </div>
    );
};

export default Signup;