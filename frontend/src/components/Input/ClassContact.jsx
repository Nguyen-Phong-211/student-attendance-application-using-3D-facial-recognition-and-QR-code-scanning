import { Form, Input } from "antd";

const ClassContact = ({ t, selectedClass }) => {
  return (
    <Form.Item
      label={t("class")}
      name="class"
    >
      <Input
        size="large"
        value={selectedClass ? selectedClass.class_name : ""}
        disabled
      />
    </Form.Item>
  );
};

export default ClassContact;
