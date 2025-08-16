import React, { useState, useEffect } from "react";

import Logo from "../../assets/general/face-recognition.png";
import DesktopMenu from "./DesktopMenu";
import i18n from 'i18next';
import { useTranslation } from 'react-i18next';

export default function Header() {
    const { t } = useTranslation();

    const [user, setUser] = useState(null);

    useEffect(() => {
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
    }, [t, user]);

    const items = [
        {
            key: "language",
            label: (
                <span className="text-base">
                    <i className="fa-solid fa-language"></i>&nbsp;&nbsp;{t('language')}
                </span>
            ),
            children: [
                {
                    key: "vi",
                    label: (
                        <span className="flex items-center">
                            <img
                                src="https://flagcdn.com/w40/vn.png"
                                alt="Vietnam"
                                className="w-7 h-5 mr-2"
                            />
                            {t('vietnamese')}
                        </span>
                    ),
                },
                {
                    key: "en",
                    label: (
                        <span className="flex items-center">
                            <img
                                src="https://flagcdn.com/w40/gb.png"
                                alt="UK"
                                className="w-7 h-5 mr-2"
                            />
                            {t('english')}
                        </span>
                    ),
                },
            ],
        }
    ];

    return (
        <header className="flex justify-between items-center py-6 border-b border-gray-200 w-full">
            <div className="flex items-center space-x-4">
                <a href="/" className="flex items-center space-x-3 hover:opacity-90 transition">
                    <img src={Logo} alt="Logo" className="h-10 w-10 object-contain" />
                    <span className="text-2xl font-bold text-gray-800 tracking-wide">
                        EDU <span>FACE ID</span>
                    </span>
                </a>
            </div>

            <div className="hidden md:flex flex-grow justify-between items-center ml-10">

                <DesktopMenu
                    items={items}
                    onClick={({ key }) => {
                        if (key === "vi" || key === "en") {
                            i18n.changeLanguage(key);
                        }
                    }}
                />
            </div>

        </header>
    );
}
