import { Select, Form } from "antd";
// Trang
const InputChooseStudent = ({
    label = "Sinh viên",
    name = "student",
    students = [],
    onChange,
    disabled = false,
}) => {
    return (
        <Form.Item
            label={label}
            name={name}
            rules={[{ required: true, message: "Vui lòng chọn sinh viên!" }]}
        >
            <Select
                className="custom-select"
                size="large"
                disabled={disabled}
                options={students.map((st) => ({
                    value: Number(st.student_id),
                    label: st.student_name,
                }))}
                onChange={onChange}
            />
        </Form.Item>
    );
};

export default InputChooseStudent;
