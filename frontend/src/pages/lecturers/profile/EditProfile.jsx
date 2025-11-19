import { Button, DatePicker, Form, Input, Select } from "antd";
import dayjs from "dayjs";

const FormEditLecturerProfile = ({ form, formData, handleUpdate }) => {
  return (
    <Form
      layout="vertical"
      form={form}
      initialValues={{
        ...formData,
        dob: formData?.dob ? dayjs(formData.dob) : null,
        gender:
          formData?.gender === "1" || formData?.gender === "M"
            ? "M"
            : formData?.gender === "0" || formData?.gender === "F"
            ? "F"
            : "O",
      }}
      onFinish={handleUpdate}
      className="w-[40%]"
      size="large"
    >
      <Form.Item
        label="Họ và tên"
        name="fullname"
        rules={[{ required: true, message: "Vui lòng nhập họ và tên" }]}
      >
        <Input style={{ borderWidth: 1.5, boxShadow: "none" }} />
      </Form.Item>

      <Form.Item label="Mã giảng viên" name="lecturer_id">
        <Input disabled />
      </Form.Item>

      <Form.Item
        label="Email"
        name="email"
        rules={[{ required: true, message: "Vui lòng nhập email" }]}
      >
        <Input style={{ borderWidth: 1.5, boxShadow: "none" }} />
      </Form.Item>

      <Form.Item
        label="Số điện thoại"
        name="phone_number"
        rules={[{ required: true, message: "Vui lòng nhập số điện thoại" }]}
      >
        <Input style={{ borderWidth: 1.5, boxShadow: "none" }} />
      </Form.Item>

      <Form.Item
        label="Giới tính"
        name="gender"
        rules={[{ required: true, message: "Vui lòng chọn giới tính" }]}
      >
        <Select className="custom-select">
          <Select.Option value="M">Nam</Select.Option>
          <Select.Option value="F">Nữ</Select.Option>
          <Select.Option value="O">Khác</Select.Option>
        </Select>
      </Form.Item>

      <Form.Item
        label="Ngày sinh"
        name="dob"
        rules={[{ required: true, message: "Vui lòng chọn ngày sinh" }]}
      >
        <DatePicker format="YYYY-MM-DD" className="w-full" />
      </Form.Item>

      <Button type="primary" htmlType="submit">
        Lưu thay đổi
      </Button>
    </Form>
  );
};

export default FormEditLecturerProfile;
