import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { LogIn, User, Hash, AlertCircle, Loader2 } from 'lucide-react';

export default function Login() {
  const [name, setName] = useState('');
  const [id, setId] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !id) {
      setError('Please fill in both fields');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      await login(name, id);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-xl shadow-blue-500/20 mb-4">
            <LogIn size={32} />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
            Chercher Secondary
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Teacher Portal v1.1</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-2xl shadow-slate-200 dark:shadow-none border border-slate-200 dark:border-slate-800">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Teacher Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 pl-11 pr-4 py-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Teacher ID
              </label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
                <input
                  type="text"
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                  placeholder="Enter your teacher ID"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 pl-11 pr-4 py-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none"
                />
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 rounded-xl bg-red-50 dark:bg-red-900/20 p-4 text-xs font-medium text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30"
              >
                <AlertCircle size={14} />
                <span>{error}</span>
              </motion.div>
            )}

            <button
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 text-sm font-bold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-all shadow-lg shadow-blue-500/30"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  <span>Logging in...</span>
                </>
              ) : (
                <>
                  <LogIn size={18} />
                  <span>Access Portal</span>
                </>
              )}
            </button>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={async () => {
                  try {
                    setIsLoading(true);
                    const { collection, addDoc, getDocs, serverTimestamp } = await import('firebase/firestore');
                    const { db } = await import('../lib/firebase');
                    
                    const snapshot = await getDocs(collection(db, 'teachers'));
                    if (snapshot.empty) {
                      const teacherRef = await addDoc(collection(db, 'teachers'), {
                        name: 'Admin',
                        teacherId: 'ADMIN123',
                        sex: 'Male',
                        age: 35,
                        role: 'admin',
                        createdAt: serverTimestamp()
                      });
                      
                      const gradeRef = await addDoc(collection(db, 'grades'), { 
                        name: 'Grade 9A', 
                        createdAt: serverTimestamp() 
                      });

                      await addDoc(collection(db, 'subjects'), { 
                        name: 'Mathematics', 
                        passkey: '1234', 
                        teacherId: 'ADMIN123', 
                        gradeId: gradeRef.id, 
                        createdAt: serverTimestamp() 
                      });

                      await addDoc(collection(db, 'students'), { 
                        studentId: 'ST001', 
                        name: 'Abebe Kebele', 
                        sex: 'Male', 
                        age: 16, 
                        gradeId: gradeRef.id, 
                        createdAt: serverTimestamp() 
                      });

                      alert('Test data seeded! Use Name: Admin, ID: ADMIN123 to login. Passkey: 1234');
                    } else {
                      alert('Database already contains data.');
                    }
                  } catch (e) {
                    alert('Error seeding data. Check console.');
                    console.error(e);
                  } finally {
                    setIsLoading(false);
                  }
                }}
                className="w-full py-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors"
              >
                Seed Initial Test Data (Debug)
              </button>
            </div>
          </form>
        </div>

        <div className="mt-8 text-center text-xs text-slate-500 dark:text-slate-400 space-y-2">
          <p>© 2026 CHERCHER SECONDARY SCHOOL</p>
          <p className="font-medium">System Developed by Ramoda Technologies</p>
        </div>
      </motion.div>
    </div>
  );
}
