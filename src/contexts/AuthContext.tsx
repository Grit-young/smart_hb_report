import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

export type ApprovalStatus = 'pending' | 'approved' | 'admin' | null;

interface AuthContextType {
  user: User | null;
  status: ApprovalStatus;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  status: null,
  loading: true,
  login: async () => {},
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
      // Wait, there could be a permission denied error here briefly, handle correctly
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

  const login = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error('Login error:', err);
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, status, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
