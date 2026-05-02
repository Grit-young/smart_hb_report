import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

export type ApprovalStatus = 'pending' | 'approved' | 'admin' | null;

interface AuthContextType {
  user: User | null;
  status: ApprovalStatus;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  status: null,
  loading: true,
  login: async () => {},
  signup: async () => {},
  resetPassword: async () => {},
  logout: async () => {}
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<ApprovalStatus>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserStatus = async (currentUser: User) => {
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        setStatus(userSnap.data().status as ApprovalStatus);
      } else {
        // Create user as pending
        // Root admin logic applies automatically through our security rules if ysjnhy@gmail.com
        const isRootAdmin = currentUser.email === 'ysjnhy@gmail.com';
        const initialStatus = isRootAdmin ? 'admin' : 'pending';
        
        await setDoc(userRef, {
          email: currentUser.email,
          status: initialStatus,
          createdAt: serverTimestamp()
        });
        setStatus(initialStatus);
      }
    } catch (err) {
      console.error("Error fetching user status:", err);
      if (err instanceof Error) {
        console.error("Firestore Error:", JSON.stringify({
          error: err.message,
          operationType: 'get/create',
          path: `users/${currentUser.uid}`
        }));
      }
      setStatus(null);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await fetchUserStatus(currentUser);
      } else {
        setStatus(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      console.error('Login error:', err);
      let errorMessage = err.message;
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        errorMessage = '이메일 또는 비밀번호가 올바르지 않습니다.';
      } else if (err.code === 'auth/too-many-requests') {
        errorMessage = '로그인 시도가 너무 많습니다. 잠시 후 다시 시도해주세요.';
      }
      alert(`로그인 오류: ${errorMessage}`);
      throw err;
    }
  };
  
  const signup = async (email: string, password: string) => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      console.error('Signup error:', err);
      let errorMessage = err.message;
      if (err.code === 'auth/email-already-in-use') {
        errorMessage = '이미 가입된 이메일입니다. 로그인해주세요.';
      } else if (err.code === 'auth/weak-password') {
        errorMessage = '비밀번호는 6자리 이상이어야 합니다.';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = '유효하지 않은 이메일 형식입니다.';
      }
      alert(`회원가입 오류: ${errorMessage}`);
      throw err;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      alert('비밀번호 재설정 이메일이 발송되었습니다. 메일함을 확인해주세요.');
    } catch (err: any) {
      console.error('Password reset error:', err);
      let errorMessage = err.message;
      if (err.code === 'auth/user-not-found') {
        errorMessage = '가입되지 않은 이메일입니다.';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = '유효하지 않은 이메일 형식입니다.';
      }
      alert(`비밀번호 재설정 오류: ${errorMessage}`);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, status, loading, login, signup, resetPassword, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
