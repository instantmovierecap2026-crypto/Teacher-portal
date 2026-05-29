import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInAnonymously, signOut } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { Teacher } from '../types';

interface AuthContextType {
  user: Teacher | null;
  loading: boolean;
  login: (name: string, id: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Teacher | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Re-auth on load if we have a persistent anonymous session
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Find teacher by linked UID
          const q = query(collection(db, 'teachers'), where('uid', '==', firebaseUser.uid));
          const snapshot = await getDocs(q);
          if (!snapshot.empty) {
            const data = snapshot.docs[0].data() as Teacher;
            setUser({ ...data, id: snapshot.docs[0].id });
          }
        } catch (e) {
          console.error('Failed to recover session:', e);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (name: string, id: string) => {
    const trimmedName = name.trim();
    const trimmedId = id.trim();

    // 1. First, check if the teacher exists (Allow this in rules)
    const teachersRef = collection(db, 'teachers');
    const q = query(
      teachersRef,
      where('name', '==', trimmedName),
      where('teacherId', '==', trimmedId)
    );
    
    let snapshot;
    try {
      snapshot = await getDocs(q);
    } catch (queryErr: any) {
      console.error('Initial teacher query failed:', queryErr);
      throw new Error(`Database connection error: ${queryErr.message}`);
    }
    
    if (snapshot.empty) {
      throw new Error('Invalid Teacher Name or Teacher ID');
    }

    const teacherDoc = snapshot.docs[0];
    const teacherData = teacherDoc.data() as Teacher;

    // 2. Now attempt to sign in anonymously
    let firebaseUser;
    try {
      const result = await signInAnonymously(auth);
      firebaseUser = result.user;
    } catch (authErr: any) {
      console.error('Auth failed:', authErr);
      // Fallback: If auth service is genuinely down but we found the teacher, 
      // we might proceed if the rules allow it, but usually rules require auth.
      // We'll report the specific error.
      if (authErr.code === 'auth/operation-not-allowed') {
        throw new Error('Anonymous authentication is disabled in Firebase. Enable it in the console.');
      }
      throw new Error(`Authentication service error: ${authErr.message}`);
    }
    
    // 3. Link UID to teacher doc for persistence
    const { doc, updateDoc } = await import('firebase/firestore');
    await updateDoc(doc(db, 'teachers', teacherDoc.id), {
      uid: firebaseUser.uid
    });

    setUser({ ...teacherData, id: teacherDoc.id, uid: firebaseUser.uid });
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
