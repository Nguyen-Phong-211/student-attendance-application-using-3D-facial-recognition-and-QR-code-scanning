import dayjs from "dayjs";

/**
 * Lấy thông tin tuần hiện tại dựa vào ngày hiện tại
 * - Tuần bắt đầu từ Thứ 2
 */
export function getCurrentWeekInfo(semesterStart, semesterEnd, currentDate = dayjs()) {
  const start = dayjs(semesterStart);
  const end = dayjs(semesterEnd);
  const now = dayjs(currentDate);

  // Tìm Thứ 2 đầu tiên >= semesterStart
  const dayOfWeek = start.day(); // 0 = Chủ nhật, 1 = Thứ 2 ...
  const firstMonday = dayOfWeek === 1 ? start : start.add((8 - dayOfWeek) % 7, "day");

  // Đảm bảo currentDate nằm trong khoảng semester
  const adjustedNow = now.isBefore(start) ? start : now.isAfter(end) ? end : now;

  // Tuần hiện tại (bắt đầu từ 1)
  let currentWeek = Math.floor(adjustedNow.diff(firstMonday, "day") / 7) + 1;
  
  // Đảm bảo currentWeek nằm trong khoảng hợp lệ
  currentWeek = Math.max(1, currentWeek);
  
  // Tính tổng số tuần
  const totalWeeks = Math.ceil(end.diff(firstMonday, "day") / 7);
  currentWeek = Math.min(currentWeek, totalWeeks);

  const weekStart = firstMonday.add(currentWeek - 1, "week");
  const weekEnd = weekStart.add(6, "day").isAfter(end) ? end : weekStart.add(6, "day");

  return { 
    currentWeek, 
    totalWeeks, 
    weekStart, 
    weekEnd, 
    firstMonday 
  };
}