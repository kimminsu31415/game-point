import React, { useState, useEffect } from 'react';
import Calendar from './components/Calendar';
import DailyRoutines from './components/DailyRoutines';

const API_BASE_URL = 'http://localhost:5000/api';

function App() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [completedRoutines, setCompletedRoutines] = useState({});

  const dateKey = selectedDate.toLocaleDateString('en-CA'); // YYYY-MM-DD 형식 (로컬 시간 기준)

  // 선택된 날짜의 완료된 할 일 상태 가져오기
  useEffect(() => {
    fetchCompletedRoutines();
  }, [dateKey]);

  const fetchCompletedRoutines = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/routines/complete/${dateKey}`
      );
      if (response.ok) {
        const data = await response.json();
        setCompletedRoutines(data);
      }
    } catch (error) {
      console.error('완료된 할 일 상태를 가져오는데 실패했습니다:', error);
    }
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    // 날짜가 변경되면 완료된 할 일 상태 초기화
    setCompletedRoutines({});
  };

  const handleRoutineToggle = async (routineId, isCompleted) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/routines/complete/${dateKey}/${routineId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ completed: isCompleted }),
        }
      );

      if (response.ok) {
        // 로컬 상태 업데이트 - 현재 날짜의 완료 상태만 업데이트
        setCompletedRoutines((prev) => ({
          ...prev,
          [routineId]: isCompleted,
        }));
      }
    } catch (error) {
      console.error('할 일 완료 상태 업데이트에 실패했습니다:', error);
    }
  };

  const getDateRoutines = () => {
    return completedRoutines;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="text-center py-4 text-sm text-gray-600 bg-blue-200">
        header
      </div>

      <main className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-[350px_1fr] gap-6">
          {/* 왼쪽 패널 - 좁은 컬럼 */}
          <div className="flex flex-col gap-6">
            {/* 왼쪽 위 - 캘린더 */}
            <div className="bg-green-200 rounded-xl shadow-sm p-5 min-h-[350px] border-2 border-green-500">
              <div className="text-center text-green-800 font-bold mb-4">
                📅 캘린더 영역
              </div>
              <Calendar
                selectedDate={selectedDate}
                onDateSelect={handleDateSelect}
                completedRoutines={completedRoutines}
              />
            </div>

            {/* 왼쪽 아래 - 이벤트/루틴 목록 */}
            <div className="bg-purple-200 rounded-xl shadow-sm p-5 min-h-[400px] border-2 border-purple-500">
              <div className="text-center text-purple-800 font-bold mb-4">
                ✅{' '}
                {selectedDate.toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}{' '}
                체크리스트
              </div>
              <DailyRoutines
                selectedDate={selectedDate}
                completedRoutines={getDateRoutines()}
                onRoutineToggle={handleRoutineToggle}
              />
            </div>
          </div>

          {/* 오른쪽 패널 - 넓은 메인 콘텐츠 영역 */}
          <div className="bg-orange-200 rounded-xl shadow-sm p-6 min-h-[800px] border-2 border-orange-500">
            <div className="text-center text-orange-800 font-bold mb-4">
              🏥 메인 콘텐츠 영역
            </div>
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Good morning, Dr.Olivia
              </h1>
              <p className="text-gray-600">
                Intelly wishes you a good and productive day. 45 patients
                waiting for your treatment today. You also have one live event
                in your calendar today.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Patients Card */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5">
                <h3 className="font-semibold text-gray-800 mb-3">Patients:</h3>
                <div className="space-y-2 text-sm">
                  <div>14 pers 22-32 YO</div>
                  <div>5 pers 32-45 YO</div>
                  <div>2 pers 45+ YO</div>
                </div>
                <div className="mt-4 h-20 bg-yellow-100 rounded flex items-end justify-between px-2">
                  <div className="text-xs text-gray-600">07:30 pm</div>
                  <div className="text-xs text-gray-600">12:00 pm</div>
                </div>
              </div>

              {/* Visits Summary Card */}
              <div className="bg-pink-50 border border-pink-200 rounded-xl p-5">
                <h3 className="font-semibold text-gray-800 mb-3">
                  Visits summary:
                </h3>
                <div className="space-y-2 text-sm">
                  <div>24 min AVERAGE</div>
                  <div>15 min MINIMUM</div>
                  <div>01:30 h MAXIMUM</div>
                </div>
                <div className="mt-4 h-20 bg-pink-100 rounded flex items-end justify-between px-2">
                  <div className="text-xs text-gray-600">10:30</div>
                  <div className="text-xs text-gray-600">13:30</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
