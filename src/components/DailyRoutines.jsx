import React, { useState, useEffect } from 'react';

const API_BASE_URL =
  process.env.NODE_ENV === 'production'
    ? '/api/routines'
    : 'http://localhost:5000/api/routines';

const LOCAL_CUSTOM_KEY_PREFIX = 'gp_custom_';
const isProd = process.env.NODE_ENV === 'production';

function loadLocalCustom(dateKey) {
  try {
    const raw = localStorage.getItem(`${LOCAL_CUSTOM_KEY_PREFIX}${dateKey}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalCustom(dateKey, routines) {
  try {
    localStorage.setItem(
      `${LOCAL_CUSTOM_KEY_PREFIX}${dateKey}`,
      JSON.stringify(routines)
    );
  } catch {}
}

function makeKey(routine) {
  // 이름+설명을 기준으로 기기 간 동일 항목을 식별
  const name = (routine.name || '').trim().toLowerCase();
  const desc = (routine.description || '').trim().toLowerCase();
  return `${name}__${desc}`;
}

function DailyRoutines({ selectedDate, completedRoutines, onRoutineToggle }) {
  const [routines, setRoutines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newRoutineName, setNewRoutineName] = useState('');
  const [newRoutineDescription, setNewRoutineDescription] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const dateKey = selectedDate.toLocaleDateString('en-CA'); // YYYY-MM-DD

  useEffect(() => {
    fetchRoutines();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateKey]);

  const fetchRoutines = async () => {
    try {
      setLoading(true);

      // 1. 서버에서 데이터 가져오기 (우선순위 1)
      let serverData = [];
      try {
        const response = await fetch(`${API_BASE_URL}/${dateKey}`);
        if (response.ok) {
          serverData = await response.json();
        }
      } catch (error) {
        console.warn('서버 데이터 가져오기 실패:', error);
      }

      // 2. 로컬에서 데이터 가져오기 (우선순위 2)
      const localCustom = loadLocalCustom(dateKey);

      // 3. 서버 데이터를 기준으로 병합 (서버 우선)
      const mergedRoutines = [...serverData];

      // 로컬에만 있는 항목들을 서버에 동기화 시도
      for (const localRoutine of localCustom) {
        const localKey = makeKey(localRoutine);
        const serverExists = serverData.some((r) => makeKey(r) === localKey);

        if (!serverExists) {
          // 로컬에만 있는 항목을 서버에 추가 시도
          try {
            const response = await fetch(`${API_BASE_URL}/custom/${dateKey}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                name: localRoutine.name,
                description: localRoutine.description,
              }),
            });

            if (response.ok) {
              const newServerRoutine = await response.json();
              mergedRoutines.push(newServerRoutine);
            } else {
              // 서버 추가 실패 시 로컬 항목 유지
              mergedRoutines.push(localRoutine);
            }
          } catch (error) {
            // 네트워크 오류 시 로컬 항목 유지
            mergedRoutines.push(localRoutine);
          }
        }
      }

      // 4. 중복 제거 (이름+설명 기준)
      const uniqueRoutines = [];
      const seenKeys = new Set();

      for (const routine of mergedRoutines) {
        const key = makeKey(routine);
        if (!seenKeys.has(key)) {
          seenKeys.add(key);
          uniqueRoutines.push(routine);
        }
      }

      setRoutines(uniqueRoutines);

      // 5. 로컬 저장소 업데이트 (서버 데이터 기준으로)
      const localOnlyRoutines = uniqueRoutines.filter((r) => !r.isDefault);
      saveLocalCustom(dateKey, localOnlyRoutines);
    } catch (error) {
      console.error('할 일 목록을 가져오는데 실패했습니다:', error);
      // 완전 실패 시 로컬 데이터만 사용
      const localData = loadLocalCustom(dateKey);
      setRoutines(localData);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRoutine = async () => {
    const name = newRoutineName.trim();
    const description = newRoutineDescription.trim();
    if (!name) return;

    // 1. 서버에 먼저 추가 시도
    try {
      const response = await fetch(`${API_BASE_URL}/custom/${dateKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description }),
      });

      if (response.ok) {
        const newServerRoutine = await response.json();

        // 서버 성공 시 화면에 추가
        setRoutines((prev) => {
          const key = makeKey(newServerRoutine);
          const exists = prev.some((r) => makeKey(r) === key);
          return exists ? prev : [...prev, newServerRoutine];
        });

        // 로컬 저장소도 업데이트
        const currentLocal = loadLocalCustom(dateKey);
        const updatedLocal = [...currentLocal, newServerRoutine];
        saveLocalCustom(dateKey, updatedLocal);

        setNewRoutineName('');
        setNewRoutineDescription('');
        setShowAddForm(false);
        return;
      }
    } catch (error) {
      console.warn('서버 추가 실패:', error);
    }

    // 2. 서버 실패 시 로컬에만 추가
    const newLocalRoutine = {
      id: `local_${Date.now()}`,
      name,
      points: 1,
      description: description || '커스텀 할 일',
      isDefault: false,
    };

    // 로컬 저장소에 추가
    const currentLocal = loadLocalCustom(dateKey);
    const updatedLocal = [...currentLocal, newLocalRoutine];
    saveLocalCustom(dateKey, updatedLocal);

    // 화면에 추가 (중복 방지)
    setRoutines((prev) => {
      const key = makeKey(newLocalRoutine);
      const exists = prev.some((r) => makeKey(r) === key);
      return exists ? prev : [...prev, newLocalRoutine];
    });

    setNewRoutineName('');
    setNewRoutineDescription('');
    setShowAddForm(false);
  };

  const handleDeleteRoutine = async (routineId) => {
    // 현재 목록에서 대상 찾기
    const target = routines.find((r) => r.id === routineId);
    if (!target) return;

    const targetKey = makeKey(target);

    // 1. 서버에서 삭제 시도 (서버 ID인 경우)
    if (!String(routineId).startsWith('local_')) {
      try {
        await fetch(`${API_BASE_URL}/custom/${dateKey}/${routineId}`, {
          method: 'DELETE',
        });
      } catch (error) {
        console.warn('서버 삭제 실패:', error);
      }
    }

    // 2. 로컬에서 제거
    const currentLocal = loadLocalCustom(dateKey);
    const filteredLocal = currentLocal.filter((r) => makeKey(r) !== targetKey);
    saveLocalCustom(dateKey, filteredLocal);

    // 3. 화면에서 제거
    setRoutines((prev) => prev.filter((r) => makeKey(r) !== targetKey));

    // 4. 완료 상태 제거 통지
    if (completedRoutines[routineId]) {
      onRoutineToggle(routineId, false);
    }
  };

  const handleRoutineToggle = async (routineId) => {
    // 이벤트 기본 동작 방지
    event.preventDefault();
    event.stopPropagation();

    if (newRoutineName.trim()) {
      try {
        const response = await fetch(`${API_BASE_URL}/custom/${dateKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: newRoutineName.trim(),
            description: newRoutineDescription.trim(),
          }),
        });

        if (response.ok) {
          await fetchRoutines(); // 목록 새로고침
          setNewRoutineName('');
          setNewRoutineDescription('');
          setShowAddForm(false);
        }
      } catch (error) {
        console.error('할 일 추가에 실패했습니다:', error);
      }
    }
  };

  const handleCheckboxChange = async (routineId, isCompleted) => {
    // 이벤트 기본 동작 방지
    event.preventDefault();
    event.stopPropagation();

    try {
      const response = await fetch(
        `${API_BASE_URL}/complete/${dateKey}/${routineId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ completed: isCompleted }),
        }
      );

      if (response.ok) {
        // 부모 컴포넌트에 상태 변경 알림
        onRoutineToggle(routineId, isCompleted);
      }
    } catch (error) {
      console.error('할 일 완료 상태 업데이트에 실패했습니다:', error);
    }
  };

  const getTotalPoints = () => {
    return routines.reduce((total, routine) => {
      if (completedRoutines[routine.id]) return total + routine.points;
      return total;
    }, 0);
  };

  const getCompletedCount = () => {
    return routines.reduce((count, routine) => {
      if (completedRoutines[routine.id]) return count + 1;
      return count;
    }, 0);
  };

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center py-8">
        <div className="text-purple-600">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-purple-700 font-medium">
            완료: {getCompletedCount()}/{routines.length}
          </span>
          <span className="text-sm text-purple-700 font-medium">
            포인트: {getTotalPoints()}P
          </span>
        </div>
        <div className="w-full bg-purple-100 rounded-full h-3 border border-purple-200">
          <div
            className="bg-purple-500 h-3 rounded-full transition-all duration-300 shadow-sm"
            style={{
              width: `${
                routines.length > 0
                  ? (getCompletedCount() / routines.length) * 100
                  : 0
              }%`,
            }}
          ></div>
        </div>
        <div className="text-xs text-purple-600 mt-1 text-center">
          {routines.length > 0
            ? `${Math.round(
                (getCompletedCount() / routines.length) * 100
              )}% 완료`
            : '할 일이 없습니다'}
        </div>
      </div>

      {/* 할 일 추가 버튼 */}
      <div className="mb-4">
        {!showAddForm ? (
          <button
            onClick={() => setShowAddForm(true)}
            className="w-full bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <span>➕</span>
            <span>새 할 일 추가</span>
          </button>
        ) : (
          <div className="bg-white border border-purple-300 rounded-lg p-4 space-y-3">
            <input
              type="text"
              placeholder="할 일 이름"
              value={newRoutineName}
              onChange={(e) => setNewRoutineName(e.target.value)}
              className="w-full px-3 py-2 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <input
              type="text"
              placeholder="설명 (선택사항)"
              value={newRoutineDescription}
              onChange={(e) => setNewRoutineDescription(e.target.value)}
              className="w-full px-3 py-2 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <div className="flex gap-2">
              <button
                onClick={handleAddRoutine}
                className="flex-1 bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded-md transition-colors duration-200"
              >
                추가
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-md transition-colors duration-200"
              >
                취소
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-3">
        {routines.map((routine) => {
          const isCompleted = completedRoutines[routine.id] || false;
          return (
            <div
              key={routine.id}
              className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 ${
                isCompleted
                  ? 'bg-green-100 border-green-300'
                  : 'bg-white border-purple-200'
              }`}
            >
              <label className="relative inline-block w-6 h-6 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isCompleted}
                  onChange={() => onRoutineToggle(routine.id, !isCompleted)}
                  className="opacity-0 w-0 h-0"
                />
                <span
                  className={`absolute top-0 left-0 w-6 h-6 rounded-md border-2 transition-all duration-200 flex items-center justify-center ${
                    isCompleted
                      ? 'bg-green-500 border-green-500 text-white'
                      : 'bg-white border-purple-400 text-transparent hover:bg-purple-50'
                  }`}
                >
                  {isCompleted && (
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </span>
              </label>

              <div className="flex-1 flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <div
                    className={`font-semibold ${
                      isCompleted
                        ? 'text-green-800 line-through'
                        : 'text-gray-800'
                    }`}
                  >
                    {routine.name}
                  </div>
                  {!routine.isDefault && (
                    <button
                      onClick={() => handleDeleteRoutine(routine.id)}
                      className="text-red-500 hover:text-red-700 text-xs"
                    >
                      🗑️
                    </button>
                  )}
                </div>
                <div
                  className={`text-xs ${
                    isCompleted ? 'text-green-600' : 'text-gray-600'
                  }`}
                >
                  {routine.description}
                </div>
                <div
                  className={`text-xs font-semibold ${
                    isCompleted ? 'text-green-600' : 'text-purple-600'
                  }`}
                >
                  +{routine.points}P
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default DailyRoutines;
