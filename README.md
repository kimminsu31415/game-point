# 🎯 Game Point - 할 일 관리 웹 애플리케이션

## 📋 프로젝트 소개

Game Point는 게임화된 할 일 관리 시스템으로, 캘린더 기반의 체크리스트와 포인트 시스템을 제공합니다.

## ✨ 주요 기능

### 🗓️ **캘린더 시스템**
- 월별 캘린더 뷰
- 오늘 날짜 하이라이트 (빨간색)
- 선택된 날짜 표시 (파란색 링)
- 완료된 할 일이 있는 날짜 표시 (초록색 점)

### ✅ **할 일 관리**
- 기본 할 일 목록 (새벽 공부, 영어 연습, 운동, 콘텐츠 제작)
- 커스텀 할 일 추가 (1포인트씩 할당)
- 할 일 완료/미완료 토글
- 진행률 바와 포인트 표시

### 🏆 **포인트 시스템**
- 기본 할 일: 1-2포인트
- 커스텀 할 일: 1포인트
- 실시간 포인트 계산
- 완료 개수 추적

### 💾 **데이터 저장**
- JSON 파일 기반 영구 저장
- 서버 재시작 시에도 데이터 유지
- 날짜별 독립적인 할 일 관리

## 🚀 기술 스택

### **Frontend**
- React 18
- Tailwind CSS
- Vite

### **Backend**
- Node.js
- Express.js
- JSON 파일 기반 데이터 저장

## 📁 프로젝트 구조

```
gamepoint/
├── src/                    # React 클라이언트
│   ├── components/        # React 컴포넌트
│   │   ├── Calendar.jsx   # 캘린더 컴포넌트
│   │   └── DailyRoutines.jsx # 할 일 관리 컴포넌트
│   ├── App.jsx           # 메인 앱 컴포넌트
│   └── main.jsx          # 앱 진입점
├── server/                # Express 서버
│   ├── index.js          # 서버 메인 파일
│   └── package.json      # 서버 의존성
├── package.json           # 클라이언트 의존성
└── tailwind.config.js     # Tailwind CSS 설정
```

## 🛠️ 설치 및 실행

### **1. 저장소 클론**
```bash
git clone https://github.com/kimminsu31415/game-point.git
cd game-point
```

### **2. 클라이언트 의존성 설치**
```bash
npm install
```

### **3. 서버 의존성 설치**
```bash
cd server
npm install
```

### **4. 서버 실행**
```bash
# 서버 디렉토리에서
node index.js
```

### **5. 클라이언트 실행**
```bash
# 새 터미널에서 (프로젝트 루트)
npm run dev
```

### **6. 브라우저 접속**
- **클라이언트**: `http://localhost:3001/`
- **서버 API**: `http://localhost:5000/api/`

## 📖 사용법

### **할 일 추가하기**
1. 캘린더에서 원하는 날짜 클릭
2. "새 할 일 추가" 버튼 클릭
3. 할 일 이름과 설명 입력
4. "추가" 버튼으로 저장

### **할 일 완료하기**
1. 체크박스 클릭하여 완료/미완료 토글
2. 실시간으로 포인트와 진행률 업데이트

### **날짜 변경하기**
1. 캘린더에서 다른 날짜 클릭
2. 해당 날짜의 할 일 목록 표시
3. 날짜별로 독립적인 할 일 관리

## 🔧 API 엔드포인트

### **할 일 관리**
- `GET /api/routines/:date` - 특정 날짜의 모든 할 일
- `POST /api/routines/custom/:date` - 커스텀 할 일 추가
- `DELETE /api/routines/custom/:date/:id` - 커스텀 할 일 삭제

### **완료 상태**
- `GET /api/routines/complete/:date` - 완료된 할 일 상태
- `POST /api/routines/complete/:date/:id` - 할 일 완료 상태 토글

## 🎨 UI/UX 특징

- **3패널 레이아웃**: 캘린더, 할 일 목록, 메인 콘텐츠
- **반응형 디자인**: 모든 화면 크기에서 최적화
- **직관적인 인터페이스**: 색상과 아이콘으로 상태 표시
- **실시간 업데이트**: 즉시 반영되는 변경사항

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 👨‍💻 개발자

**김민수** - [GitHub](https://github.com/kimminsu31415)

---

⭐ 이 프로젝트가 도움이 되었다면 스타를 눌러주세요!
