import React, { useState, useEffect } from 'react';
import API from '../api/api';
import { ClipboardList, CheckCircle2, XCircle, Award } from 'lucide-react';

const ResultPage = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const { data } = await API.get('/results/my-results');
        setResults(data);
      } catch (err) {
        console.error('Error fetching results', err);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, []);

  return (
    <div className="results-page dashboard">
      <header className="dashboard-header">
        <h1 className="gradient-text">Your Performance</h1>
        <p>Review your exam history and scores.</p>
      </header>

      {loading ? (
        <div className="loading">Loading your results...</div>
      ) : (
        <div className="results-container">
          {results.length === 0 ? (
            <div className="no-data glass">You haven't attempted any exams yet.</div>
          ) : (
            <div className="results-grid">
              {results.map((res) => (
                <div key={res.id} className="result-card glass">
                  <div className="result-card-header">
                    <h3>{res.title}</h3>
                    <span className="date">{new Date(res.end_time).toLocaleDateString()}</span>
                  </div>
                  <div className="result-stats">
                    <div className="res-stat">
                      <span className="label">Score</span>
                      <span className="value">{res.score} / {res.total_marks}</span>
                    </div>
                    <div className="res-stat">
                      <span className="label">Status</span>
                      <span className={`value ${res.score >= res.total_marks * 0.4 ? 'pass' : 'fail'}`}>
                        {res.score >= res.total_marks * 0.4 ? 'Passed' : 'Failed'}
                      </span>
                    </div>
                  </div>
                  <div className="progress-bar-container">
                    <div 
                      className="progress-bar" 
                      style={{ width: `${(res.score / res.total_marks) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ResultPage;
