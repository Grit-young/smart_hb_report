import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

export type ApprovalStatus = 'pending' | 'approved' | 'admin' | null;

interface AuthContextType {
  user: User | null;
  status: ApprovalStatus;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  status: null,
  loading: true,
  login: async () => {},
  signup: async () => {},
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
    } catch (err) {
      console.error('Login error:', err);
      if (err instanceof Error) {
        alert(`로그인 오류: ${err.message}`);
      } else {
        alert('로그인 중 알 수 없는 오류가 발생했습니다.');
      }
      throw err; // Re-throw to handle in UI
    }
  };
  
  const signup = async (email: string, password: string) => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (err) {
      console.error('Signup error:', err);
      if (err instanceof Error) {
        alert(`회원가입 오류: ${err.message}`);
      } else {
        alert('회원가입 중 알 수 없는 오류가 발생했습니다.');
      }
      throw err; // Re-throw to handle in UI
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
    <AuthContext.Provider value={{ user, status, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
