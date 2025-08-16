import React, { useEffect } from "react";
import { Button } from "antd";
import { motion } from "framer-motion";
import LogoFaceId from "../../assets/general/Face_ID_logo.png";
import Header from "../../components/Header/Header";
import { useTranslation } from 'react-i18next';

export default function HomePage() {

    const { t } = useTranslation();

    useEffect(() => {
        document.title = "ATTEND 3D - " + t('home');
    }, [t]);    
    
    return (
        <div className="min-h-screen bg-white text-gray-800 flex flex-col">

            <div className="w-full mx-auto px-6 flex-grow">
                <Header />

                <main className="container m-auto mt-20 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    <motion.div
                        initial={{ x: -50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: 1 }}
                    >
                        <h2 className="text-4xl font-bold leading-tight mb-4">
                            {t('3D Facial Recognition Smart Attendance')}
                        </h2>
                        <p className="text-lg text-gray-600 mb-6">
                            {t('Advanced AI integration ensures fast, accurate, and highly secure identity verification in educational and corporate environments.')}
                        </p>
                        <Button type="primary" size="large">
                            {t('start')} <i className="fa-solid fa-arrow-right"></i>
                        </Button>
                    </motion.div>

                    <motion.div
                        initial={{ x: 50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: 1 }}
                        className="flex justify-center"
                    >
                        <img
                            src={ LogoFaceId }
                            alt="3D Face Scan"
                            className="w-full max-w-md rounded-xl"
                        />
                    </motion.div>
                </main>
            </div>

            <footer className="bg-gray-100 mt-20 py-2 px-5">
                <div className="text-center text-sm text-gray-500 mt-0">
                    © {new Date().getFullYear()} EDU FACE ID. All rights reserved.
                </div>
            </footer>

        </div>
    );
}
