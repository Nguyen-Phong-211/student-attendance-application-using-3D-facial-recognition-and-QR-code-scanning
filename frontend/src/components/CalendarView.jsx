import dayjs from "dayjs"; 

function CalendarView() {
  const now = dayjs();
  const currentMonth = now.month(); 
  const currentYear = now.year();
  const daysInMonth = now.daysInMonth();

  const attendanceData = {
    1: ["Toán", "Lý"],
    3: ["Hóa"],
    5: ["Sinh", "Văn"],
    10: ["Anh Văn"],
    15: ["Lịch Sử"],
    20: ["Tin học"],
    28: ["GDCD", "Thể dục"]
  };

  const renderDays = () => {
    const days = [];
    for (let i = 1; i <= daysInMonth; i++) {
      const subjects = attendanceData[i] || [];
      days.push(
        <div
          key={i}
          className="border rounded-lg p-3 text-sm shadow-sm hover:shadow-md transition duration-200 bg-white"
        >
          <div className="font-semibold mb-1">Ngày {i}</div>
          {subjects.length > 0 ? (
            <ul className="text-xs text-gray-600 space-y-1">
              {subjects.map((subj, idx) => (
                <li key={idx}>📌 {subj}</li>
              ))}
            </ul>
          ) : (
            <div className="text-gray-400 italic text-xs">Chưa có điểm danh</div>
          )}
        </div>
      );
    }
    return days;
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-4">
      {renderDays()}
    </div>
  );
}

export default CalendarView;

