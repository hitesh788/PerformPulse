import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';

const Navbar = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('userInfo'));
    const [notifications, setNotifications] = useState([]);
    const [showBell, setShowBell] = useState(false);

    useEffect(() => {
        if (user) {
            fetchNotifications();
            // Simulate Real-time web sockets by short-polling for new manager pings
            const interval = setInterval(fetchNotifications, 5000);
            return () => clearInterval(interval);
        }
    }, []);

    const fetchNotifications = async () => {
        try {
            const res = await api.get('/notification');
            setNotifications(res.data);
        } catch (error) {
            console.error('Error with notification socket', error);
        }
    };

    const markAsRead = async (id) => {
        try {
            await api.put(`/notification/${id}/read`);
            fetchNotifications();
        } catch (error) {
            console.error(error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('userInfo');
        navigate('/login');
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <nav className="navbar">
            
            <Link to={user ? `/${user.role.toLowerCase()}` : "/"} className="nav-brand">PerformPulse</Link>
            <div className="nav-links" style={{ display: 'flex', alignItems: 'center' }}>
                {user ? (
                    <>
                        <div style={{ position: 'relative', cursor: 'pointer', marginRight: '1rem' }}>
                            <div onClick={() => setShowBell(!showBell)} style={{ position: 'relative' }}>
                                <span style={{ fontSize: '1.5rem' }}>🔔</span>
                                {unreadCount > 0 && (
                                    <span style={{
                                        position: 'absolute', top: '-5px', right: '-5px',
                                        background: 'var(--accent-color)', color: 'white',
                                        borderRadius: '50%', padding: '0.1rem 0.4rem',
                                        fontSize: '0.65rem', fontWeight: 'bold'
                                    }}>
                                        {unreadCount}
                                    </span>
                                )}
                                
                            </div>

                            {showBell && (
                                <div style={{
                                    position: 'absolute', top: '40px', right: '-50px', width: '300px',
                                    background: 'white', borderRadius: '12px', boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
                                    zIndex: 1000, overflow: 'hidden', border: '1px solid #e2e8f0'
                                }}>
                                    <div style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0', fontWeight: 'bold', background: '#f8fafc' }}>
                                        Real-time Notifications
                                    </div>
                                    <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                        {notifications.length === 0 ? (
                                            <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>No recent activity</div>
                                        ) : notifications.map(notif => (
                                            <div key={notif._id} onClick={() => markAsRead(notif._id)} style={{
                                                padding: '1rem', borderBottom: '1px solid #f1f5f9', cursor: 'pointer',
                                                background: notif.isRead ? 'white' : 'rgba(99, 102, 241, 0.05)',
                                                borderLeft: notif.isRead ? '3px solid transparent' : '3px solid var(--primary-color)'
                                            }}>
                                                <p style={{ fontSize: '0.85rem', color: notif.isRead ? 'var(--text-muted)' : 'var(--text-main)', marginBottom: '0.3rem' }}>
                                                    {notif.message}
                                                </p>
                                                <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                                                    {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {(user.role === 'Admin' || user.role === 'Manager') && (
                            <Link to="/analytics" style={{ fontWeight: 600 }}>Analytics</Link>
                        )}
                        <span style={{ fontWeight: 500, color: 'var(--text-muted)', marginLeft: '1rem' }}>{user.name}</span>
                        <button onClick={handleLogout} className="btn btn-logout" style={{ marginLeft: '1rem' }}>Logout</button>
                    </>
                ) : (
                    <>
                        <Link to="/login">Login</Link>
                        <Link to="/signup" className="btn btn-primary">Sign Up</Link>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
