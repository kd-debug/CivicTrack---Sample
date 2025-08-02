import React, { useState, useEffect } from 'react';
import { databaseService } from '../services/databaseService';
import './AnalyticsDashboard.css';

const AnalyticsDashboard = () => {
    const [stats, setStats] = useState(null);
    const [categoryStats, setCategoryStats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                const [statistics, categories] = await Promise.all([
                    databaseService.getStatistics(),
                    databaseService.getCategoryStatistics()
                ]);
                setStats(statistics);
                setCategoryStats(categories);
                setError(null);
            } catch (err) {
                setError('Failed to fetch statistics.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <div>Loading analytics...</div>;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="analytics-dashboard">
            <h2>Platform Analytics</h2>
            <div className="stats-container">
                <div className="stat-card">
                    <h3>Total Issues</h3>
                    <p>{stats?.totalIssues}</p>
                </div>
                <div className="stat-card">
                    <h3>Reported</h3>
                    <p>{stats?.reportedIssues}</p>
                </div>
                <div className="stat-card">
                    <h3>In Progress</h3>
                    <p>{stats?.inProgressIssues}</p>
                </div>
                <div className="stat-card">
                    <h3>Resolved</h3>
                    <p>{stats?.resolvedIssues}</p>
                </div>
            </div>

            <div className="category-stats">
                <h3>Most Reported Categories</h3>
                <ul>
                    {categoryStats.map(cat => (
                        <li key={cat.name}>
                            <span>{cat.name}</span>
                            <span>{cat.count}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default AnalyticsDashboard;
