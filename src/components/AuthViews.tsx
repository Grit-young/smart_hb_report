import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Lock, LogOut } from 'lucide-react';

export const LoginView: React.FC = () => {
  const { login } = useAuth();
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] px-4">
      <div className="max-w-md w-full bg-white rounded-3xl border border-blue-100 shadow-sm p-8 text-center space-y-6">
        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto text-blue-500">
          <Lock className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-slate-800">피드백 리포트 생성기</h1>
          <p className="text-slate-500">허용된 사용자만 이용 가능한 비공개 서비스입니다.</p>
        </div>
        
        <button 
          onClick={login}
          className="w-full bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-medium py-3 px-4 rounded-xl transition-colors shadow-sm"
        >
          Google 계정으로 로그인
        </button>
      </div>
    </div>
  );
};

export const PendingView: React.FC = () => {
  const { logout, user } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] px-4">
      <div className="max-w-md w-full bg-white rounded-3xl border border-orange-100 shadow-sm p-8 text-center space-y-6">
        <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto text-orange-500">
          <Lock className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-slate-800">승인 대기 중</h1>
          <p className="text-slate-500">
            <strong>{user?.email}</strong> 계정은 아직 승인되지 않았습니다. 관리자의 승인을 기다려주세요.
          </p>
        </div>
        
        <button 
          onClick={logout}
          className="w-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-medium py-3 px-4 rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          다른 계정으로 로그인
        </button>
      </div>
    </div>
  );
}
