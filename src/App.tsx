import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Grades from './pages/Grades';
import Subjects from './pages/Subjects';
import MarksEntry from './pages/MarksEntry';
import About from './pages/About';

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route element={<ProtectedRoute />}>
              <Route element={<Layout><Dashboard /></Layout>} path="/" />
              <Route element={<Layout><Grades /></Layout>} path="/grades" />
              <Route element={<Layout><Subjects /></Layout>} path="/grades/:gradeId/subjects" />
              <Route element={<Layout><MarksEntry /></Layout>} path="/grades/:gradeId/subjects/:subjectId/marks" />
              <Route element={<Layout><About /></Layout>} path="/about" />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
