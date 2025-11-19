import dayjs from "dayjs";

export const getShift = (time) => {
    // Trang
    if (!time) return "";
    const hour = parseInt(time.split(":")[0]);
    if (hour < 12) return "morning";
    if (hour < 18) return "afternoon";
    return "evening";
};

export const buildWeekSchedule = (data, currentTime) => {
    const days = { 2: "Monday", 3: "Tuesday", 4: "Wednesday", 5: "Thursday", 6: "Friday", 7: "Saturday", 8: "Sunday" };
    const weekSchedule = {
        morning: { Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [], Saturday: [], Sunday: [] },
        afternoon: { Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [], Saturday: [], Sunday: [] },
        evening: { Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [], Saturday: [], Sunday: [] },
    };

    data.forEach((item) => {
        const dayName = days[item.day_of_week];
        const shift = getShift(item.lesson_start);
        //Trang
        if (!shift) return;
        const semesterStart = dayjs(item.semester_start_date);
        const semesterEnd = dayjs(item.semester_end_date);

        if (currentTime.isBefore(semesterStart, "day") || currentTime.isAfter(semesterEnd, "day")) return;

        if (dayName && weekSchedule[shift]) {
            weekSchedule[shift][dayName].push(item);
        }
    });

    return weekSchedule;
};