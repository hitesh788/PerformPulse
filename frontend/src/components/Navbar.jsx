import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('userInfo'));

    const handleLogout = () => {
        localStorage.removeItem('userInfo');
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <Link to="/" className="nav-brand">PerformPulse</Link>
            <div className="nav-links">
                {user ? (
                    <>
                        {(user.role === 'Admin' || user.role === 'Manager') && (
                            <Link to="/analytics" style={{ fontWeight: 600 }}>Analytics</Link>
                        )}
                        <span style={{ fontWeight: 500, color: 'var(--text-muted)' }}>{user.name}</span>
                        <button onClick={handleLogout} className="btn btn-logout">Logout</button>
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
