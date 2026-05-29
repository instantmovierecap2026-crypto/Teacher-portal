import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Result, Student } from '../types';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export const exportToExcel = (data: any[], fileName: string) => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Results");
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
};

export const exportToCSV = (data: any[], fileName: string) => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const csv = XLSX.utils.sheet_to_csv(worksheet);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `${fileName}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const generateTranscript = (student: Student, results: Result[]) => {
  const doc = new jsPDF();
  const schoolName = "CHERCHER SECONDARY SCHOOL";

  // Header
  doc.setFontSize(22);
  doc.setTextColor(22, 101, 192); // Blue
  doc.text(schoolName, 105, 20, { align: 'center' });
  
  doc.setFontSize(14);
  doc.setTextColor(100);
  doc.text("Official Student Transcript", 105, 28, { align: 'center' });

  // Student Info
  doc.setFontSize(10);
  doc.setTextColor(0);
  doc.text(`Student Name: ${student.studentName}`, 20, 45);
  doc.text(`Student ID: ${student.studentId}`, 20, 52);
  doc.text(`Grade: ${student.grade}`, 140, 45);
  doc.text(`Sex: ${student.sex}`, 140, 52);

  // Table
  const tableData = results.map(r => [
    r.subject, 
    r.semester1, 
    r.semester2, 
    r.subjectAverage, 
    r.finalStatus
  ]);

  (doc as any).autoTable({
    startY: 65,
    head: [['Subject', 'Sem 1', 'Sem 2', 'Average', 'Status']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [22, 101, 192], textColor: 255 },
    alternateRowStyles: { fillColor: [245, 247, 250] },
  });

  // Footer
  const finalY = (doc as any).lastAutoTable.finalY + 20;
  doc.setFontSize(9);
  doc.text("System Developed by Ramoda Technologies", 105, 285, { align: 'center' });

  doc.save(`${student.studentName}_Transcript.pdf`);
};

export const generateGradeReport = (grade: string, subject: string, results: Result[]) => {
  const doc = new jsPDF();
  const schoolName = "CHERCHER SECONDARY SCHOOL";

  doc.setFontSize(18);
  doc.text(schoolName, 105, 15, { align: 'center' });
  doc.setFontSize(12);
  doc.text(`Result Sheet: Grade ${grade} - ${subject}`, 105, 22, { align: 'center' });

  const tableData = results.map(r => [
    r.studentId,
    r.studentName,
    r.semester1,
    r.semester2,
    r.finalAverage,
    r.finalStatus
  ]);

  (doc as any).autoTable({
    startY: 35,
    head: [['ID', 'Name', 'Sem 1', 'Sem 2', 'Final Avg', 'Status']],
    body: tableData,
    headStyles: { fillColor: [51, 65, 85] },
  });

  doc.save(`Grade_${grade}_${subject}_Results.pdf`);
};
