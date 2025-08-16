import React, { useState } from "react";
import { Button, Form, Input, Select, Typography, Upload } from "antd";
import { CloudUploadOutlined } from "@ant-design/icons";

const { Title } = Typography;

export default function ReportIssueForm() {

    const [showOther, setShowOther] = useState(false);
    const [fileList, setFileList] = useState([]);

    const handleChange = ({ fileList: newFileList }) => {
        setFileList(newFileList);
    };

    return (
        <div className="bg-white p-6 rounded-xl border">
            <Title level={4}>Báo cáo lỗi</Title>
            <Form layout="vertical" onFinish={(values) => console.log(values)}>
                <Form.Item
                    name="errorType"
                    label="Loại lỗi"
                    rules={[{ required: true, message: "Vui lòng chọn loại lỗi" }]}
                >
                    <Select
                        placeholder="Chọn loại lỗi"
                        onChange={(value) => setShowOther(value === "other")}
                        className="w-full custom-select"
                        size="large"
                    >
                        <Select.Option value="qrcode">QR Code</Select.Option>
                        <Select.Option value="face">Checkin Face</Select.Option>
                        <Select.Option value="other">Chức năng Khác</Select.Option>
                    </Select>
                </Form.Item>

                {showOther && (
                    <Form.Item
                        name="otherFunction"
                        label="Tên chức năng"
                        rules={[{ required: true, message: "Vui lòng nhập tên chức năng" }]}
                    >
                        <Input
                            placeholder="Nhập tên chức năng gặp lỗi"
                            size="large"
                            style={{ borderWidth: 1.5, boxShadow: 'none' }}
                        />
                    </Form.Item>
                )}

                <Form.Item
                    name="description"
                    label="Mô tả chi tiết"
                    rules={[{ required: true, message: "Vui lòng nhập mô tả lỗi" }]}
                >
                    <Input.TextArea
                        rows={4}
                        placeholder="Mô tả chi tiết lỗi..."
                        style={{ borderWidth: 1.5, boxShadow: 'none' }}
                    />
                </Form.Item>

                <Form.Item
                    name="avatar"
                    label="Ảnh mô tả (Optional)"
                >
                    <Upload
                        fileList={fileList}
                        onChange={handleChange}
                        beforeUpload={() => false}
                        listType="picture-card"
                        multiple
                        style={{ width: '100%' }}
                        accept="image/*"
                    >
                        {fileList.length < 1 && (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <CloudUploadOutlined style={{ fontSize: 24, color: '#999' }} />
                                <div style={{ marginTop: 8 }}>Tải hình ảnh lên</div>
                            </div>
                        )}
                    </Upload>
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit" security="high" size="large">
                        Gửi báo cáo
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
}