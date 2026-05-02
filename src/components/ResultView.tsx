import React from 'react';
import { ReportData } from '../types';
import { Copy, MessageCircle } from 'lucide-react';

interface ResultViewProps {
  data: ReportData;
  onUpdate: (data: ReportData) => void;
  onSave: () => void;
}

export function ResultView({ data, onUpdate, onSave }: ResultViewProps) {
  
  const handleChangeList = (field: keyof ReportData, index: number, value: string) => {
    const list = [...(data[field] as string[])];
    list[index] = value;
    onUpdate({ ...data, [field]: list });
  };

  const handleTextChange = (field: keyof ReportData, value: string | number) => {
    onUpdate({ ...data, [field]: value });
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert("클립보드에 복사되었습니다. 카카오톡에 붙여넣기 하세요!");
    } catch (e) {
      alert("복사에 실패했습니다.");
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 sm:p-6 pb-24 px-4 mt-2">
      
      {/* 2. 검토 및 편집 영역 (Top in design structure, shifted order visually if using desktop view but left to top-down here) */}
      <section className="bg-white rounded-3xl border border-blue-100 shadow-sm overflow-hidden flex flex-col">
        <div className="bg-sky-50 px-6 py-3 border-b border-sky-100 flex justify-between items-center">
          <h3 className="text-xs font-bold text-sky-700 flex items-center gap-2 uppercase tracking-wider">
            <span className="flex h-2 w-2 rounded-full bg-sky-500"></span> AI 생성 분석 결과 데이터 수정
          </h3>
          <div className="flex gap-4">
             {/* Action slot */}
          </div>
        </div>

        <div className="flex flex-col p-6 space-y-6">
          {/* 기본 정보 요약 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-gray-400 uppercase mb-1 block">학생/학년</span>
              <span className="text-sm font-medium text-[#333]">{data.student_name} ({data.grade})</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-gray-400 uppercase mb-1 block">단원명</span>
              <span className="text-sm font-medium text-[#333]">{data.unit_name}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-gray-400 uppercase mb-1 block">예상 점수</span>
              <input 
                type="number"
                value={data.score}
                onChange={(e) => handleTextChange('score', Number(e.target.value))}
                className="font-medium text-sky-600 bg-transparent border-b border-dashed border-sky-300 focus:outline-none w-16 text-sm"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-gray-400 uppercase mb-1 block">성취 수준</span>
              <input 
                type="text"
                value={data.achievement_level}
                onChange={(e) => handleTextChange('achievement_level', e.target.value)}
                className="font-medium text-[#333] bg-transparent border-b border-dashed border-gray-300 focus:outline-none w-24 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-green-50 p-4 rounded-2xl border border-green-100/50">
              <EditableList 
                title="✓ 강점 포인트" 
                items={data.strengths} 
                onChange={(idx, val) => handleChangeList('strengths', idx, val)}
                color="text-green-700"
                itemColor="text-green-800"
              />
            </div>
            
            <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100/50">
              <EditableList 
                title="⚠️ 보완 포인트 (취약점)" 
                items={data.weak_points} 
                onChange={(idx, val) => handleChangeList('weak_points', idx, val)}
                color="text-orange-700"
                itemColor="text-orange-800"
              />
            </div>
          </div>

          <div className="space-y-4">
            <PlainEditableList 
              title="오답 원인" 
              items={data.error_causes} 
              onChange={(idx, val) => handleChangeList('error_causes', idx, val)}
            />
            
            <PlainEditableList 
              title="학원 관리 계획" 
              items={data.academy_plan} 
              onChange={(idx, val) => handleChangeList('academy_plan', idx, val)}
            />
            
            <PlainEditableList 
              title="다음 단원 연결" 
              items={data.next_unit_connection} 
              onChange={(idx, val) => handleChangeList('next_unit_connection', idx, val)}
            />
            
            <PlainEditableList 
              title="가정 협조 포인트" 
              items={data.home_support_points} 
              onChange={(idx, val) => handleChangeList('home_support_points', idx, val)}
            />
          </div>
        </div>
      </section>

      {/* 1. 카카오톡 발송용 메시지 */}
      <section className="bg-white rounded-3xl border border-yellow-100 shadow-sm p-4 sm:p-6 space-y-4">
        <h4 className="text-[11px] font-bold text-yellow-600 mb-3 flex items-center gap-2">
          <span className="w-2 h-2 bg-yellow-400 rounded-full"></span> 카카오톡 공유 문구 (복사해서 바로 보내기)
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <KakaoCard 
            title="짧고 친근한 버전" 
            value={data.kakao_short}
            onChange={(v) => handleTextChange('kakao_short', v)}
            onCopy={() => copyToClipboard(data.kakao_short)}
          />
          
          <KakaoCard 
            title="표준 버전" 
            value={data.kakao_standard}
            onChange={(v) => handleTextChange('kakao_standard', v)}
            onCopy={() => copyToClipboard(data.kakao_standard)}
            isPrimary
          />
          
          <KakaoCard 
            title="상담용 상세 버전" 
            value={data.kakao_detailed}
            onChange={(v) => handleTextChange('kakao_detailed', v)}
            onCopy={() => copyToClipboard(data.kakao_detailed)}
          />
        </div>
      </section>
      
      {/* 액션 플로팅 버튼 - 모바일 하단 고정 */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-gray-100 flex justify-center z-20">
        <div className="w-full max-w-4xl flex justify-end gap-3 px-2">
          <button
            onClick={onSave}
            className="flex-1 sm:flex-none py-3.5 px-8 bg-sky-500 text-white font-bold rounded-2xl hover:bg-sky-600 transition-colors shadow-lg shadow-sky-500/20"
          >
            현재 결과 기록에 저장하기
          </button>
        </div>
      </div>

    </div>
  );
}

function KakaoCard({ title, value, onChange, onCopy, isPrimary = false }: any) {
  return (
    <div className={`flex flex-col relative group rounded-xl border transition-all ${isPrimary ? 'bg-yellow-50 border-yellow-100 flex-1' : 'bg-gray-50 border-gray-100 opacity-80 hover:opacity-100'}`}>
      <span className={`absolute top-3 right-3 text-[10px] font-bold z-10 ${isPrimary ? 'text-yellow-600' : 'text-gray-400'}`}>{title}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-[140px] sm:h-[180px] p-3 pt-8 pb-12 text-[11px] sm:text-[12px] leading-relaxed text-gray-700 bg-transparent resize-none focus:outline-none rounded-xl transition-all"
      />
      <div className="absolute bottom-2 right-2 flex gap-1.5">
        {isPrimary && (
          <button
            className="bg-[#FEE500] hover:bg-[#FDD800] text-[#371D1E] px-3 py-1.5 rounded-full text-[10px] font-bold shadow-sm flex items-center gap-1 opacity-100 transition-colors"
             title="카카오톡 공유 연동 예정"
          >
            <MessageCircle className="w-3 h-3" />
            카톡
          </button>
        )}
        <button
          onClick={onCopy}
          className={`px-3 py-1.5 rounded-full text-[10px] font-bold shadow-sm transition-colors ${
            isPrimary 
              ? 'bg-yellow-400 text-white hover:bg-yellow-500' 
              : 'bg-gray-300 text-white hover:bg-gray-400'
          }`}
        >
          복사
        </button>
      </div>
    </div>
  );
}

function EditableList({ title, items, onChange, color, itemColor }: any) {
  return (
    <div>
      <h5 className={`text-[11px] font-bold mb-2 uppercase tracking-wide ${color}`}>{title}</h5>
      <ul className={`text-[11px] space-y-1 ${itemColor}`}>
        {items.map((item: string, idx: number) => (
          <li key={idx} className="flex gap-1">
            <span className="mt-0.5">•</span>
            <textarea
              value={item}
              onChange={(e) => onChange(idx, e.target.value)}
              className="flex-1 bg-transparent border border-transparent hover:border-black/5 focus:bg-white focus:border-black/10 focus:ring-1 focus:ring-black/10 rounded-md p-1 -mt-1 resize-none h-auto transition-colors outline-none"
              rows={Math.max(1, Math.ceil(item.length / 32))}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

function PlainEditableList({ title, items, onChange }: any) {
  return (
    <div>
      <h5 className="text-[11px] font-bold text-sky-600 mb-1">{title}</h5>
      <ul className="text-xs text-gray-600 bg-gray-50 p-2 rounded-xl border border-gray-100 space-y-1">
        {items.map((item: string, idx: number) => (
           <li key={idx}>
             <textarea
              value={item}
              onChange={(e) => onChange(idx, e.target.value)}
              className="w-full bg-transparent border border-transparent hover:border-gray-200 focus:bg-white focus:border-sky-300 focus:ring-1 focus:ring-sky-100 rounded-md p-1 resize-none h-auto transition-colors outline-none"
              rows={Math.max(1, Math.ceil(item.length / 50))}
            />
           </li>
        ))}
      </ul>
    </div>
  );
}
