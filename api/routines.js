// Vercel Serverless Function for routines API (CommonJS)
const fs = require('fs');
const path = require('path');

// 데이터 파일 경로 (Vercel 환경에서는 임시 저장소 사용)
function getDataPath() {
  if (process.env.VERCEL) return '/tmp/data.json';
  return path.join(process.cwd(), 'data.json');
}

function loadData() {
  try {
    const dataPath = getDataPath();
    if (fs.existsSync(dataPath)) {
      const data = fs.readFileSync(dataPath, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('데이터 파일 로드 실패:', error);
  }
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
}

function saveData(data) {
  try {
    const dataPath = getDataPath();
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error('데이터 파일 저장 실패:', error);
  }
}

let routines = loadData();

module.exports = async (req, res) => {
  // CORS (개발 시에만 필요한 경우가 많지만 유지)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    // /api/routines[...] 이후 경로를 분해
    const base = '/api/routines';
    const subPath = url.pathname.startsWith(base)
      ? url.pathname.slice(base.length).replace(/^\//, '')
      : '';
    const parts = subPath.length ? subPath.split('/') : [];

    // 라우팅 규칙
    // GET /api/routines -> 기본 할 일 목록
    // GET /api/routines/:date -> 특정 날짜의 모든 할 일 (기본 + 커스텀)
    // POST /api/routines/custom/:date -> 커스텀 할 일 추가
    // DELETE /api/routines/custom/:date/:id -> 커스텀 할 일 삭제 (+ 완료 상태 제거)
    // GET /api/routines/complete/:date -> 특정 날짜 완료 상태 맵
    // POST /api/routines/complete/:date/:id -> 완료 상태 토글

    if (req.method === 'GET' && parts.length === 0) {
      return res.status(200).json(routines.default);
    }

    if (parts[0] === 'custom') {
      // custom 경로들
      if (req.method === 'POST' && parts.length === 2) {
        const date = parts[1];
        const chunks = [];
        for await (const chunk of req) chunks.push(chunk);
        const body = chunks.length
          ? JSON.parse(Buffer.concat(chunks).toString())
          : {};
        const { name, description } = body;
        if (!name || !name.trim())
          return res.status(400).json({ error: '할 일 이름은 필수입니다.' });
        const newRoutine = {
          id: `custom_${Date.now()}`,
          name: name.trim(),
          points: 1,
          description: (description || '').trim() || '커스텀 할 일',
          isDefault: false,
        };
        if (!routines.custom[date]) routines.custom[date] = [];
        routines.custom[date].push(newRoutine);
        saveData(routines);
        return res.status(200).json(newRoutine);
      }
      if (req.method === 'DELETE' && parts.length === 3) {
        const [_, date, id] = parts;
        if (routines.custom[date]) {
          routines.custom[date] = routines.custom[date].filter(
            (r) => r.id !== id
          );
        }
        if (routines.completed[date] && routines.completed[date][id]) {
          delete routines.completed[date][id];
        }
        saveData(routines);
        return res.status(200).json({ message: '할 일이 삭제되었습니다.' });
      }
      return res.status(400).json({ error: '잘못된 custom 요청입니다.' });
    }

    if (parts[0] === 'complete') {
      // complete 경로들
      if (req.method === 'GET' && parts.length === 2) {
        const date = parts[1];
        return res.status(200).json(routines.completed[date] || {});
      }
      if (req.method === 'POST' && parts.length === 3) {
        const date = parts[1];
        const id = parts[2];
        const chunks = [];
        for await (const chunk of req) chunks.push(chunk);
        const body = chunks.length
          ? JSON.parse(Buffer.concat(chunks).toString())
          : {};
        if (!routines.completed[date]) routines.completed[date] = {};
        routines.completed[date][id] = !!body.completed;
        saveData(routines);
        return res
          .status(200)
          .json({ message: '완료 상태가 업데이트되었습니다.' });
      }
      return res.status(400).json({ error: '잘못된 complete 요청입니다.' });
    }

    // 나머지: /:date (GET)
    if (req.method === 'GET' && parts.length === 1) {
      const date = parts[0];
      const customRoutines = routines.custom[date] || [];
      const all = [...routines.default, ...customRoutines];
      return res.status(200).json(all);
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (error) {
    console.error('API 오류:', error);
    return res.status(500).json({ error: '서버 내부 오류가 발생했습니다.' });
  }
};
