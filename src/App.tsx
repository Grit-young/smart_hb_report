import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { InputForm } from './components/InputForm';
import { ResultView } from './components/ResultView';
import { HistoryView } from './components/HistoryView';
import { ReportData, StudentInfo } from './types';
import { generateFeedbackReport } from './services/aiService';
import { SAMPLE_DATA } from './constants/sampleData';
import { useAuth } from './contexts/AuthContext';
import { LoginView, PendingView } from './components/AuthViews';
import { AdminPanel } from './components/AdminPanel';
import { saveReportToDB, fetchReportsFromDB, deleteReportFromDB } from './services/dbService';

type ViewMode = 'input' | 'result' | 'history' | 'admin';

export default function App() {
  const [view, setView] = useState<ViewMode>('input');
  const [currentData, setCurrentData] = useState<ReportData | null>(null);
  const [history, setHistory] = useState<ReportData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user, status, loading } = useAuth();

  useEffect(() => {
    if (user && status === 'approved') {
      loadHistory();
    }
  }, [user, status]);

  const loadHistory = async () => {
    try {
      const reports = await fetchReportsFromDB();
      setHistory(reports);
    } catch (e) {
      console.error("Failed to fetch history:", e);
    }
  };

  const saveToHistory = async (data: ReportData) => {
    try {
      const isAlreadyInHistory = history.some(h => h.id === data.id);
      if (!isAlreadyInHistory) {
        await saveReportToDB(data);
        alert("기록에 저장되었습니다.");
        loadHistory(); // Refresh history
      } else {
        alert("이미 저장된 결과입니다.");
      }
    } catch (e) {
      console.error(e);
      alert("저장 중 오류가 발생했습니다.\n" + (e as Error).message);
    }
  };
  
  const handleDeleteFromHistory = async (id: string) => {
    try {
      await deleteReportFromDB(id);
      loadHistory();
    } catch (e) {
      console.error(e);
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  const handleAnalyze = async (info: StudentInfo, files: { data: string; mimeType: string; name: string }[]) => {
    setIsLoading(true);
    try {
      const result = await generateFeedbackReport(info, files);
      setCurrentData({ ...result, id: Math.random().toString(36).substring(2, 11) });
      setView('result');
    } catch (e) {
      console.error(e);
      alert("분석 중 오류가 발생했습니다. 개발 환경의 경우 GEMINI_API_KEY가 설정되어 있는지 확인해주세요.\n\n" + (e as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSampleData = () => {
    setCurrentData({ ...SAMPLE_DATA, id: Math.random().toString(36).substring(2, 11) });
    setView('result');
  };

  if (loading) {
    return <div className="min-h-screen bg-[#F0F7FF] flex items-center justify-center">불러오는 중...</div>;
  }

  if (!user) {
    return <LoginView />;
  }

  if (status === 'pending') {
    return <PendingView />;
  }

  return (
    <div className="min-h-screen bg-[#F0F7FF] text-[#333] font-sans selection:bg-sky-100 selection:text-sky-900">
      <Header view={view} setView={setView} isAdmin={status === 'admin'} />
      
      <main className="w-full">
        {view === 'admin' && status === 'admin' && (
          <AdminPanel onBack={() => setView('input')} />
        )}
        
        {view === 'input' && (
          <InputForm 
            onAnalyze={handleAnalyze} 
            onSampleData={handleSampleData} 
            isLoading={isLoading} 
          />
        )}
        
        {view === 'result' && currentData && (
          <ResultView 
            data={currentData} 
            onUpdate={setCurrentData} 
            onSave={() => saveToHistory(currentData)} 
          />
        )}

        {view === 'history' && (
          <HistoryView 
            history={history} 
            onSelect={(data) => {
              setCurrentData(data);
              setView('result');
            }}
            onDelete={handleDeleteFromHistory}
          />
        )}
      </main>
    </div>
  );
}
