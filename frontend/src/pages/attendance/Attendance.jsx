import React, { useState, useEffect } from "react";
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import { Modal, Input, Badge, Calendar, Breadcrumb } from "antd";
import { motion } from "framer-motion";
import Header from "../../components/Header/Header";
import { HomeOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

export default function AttendancePage() {

    const { t } = useTranslation();
    const [, setUser] = useState(null);

    useEffect(() => {
        document.title = "ATTEND 3D - " + t('attendance');;

        const storedUser = localStorage.getItem('user');
        if (storedUser && storedUser !== 'undefined') {
            try {
                setUser(JSON.parse(storedUser));
            } catch (err) {
                console.error('Error parsing user from localStorage:', err);
                localStorage.removeItem('user');
                setUser(null);
            }
        } else {
            setUser(null);
        }
    }, [t]);

    dayjs.locale('en');
    const today = dayjs();

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [note, setNote] = useState("");
    const [events, setEvents] = useState({
        "2025-05-03": ["Điểm danh lớp CNTT"],
        "2025-05-10": ["Họp phụ huynh"],
    });

    const capitalizeFirst = (str) => str.charAt(0).toUpperCase() + str.slice(1);

    const handleOpenModal = (date) => {
        setSelectedDate(date);
        setNote("");
        setIsModalVisible(true);
    };

    const handleOk = () => {
        if (selectedDate && note.trim()) {
            const key = selectedDate.format("H:m:s DD/MM/YYYY");
            setEvents(prev => ({
                ...prev,
                [key]: prev[key] ? [...prev[key], note] : [note]
            }));
        }
        setIsModalVisible(false);
    };

    const handleCancel = () => setIsModalVisible(false);

    const dateCellRender = (value) => {
        const key = value.format("H:m:s DD/MM/YYYY");
        const listData = events[key] || [];

        return (
            <ul className="list-disc pl-4">
                {listData.map((item, index) => (
                    <li key={index}>
                        <Badge status="success" text={item} />
                    </li>
                ))}
            </ul>
        );
    };

    const handleSelect = (date) => {
        handleOpenModal(date);
    };

    return (
        <div className="min-h-screen bg-white text-gray-800 flex flex-col">
            <div className="w-full mx-auto px-6 flex-grow">
                <Header />

                <main className="mt-10">
                    <div className="w-full max-w-6xl px-4">
                        <Breadcrumb
                            items={[
                                { href: '/', title: <HomeOutlined /> },
                                { href: '/attendance', title: <><PlusCircleOutlined /> <span>{t('attendance')}</span></> },
                                { title: t('attendance') },
                            ]}
                        />
                    </div>
                    <motion.h2
                        className="text-2xl font-bold mb-6 mt-6"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        {t('Attendance Schedule')}: {capitalizeFirst(today.format("dddd"))} - {today.format("DD/MM/YYYY")}
                    </motion.h2>

                    <Calendar
                        onSelect={handleSelect}
                        cellRender={(date, info) => {
                            if (info.type === 'date') return dateCellRender(date);
                            return info.originNode;
                        }}
                    />
                </main>

                <Modal
                    title={`Ghi chú cho ngày: ${selectedDate?.format("dddd")} - ${selectedDate?.format("DD/MM/YYYY")}`}
                    open={isModalVisible}
                    onOk={handleOk}
                    onCancel={handleCancel}
                >
                    <Input.TextArea
                        rows={4}
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Nhập ghi chú..."
                    />
                </Modal>
            </div>

            <footer className="bg-gray-100 mt-20 py-2 px-5">
                <div className="text-center text-sm text-gray-500">
                    © {new Date().getFullYear()} EDU FACE ID. All rights reserved.
                </div>
            </footer>
        </div>
    );
}
