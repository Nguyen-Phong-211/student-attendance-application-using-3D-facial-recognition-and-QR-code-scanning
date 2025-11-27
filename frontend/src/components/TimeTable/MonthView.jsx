import React from "react";
import { Calendar, Typography } from "antd";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import TimerCountdown from "../../components/TimerCountdown";
import { FireOutlined } from "@ant-design/icons";

dayjs.extend(utc);
dayjs.extend(timezone);

const { Text } = Typography;

export default function MonthView({ scheduleData, currentTime }) {
    const getListData = (value) => {
    const jsDay = value.day();
    const weekday = jsDay === 0 ? 8 : jsDay + 1;
    const dateStr = value.format("YYYY-MM-DD");

    return scheduleData.filter((item) => {
        if (!item) return false;

        const semesterStart = item?.semester_start_date ? dayjs(item.semester_start_date) : null;
        const semesterEnd = item?.semester_end_date ? dayjs(item.semester_end_date) : null;

        if ((semesterStart && value.isBefore(semesterStart, "day")) ||
            (semesterEnd && value.isAfter(semesterEnd, "day"))) return false;

        if (item?.repeat_weekly === true || item?.repeat_weekly === "True" || item?.repeat_weekly === 1) {
        return parseInt(item?.day_of_week, 10) === weekday;
        }

        const localDate = item?.occurrence_start ? dayjs.utc(item.occurrence_start).tz("Asia/Ho_Chi_Minh").format("YYYY-MM-DD") : null;
        return localDate === dateStr;
    });
    };

    const dateCellRender = (value) => {
        const listData = getListData(value);
        return (
            <div style={{ display: "flex", flexDirection: "column", gap: 4, minHeight: 60 }}>
                {listData.map((item, index) => {
                    const [sh, sm] = (item?.lesson_start || "00:00").split(":");
                    const [eh, em] = (item?.lesson_end || "00:00").split(":");
                    const start = value.hour(parseInt(sh, 10)).minute(parseInt(sm, 10)).second(0);
                    const end = value.hour(parseInt(eh, 10)).minute(parseInt(em, 10)).second(0);
                    const endCountdown = start.add(10, "minute");

                    let contentNode;
                    if (currentTime.isBefore(start)) {
                        contentNode = <Text type="warning">{item?.subject_name} ({item?.lesson_type}) - Chưa đến giờ điểm danh</Text>;
                    } else if (currentTime.isAfter(end)) {
                        contentNode = <Text type="danger">{item?.subject_name} ({item?.lesson_type}) - Hết giờ điểm danh</Text>;
                    } else if (currentTime.isAfter(start) && currentTime.isBefore(endCountdown)) {
                        contentNode = <>{item?.subject_name} ({item?.lesson_type}) - <TimerCountdown end={endCountdown} /></>;
                    } else {
                        contentNode = <Text type="danger">{item?.subject_name} ({item?.lesson_type}) - Hết giờ điểm danh</Text>;
                    }

                    return <div key={index}><FireOutlined /> {contentNode}</div>;
                })}
            </div>
        );
    };

    return <Calendar cellRender={dateCellRender} />;
}