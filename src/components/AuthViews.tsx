import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Lock, LogOut, Mail, Key } from 'lucide-react';

export const LoginView: React.FC = () => {
  const { login, signup } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setIsSubmitting(true);
    
    try {
      if (isRegister) {
        await signup(email, password);
      } else {
        await login(email, password);
      }
    } catch (err) {
      // Errors are already handled inside AuthContext via alerts
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] px-4">
      <div className="max-w-md w-full bg-white rounded-3xl border border-blue-100 shadow-sm p-8 space-y-6">
        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto text-blue-500">
          <Lock className="w-8 h-8" />
        </div>
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold text-slate-800">피드백 리포트 생성기</h1>
          <p className="text-slate-500">
            {isRegister ? '새 계정을 생성하세요.' : '허용된 사용자만 이용 가능한 비공개 서비스입니다.'}
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">이메일</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="이메일을 입력하세요"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">비밀번호</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Key className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="비밀번호를 입력하세요"
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-medium py-3 px-4 rounded-xl transition-colors shadow-sm disabled:opacity-50 mt-2"
          >
            {isSubmitting ? '처리 중...' : (isRegister ? '회원가입' : '로그인')}
          </button>
        </form>

        <div className="text-center mt-4">
          <button
            type="button"
            onClick={() => setIsRegister(!isRegister)}
            className="text-sm text-blue-500 hover:text-blue-600 font-medium"
          >
            {isRegister ? '이미 계정이 있으신가요? 로그인' : '계정이 없으신가요? 회원가입'}
          </button>
        </div>
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
