import React, { useEffect } from "react";
import 'dayjs/locale/vi';
import { Breadcrumb, Card, Typography, Button, message } from "antd";
import Header from "../../components/Header/Header";
import { HomeOutlined, PlusCircleOutlined, CameraOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import Footer from "../../components/Footer";

const { Title, Paragraph } = Typography;

export default function AddFacePage() {

    const { t } = useTranslation();

    useEffect(() => {
        document.title = "ATTEND 3D - " + t('Add Face');
    }, [t]);

    const handleCapture = () => {
        message.info("Tính năng chụp ảnh đang được phát triển...");
    };

    // const [tabPosition] = useState("left");

    // const stepsContent = [
    //     (
    //         <>
    //             <Title level={4}>{t('Prepare before registration')}</Title>
    //             <Paragraph>
    //                 - {t('Make sure the environment is well lit and there are no shadows on your face so the camera can recognize you accurately.')}
    //             </Paragraph>
    //             <Paragraph>
    //                 - {t('Check that the webcam or imaging device is working properly.')}
    //             </Paragraph>
    //             <Paragraph>
    //                 - {t('Sit up straight, keep your head up, and face straight towards the camera.')}
    //             </Paragraph>
    //             <Paragraph>
    //                 - {t('Remove glasses, hats or any other obstructions on your face to get a clear photo.')}
    //             </Paragraph>
    //         </>
    //     ),
    //     (
    //         <>
    //             <Title level={4}>{t('Face photo capture')}</Title>
    //             <Paragraph>
    //                 - {t('Press the "Capture with Camera" button to start using the webcam.')}
    //             </Paragraph>
    //             <Paragraph>
    //                 - {t('Keep your face within the frame and stay still for a few seconds.')}
    //             </Paragraph>
    //             <Paragraph>
    //                 - {t('You can retake the photo multiple times if you are not satisfied.')}
    //             </Paragraph>
    //             <Paragraph>
    //                 - {t('The system will automatically process and analyze your 3D face photo.')}
    //             </Paragraph>
    //         </>
    //     ),
    //     (
    //         <>
    //             <Title level={4}>{t('Confirmation and Saving Information')}</Title>
    //             <Paragraph>
    //                 - {t('Review the captured face photo and confirm your personal information.')}
    //             </Paragraph>
    //             <Paragraph>
    //                 - {t('Press the "Save" button to complete the 3D face registration process.')}
    //             </Paragraph>
    //             <Paragraph>
    //                 - {t('The system will use this photo data for automatic attendance in future sessions.')}
    //             </Paragraph>
    //             <Paragraph>
    //                 - {t('If changes are needed, you can re-register or update your face photo later.')}
    //             </Paragraph>
    //         </>
    //     )
    // ];

    return (
        <div className="min-h-screen text-gray-800 flex flex-col">
            <div className="w-full mx-auto px-6 flex-grow">
                <Header />

                <main className="mt-10">
                    <div className="w-full max-w-6xl px-4">
                        <Breadcrumb
                            items={[
                                { href: '/', title: <HomeOutlined /> },
                                { href: '/add-face', title: <><PlusCircleOutlined /> <span>{t('Face Registration')}</span></> },
                                { title: t('Face Registration') },
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
