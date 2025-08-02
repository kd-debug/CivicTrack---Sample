import React, { useState, useEffect } from 'react';
import { databaseService } from '../services/databaseService';
import './UserManagement.css';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoading(true);
                const allUsers = await databaseService.getAllUsers(); 
                setUsers(allUsers);
                setError(null);
            } catch (err) {
                setError('Failed to fetch users.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    const handleBanUser = async (userId) => {
        if (window.confirm('Are you sure you want to ban this user?')) {
            try {
                await databaseService.banUser(userId);
                setUsers(users.map(user => 
                    user.id === userId ? { ...user, is_banned: true } : user
                ));
            } catch (err) {
                alert('Failed to ban user.');
            }
        }
    };

    if (loading) return <div>Loading users...</div>;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="user-management">
            <h2>Manage Users</h2>
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user.id}>
                            <td>{user.name || 'N/A'}</td>
                            <td>{user.email}</td>
                            <td>{user.role}</td>
                            <td>{user.is_banned ? <span className="status-banned">Banned</span> : <span className="status-active">Active</span>}</td>
                            <td>
                                <button 
                                    onClick={() => handleBanUser(user.id)}
                                    disabled={user.is_banned}
                                    className="ban-button"
                                >
                                    {user.is_banned ? 'Banned' : 'Ban User'}
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default UserManagement;
