import React from "react";
import { Card, Form, Typography, Button } from "antd";
import EventInfoForm from "./EventInfoForm";
import SubjectInfoForm from "./SubjectInfoForm";

const { Title } = Typography;

export default function EventForm() {
    const [form] = Form.useForm();

    return (
        <div className="w-full p-5 rounded-lg mt-6">
            <Card title={<Title level={3}>Tạo thông tin sự kiện</Title>} className="p-2">
                <Form
                    form={form}
                    initialValues={{ variant: 'filled', emailNotification: 1 }}
                    layout="vertical"
                    name="formCreateEvent"
                    autoComplete="off"
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <EventInfoForm />
                        <SubjectInfoForm />
                    </div>

                    <Form.Item className="mt-6">
                        <Button type="primary" htmlType="submit" size="large" className="w-full md:w-auto">
                            Gửi sự kiện
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
}