import { ArrowLeft, History, Shield, LogOut } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

interface HeaderProps {
  view: string;
  setView: (view: any) => void;
  isAdmin?: boolean;
}

export function Header({ view, setView, isAdmin }: HeaderProps) {
  const { logout, user } = useAuth();
  
  return (
    <header className="bg-white border-b border-blue-100 sticky top-0 z-10 px-4 sm:px-8 py-4 shadow-sm shrink-0">
      <div className="max-w-4xl mx-auto w-full flex items-center justify-between">
        <div className="flex items-center gap-3">
          {view !== 'input' ? (
            <button
              onClick={() => setView('input')}
              className="p-2 -ml-2 text-gray-400 hover:text-sky-600 transition-colors"
              aria-label="뒤로 가기"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
          ) : (
            <div className="w-10 h-10 bg-sky-500 rounded-lg flex items-center justify-center text-white font-bold text-xl">
              S
            </div>
          )}
          <div>
            <h1 className="text-lg font-bold text-sky-600 leading-tight">스마트 학부모 피드백 리포트</h1>
            <p className="text-xs text-gray-400 font-medium hidden sm:block">AI 기반 개인별 맞춤 학습 분석 서비스</p>
          </div>
        </div>
        
        {view === 'input' && (
          <div className="flex gap-2 items-center">
            {isAdmin && (
              <button
                onClick={() => setView('admin')}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-purple-600 bg-purple-50 border border-purple-100 rounded-full hover:bg-purple-100 transition-colors"
              >
                <Shield className="w-4 h-4" />
                <span className="hidden sm:inline">관리자</span>
              </button>
            )}
            <button
              onClick={() => setView('history')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-sky-600 bg-sky-50 border border-sky-100 rounded-full hover:bg-sky-100 transition-colors"
            >
              <History className="w-4 h-4" />
              <span className="hidden sm:inline">과거 기록</span>
            </button>
            <div className="relative group">
              {user?.photoURL ? (
                <img src={user.photoURL} alt="Profile" className="w-8 h-8 rounded-full border-2 border-white shadow-sm" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white shadow-sm flex items-center justify-center text-sm font-bold text-slate-500">
                  {user?.email?.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-lg border border-slate-100 p-2 hidden group-hover:block w-48">
                <div className="px-3 py-2 border-b border-slate-100 mb-2 truncate text-sm text-slate-600">
                  {user?.email}
                </div>
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors text-left"
                >
                  <LogOut className="w-4 h-4" />
                  로그아웃
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
