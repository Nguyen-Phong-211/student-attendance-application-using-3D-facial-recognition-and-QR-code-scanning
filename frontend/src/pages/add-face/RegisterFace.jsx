import React, { useEffect, useRef, useState } from "react";
import 'dayjs/locale/vi';
import { Breadcrumb, Card, Typography, Button, message } from "antd";
import Header from "../../components/Header/Header";
import { HomeOutlined, PlusCircleOutlined, CameraOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

const { Title, Paragraph } = Typography;

export default function RegisterPage() {

    const { t } = useTranslation();

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
        <div className="min-h-screen bg-gray-50 text-gray-800 flex flex-col">
            <div className="w-full mx-auto px-6 flex-grow">
                <Header />

                <main className="mt-10">
                    <div className="w-full max-w-6xl px-4">
                        <Breadcrumb
                            items={[
                                { href: '/', title: <HomeOutlined /> },
                                { href: '/add-face', title: <><PlusCircleOutlined /> <span>Đăng ký khuôn mặt</span></> },
                                { href: '/add-face/register', title: <><PlusCircleOutlined /> <span>Đăng ký</span></> },
                                { title: 'Đăng ký' },
                            ]}
                        />
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

            <footer className="bg-gray-100 mt-0 py-2 px-5">
                <div className="text-center text-sm text-gray-500">
                    © {new Date().getFullYear()} EDU FACE ID. All rights reserved.
                </div>
            </footer>
        </div>
    );
}
