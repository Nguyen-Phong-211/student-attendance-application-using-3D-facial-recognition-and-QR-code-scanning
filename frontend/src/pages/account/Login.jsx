import React, { useEffect, useState } from "react";
import { Typography, message, Spin } from "antd";
import { useNavigate } from "react-router-dom";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import { v4 as uuidv4 } from "uuid";

import LoginImage from "../../components/Account/LoginImage";
import LoginForm from "../../components/Account/LoginForm";

const { Title } = Typography;

const Login = () => {
    const [messageApi, contextHolder] = message.useMessage();
    const navigate = useNavigate();
    const { executeRecaptcha } = useGoogleReCaptcha();
    const randomId = uuidv4();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        document.title = "ATTEND 3D - Đăng nhập";
    }, []);

    return (
        <div className="h-screen w-full flex flex-col md:flex-row">
            <div className="w-full md:w-7/12 flex items-center justify-center">
                <LoginImage />
            </div>

            <div className="w-full md:w-5/12 flex items-center justify-center p-8 bg-white">
                <div className="w-full max-w-md">
                    <Title level={2} className="text-center mb-8 text-gray-800">
                        Đăng nhập
                    </Title>
                    {contextHolder}
                    <LoginForm
                        messageApi={messageApi}
                        executeRecaptcha={executeRecaptcha}
                        navigate={navigate}
                        randomId={randomId}
                        loading={loading}
                        setLoading={setLoading}
                    />
                </div>
            </div>
            <Spin spinning={loading} fullscreen tip="Đang xử lý. Vui lòng chờ..." />
        </div>
    );
};

export default Login;