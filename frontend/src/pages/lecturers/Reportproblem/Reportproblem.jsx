import React, { useState } from "react";
import { Layout, Card, Form, Input, Upload, Button, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import Sidebar from "../../../components/Layout/Sidebar_lecturer";
import Navbar from "../../../components/Layout/Navbar";
import Footer from "../../../components/Layout/Footer";
import axios from "axios";

const { Header, Content } = Layout;
const { TextArea } = Input;

export default function IncidentReport() {
  const [collapsed, setCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState([]);
  const BACKEND_URL = "http://127.0.0.1:8000"; 

  const onFinish = async (values) => {
    const formData = new FormData();
    formData.append("title", values.title);
    formData.append("description", values.description);
    if (fileList.length > 0) {
      formData.append("attachment", fileList[0].originFileObj);
    }

    setLoading(true);
    try {
      const response = await axios.post(`${BACKEND_URL}/api/v1/incidents/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (response.status === 201) {
        message.success("Báo cáo sự cố đã được gửi thành công!");
      }
    } catch (err) {
      console.error(err);
      message.error("Không thể gửi báo cáo. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  const handleUploadChange = ({ fileList: newFileList }) => setFileList(newFileList);

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <Layout>
        <Header className="bg-white border-b px-4">
          <Navbar />
        </Header>

        <Content className="m-6">
          <Card
            title="Báo cáo sự cố"
            bordered={false}
            style={{ maxWidth: 700, margin: "0 auto" }}
          >
            <Form layout="vertical" onFinish={onFinish}>
              <Form.Item
                label="Tiêu đề"
                name="title"
                rules={[{ required: true, message: "Vui lòng nhập tiêu đề!" }]}
              >
                <Input placeholder="Ví dụ: Sự cố khi điểm danh bằng QR" />
              </Form.Item>

              <Form.Item
                label="Mô tả chi tiết"
                name="description"
                rules={[{ required: true, message: "Vui lòng nhập mô tả sự cố!" }]}
              >
                <TextArea
                  rows={5}
                  placeholder="Mô tả chi tiết sự cố bạn gặp phải..."
                />
              </Form.Item>

              <Form.Item label="Đính kèm hình ảnh (nếu có)">
                <Upload
                  beforeUpload={() => false}
                  onChange={handleUploadChange}
                  fileList={fileList}
                  maxCount={1}
                >
                  <Button icon={<UploadOutlined />}>Chọn tệp</Button>
                </Upload>
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  block
                >
                  Gửi báo cáo
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Content>

        <Footer />
      </Layout>
    </Layout>
  );
}
