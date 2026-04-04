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
                        <span style={{ fontWeight: 500 }}>Hello, {user.name} ({user.role})</span>
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
