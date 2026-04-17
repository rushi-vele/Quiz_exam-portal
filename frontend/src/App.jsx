import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/layout/Layout';
import Login from './pages/Login';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageExams from './pages/admin/ManageExams';
import QuestionUpload from './pages/admin/QuestionUpload';
import QuestionCurator from './pages/admin/QuestionCurator';
import Students from './pages/admin/Students';
import Results from './pages/admin/Results';
import RetakeRequests from './pages/admin/RetakeRequests';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import ExamPage from './pages/student/ExamPage';
import ResultPage from './pages/student/ResultPage';
import Leaderboard from './pages/student/Leaderboard';
import Register from './pages/Register';

const App = () => {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    
                    {/* Admin Routes */}
                    <Route element={<Layout requiredRole="admin" />}>
                        <Route path="/admin" element={<AdminDashboard />} />
                        <Route path="/admin/exams" element={<ManageExams />} />
                        <Route path="/admin/exams/:examId/questions" element={<QuestionCurator />} />
                        <Route path="/admin/questions" element={<QuestionUpload />} />
                        <Route path="/admin/students" element={<Students />} />
                        <Route path="/admin/results" element={<Results />} />
                        <Route path="/admin/retakes" element={<RetakeRequests />} />
                        <Route path="/admin/leaderboard" element={<Leaderboard />} />
                        <Route path="/admin/settings" element={<div>Settings (Coming Soon)</div>} />
                    </Route>

                    {/* Student Routes */}
                    <Route element={<Layout requiredRole="student" />}>
                        <Route path="/student" element={<StudentDashboard />} />
                        <Route path="/student/exams" element={<StudentDashboard />} />
                        <Route path="/student/results" element={<ResultPage />} />
                        <Route path="/student/results/:id" element={<ResultPage />} />
                        <Route path="/student/leaderboard" element={<Leaderboard />} />
                        <Route path="/student/settings" element={<div>Settings (Coming Soon)</div>} />
                    </Route>

                    {/* Special Routes (No Layout) */}
                    <Route path="/student/exam/:id" element={<ExamPage />} />

                    {/* Root Redirect */}
                    <Route path="/" element={<Navigate to="/login" replace />} />
                    <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
            </Router>
            <Toaster 
                position="top-right"
                toastOptions={{
                    duration: 4000,
                    style: {
                        background: '#334155',
                        color: '#fff',
                        borderRadius: '16px',
                        padding: '12px 24px',
                        fontSize: '14px',
                        fontWeight: '600'
                    },
                }} 
            />
        </AuthProvider>
    );
};

export default App;
