import { Form, Select } from "antd";

const InputObjectContact = ({ handleContactTypeChange, t }) => {
    return (
        <Form.Item
            label={t("contact object")}
            name="object_contact"
            rules={[
                {
                    required: true,
                    message: t("please select a contact person"),
                },
            ]}
        >
            <Select
                showSearch
                size="large"
                allowClear
                onChange={handleContactTypeChange}
                options={[
                    { value: "student", label: t("Sinh viên") },
                    // { value: "admin", label: t("admin") },
                ]}
                className="w-full custom-select"
                placeholder={t("select a contact person")}
            />
        </Form.Item>
    );
};


export default InputObjectContact;