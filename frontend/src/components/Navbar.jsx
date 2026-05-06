import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import io from 'socket.io-client';

const Navbar = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('userInfo'));
    const [notifications, setNotifications] = useState([]);
    const [showBell, setShowBell] = useState(false);
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        if (user) {
            fetchNotifications();

            // Initialize Socket connection
            const newSocket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000');
            setSocket(newSocket);

            newSocket.on('connect', () => {
                newSocket.emit('join', user._id);
            });

            newSocket.on('newNotification', (notif) => {
                setNotifications(prev => [notif, ...prev]);
                // Optional: Play a subtle notification sound
                new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3').play().catch(e => { });
            });

            return () => newSocket.disconnect();
        }
    }, [user?._id]);

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
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginLeft: '1rem', padding: '0.4rem 0.8rem', background: 'rgba(255,255,255,0.6)', borderRadius: '14px', border: '1px solid rgba(226, 232, 240, 0.6)', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                            <div style={{
                                width: '36px', height: '36px', borderRadius: '12px',
                                background: user.role === 'Admin' ? 'linear-gradient(135deg, #f59e0b, #d97706)' :
                                    user.role === 'Manager' ? 'linear-gradient(135deg, #10b981, #059669)' :
                                        'linear-gradient(135deg, var(--primary-color), var(--primary-hover))',
                                color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontWeight: 800, fontSize: '1rem', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                            }}>
                                {user.name?.[0].toUpperCase()}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '0.9rem', lineHeight: 1 }}>{user.name}</span>
                                <span style={{
                                    fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '0.2rem',
                                    color: user.role === 'Admin' ? '#b45309' : user.role === 'Manager' ? '#047857' : '#4338ca'
                                }}>
                                    {user.role === 'Admin' ? 'Root Authority' : user.role === 'Manager' ? 'Leadership Node' : 'Operational Staff'}
                                </span>
                            </div>
                        </div>
                        <button onClick={handleLogout} className="btn btn-logout" style={{ marginLeft: '1rem', padding: '0.5rem 1rem', fontSize: '0.85rem' }}>Secure Logout</button>


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
