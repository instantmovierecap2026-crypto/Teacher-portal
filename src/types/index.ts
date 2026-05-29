export interface Teacher {
  id: string;
  teacherId: string;
  name: string;
  sex: 'Male' | 'Female';
  age: number;
  role: 'teacher' | 'admin';
  createdAt: any;
  uid?: string;
}

export interface Grade {
  id: string;
  name: string; // e.g., "Grade 10A"
  createdAt: any;
}

export interface Student {
  id: string;
  studentId: string;
  name: string;
  gradeId: string; // Reference to Grade ID
  sex: 'Male' | 'Female';
  age: number;
  createdAt: any;
}

export interface Subject {
  id: string;
  name: string;
  passkey: string;
  teacherId: string; // Reference to Teacher ID
  gradeId: string; // Reference to Grade ID
  createdAt: any;
}

export interface Result {
  id: string;
  studentId: string;
  subjectId: string;
  gradeId: string;
  semester1: string; // "Unfilled" or number
  semester2: string; // "Unfilled" or number
  average: string;
  rank: string;
  status: string;
  updatedAt: any;
  // Metadata for UI
  studentName?: string;
  semester1Total?: string;
  semester1Average?: string;
  semester1Rank?: string;
  semester1Status?: string;
  semester2Total?: string;
  semester2Average?: string;
  semester2Rank?: string;
  semester2Status?: string;
  finalTotal?: string;
  finalAverage?: string;
  finalRank?: string;
  finalStatus?: string;
}

export type Theme = 'light' | 'dark';
