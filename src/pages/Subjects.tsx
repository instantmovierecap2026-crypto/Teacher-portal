import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { BookOpen, ArrowLeft, ChevronRight, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Subject } from '../types';

export default function Subjects() {
  const { gradeId } = useParams();
  const { user } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [gradeName, setGradeName] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSubjects = async () => {
      if (!gradeId || !user) return;
      try {
        // Fetch grade details for header
        const { doc, getDoc } = await import('firebase/firestore');
        const gradeDoc = await getDoc(doc(db, 'grades', gradeId));
        if (gradeDoc.exists()) {
          setGradeName(gradeDoc.data().name);
        }

        // Fetch subjects assigned to this teacher for this grade
        const q = query(
          collection(db, 'subjects'), 
          where('gradeId', '==', gradeId),
          where('teacherId', '==', user.teacherId)
        );
        const snapshot = await getDocs(q);
        const fetchedSubjects = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Subject));
        
        setSubjects(fetchedSubjects);
      } catch (e) {
        console.error('Error fetching subjects:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, [gradeId, user]);

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            to="/grades"
            className="p-3 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="text-slate-600 dark:text-slate-400" />
          </Link>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              {gradeName || '...'} - Subjects
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Select an assigned subject to manage marks.
            </p>
          </div>
        </div>
      </header>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-48 rounded-xl bg-white dark:bg-slate-900 border border-[#e2e8f0] dark:border-slate-800 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((subject, index) => (
            <motion.button
              key={subject.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => navigate(`/grades/${gradeId}/subjects/${subject.id}/marks`)}
              className="group bg-white dark:bg-slate-900 p-6 rounded-xl border border-[#e2e8f0] dark:border-slate-800 text-left hover:border-blue-300 transition-all shadow-sm hover:shadow-md"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                  <BookOpen size={20} />
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 dark:bg-slate-800 rounded-full text-[9px] font-bold text-slate-400 uppercase tracking-widest border border-slate-100 dark:border-slate-700">
                  <Lock size={10} />
                  <span>Passkey Protected</span>
                </div>
              </div>

              <h3 className="text-xl font-bold text-slate-800 dark:text-white group-hover:text-blue-600 transition-colors">
                {subject.name}
              </h3>
              <p className="text-xs font-semibold text-slate-400 mt-1 uppercase tracking-wider">
                Chercher Secondary School
              </p>

              <div className="mt-8 flex items-center justify-between border-t border-slate-50 dark:border-slate-800 pt-4">
                <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1 uppercase tracking-tight">
                  ENTER MARKS <ChevronRight size={14} />
                </span>
                <span className="h-2 w-2 rounded-full bg-green-500" />
              </div>
            </motion.button>
          ))}

          {subjects.length === 0 && !loading && (
            <div className="col-span-full py-20 text-center bg-white dark:bg-slate-900 rounded-xl border border-dashed border-[#cbd5e1] dark:border-slate-700">
              <BookOpen size={48} className="mx-auto text-slate-300 mb-4" />
              <p className="text-slate-500 font-medium tracking-tight">No subjects assigned for this grade.</p>
              <p className="text-xs text-slate-400 mt-1 uppercase">CONTACT ADMIN FOR ASSIGNMENT</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
