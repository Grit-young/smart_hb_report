import React, { useState } from 'react';
import { Upload, X, FileImage, FileText, Play } from 'lucide-react';
import { StudentInfo } from '../types';
import { extractStudentInfo } from '../services/aiService';

interface InputFormProps {
  onAnalyze: (info: StudentInfo, files: { data: string; mimeType: string; name: string }[]) => void;
  onSampleData: () => void;
  isLoading?: boolean;
}

const GRADES = ["초1", "초2", "초3", "초4", "초5", "초6", "중1", "중2", "중3"];

export function InputForm({ onAnalyze, onSampleData, isLoading }: InputFormProps) {
  const [info, setInfo] = useState<StudentInfo>({
    student_name: '',
    grade: '초4',
    gender: '',
    test_date: new Date().toISOString().split('T')[0],
    unit_name: '',
  });

  const [files, setFiles] = useState<{ file: File; id: string }[]>([]);
  const [isExtracting, setIsExtracting] = useState(false);

  const handleInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFilesList = Array.from(e.target.files) as File[];
      const newFiles: { file: File; id: string }[] = newFilesList.map(f => ({
        file: f,
        id: Math.random().toString(36).substring(2, 9)
      }));
      
      // Update UI immediately
      setFiles(prev => [...prev, ...newFiles]);

      // Auto extraction from files
      try {
        setIsExtracting(true);
        const processedFiles = await Promise.all(newFiles.map(f => fileToBase64(f.file)));
        const extracted = await extractStudentInfo(processedFiles);
        
        setInfo(prev => ({
          ...prev,
          student_name: extracted.student_name || prev.student_name,
          grade: extracted.grade || prev.grade,
          test_date: extracted.test_date || prev.test_date,
          unit_name: extracted.unit_name || prev.unit_name,
        }));
      } catch (err) {
        console.error("Extraction error:", err);
      } finally {
        setIsExtracting(false);
      }
    }
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const fileToBase64 = (file: File): Promise<{ data: string; mimeType: string; name: string }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        const base64Data = result.split(',')[1];
        resolve({ data: base64Data, mimeType: file.type, name: file.name });
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length === 0 && !info.student_name) {
      alert("분석할 파일이나 학생 정보를 입력해주세요.");
      return;
    }
    
    // Process files for final analysis
    try {
      const processedFiles = await Promise.all(files.map(f => fileToBase64(f.file)));
      onAnalyze(info, processedFiles);
    } catch (err) {
      console.error("파일 처리 오류:", err);
      alert("이미지를 처리하는 중 오류가 발생했습니다.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto space-y-4 sm:p-6 pb-24 px-4 mt-2">
      
      {/* 파일 업로드 카드 (Now first step) */}
      <section className="bg-white rounded-2xl p-5 shadow-sm border border-blue-50">
        <h2 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
          <span className="w-1.5 h-4 bg-sky-400 rounded-full"></span> 1. 분석 파일 업로드 (시험지/분석표)
        </h2>
        
        <div className="flex flex-col gap-2">
          <label className="border-2 border-dashed border-sky-200 bg-sky-50/50 rounded-xl p-6 text-center cursor-pointer hover:bg-sky-50 transition-colors group">
            <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">📄</div>
            <p className="text-[12px] text-sky-800 font-bold leading-relaxed mb-1">
              시험지 및 분석표 문서를 여기에 클릭하여 업로드하세요
            </p>
            <p className="text-[10px] text-gray-500 font-medium">업로드 시 AI가 자동으로 학생 정보를 읽어옵니다.</p>
            <input 
              type="file" 
              className="hidden" 
              multiple 
              accept="image/*,application/pdf"
              onChange={handleFileChange} 
            />
          </label>

          {files.length > 0 && (
            <div className="flex flex-col gap-2 mt-2">
              {files.map(f => (
                <div key={f.id} className="flex gap-2">
                  <div className="flex-1 bg-gray-100 p-2 rounded-lg flex items-center gap-2">
                    <div className="w-6 h-6 bg-white rounded flex items-center justify-center text-[10px] shadow-sm font-bold text-sky-600">
                      {f.file.type.includes('pdf') ? 'PDF' : 'IMG'}
                    </div>
                    <span className="text-[10px] text-gray-600 truncate">{f.file.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(f.id)}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 학생 정보 카드 (Now second step) */}
      <section className="bg-white rounded-2xl p-5 shadow-sm border border-blue-50 relative overflow-hidden">
        {isExtracting && (
           <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center animate-in fade-in">
             <svg className="animate-spin h-6 w-6 text-sky-500 mb-2" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
             </svg>
             <p className="text-[11px] font-bold text-sky-700">문서에서 학생 정보를 추출하고 있습니다...</p>
           </div>
        )}
        <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-gray-700 flex items-center gap-2">
            <span className="w-1.5 h-4 bg-sky-400 rounded-full"></span> 2. 발견된 학생 정보 (수정 가능)
            </h2>
            <span className="text-[10px] text-gray-400 font-medium">잘못 읽힌 부분이 있다면 직접 수정해주세요.</span>
        </div>
        
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="col-span-2 sm:col-span-1">
            <label className="text-[11px] font-bold text-gray-400 uppercase mb-1 block">학생 이름 <span className="text-sky-500">*</span></label>
            <input
              type="text"
              name="student_name"
              value={info.student_name}
              onChange={handleInfoChange}
              placeholder="직접 입력 가능"
              required
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-sky-400 transition-colors"
            />
          </div>
          
          <div className="col-span-2 sm:col-span-1">
            <label className="text-[11px] font-bold text-gray-400 uppercase mb-1 block">학년 <span className="text-sky-500">*</span></label>
            <select
              name="grade"
              value={info.grade}
              onChange={handleInfoChange}
              required
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-sky-400 transition-colors"
            >
              {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>

          <div className="col-span-2 sm:col-span-1">
            <label className="text-[11px] font-bold text-gray-400 uppercase mb-1 block">성별 (선택)</label>
            <div className="flex gap-4 px-1 py-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="gender" value="남" checked={info.gender === '남'} onChange={handleInfoChange} className="accent-sky-500 w-4 h-4" />
                <span className="text-sm text-gray-600 font-medium">남</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="gender" value="여" checked={info.gender === '여'} onChange={handleInfoChange} className="accent-sky-500 w-4 h-4" />
                <span className="text-sm text-gray-600 font-medium">여</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="gender" value="" checked={info.gender === ''} onChange={handleInfoChange} className="accent-sky-500 w-4 h-4" />
                <span className="text-sm text-gray-600 font-medium">선택안함</span>
              </label>
            </div>
          </div>

          <div className="col-span-2 sm:col-span-1">
            <label className="text-[11px] font-bold text-gray-400 uppercase mb-1 block">시험일 <span className="text-sky-500">*</span></label>
            <input
              type="date"
              name="test_date"
              value={info.test_date}
              onChange={handleInfoChange}
              required
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-sky-400 transition-colors"
            />
          </div>

          <div className="col-span-2">
            <label className="text-[11px] font-bold text-gray-400 uppercase mb-1 block">단원명 <span className="text-sky-500">*</span></label>
            <input
              type="text"
              name="unit_name"
              value={info.unit_name}
              onChange={handleInfoChange}
              placeholder="예: 4단원 사각형"
              required
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-sky-400 transition-colors font-medium text-[#333]"
            />
          </div>
        </div>
      </section>

      {/* 실행 버튼 영역 */}
      <div className="flex flex-col gap-3 pt-4">
        <button
          type="submit"
          disabled={isLoading || isExtracting}
          className="w-full py-4 bg-sky-500 hover:bg-sky-600 text-white rounded-2xl font-bold shadow-lg shadow-sky-200 transition-all flex items-center justify-center gap-2 disabled:opacity-70 mt-auto"
        >
          {isLoading ? (
            <span className="flex items-center gap-2 text-base">
              <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              AI 리포트 생성 중...
            </span>
          ) : (
            <span className="flex items-center gap-2 text-base">
              <span className="text-lg">✨</span> 분석 리포트 생성하기
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={onSampleData}
          disabled={isLoading || isExtracting}
          className="w-full py-3 bg-white border border-gray-200 text-gray-700 font-bold rounded-2xl hover:bg-gray-50 focus:ring-4 focus:ring-gray-100 transition-all disabled:opacity-50 text-sm"
        >
          샘플 데이터로 체험하기
        </button>
      </div>
    </form>
  );
}
