import React, { useEffect, useState } from "react";
import { Button, Form, Input, Typography, Card, Breadcrumb, Select, Row, Col, Descriptions, Avatar,} from "antd";
import { HomeOutlined, PhoneOutlined, UserOutlined, MailOutlined, PhoneOutlined as PhoneIcon } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import Footer from "../../components/Layout/Footer";
import Header from "../../components/Layout/Header";

const { Title } = Typography;
const { TextArea } = Input;

const lecturersData = {
    lecturer1: {
        name: "Nguyễn Văn A",
        email: "nguyenvana@example.com",
        phone: "0909123456",
        avatar: "https://i.pravatar.cc/150?img=1",
    },
    lecturer2: {
        name: "Trần Thị B",
        email: "tranthib@example.com",
        phone: "0912233445",
        avatar: "https://i.pravatar.cc/150?img=2",
    },
};

export default function ContactPage() {
    const { t } = useTranslation();
    const [contactType, setContactType] = useState("");
    const [selectedLecturer, setSelectedLecturer] = useState(null);

    useEffect(() => {
        document.title = "ATTEND 3D - " + t("contact");
    }, [t]);

    const handleContactTypeChange = (value) => {
        setContactType(value);
        setSelectedLecturer(null);
    };

    const handleLecturerChange = (value) => {
        setSelectedLecturer(value);
    };

    return (
        <div className="min-h-screen flex flex-col">
            <div className="w-full mx-auto px-6 flex-grow">
                <Header />
                <main className="mt-10 flex flex-col items-center">
                    <div className="w-full px-4">
                        <Breadcrumb
                            items={[
                                { href: "/", title: <><HomeOutlined /> <span>{"Trang chủ"}</span></> },
                                {
                                    href: "/contact",
                                    title: (
                                        <>
                                            <PhoneOutlined /> <span>{t("contact")}</span>
                                        </>
                                    ),
                                },
                            ]}
                        />
                    </div>

                    <div className="w-full p-5 rounded-lg mt-6">
                        <Card
                            title={
                                <Title level={3} className="!mb-0 text-start">
                                    {t("Send contact information")}
                                </Title>
                            }
                            className="p-6"
                        >
                            <Form
                                name="contact"
                                layout="vertical"
                                method="POST"
                                autoComplete="off"
                            >
                                <Row gutter={24}>
                                    <Col xs={24} md={12}>
                                        <Form.Item
                                            label={t("fullname")}
                                            name="fullname"
                                            rules={[
                                                { required: true, message: t("Please enter your full name!") },
                                            ]}
                                        >
                                            <Input
                                                size="large"
                                                style={{ boxShadow: 'none', borderWidth: 1.5 }}
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} md={12}>
                                        <Form.Item
                                            label={t("phonenumber")}
                                            name="phone"
                                            rules={[
                                                {
                                                    required: true,
                                                    message: t("Please enter your phone number!"),
                                                },
                                                {
                                                    pattern: /^[0-9]{9,12}$/,
                                                    message: t("Invalid phone number"),
                                                },
                                            ]}
                                        >
                                            <Input
                                                size="large"
                                                style={{ boxShadow: 'none', borderWidth: 1.5 }}
                                            />
                                        </Form.Item>
                                    </Col>
                                </Row>

                                <Row gutter={24}>
                                    <Col xs={24} md={12}>
                                        <Form.Item
                                            label="Email"
                                            name="email"
                                            rules={[
                                                { required: true, message: t("Please enter your email!") },
                                                { type: "email", message: t("Invalid email") },
                                            ]}
                                        >
                                            <Input
                                                size="large"
                                                style={{ boxShadow: 'none', borderWidth: 1.5 }}
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} md={12}>
                                        <Form.Item
                                            label={t("Contact object")}
                                            name="object_contact"
                                            rules={[
                                                {
                                                    required: true,
                                                    message: t("Please select a contact person!"),
                                                },
                                            ]}
                                        >
                                            <Select
                                                showSearch
                                                size="large"
                                                allowClear
                                                onChange={handleContactTypeChange}
                                                options={[
                                                    { value: "lecturer", label: t("lecturer") },
                                                    { value: "admin", label: t("admin") },
                                                ]}
                                                className="w-full custom-select"
                                            />
                                        </Form.Item>
                                    </Col>
                                </Row>

                                {contactType === "lecturer" && (
                                    <Row gutter={24}>
                                        <Col xs={24} md={12}>
                                            <Form.Item
                                                label={t("subject")}
                                                name="subject"
                                                rules={[{ required: true, message: "Vui lòng chọn môn học!" }]}
                                            >
                                                <Select
                                                    showSearch
                                                    size="large"
                                                    allowClear
                                                    placeholder={t("Enter your subject")}
                                                    options={[
                                                        { value: "math", label: "Toán" },
                                                        { value: "physics", label: "Vật lý" },
                                                        { value: "chemistry", label: "Hóa học" },
                                                    ]}
                                                    className="w-full custom-select"
                                                />
                                            </Form.Item>

                                            <Form.Item
                                                label={t("lecturerName")}
                                                name="lecturer"
                                                rules={[
                                                    { required: true, message: t("Please select a lecturer") },
                                                ]}
                                            >
                                                <Select
                                                    showSearch
                                                    size="large"
                                                    allowClear
                                                    placeholder={t("Select lecturer")}
                                                    options={Object.entries(lecturersData).map(
                                                        ([key, val]) => ({
                                                            value: key,
                                                            label: val.name,
                                                        })
                                                    )}
                                                    onChange={handleLecturerChange}
                                                    className="w-full custom-select"
                                                />
                                            </Form.Item>
                                        </Col>

                                        <Col xs={24} md={12}>
                                            <Card
                                                size="small"
                                                title={t("Lecturer Information")}
                                                className="h-full"
                                            >
                                                {selectedLecturer ? (
                                                    <Descriptions column={1} size="small">
                                                        <Descriptions.Item label={t("Name")}>
                                                            <div className="flex items-center gap-3">
                                                                <Avatar
                                                                    src={lecturersData[selectedLecturer].avatar}
                                                                    icon={<UserOutlined />}
                                                                />
                                                                {lecturersData[selectedLecturer].name}
                                                            </div>
                                                        </Descriptions.Item>
                                                        <Descriptions.Item label={t("Email")}>
                                                            <a
                                                                href={`mailto:${lecturersData[selectedLecturer].email}`}
                                                            >
                                                                <MailOutlined />{" "}
                                                                {lecturersData[selectedLecturer].email}
                                                            </a>
                                                        </Descriptions.Item>
                                                        <Descriptions.Item label={t("Phone")}>
                                                            <a
                                                                href={`tel:${lecturersData[selectedLecturer].phone}`}
                                                            >
                                                                <PhoneIcon />{" "}
                                                                {lecturersData[selectedLecturer].phone}
                                                            </a>
                                                        </Descriptions.Item>
                                                    </Descriptions>
                                                ) : (
                                                    <p>{t("Please select a lecturer to view information")}</p>
                                                )}
                                            </Card>
                                        </Col>
                                    </Row>
                                )}

                                <Form.Item
                                    label={t("content")}
                                    name="content"
                                    rules={[{ required: true, message: t("Please enter your content!") }]}
                                >
                                    <TextArea rows={5} style={{ boxShadow: 'none', borderWidth: 1.5 }} />
                                </Form.Item>

                                <Form.Item className="mt-6">
                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        block
                                        size="large"
                                        style={{ width: '100px' }}
                                    >
                                        {t("Send")}
                                    </Button>
                                </Form.Item>
                            </Form>
                        </Card>
                    </div>
                </main>
            </div>
            <Footer />
        </div>
    );
}