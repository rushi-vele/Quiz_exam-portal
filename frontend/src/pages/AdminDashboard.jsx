import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/api';
import { Users, BookOpen, BarChart2, Plus, Trash2, Edit, AlertCircle, RotateCcw } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const AdminDashboard = () => {
  const [exams, setExams] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [examsRes, statsRes] = await Promise.all([
        API.get('/exams'),
        API.get('/analytics/stats')
      ]);
      setExams(examsRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error('Error fetching dashboard data', err);
      setError('Failed to load dashboard data. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const deleteExam = async (id) => {
    if (window.confirm('Delete this exam and all associated questions?')) {
      try {
        await API.delete(`/exams/${id}`);
        setExams(exams.filter(e => e.id !== id));
      } catch (err) {
        alert('Failed to delete exam');
      }
    }
  };

  const chartData = stats?.examPerformance?.map(e => ({ 
    name: e.title, 
    avgScore: Math.round(e.avgScore * 10) / 10 
  })) || [];

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner-container">
          <div className="premium-spinner"></div>
          <p>Initialising Dashboard Analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error glass">
        <AlertCircle size={48} color="#ef4444" />
        <h2>Something went wrong</h2>
        <p>{error}</p>
        <button onClick={fetchAllData} className="btn-primary retry-btn">
          <RotateCcw size={18} />
          <span>Retry Loading</span>
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1 className="gradient-text">Admin Dashboard</h1>
          <p>Manage users, exams, and monitor platform performance.</p>
        </div>
        <button onClick={() => navigate('/admin/create-exam')} className="btn-primary add-exam-btn">
          <Plus size={20} />
          <span>New Exam</span>
        </button>
      </header>

      <div className="stats-grid">
        <div className="stat-card glass">
          <Users className="stat-icon" color="#6366f1" />
          <div className="stat-info">
            <h3>{stats?.totalStudents || 0}</h3>
            <p>Total Students</p>
          </div>
        </div>
        <div className="stat-card glass">
          <BookOpen className="stat-icon" color="#9333ea" />
          <div className="stat-info">
            <h3>{stats?.totalExams || 0}</h3>
            <p>Total Exams</p>
          </div>
        </div>
        <div className="stat-card glass">
          <BarChart2 className="stat-icon" color="#f43f5e" />
          <div className="stat-info">
            <h3>{Math.round(stats?.avgScore || 0)}%</h3>
            <p>Avg. Score</p>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <section className="chart-section glass">
          <h3>Average Marks per Exam</h3>
          <div className="chart-container">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="name" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                    itemStyle={{ color: '#f8fafc' }}
                  />
                  <Bar dataKey="avgScore" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
                <div className="no-chart-data">No performance data available yet.</div>
            )}
          </div>
        </section>

        <section className="management-section glass">
          <h3>Manage Exams</h3>
          <div className="table-wrapper">
            <table className="admin-table">
                <thead>
                <tr>
                    <th>Title</th>
                    <th>Duration</th>
                    <th>Created By</th>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {exams.map(exam => (
                    <tr key={exam.id}>
                    <td>{exam.title}</td>
                    <td>{exam.duration}m</td>
                    <td>{exam.creator_name}</td>
                    <td className="actions-cell">
                        <button className="icon-btn edit-btn"><Edit size={16} /></button>
                        <button onClick={() => deleteExam(exam.id)} className="icon-btn delete-btn"><Trash2 size={16} /></button>
                    </td>
                    </tr>
                ))}
                {exams.length === 0 && (
                    <tr>
                        <td colSpan="4" className="text-center no-data">No exams found.</td>
                    </tr>
                )}
                </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminDashboard;
