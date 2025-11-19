import { Form, Input } from "antd";

const StudentContact = ({ t, selectedStudent }) => {
  return (
    <Form.Item
      label={t("student")}
      name="student"
    >
      <Input
        size="large"
        value={selectedStudent ? `${selectedStudent.student_name} - ${selectedStudent.student_code}` : ""}
        disabled
      />
    </Form.Item>
  );
};

export default StudentContact;
