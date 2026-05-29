export interface Teacher {
  id: string;
  teacherId: string;
  teacherName: string;
  assignedGrades: string[];
  assignedSubjects: string[];
  role: 'teacher' | 'admin';
  createdAt: any;
}

export interface Grade {
  id: string;
  gradeName: string;
  section: string;
  totalStudents: number;
  totalSubjects: number;
  createdAt: any;
}

export interface Student {
  id: string;
  studentId: string;
  studentName: string;
  sex: 'Male' | 'Female';
  age: number;
  grade: string;
  createdAt: any;
}

export interface Subject {
  id: string;
  subjectName: string;
  subjectPasskey: string;
  assignedGrade: string;
  createdAt: any;
}

export interface Result {
  id: string;
  studentId: string;
  studentName: string;
  grade: string;
  subject: string;
  semester1: string; // "Unfilled" or numeric string
  semester2: string; // "Unfilled" or numeric string
  subjectAverage: string;
  semester1Total: string;
  semester1Average: string;
  semester1Rank: string;
  semester1Status: string;
  semester2Total: string;
  semester2Average: string;
  semester2Rank: string;
  semester2Status: string;
  finalTotal: string;
  finalAverage: string;
  finalRank: string;
  finalStatus: string;
  publishStatus: boolean;
  updatedAt: any;
}

export type Theme = 'light' | 'dark';
