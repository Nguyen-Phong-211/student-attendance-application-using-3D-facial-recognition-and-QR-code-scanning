import React, { useEffect, useRef, useState } from "react";
import 'dayjs/locale/vi';
import { Card, Typography, Button, message } from "antd";
import { useNavigate } from "react-router-dom";
import { CameraOutlined, LeftOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

const { Title, Paragraph } = Typography;

export default function RegisterPage() {

    const { t } = useTranslation();
    const navigate = useNavigate();

    useEffect(() => {
        document.title = "ATTEND 3D - " + t('Face Registration');
    }, [t]);

    const videoRef = useRef(null);
    const [setStream] = useState(null);

    useEffect(() => {
        let localStream;

        async function startCamera() {
            try {
                localStream = await navigator.mediaDevices.getUserMedia({ video: true });
                if (videoRef.current) {
                    videoRef.current.srcObject = localStream;
                }
                setStream(localStream);
            } catch (error) {
                message.error("Không thể truy cập camera.");
            }
        }

        startCamera();

        return () => {
            if (localStream) {
                localStream.getTracks().forEach(track => track.stop());
            }
        };
    }, [setStream]);

    const [messageApi, contextHolder] = message.useMessage();

    const error = () => {
        messageApi.open({
          type: 'error',
          content: 'Tính năng chưa phát triển',
        });
    };

    return (
        <div className="min-h-screen text-gray-800 flex flex-col">
            <div className="w-full mx-auto px-6 flex-grow">
                <main className="mt-10">
                    <div className="w-full px-2 mb-6">
                        <Button
                            type="link"
                            icon={<LeftOutlined />}
                            onClick={() => {
                                if (window.history.state && window.history.state.idx > 0) {
                                    navigate(-1);
                                } else {
                                    navigate("/add-face");
                                }
                            }}
                        >
                            Quay lại
                        </Button>
                    </div>

                    <div className="flex justify-center mt-10 px-4">
                        <div className="w-full max-w-4xl">
                            <Card className="shadow-sm rounded-lg p-6">
                                <Title level={3}>Quét khuôn mặt</Title>
                                <Paragraph type="secondary">
                                    Vui lòng tháo kính râm, mắt kiến, khẩu trang để có thể nhận diện chính xác.
                                </Paragraph>

                                <div style={{ display: "flex", justifyContent: "center", marginTop: 20 }}>
                                    <video
                                        ref={videoRef}
                                        autoPlay
                                        playsInline
                                        muted
                                        className="w-full max-w-[100%]  h-[400px] border-r-8 bg-black"
                                    />
                                </div>

                                <div style={{ marginTop: 20, textAlign: "center" }}>
                                    {contextHolder}
                                    <Button
                                        icon={<CameraOutlined />}
                                        type="primary"
                                        onClick={error}
                                        size="large"
                                    >
                                        Chụp bằng Camera
                                    </Button>
                                </div>

                            </Card>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
