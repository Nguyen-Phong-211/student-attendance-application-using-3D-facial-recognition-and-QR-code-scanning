import React from "react";
import { Form, Input, DatePicker, Radio, Select } from "antd";

const { RangePicker } = DatePicker;

export default function EventInfoForm() {
    const options = [
        { label: 'Có', value: 1 },
        { label: 'Không', value: 0 },
    ];

    const optionsRemind = [
        { label: 'Trước 5 phút', value: '1' },
        { label: 'Trước 10 phút', value: '2' },
        { label: 'Trước 15 phút', value: '3' },
        { label: 'Trước 20 phút', value: '4' }
    ];

    return (
        <div>
            <Form.Item
                label="Tiêu đề sự kiện"
                name="title"
                rules={[{ required: true, message: 'Vui lòng nhập tiêu đề sự kiện!' }]}
            >
                <Input size="large" placeholder="Nhập tiêu đề sự kiện" style={{ borderWidth: 1.5, boxShadow: 'none' }} />
            </Form.Item>

            <Form.Item
                label="Nội dung sự kiện"
                name="content"
                rules={[{ required: true, message: 'Vui lòng nhập nội dung sự kiện!' }]}
            >
                <Input.TextArea size="large" rows={5} style={{ borderWidth: 1.5, boxShadow: 'none' }} />
            </Form.Item>

            <Form.Item
                label="Ngày bắt đầu - Ngày kết thúc"
                name="rangeDate"
                rules={[
                    { required: true, message: 'Vui lòng chọn thời gian!' },
                    {
                        validator(_, value) {
                            const [start, end] = value || [];
                            if (start && end && end.diff(start, 'minute') < 30) {
                                return Promise.reject(
                                    new Error('Ngày kết thúc phải lớn hơn ngày bắt đầu ít nhất 30 phút')
                                );
                            }
                            return Promise.resolve();
                        },
                    },
                ]}
            >
                <RangePicker
                    showTime={{ format: 'HH:mm' }}
                    size="large"
                    format="HH:mm DD/MM/YYYY"
                    className="w-full"
                    style={{ borderWidth: 1.5, boxShadow: 'none' }}
                />
            </Form.Item>

            <Form.Item name="emailNotification" rules={[{ required: true }]}>
                <label>
                    <span className="text-red-500">*</span> Thông báo email
                </label>
                <Radio.Group options={options} className="ms-4" />
            </Form.Item>

            <Form.Item label="Thời gian remind sự kiện (Optional)" name="timeEvent">
                <Select
                    allowClear
                    options={optionsRemind}
                    placeholder="Chọn thời gian remind sự kiện"
                    size="large"
                    className="w-full custom-select"
                />
            </Form.Item>
        </div>
    );
}