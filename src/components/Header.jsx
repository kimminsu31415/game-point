import React from 'react';

function Header({ remaining, onSave, onReset }) {
  return (
    <header className="sticky top-0 z-10 backdrop-blur-md bg-bg/70 border-b border-border">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl lg:text-3xl xl:text-4xl font-bold text-text tracking-wide m-0">
              Johnny Blackpaw – 성장 스킬 트리 2.0
            </h1>
            <div className="text-muted text-sm mt-1">
              클라우드·백엔드·AI 창업·영어·체력·창작을 하나의 캐릭터 빌드로
            </div>
          </div>
          <div className="flex flex-wrap gap-3 lg:gap-4 items-center justify-center lg:justify-end">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="bg-chip border border-border px-3 py-2 rounded-full flex gap-2 items-center text-sm">
                남은 포인트: <span className="text-accent font-semibold">{remaining}</span>
              </div>
              <div className="bg-warn/10 border border-warn/30 px-3 py-2 rounded-full flex gap-2 items-center text-sm">
                획득: <span className="text-warn font-semibold">+{Math.max(0, remaining - 24)}P</span>
              </div>
            </div>
            <button 
              className="bg-accent-2 text-bg font-bold px-4 py-2.5 rounded-lg shadow-custom hover:brightness-105 active:scale-95 transition-all duration-200"
              onClick={onSave}
            >
              저장
            </button>
            <button 
              className="bg-danger text-bg font-bold px-4 py-2.5 rounded-lg shadow-custom hover:brightness-105 active:scale-95 transition-all duration-200"
              onClick={onReset}
            >
              초기화
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
