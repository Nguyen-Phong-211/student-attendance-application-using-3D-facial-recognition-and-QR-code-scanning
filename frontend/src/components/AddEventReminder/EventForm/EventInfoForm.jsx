import React from "react";
import { Form, Input, DatePicker, Radio, Select, message } from "antd";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;

export default function EventInfoForm({ reminderData, form, selectedSubject }) {
    const options = [
        { label: 'Có', value: 1 },
        // { label: 'Không', value: 0 },
    ];

    const optionsRemind = [
        { label: 'Trước 15 phút', value: '15' },
        { label: 'Trước 30 phút', value: '30' },
        { label: 'Trước 45 phút', value: '45' },
        { label: 'Trước 60 phút', value: '60' }
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
                label="Thời gian nhắc nhở sự kiện"
                name="timeEvent"
                rules={[{ required: true, message: 'Vui lòng chọn thời gian nhắc nhở sự kiện!' }]}
            >
                <Select
                    options={optionsRemind}
                    defaultValue={optionsRemind[1].value}
                    placeholder="Chọn thời gian nhắc nhở sự kiện"
                    size="large"
                    className="w-full custom-select"
                />
            </Form.Item>

            <Form.Item
  label="Ngày bắt đầu - Ngày kết thúc"
  name="rangeDate"
  rules={[
    { required: true, message: "Vui lòng chọn thời gian!" },
    {
      validator: (_, value) => {
        if (!value || !reminderData) return Promise.resolve();

        const [start, end] = value;
        if (!start || !end) return Promise.resolve();

        const { day_of_week, start_time, start_date_semester, end_date_semester } = reminderData;

        const semesterStart = dayjs(start_date_semester);
        const semesterEnd = dayjs(end_date_semester);

        // ====== TÍNH REMINDER TIME ======
        const reminderMinutes = form.getFieldValue("timeEvent") 
          ? parseInt(form.getFieldValue("timeEvent"), 10) 
          : 30; // mặc định 30 phút
        const reminderTime = start.add(reminderMinutes, "minute");

        console.log("Reminder time thực tế:", reminderTime.format("HH:mm DD/MM/YYYY"));

        // 1. start & end phải nằm trong học kỳ
        if (start.isBefore(semesterStart) || start.isAfter(semesterEnd)) {
          return Promise.reject(new Error("Ngày bắt đầu phải nằm trong học kỳ."));
        }
        if (end.isBefore(semesterStart) || end.isAfter(semesterEnd)) {
          return Promise.reject(new Error("Ngày kết thúc phải nằm trong học kỳ."));
        }

        // 2. end phải rơi đúng thứ
        const endDay = end.day() === 0 ? 8 : end.day() + 1;
        if (endDay !== day_of_week) {
          return Promise.reject(new Error(`Ngày kết thúc phải rơi vào thứ ${day_of_week}`));
        }

        // 3. end < start_time
        const endLimit = dayjs(end.format("YYYY-MM-DD") + " " + start_time);
        if (!end.isBefore(endLimit)) {
          return Promise.reject(new Error(`Ngày kết thúc phải trước ${start_time}`));
        }

        // 4. start < end và end - start >= 1h
        if (!start.isBefore(end)) {
          return Promise.reject(new Error("Ngày bắt đầu phải nhỏ hơn ngày kết thúc."));
        }
        if (end.diff(start, "minute") < 60) {
          return Promise.reject(new Error("Khoảng thời gian sự kiện phải ít nhất 1 giờ."));
        }

        // 5. check reminderTime < start
        if (!reminderTime.isBefore(start)) {
          return Promise.reject(
            new Error(`Thời gian nhắc nhở (${reminderMinutes} phút) phải trước thời điểm bắt đầu sự kiện.`)
          );
        }

        return Promise.resolve();
      },
    },
  ]}
>
  <RangePicker
    showTime={{ format: "HH:mm" }}
    disabled={!selectedSubject}
    size="large"
    format="HH:mm DD/MM/YYYY"
    className="w-full"
    style={{ borderWidth: 1.5, boxShadow: "none" }}
  />
</Form.Item>


            <Form.Item name="emailNotification" rules={[{ required: true }]}>
                <label>
                    <span className="text-red-500">*</span> Thông báo email
                </label>
                <Radio.Group options={options} defaultValue={1} className="ms-4" />
            </Form.Item>
        </div>
    );
}