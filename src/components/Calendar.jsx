import React from 'react';

function Calendar({ selectedDate, onDateSelect, completedRoutines }) {
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days = [];

    // 이전 달의 마지막 날들
    for (let i = startingDay - 1; i >= 0; i--) {
      const prevMonth = new Date(year, month - 1, 0);
      days.push({
        date: prevMonth.getDate() - i,
        isCurrentMonth: false,
        isToday: false,
        fullDate: new Date(year, month - 1, prevMonth.getDate() - i),
      });
    }

    // 현재 달의 날들
    const today = new Date();
    for (let i = 1; i <= daysInMonth; i++) {
      const fullDate = new Date(year, month, i);
      const isToday =
        today.getDate() === i &&
        today.getMonth() === month &&
        today.getFullYear() === year;

      days.push({
        date: i,
        isCurrentMonth: true,
        isToday: isToday,
        fullDate: fullDate,
      });
    }

    // 다음 달의 첫 날들 (42개 셀을 채우기 위해)
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      const fullDate = new Date(year, month + 1, i);
      days.push({
        date: i,
        isCurrentMonth: false,
        isToday: false,
        fullDate: fullDate,
      });
    }

    return days;
  };

  const goToPreviousMonth = () => {
    const newDate = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth() - 1,
      1
    );
    onDateSelect(newDate);
  };

  const goToNextMonth = () => {
    const newDate = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth() + 1,
      1
    );
    onDateSelect(newDate);
  };

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const days = getDaysInMonth(selectedDate);

  const isDateSelected = (day) => {
    return day.fullDate.toDateString() === selectedDate.toDateString();
  };

  const hasCompletedRoutines = (day) => {
    const dateKey = day.fullDate.toDateString();
    const routines = completedRoutines[dateKey];
    return routines && Object.values(routines).some((completed) => completed);
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-5">
        <button
          className="bg-chip border border-border text-text px-3 py-2 rounded-lg cursor-pointer text-base hover:bg-accent-2 hover:text-bg transition-all duration-200"
          onClick={goToPreviousMonth}
        >
          ←
        </button>
        <h3 className="text-lg font-semibold text-text m-0">
          {monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}
        </h3>
        <button
          className="bg-chip border border-border text-text px-3 py-2 rounded-lg cursor-pointer text-base hover:bg-accent-2 hover:text-bg transition-all duration-200"
          onClick={goToNextMonth}
        >
          →
        </button>
      </div>

      <div className="grid grid-cols-7 gap-0.5">
        {dayNames.map((day) => (
          <div
            key={day}
            className="text-center p-2 font-semibold text-muted text-xs bg-panel rounded-md"
          >
            {day}
          </div>
        ))}

        {days.map((day, index) => (
          <div
            key={index}
            className={`aspect-square flex items-center justify-center text-sm text-text bg-panel border border-border rounded-md cursor-pointer transition-all duration-200 hover:bg-accent-2 hover:text-bg relative ${
              !day.isCurrentMonth ? 'text-muted opacity-50' : ''
            } ${
              day.isToday
                ? 'bg-red-500 text-white font-bold border-red-600 shadow-lg scale-105'
                : ''
            } ${
              isDateSelected(day) ? 'ring-2 ring-blue-500 ring-offset-2' : ''
            }`}
            onClick={() => onDateSelect(day.fullDate)}
          >
            {day.date}
            {/* 완료된 루틴이 있는 날짜 표시 */}
            {hasCompletedRoutines(day) && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Calendar;
