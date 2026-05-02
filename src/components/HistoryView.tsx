import React from 'react';
import { ReportData } from '../types';
import { Clock, ChevronRight, Trash2 } from 'lucide-react';

interface HistoryViewProps {
  history: ReportData[];
  onSelect: (data: ReportData) => void;
  onDelete?: (id: string) => void;
}

export function HistoryView({ history, onSelect, onDelete }: HistoryViewProps) {
  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center h-[50vh]">
        <div className="w-16 h-16 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-center mb-4">
          <Clock className="w-8 h-8 text-gray-400" />
        </div>
        <h2 className="text-sm font-bold text-gray-700 mb-2">저장된 기록이 없습니다</h2>
        <p className="text-gray-500 text-xs max-w-sm">
          생성된 피드백 리포트를 기록에 저장하면<br/>여기서 다시 확인하고 활용할 수 있습니다.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4 sm:p-6 pb-24 px-4 mt-2">
      <h2 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
        <span className="w-1.5 h-4 bg-sky-400 rounded-full"></span> 과거 생성 기록
      </h2>
      
      <div className="space-y-3">
        {history.map((item, idx) => (
          <div key={item.id || idx} className="w-full bg-white p-5 rounded-2xl shadow-sm border border-blue-50 flex items-center justify-between hover:border-sky-300 hover:shadow-md transition-all text-left group">
            <button
              onClick={() => onSelect(item)}
              className="flex-1 text-left"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-[#333] text-base">{item.student_name}</span>
                <span className="px-2 py-0.5 bg-gray-50 text-gray-600 rounded text-[11px] font-bold border border-gray-100">{item.grade}</span>
                <span className="text-[11px] text-gray-400 font-medium ml-1">{item.created_at || item.test_date}</span>
              </div>
              <p className="text-sm text-gray-500 font-medium truncate mt-1">
                {item.unit_name} - <span className="text-sky-600">{item.achievement_level} ({item.score}점)</span>
              </p>
            </button>
            <div className="flex items-center gap-2">
              {onDelete && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    if(window.confirm('정말로 이 기록을 삭제하시겠습니까?')) {
                      onDelete(item.id!);
                    }
                  }}
                  className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors sm:opacity-0 sm:group-hover:opacity-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button 
                onClick={() => onSelect(item)}
                className="bg-gray-50 p-2 rounded-xl text-gray-400 hover:text-sky-500 hover:bg-sky-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
