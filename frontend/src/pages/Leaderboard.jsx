import React, { useState, useEffect } from 'react';
import API from '../api/api';
import { Trophy, Medal, Star } from 'lucide-react';

const Leaderboard = () => {
    const [globalStats, setGlobalStats] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const { data } = await API.get('/leaderboard/global');
                setGlobalStats(data);
            } catch (err) {
                console.error('Error fetching leaderboard', err);
            } finally {
                setLoading(false);
            }
        };
        fetchLeaderboard();
    }, []);

    const getIcon = (index) => {
        if (index === 0) return <Trophy color="#fbbf24" size={24} />;
        if (index === 1) return <Medal color="#94a3b8" size={24} />;
        if (index === 2) return <Star color="#b45309" size={24} />;
        return <span className="rank-num">{index + 1}</span>;
    };

    return (
        <div className="leaderboard-page dashboard">
            <header className="dashboard-header text-center">
                <h1 className="gradient-text">Hall of Fame</h1>
                <p>Recognizing our top performers and consistent learners.</p>
            </header>

            <div className="leaderboard-container glass">
                {loading ? (
                    <div className="loading">Calculating rankings...</div>
                ) : (
                    <table className="leaderboard-table">
                        <thead>
                            <tr>
                                <th>Rank</th>
                                <th>Student Name</th>
                                <th>Total Accumulated Score</th>
                            </tr>
                        </thead>
                        <tbody>
                            {globalStats.map((stat, idx) => (
                                <tr key={idx} className={idx < 3 ? 'top-rank' : ''}>
                                    <td>{getIcon(idx)}</td>
                                    <td>
                                        <div className="user-cell">
                                            <div className="avatar">{stat.name.charAt(0)}</div>
                                            <span>{stat.name}</span>
                                        </div>
                                    </td>
                                    <td><span className="score-pill">{stat.total_score} pts</span></td>
                                </tr>
                            ))}
                            {globalStats.length === 0 && (
                                <tr>
                                    <td colSpan="3" className="no-data">No ranking data available yet.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default Leaderboard;
