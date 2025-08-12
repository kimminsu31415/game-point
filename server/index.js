const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 5000;

// 데이터 파일 경로
const DATA_FILE = path.join(__dirname, 'data.json');

// 미들웨어
app.use(cors());
app.use(express.json());

// 데이터 로드 함수
const loadData = () => {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('데이터 파일 로드 실패:', error);
  }

  // 기본 데이터 반환
  return {
    default: [
      {
        id: 'morning_study',
        name: '새벽 공부 (6-9시)',
        points: 2,
        description: 'AWS 실습, 백엔드 코딩, 데이터 분석',
        isDefault: true,
      },
      {
        id: 'english_practice',
        name: '영어 연습',
        points: 1,
        description: '기술 문서 읽기, 영어 회화 연습',
        isDefault: true,
      },
      {
        id: 'exercise',
        name: '운동 루틴',
        points: 1,
        description: '근력 운동 + 유산소 운동',
        isDefault: true,
      },
      {
        id: 'content_creation',
        name: '콘텐츠 제작',
        points: 1,
        description: '브이로그 촬영, 게임 개발, 블로그 작성',
        isDefault: true,
      },
    ],
    custom: {},
    completed: {},
  };
};

// 데이터 저장 함수
const saveData = (data) => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error('데이터 파일 저장 실패:', error);
  }
};

// 초기 데이터 로드
let routines = loadData();

// 기본 할 일 목록 가져오기
app.get('/api/routines/default', (req, res) => {
  res.json(routines.default);
});

// 특정 날짜의 커스텀 할 일 가져오기
app.get('/api/routines/custom/:date', (req, res) => {
  const { date } = req.params;
  const customRoutines = routines.custom[date] || [];
  res.json(customRoutines);
});

// 특정 날짜의 모든 할 일 가져오기 (기본 + 커스텀)
app.get('/api/routines/:date', (req, res) => {
  const { date } = req.params;
  const customRoutines = routines.custom[date] || [];
  const allRoutines = [...routines.default, ...customRoutines];
  res.json(allRoutines);
});

// 특정 날짜에 커스텀 할 일 추가
app.post('/api/routines/custom/:date', (req, res) => {
  const { date } = req.params;
  const { name, description } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: '할 일 이름은 필수입니다.' });
  }

  const newRoutine = {
    id: `custom_${Date.now()}`,
    name: name.trim(),
    points: 1,
    description: description?.trim() || '커스텀 할 일',
    isDefault: false,
  };

  if (!routines.custom[date]) {
    routines.custom[date] = [];
  }

  routines.custom[date].push(newRoutine);
  saveData(routines); // 데이터 파일에 저장
  res.json(newRoutine);
});

// 커스텀 할 일 삭제
app.delete('/api/routines/custom/:date/:id', (req, res) => {
  const { date, id } = req.params;

  if (routines.custom[date]) {
    routines.custom[date] = routines.custom[date].filter((r) => r.id !== id);
    saveData(routines); // 데이터 파일에 저장
  }

  res.json({ message: '할 일이 삭제되었습니다.' });
});

// 할 일 완료 상태 토글
app.post('/api/routines/complete/:date/:id', (req, res) => {
  const { date, id } = req.params;
  const { completed } = req.body;

  if (!routines.completed[date]) {
    routines.completed[date] = {};
  }

  routines.completed[date][id] = completed;
  saveData(routines); // 데이터 파일에 저장
  res.json({ message: '완료 상태가 업데이트되었습니다.' });
});

// 특정 날짜의 완료된 할 일 가져오기
app.get('/api/routines/complete/:date', (req, res) => {
  const { date } = req.params;
  const completedRoutines = routines.completed[date] || {};
  res.json(completedRoutines);
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`🚀 서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
  console.log(`📅 할 일 관리 API 서버`);
  console.log(`💾 데이터 파일: ${DATA_FILE}`);
});
