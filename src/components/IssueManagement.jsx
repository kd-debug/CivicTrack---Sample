import React, { useState, useEffect } from 'react';
import { databaseService } from '../services/databaseService';
import './IssueManagement.css';

const IssueManagement = () => {
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchIssues = async () => {
            try {
                setLoading(true);
                const allIssues = await databaseService.getIssues({ status: 'all' });
                setIssues(allIssues);
                setError(null);
            } catch (err) {
                setError('Failed to fetch issues.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchIssues();
    }, []);

    const toggleVisibility = async (issueId, isHidden) => {
        try {
            await databaseService.toggleIssueVisibility(issueId, !isHidden);
            setIssues(issues.map(issue => 
                issue.id === issueId ? { ...issue, is_hidden: !isHidden } : issue
            ));
        } catch (err) {
            alert('Failed to update issue visibility.');
        }
    };

    if (loading) return <div>Loading issues...</div>;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="issue-management">
            <h2>Manage Reported Issues</h2>
            <table>
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Category</th>
                        <th>Status</th>
                        <th>Reported By</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {issues.map(issue => (
                        <tr key={issue.id} className={issue.is_hidden ? 'hidden-issue' : ''}>
                            <td>{issue.title}</td>
                            <td>{issue.category}</td>
                            <td>{issue.status}</td>
                            <td>{issue.reporter_name}</td>
                            <td>
                                <button onClick={() => toggleVisibility(issue.id, issue.is_hidden)}>
                                    {issue.is_hidden ? 'Unhide' : 'Hide'}
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default IssueManagement;
