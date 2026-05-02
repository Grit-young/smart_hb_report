import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, query, getDocs, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { useAuth, ApprovalStatus } from '../contexts/AuthContext';
import { Check, X, Shield, ArrowLeft } from 'lucide-react';

interface UserData {
  id: string;
  email: string;
  status: ApprovalStatus;
  createdAt: any;
}

export const AdminPanel: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const q = query(collection(db, 'users'));
      const snapshot = await getDocs(q);
      const fetched: UserData[] = [];
      snapshot.forEach(doc => {
        fetched.push({ id: doc.id, ...doc.data() } as UserData);
      });
      // Sort by creation somewhat
      fetched.sort((a, b) => {
        const timeA = a.createdAt?.toMillis?.() || 0;
        const timeB = b.createdAt?.toMillis?.() || 0;
        return timeB - timeA;
      });
      setUsers(fetched);
    } catch (err) {
      console.error("Error fetching users", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUpdateStatus = async (userId: string, newStatus: ApprovalStatus) => {
    try {
      await updateDoc(doc(db, 'users', userId), { status: newStatus });
      setUsers(users.map(u => u.id === userId ? { ...u, status: newStatus } : u));
    } catch (err) {
      console.error("Error updating status", err);
      alert('오류가 발생했습니다.');
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 sm:p-6 pb-24 px-4 mt-2">
      <div className="flex items-center justify-between">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          앱으로 돌아가기
        </button>
        <div className="flex items-center gap-2 text-blue-600 font-medium bg-blue-50 px-3 py-1.5 rounded-full text-sm">
          <Shield className="w-4 h-4" />
          관리자 모드
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800">사용자 관리</h2>
          <p className="text-sm text-slate-500 mt-1">접근을 허용하거나 차단할 사용자를 관리하세요.</p>
        </div>
        
        <div className="divide-y divide-slate-100">
          {loading ? (
            <div className="p-8 text-center text-slate-400">불러오는 중...</div>
          ) : users.length === 0 ? (
            <div className="p-8 text-center text-slate-400">사용자가 없습니다.</div>
          ) : (
            users.map(user => (
              <div key={user.id} className="flex items-center justify-between p-4 sm:px-6 hover:bg-slate-50 transition-colors">
                <div>
                  <div className="font-medium text-slate-800">{user.email}</div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    ID: {user.id}
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    user.status === 'admin' ? 'bg-purple-100 text-purple-700' :
                    user.status === 'approved' ? 'bg-green-100 text-green-700' :
                    'bg-orange-100 text-orange-700'
                  }`}>
                    {user.status === 'admin' ? '관리자' : user.status === 'approved' ? '승인됨' : '대기중'}
                  </span>

                  {user.status !== 'admin' && (
                    <div className="flex items-center gap-1">
                      {user.status !== 'approved' && (
                        <button 
                          onClick={() => handleUpdateStatus(user.id, 'approved')}
                          className="p-1.5 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="승인"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                      
                      {user.status === 'approved' && (
                        <button 
                          onClick={() => handleUpdateStatus(user.id, 'pending')}
                          className="p-1.5 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                          title="승인 취소"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
