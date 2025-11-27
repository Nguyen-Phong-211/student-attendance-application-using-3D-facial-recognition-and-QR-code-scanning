import dayjs from "dayjs";

export function buildMonthSchedule(scheduleData, currentTime) {
    const monthStart = currentTime.startOf("month");
    const monthEnd = currentTime.endOf("month");
    const monthSchedule = {};

    let dayPointer = monthStart.clone();
    while (dayPointer.isBefore(monthEnd) || dayPointer.isSame(monthEnd, "day")) {
        monthSchedule[dayPointer.format("YYYY-MM-DD")] = [];
        dayPointer = dayPointer.add(1, "day");
    }

    scheduleData.forEach(lesson => {
        lesson.displayDates.forEach(date => {
            const dateStr = dayjs(date).format("YYYY-MM-DD");
            if (monthSchedule[dateStr]) {
                monthSchedule[dateStr].push(lesson);
            }
        });
    });

    return monthSchedule;
}