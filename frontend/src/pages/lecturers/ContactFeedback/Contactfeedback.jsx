import React, { useState } from "react";
import { Layout, message } from "antd";
import Sidebar from "../../../components/Layout/Sidebar_lecturer";
import Navbar from "../../../components/Layout/Navbar";
import Footer from "../../../components/Layout/Footer";
import { useTranslation } from "react-i18next";
import FormAddContactDynamic from "../../../components/Form/AddContactDynamic";
import FullScreenLoader from "../../../components/Spin/Spin";
import api from "../../../api/axiosInstance";
import BreadcrumbContact from "../../../components/Breadcrumb/Contact";

const { Header, Content } = Layout;

export default function ContactPage() {
    const { t } = useTranslation();
    const [collapsed, setCollapsed] = useState(false);
    const [contactType, setContactType] = useState("");
    const [loading, setLoading] = useState(false);
    const [currentUser, setCurrentUser] = useState({ id: 8 }); // Thay bằng API /accounts/me nếu cần
    const [form] = FormAddContactDynamic.useForm?.() || [];

    const handleContactTypeChange = (value) => setContactType(value);

    const onFinish = async (payload) => {
        setLoading(true);
        try {
            const res = await api.post("/contacts/lecturer-to-student/", payload);
            if (res.status === 200 || res.status === 201) {
                message.success("Gửi liên hệ thành công.");
            } else {
                message.error("Gửi liên hệ thất bại. Vui lòng thử lại.");
            }
        } catch (err) {
            console.error(err);
            message.error("Lỗi gửi liên hệ, kiểm tra payload và server.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout style={{ minHeight: "100vh", background: "#f9fafc" }}>
            <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
            <Layout>
                <Header className="bg-white px-4 flex justify-between items-center border-b">
                    <Navbar />
                </Header>
                <Content style={{ margin: "16px" }}>
                    <main className="flex flex-col items-center">
                        <div className="w-full px-4 mb-4">
                            <BreadcrumbContact t={t} />
                        </div>
                        <div className="w-full p-5 rounded-lg bg-white shadow-md">
                            <FormAddContactDynamic
                                form={form}
                                t={t}
                                contactType={contactType}
                                handleContactTypeChange={handleContactTypeChange}
                                onFinish={onFinish}
                                loading={loading}
                                currentUser={currentUser}
                            />
                        </div>
                    </main>
                </Content>
                <Footer />
            </Layout>
            <FullScreenLoader loading={loading} text={"Đang xử lý... Vui lòng đợi"} />
        </Layout>
    );
}
