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

    // 1. Sign in anonymously first so we have a 'uid' and can pass security rules
    let firebaseUser;
    try {
      const result = await signInAnonymously(auth);
      firebaseUser = result.user;
    } catch (authErr) {
      console.error('Auth failed:', authErr);
      throw new Error('Authentication service unavailable');
    }

    // 2. Query for teacher
    const q = query(
      collection(db, 'teachers'),
      where('teacherName', '==', trimmedName),
      where('teacherId', '==', trimmedId)
    );
    
    let snapshot;
    try {
      snapshot = await getDocs(q);
    } catch (queryErr) {
      console.error('Query failed:', queryErr);
      await signOut(auth); // Cleanup
      throw new Error('Database access denied. Contact administrator.');
    }
    
    if (snapshot.empty) {
      await signOut(auth); // Cleanup
      throw new Error('Invalid Teacher Name or Teacher ID');
    }

    const teacherDoc = snapshot.docs[0];
    const teacherData = teacherDoc.data() as Teacher;
    
    // 3. Link UID to teacher doc for persistence
    const { doc, updateDoc } = await import('firebase/firestore');
    await updateDoc(doc(db, 'teachers', teacherDoc.id), {
      uid: firebaseUser.uid
    });

    setUser({ ...teacherData, id: teacherDoc.id, uid: firebaseUser.uid } as any);
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
