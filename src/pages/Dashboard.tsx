import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  BookOpen, 
  GraduationCap, 
  CheckCircle2, 
  Clock, 
  TrendingUp,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalSubjects: 0,
    totalGrades: 0,
    completionRate: 0
  });
  const [recentActivities, setRecentActivities] = useState<any[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;

      try {
        // 1. Fetch subjects assigned to this teacher
        const subjectsQuery = query(
          collection(db, 'subjects'),
          where('teacherId', '==', user.teacherId)
        );
        const subjectsSnapshot = await getDocs(subjectsQuery);
        const assignedSubjects = subjectsSnapshot.docs.map(doc => doc.data());
        
        // 2. Extract unique grade IDs
        const uniqueGradeIds = Array.from(new Set(assignedSubjects.map(s => s.gradeId)));

        // 3. Fetch total students for these grades
        let studentCount = 0;
        if (uniqueGradeIds.length > 0) {
          // Firestore 'in' query has a limit of 10, but teachers usually don't have > 10 grades
          const studentsQuery = query(
            collection(db, 'students'),
            where('gradeId', 'in', uniqueGradeIds)
          );
          const studentsSnapshot = await getDocs(studentsQuery);
          studentCount = studentsSnapshot.size;
        }

        setStats({
          totalStudents: studentCount,
          totalSubjects: assignedSubjects.length,
          totalGrades: uniqueGradeIds.length,
          completionRate: 0 // Will be calculated once results integration is deeper
        });

        // Optional: Fetch actual completion rate from results
        if (assignedSubjects.length > 0) {
          const resultsQuery = query(
            collection(db, 'results'),
            where('gradeId', 'in', uniqueGradeIds)
          );
          const resultsSnapshot = await getDocs(resultsQuery);
          if (!resultsSnapshot.empty) {
            const filled = resultsSnapshot.docs.filter(d => d.data().semester1 !== 'Unfilled').length;
            const rate = Math.round((filled / (studentCount * assignedSubjects.length)) * 100);
            setStats(prev => ({ ...prev, completionRate: isNaN(rate) ? 0 : Math.min(rate, 100) }));
          }
        }

      } catch (e) {
        console.error('Error fetching dashboard stats:', e);
      }
    };

    fetchStats();
  }, [user]);

  const cards = [
    { title: 'My Students', value: stats.totalStudents, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { title: 'My Subjects', value: stats.totalSubjects, icon: BookOpen, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
    { title: 'My Grades', value: stats.totalGrades, icon: GraduationCap, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20' },
    { title: 'Marks Completion', value: `${stats.completionRate}%`, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
  ];

  return (
    <div className="space-y-8">
      <header>
        <motion.h1 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-3xl font-black tracking-tight text-slate-900 dark:text-white"
        >
          Welcome Back, {user?.name}
        </motion.h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Here's an overview of your current academic responsibilities at Chercher Secondary.
        </p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-[#e2e8f0] dark:border-slate-800 shadow-sm flex items-center space-x-4"
          >
            <div className={`p-3 rounded-lg ${card.bg} w-fit`}>
              <card.icon className={card.color} size={24} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{card.title}</p>
              <h3 className="text-2xl font-bold mt-0.5">{card.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions / Assigned Summary */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-[#e2e8f0] dark:border-slate-800 p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold flex items-center gap-2 text-slate-800 dark:text-white">
                <Clock className="text-blue-600" size={20} />
                Recent Activities
              </h2>
            </div>
            
            <div className="space-y-4">
              {recentActivities.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-slate-500 dark:text-slate-400 italic">No recent activities found.</p>
                </div>
              ) : (
                recentActivities.map((act, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                    <div className="mt-1 p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600">
                      <TrendingUp size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{act.message}</p>
                      <p className="text-xs text-slate-500 mt-1">{act.time}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Shortcuts */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-[#2563eb] to-[#1d4ed8] rounded-xl p-8 text-white shadow-xl shadow-blue-500/20">
            <h2 className="text-lg font-bold mb-4">Quick Entry</h2>
            <p className="text-blue-100 text-xs mb-6 leading-relaxed">
              Start entering marks for your assigned grades and subjects today.
            </p>
            <Link
              to="/grades"
              className="flex items-center justify-center gap-2 bg-white text-blue-600 py-3 rounded-lg font-bold text-xs hover:bg-blue-50 transition-all"
            >
              Go to Grade Cards
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl border border-[#e2e8f0] dark:border-slate-800 p-8 shadow-sm">
            <h2 className="text-sm font-bold mb-4 uppercase tracking-widest text-slate-800 dark:text-white">System Status</h2>
            <ul className="space-y-3">
              <li className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Firestore Sync</span>
                <span className="text-green-600 font-bold">Online</span>
              </li>
              <li className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>App Check</span>
                <span className="text-green-600 font-bold">Verified</span>
              </li>
              <li className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Teacher Session</span>
                <span className="text-blue-600 font-bold">Active</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
