import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/api';
import { Play, Clock, Award, FileText, AlertCircle, RotateCcw } from 'lucide-react';

const StudentDashboard = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await API.get('/exams');
      setExams(data);
    } catch (err) {
      console.error('Error fetching exams', err);
      setError('Could not load exams. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const startExam = (examId) => {
    if (window.confirm('Are you sure you want to start this exam? The timer will begin immediately.')) {
      navigate(`/exam/${examId}`);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner-container">
          <div className="premium-spinner"></div>
          <p>Loading your courses...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error glass">
        <AlertCircle size={48} color="#ef4444" />
        <h2>Unable to load dashboard</h2>
        <p>{error}</p>
        <button onClick={fetchExams} className="btn-primary retry-btn">
          <RotateCcw size={18} />
          <span>Retry</span>
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1 className="gradient-text">Student Dashboard</h1>
        <p>Welcome back! Ready to test your knowledge?</p>
      </header>

      <div className="stats-grid">
        <div className="stat-card glass">
          <FileText className="stat-icon" color="#6366f1" />
          <div className="stat-info">
            <h3>{exams.length}</h3>
            <p>Available Exams</p>
          </div>
        </div>
        <div className="stat-card glass">
          <Clock className="stat-icon" color="#9333ea" />
          <div className="stat-info">
            <h3>0</h3>
            <p>Exams Attempted</p>
          </div>
        </div>
        <div className="stat-card glass">
          <Award className="stat-icon" color="#f43f5e" />
          <div className="stat-info">
            <h3>0</h3>
            <p>Certificates Earned</p>
          </div>
        </div>
      </div>

      <section className="exam-list-section">
        <h2>Available Exams</h2>
        <div className="exam-grid">
          {exams.map((exam) => (
            <div key={exam.id} className="exam-card glass">
              <div className="exam-card-content">
                <h3>{exam.title}</h3>
                <p>{exam.description}</p>
                <div className="exam-meta">
                  <span><Clock size={16} /> {exam.duration} mins</span>
                  <span><Award size={16} /> {exam.total_marks} Marks</span>
                </div>
              </div>
              <button onClick={() => startExam(exam.id)} className="btn-primary start-btn">
                <Play size={18} />
                <span>Start Exam</span>
              </button>
            </div>
          ))}
          {exams.length === 0 && <p className="no-data">No exams available at the moment.</p>}
        </div>
      </section>
    </div>
  );
};

export default StudentDashboard;
