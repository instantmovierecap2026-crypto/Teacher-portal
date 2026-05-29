import React, { createContext, useContext, useEffect, useState } from 'react';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Teacher } from '../types';

interface AuthContextType {
  user: Teacher | null;
  loading: boolean;
  login: (name: string, id: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Teacher | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const recoverSession = async () => {
      const savedTeacherId = localStorage.getItem('teacher_session_id');
      const savedDocId = localStorage.getItem('teacher_doc_id');

      if (savedTeacherId && savedDocId) {
        try {
          const docRef = doc(db, 'teachers', savedDocId);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            const data = docSnap.data() as Teacher;
            if (data.teacherId === savedTeacherId) {
              setUser({ ...data, id: docSnap.id });
            }
          }
        } catch (e) {
          console.error('Failed to recover session:', e);
        }
      }
      setLoading(false);
    };

    recoverSession();
  }, []);

  const login = async (name: string, id: string) => {
    const trimmedName = name.trim();
    const trimmedId = id.trim();

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
      console.error('Teacher query failed:', queryErr);
      throw new Error(`Database connection error: ${queryErr.message}`);
    }
    
    if (snapshot.empty) {
      throw new Error('Invalid Teacher Name or Teacher ID');
    }

    const teacherDoc = snapshot.docs[0];
    const teacherData = { ...teacherDoc.data() as Teacher, id: teacherDoc.id };

    // Save to localStorage for persistence
    localStorage.setItem('teacher_session_id', teacherData.teacherId);
    localStorage.setItem('teacher_doc_id', teacherDoc.id);

    setUser(teacherData);
  };

  const logout = () => {
    localStorage.removeItem('teacher_session_id');
    localStorage.removeItem('teacher_doc_id');
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
