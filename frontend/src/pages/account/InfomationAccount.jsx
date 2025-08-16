import React, { useState, useEffect } from "react";
import { Typography, Card, Breadcrumb, Button } from "antd";
import Header from "../../components/Header/Header";
import { HomeOutlined, SnippetsOutlined, EditOutlined } from '@ant-design/icons';

const { Title } = Typography;

export default function ContactPage() {
    
    const [, setUser] = useState(null);

    useEffect(() => {
        document.title = "ATTEND 3D - Thông tin tài khoản";

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
    }, []);

    return (
        <div className="min-h-screen bg-white text-gray-800 flex flex-col">
            <div className="w-full mx-auto px-6 flex-grow">

                <Header />

                <main className="mt-10 flex flex-col items-center">
                    <div className="w-full px-4">
                        <Breadcrumb
                            items={[
                                { href: '/', title: <HomeOutlined /> },
                                { href: '/account/information-account', title: <><SnippetsOutlined /> <span>Thông tin tài khoản</span></> },
                                { title: 'Thông tin tài khoản' },
                            ]}
                        />
                    </div>

                    <div className="w-full p-5 rounded-lg mt-6">
                        <Card title={<Title level={3}>Thông tin sinh viên</Title>} className="p-2">
                            <div>
                                <div className="grid grid-cols-2 gap-8">
                                    <div className="px-4 sm:px-0">
                                        <h3 className="text-base/7 font-semibold text-gray-900">Actions</h3>
                                        <p className="mt-1 max-w-2xl text-sm/6 text-gray-500">Thông tin chi tiết.</p>
                                    </div>
                                    <div className="px-4 sm:px-0">
                                        <Button 
                                            type="primary" 
                                            size="large" 
                                            href="/account/information-account/update" 
                                            icon={<EditOutlined />}
                                        >
                                            Cập nhật
                                        </Button>
                                    </div>
                                </div>
                                <div className="mt-6 border-t border-gray-100">
                                    <dl className="divide-y divide-gray-100">
                                        <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                                            <dt className="text-sm/6 font-medium text-gray-900">Họ và tên</dt>
                                            <dd className="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">
                                            </dd>
                                        </div>
                                        <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                                            <dt className="text-sm/6 font-medium text-gray-900">Mã số sinh viên</dt>
                                            <dd className="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">
                                            </dd>
                                        </div>
                                        <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                                            <dt className="text-sm/6 font-medium text-gray-900">Số điện thoại </dt>
                                            <dd className="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">
                                            </dd>
                                        </div>
                                        <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                                            <dt className="text-sm/6 font-medium text-gray-900">Email </dt>
                                            <dd className="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">
                                            </dd>
                                        </div>
                                        <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                                            <dt className="text-sm/6 font-medium text-gray-900">Khoa</dt>
                                            <dd className="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">
                                            </dd>
                                        </div>
                                        <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                                            <dt className="text-sm/6 font-medium text-gray-900">Lớp</dt>
                                            <dd className="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">
                                            </dd>
                                        </div>
                                        <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                                            <dt className="text-sm/6 font-medium text-gray-900">Attachments</dt>
                                            <dd className="mt-2 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                                                <ul className="divide-y divide-gray-100 rounded-md border border-gray-200">
                                                    <li className="flex items-center justify-between py-4 pr-5 pl-4 text-sm/6">
                                                        <div className="flex w-0 flex-1 items-center">
                                                            <svg className="size-5 shrink-0 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" data-slot="icon">
                                                                <path fillRule="evenodd" d="M15.621 4.379a3 3 0 0 0-4.242 0l-7 7a3 3 0 0 0 4.241 4.243h.001l.497-.5a.75.75 0 0 1 1.064 1.057l-.498.501-.002.002a4.5 4.5 0 0 1-6.364-6.364l7-7a4.5 4.5 0 0 1 6.368 6.36l-3.455 3.553A2.625 2.625 0 1 1 9.52 9.52l3.45-3.451a.75.75 0 1 1 1.061 1.06l-3.45 3.451a1.125 1.125 0 0 0 1.587 1.595l3.454-3.553a3 3 0 0 0 0-4.242Z" clipRule="evenodd" />
                                                            </svg>
                                                            <div className="ml-4 flex min-w-0 flex-1 gap-2">
                                                                <span className="truncate font-medium">profile_student_21070701.pdf</span>
                                                                <span className="shrink-0 text-gray-400">2.4mb</span>
                                                            </div>
                                                        </div>
                                                        <div className="ml-4 shrink-0">
                                                            <button className="font-medium text-indigo-600 hover:text-indigo-500">Download</button>
                                                        </div>
                                                    </li>
                                                </ul>
                                            </dd>
                                        </div>
                                    </dl>
                                </div>
                            </div>
                        </Card>
                    </div>
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
