import { Select, Form } from "antd";
// Trang
const InputChooseClass = ({
    label = "Lớp học",
    name = "class",
    classes = [],
    onChange,
    disabled = false,
}) => {
    return (
        <Form.Item
            label={label}
            name={name}
            rules={[{ required: true, message: "Vui lòng chọn lớp học!" }]}
        >
            <Select
                className="custom-select"
                size="large"
                disabled={disabled}
                options={classes.map((cls) => ({
                    value: Number(cls.class_id),
                    label: cls.class_name,
                }))}
                onChange={onChange}
            />
        </Form.Item>
    );
};

export default InputChooseClass;
