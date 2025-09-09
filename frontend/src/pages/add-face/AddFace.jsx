import React, { useEffect } from "react";
import 'dayjs/locale/vi';
import { Breadcrumb, Card, Typography, Button, message } from "antd";
import { HomeOutlined, PlusCircleOutlined, CameraOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import Footer from "../../components/Layout/Footer";
import Header from "../../components/Layout/Header";

const { Title, Paragraph } = Typography;

export default function AddFacePage() {

    const { t } = useTranslation();

    useEffect(() => {
        document.title = "ATTEND 3D - " + t('Add Face');
    }, [t]);

    const handleCapture = () => {
        message.info("Tính năng chụp ảnh đang được phát triển...");
    };

    return (
        <div className="min-h-screen text-gray-800 flex flex-col">
            <div className="w-full mx-auto px-6 flex-grow">
                <Header />
                <main className="mt-10">
                    <div className="w-full max-w-6xl px-4">
                        <Breadcrumb
                            items={[
                                { href: '/', title: <><HomeOutlined /> <span>{ "Trang chủ" }</span></> },
                                { href: '/add-face', title: <><PlusCircleOutlined /> <span>{ "Đăng ký khuôn mặt" }</span></> }
                            ]}
                        />
                    </div>

                    <div className="flex justify-center mt-10 px-4">
                        <div className="w-full max-w-4xl">
                            <Card className="shadow-sm rounded-lg p-6">
                                <Title level={3}>{t('3D Face Registration')}</Title>
                                <Paragraph type="secondary">
                                    {t('Please provide your facial image for the system to use in automatic attendance using 3D facial recognition technology.')}
                                </Paragraph>

                                <div className="flex justify-center mt-6">
                                    <div className="border rounded-lg p-4 bg-white text-center">
                                        <Button
                                            icon={<CameraOutlined />}
                                            size="large"
                                            block
                                            onClick={handleCapture}
                                            href="/add-face/register-face"
                                        >
                                            {t('Taken with Camera')}
                                        </Button>
                                        <Paragraph className="mt-2 text-sm text-gray-500">
                                            {t('Allows using webcam to take live face photos.')}
                                        </Paragraph>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>
                </main>
            </div>

            <Footer />
        </div>
    );
}
