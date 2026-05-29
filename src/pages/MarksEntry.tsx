import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Save, 
  FileDown, 
  Search, 
  Lock, 
  CheckCircle2, 
  AlertCircle,
  Download,
  FileText,
  Table as TableIcon,
  Loader2,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  getDoc, 
  doc, 
  setDoc, 
  writeBatch,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Subject, Student, Result, Grade } from '../types';
import { calculateSubjectAverage, calculateStatus, calculateRanks } from '../utils/calculations';
import { exportToExcel, exportToCSV, generateGradeReport, generateTranscript } from '../utils/exports';

export default function MarksEntry() {
  const { gradeId, subjectId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [subject, setSubject] = useState<Subject | null>(null);
  const [grade, setGrade] = useState<Grade | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [results, setResults] = useState<Record<string, Result>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Passkey state
  const [passkey, setPasskey] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [passkeyError, setPasskeyError] = useState('');

  // Notifications
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!gradeId || !subjectId) return;
      try {
        // 1. Fetch Subject & Grade
        const [subSnap, gradeSnap] = await Promise.all([
          getDoc(doc(db, 'subjects', subjectId)),
          getDoc(doc(db, 'grades', gradeId))
        ]);

        if (subSnap.exists()) {
          const subData = subSnap.data() as Subject;
          setSubject({ ...subData, id: subSnap.id });
        }

        if (gradeSnap.exists()) {
          setGrade({ ...gradeSnap.data(), id: gradeSnap.id } as Grade);
        }

        // 2. Fetch Students
        const qStudents = query(collection(db, 'students'), where('gradeId', '==', gradeId));
        const snapStudents = await getDocs(qStudents);
        const fetchedStudents = snapStudents.docs.map(doc => ({ ...doc.data(), id: doc.id } as Student));
        setStudents(fetchedStudents);

        // 3. Fetch Existing Results for this subject
        const qResults = query(
          collection(db, 'results'), 
          where('gradeId', '==', gradeId),
          where('subjectId', '==', subjectId)
        );
        const snapResults = await getDocs(qResults);
        const resultsMap: Record<string, Result> = {};
        
        snapResults.docs.forEach(doc => {
          const data = doc.data() as Result;
          resultsMap[data.studentId] = { ...data, id: doc.id };
        });

        // Initialize missing results
        fetchedStudents.forEach(student => {
          if (!resultsMap[student.studentId]) {
            resultsMap[student.studentId] = {
              id: '', 
              studentId: student.studentId, 
              studentName: student.name,
              gradeId: gradeId, 
              subjectId: subjectId,
              semester1: 'Unfilled', 
              semester2: 'Unfilled', 
              average: 'Unfilled',
              rank: 'Unfilled',
              status: 'Unfilled',
              updatedAt: null
            };
          }
        });

        setResults(resultsMap);
      } catch (e) {
        console.error('Error fetching data:', e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [gradeId, subjectId]);

  const handlePasskeyVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject) return;

    if (passkey === subject.passkey) {
      setIsVerified(true);
      setPasskeyError('');
    } else {
      setPasskeyError('Invalid Subject Passkey');
    }
  };

  const handleMarkChange = (studentId: string, semester: 'semester1' | 'semester2', value: string) => {
    if (value !== '' && (isNaN(Number(value)) || Number(value) < 0 || Number(value) > 100)) return;

    setResults(prev => {
      const studentResult = { ...prev[studentId] };
      studentResult[semester] = value === '' ? 'Unfilled' : value;
      
      // Auto calc subject avg
      studentResult.average = calculateSubjectAverage(
        studentResult.semester1, 
        studentResult.semester2
      );
      
      return { ...prev, [studentId]: studentResult };
    });
  };

  const saveAllMarks = async () => {
    if (!gradeId || !subject) return;
    setIsSaving(true);
    setNotification(null);

    try {
      const batch = writeBatch(db);
      const studentIds = Object.keys(results);
      
      const allResultsQuery = query(collection(db, 'results'), where('gradeId', '==', gradeId));
      const allResultsSnap = await getDocs(allResultsQuery);
      const allResults = allResultsSnap.docs.map(doc => doc.data() as Result);
      
      const studentsMap: Record<string, Result[]> = {};
      allResults.forEach(r => {
        if (!studentsMap[r.studentId]) studentsMap[r.studentId] = [];
        studentsMap[r.studentId].push(r);
      });

      for (const res of Object.values(results) as Result[]) {
        const studentResList = (studentsMap[res.studentId] || []) as Result[];
        const index = studentResList.findIndex(r => r.subjectId === subject.id);
        if (index > -1) {
          studentResList[index] = res;
        } else {
          studentResList.push(res);
        }
        studentsMap[res.studentId] = studentResList;
      }

      const studentSummaries: Record<string, { s1Total: number, s1Avg: number, s2Total: number, s2Avg: number, finalTotal: number, finalAvg: number }> = {};
      
      for (const [sId, resList] of Object.entries(studentsMap) as [string, Result[]][]) {
        let s1T = 0, s1Count = 0;
        let s2T = 0, s2Count = 0;
        
        resList.forEach(r => {
          const s1 = parseFloat(r.semester1);
          const s2 = parseFloat(r.semester2);
          if (!isNaN(s1)) { s1T += s1; s1Count++; }
          if (!isNaN(s2)) { s2T += s2; s2Count++; }
        });
        
        const s1Avg = s1Count > 0 ? s1T / s1Count : 0;
        const s2Avg = s2Count > 0 ? s2T / s2Count : 0;
        const finalT = s1T + s2T;
        const finalAvg = (s1Avg + s2Avg) / 2;

        studentSummaries[sId] = { s1Total: s1T, s1Avg, s2Total: s2T, s2Avg, finalTotal: finalT, finalAvg };
      }

      const s1Totals = Object.values(studentSummaries).map(s => s.s1Total);
      const s2Totals = Object.values(studentSummaries).map(s => s.s2Total);
      const finalTotals = Object.values(studentSummaries).map(s => s.finalTotal);
      
      const s1Ranks = calculateRanks(s1Totals);
      const s2Ranks = calculateRanks(s2Totals);
      const finalRanks = calculateRanks(finalTotals);
      
      const studentIdsSorted = Object.keys(studentSummaries);
      const s1RankMap = Object.fromEntries(studentIdsSorted.map((id, i) => [id, s1Ranks[i]]));
      const s2RankMap = Object.fromEntries(studentIdsSorted.map((id, i) => [id, s2Ranks[i]]));
      const finalRankMap = Object.fromEntries(studentIdsSorted.map((id, i) => [id, finalRanks[i]]));

      for (const sId of studentIds) {
        const res = results[sId];
        const summary = studentSummaries[sId];
        
        const updatedRes: Partial<Result> = {
          ...res,
          semester1Total: summary.s1Total.toString(),
          semester1Average: summary.s1Avg.toFixed(2),
          semester1Rank: s1RankMap[sId].toString(),
          semester1Status: summary.s1Avg >= 50 ? 'Passed' : 'Failed',
          semester2Total: summary.s2Total.toString(),
          semester2Average: summary.s2Avg.toFixed(2),
          semester2Rank: s2RankMap[sId].toString(),
          semester2Status: summary.s2Avg >= 50 ? 'Passed' : 'Failed',
          finalTotal: summary.finalTotal.toString(),
          finalAverage: summary.finalAvg.toFixed(2),
          finalRank: finalRankMap[sId].toString(),
          finalStatus: summary.finalAvg >= 50 ? 'Passed' : 'Failed',
          status: res.average !== 'Unfilled' && parseFloat(res.average) >= 50 ? 'Passed' : 'Failed',
          updatedAt: serverTimestamp()
        };

        const resultRef = doc(db, 'results', `${gradeId}_${subject.id}_${sId}`);
        batch.set(resultRef, updatedRes, { merge: true });
      }

      await batch.commit();
      setNotification({ type: 'success', message: 'Marks saved and calculated successfully!' });
    } catch (e: any) {
      console.error('Save error:', e);
      setNotification({ type: 'error', message: 'Failed to save marks.' });
    } finally {
      setIsSaving(false);
    }
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.studentId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
        <p className="text-slate-500 font-medium animate-pulse">Loading class data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      {/* Passkey Modal */}
      <AnimatePresence>
        {!isVerified && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/80 backdrop-blur-xl p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-2xl"
            >
              <div className="text-center mb-8">
                <div className="inline-flex p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/20 text-amber-600 mb-4">
                  <Lock size={32} />
                </div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">Verification Required</h2>
                <p className="text-slate-500 text-sm mt-2 font-medium">Please enter the subject passkey for <span className="text-slate-900 dark:text-white underline">{subject?.name}</span>.</p>
              </div>

              <form onSubmit={handlePasskeyVerify} className="space-y-6">
                <input
                  type="password"
                  value={passkey}
                  onChange={(e) => setPasskey(e.target.value)}
                  placeholder="Enter Passkey"
                  autoFocus
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center text-2xl font-black tracking-widest focus:ring-2 focus:ring-blue-500 outline-none"
                />
                
                {passkeyError && (
                  <p className="text-xs text-red-500 font-bold text-center flex items-center justify-center gap-1">
                    <AlertCircle size={14} /> {passkeyError}
                  </p>
                )}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => navigate(`/grades/${gradeId}/subjects`)}
                    className="flex-1 px-4 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-500 hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-[2] px-4 py-4 rounded-2xl bg-blue-600 text-white text-sm font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-colors"
                  >
                    Verify & Proceed
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Link to={`/grades/${gradeId}/subjects`} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-3 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase">{grade?.name || '...'}</span>
              <span className="text-slate-300 dark:text-slate-700">/</span>
              <span className="px-3 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase">{subject?.name}</span>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Marks Entry Portal</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => exportToExcel(Object.values(results), `Results_${gradeId}_${subject?.name}`)}
            className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800" title="Export Excel">
            <TableIcon size={20} />
          </button>
          <button 
            onClick={() => generateGradeReport(gradeId!, subject?.name!, Object.values(results))}
            className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800" title="Download report PDF">
            <FileDown size={20} />
          </button>
          <button
            onClick={saveAllMarks}
            disabled={isSaving}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-xl shadow-blue-500/20 hover:bg-blue-700 disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            {isSaving ? 'Calculating...' : 'Save & Calculate All'}
          </button>
        </div>
      </header>

      {/* Toolbar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search student by name or ID..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        <div className="flex items-center gap-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
          Total: {students.length} Students
        </div>
      </div>

      {notification && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`p-4 rounded-2xl flex items-center gap-3 border ${
            notification.type === 'success' 
              ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-900/50' 
              : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-900/50'
          }`}
        >
          {notification.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <span className="text-sm font-semibold">{notification.message}</span>
        </motion.div>
      )}

      {/* Main Table Container */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                <th className="px-6 py-4 font-black text-slate-500 uppercase tracking-tighter text-[10px]">Student Details</th>
                <th className="px-6 py-4 font-black text-slate-500 uppercase tracking-tighter text-[10px] text-center">Sex</th>
                <th className="px-6 py-4 font-black text-blue-600 uppercase tracking-tighter text-[10px] text-center">Semester 1</th>
                <th className="px-6 py-4 font-black text-indigo-600 uppercase tracking-tighter text-[10px] text-center">Semester 2</th>
                <th className="px-6 py-4 font-black text-slate-500 uppercase tracking-tighter text-[10px] text-center">Average</th>
                <th className="px-6 py-4 font-black text-slate-500 uppercase tracking-tighter text-[10px] text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredStudents.map((student) => {
                const res = results[student.studentId];
                return (
                  <tr key={student.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-slate-400">
                          {student.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white leading-none mb-1">{student.name}</p>
                          <p className="text-[10px] font-mono text-slate-500 uppercase tracking-tighter">{student.studentId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                        student.sex === 'Male' ? 'bg-blue-100 text-blue-600' : 'bg-pink-100 text-pink-600'
                      }`}>
                        {student.sex}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex justify-center">
                        <input
                          type="text"
                          value={res.semester1 === 'Unfilled' ? '' : res.semester1}
                          onChange={(e) => handleMarkChange(student.studentId, 'semester1', e.target.value)}
                          placeholder="--"
                          className="w-16 h-10 text-center rounded-xl bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 text-blue-700 dark:text-blue-400 font-black focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex justify-center">
                        <input
                          type="text"
                          value={res.semester2 === 'Unfilled' ? '' : res.semester2}
                          onChange={(e) => handleMarkChange(student.studentId, 'semester2', e.target.value)}
                          placeholder="--"
                          className="w-16 h-10 text-center rounded-xl bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/30 text-indigo-700 dark:text-indigo-400 font-black focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <div className="inline-flex flex-col items-center">
                        <span className={`text-sm font-black ${
                          res.average !== 'Unfilled' && parseFloat(res.average) >= 50 ? 'text-green-600' : 'text-slate-400'
                        }`}>
                          {res.average}
                        </span>
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">AVG</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex justify-center gap-2">
                        <button 
                          onClick={() => generateTranscript(student, [res])}
                          className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                          title="View Transcript"
                        >
                          <FileText size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          {filteredStudents.length === 0 && (
            <div className="py-20 text-center">
              <Search className="mx-auto text-slate-200 mb-4" size={48} />
              <p className="text-slate-400 font-medium">No students match your criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
