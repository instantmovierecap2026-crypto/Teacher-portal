import React from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, ArrowRight, LayoutGrid } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Grades() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Assigned Grades
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Browse and manage academic records for your assigned sections.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm font-medium text-slate-500 bg-white dark:bg-slate-900 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800">
          <LayoutGrid size={16} />
          <span>{user?.assignedGrades.length} Sections</span>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {user?.assignedGrades.map((grade, index) => (
          <motion.button
            key={grade}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => navigate(`/grades/${grade}/subjects`)}
            className="group relative overflow-hidden bg-white dark:bg-slate-900 p-6 rounded-xl border border-[#e2e8f0] dark:border-slate-800 text-left hover:border-blue-300 transition-all shadow-sm hover:shadow-md"
          >
            <div className="flex justify-between items-start mb-4">
              <span className="text-2xl font-black text-slate-800 dark:text-white">{grade}</span>
              <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 rounded-full text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                {user?.assignedSubjects.length} Subjects
              </span>
            </div>
            
            <p className="text-xs text-slate-500 mb-4">
              Chercher Secondary School
            </p>
            
            <button className="w-full py-2.5 bg-slate-50 dark:bg-slate-800 group-hover:bg-blue-600 group-hover:text-white transition-all text-slate-600 dark:text-slate-300 rounded-lg text-xs font-bold uppercase">
              ENTER MARKS
            </button>
          </motion.button>
        ))}
      </div>

      {user?.assignedGrades.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
          <GraduationCap size={48} className="text-slate-300 mb-4" />
          <p className="text-slate-500 font-medium">No grades have been assigned to you yet.</p>
          <p className="text-xs text-slate-400 mt-1">Please contact the admin for assignment.</p>
        </div>
      )}
    </div>
  );
}
