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
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSubjects = async () => {
      if (!gradeId) return;
      try {
        const q = query(collection(db, 'subjects'), where('assignedGrade', '==', gradeId));
        const snapshot = await getDocs(q);
        const fetchedSubjects = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Subject));
        
        // Filter subjects that belong to the teacher's assigned subjects
        const teacherSubjects = fetchedSubjects.filter(sub => 
          user?.assignedSubjects.includes(sub.subjectName)
        );
        
        setSubjects(teacherSubjects);
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
              Grade {gradeId} - Subjects
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
            <div key={i} className="h-48 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-pulse" />
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
              className="group bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 text-left hover:border-blue-500 transition-all shadow-sm hover:shadow-xl hover:shadow-blue-500/10"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                  <BookOpen size={24} />
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-[10px] font-bold text-slate-500 uppercase tracking-widest border border-slate-200 dark:border-slate-700">
                  <Lock size={10} />
                  <span>Passkey Protected</span>
                </div>
              </div>

              <h3 className="text-2xl font-black text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                {subject.subjectName}
              </h3>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-tighter">
                Secondary Education
              </p>

              <div className="mt-8 flex items-center justify-between">
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                  ENTER MARKS <ChevronRight size={14} />
                </span>
                <span className="h-2 w-2 rounded-full bg-green-500 shadow-sm shadow-green-500/50" />
              </div>
            </motion.button>
          ))}

          {subjects.length === 0 && !loading && (
            <div className="col-span-full py-20 text-center bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
              <BookOpen size={48} className="mx-auto text-slate-300 mb-4" />
              <p className="text-slate-500 font-medium tracking-tight">No subjects assigned for this grade.</p>
              <p className="text-xs text-slate-400 mt-1 uppercase">CHERCHER SECONDARY SCHOOL</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
