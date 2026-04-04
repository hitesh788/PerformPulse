import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import '../pages/Login.css';
import { toast } from 'react-toastify';

const Login = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const submitHandler = async (e) => {
        e.preventDefault();
        try {
            const { data } = await api.post('/auth/login', { email, password });
            localStorage.setItem('userInfo', JSON.stringify(data));
            toast.success('Login successful!');
            navigate(`/${data.role.toLowerCase()}`);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Invalid email or password');
        }
    };

    return (
        <div className="login-container">

            {/* LEFT SIDE */}
            <div className="login-left">
                <h2>Welcome Back 👋</h2>
                <p>
                    Sign in to manage your performance goals, track progress, and view appraisal insights.
                </p>

                <form onSubmit={submitHandler}>
                    <label>Email Address</label>
                    <input
                        type="email"
                        placeholder="Enter your work email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <label>Password</label>
                    <input
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    <button type="submit">Sign In</button>
                </form>

                <div className="divider">OR</div>

                <button className="google-btn">Continue with Google</button>
                <button className="apple-btn">Continue with Apple</button>

                <p className="signup-text">
                    New to PerformPulse? <Link to="/signup">Create Account</Link>
                </p>
            </div>

            {/* RIGHT SIDE */}
            <div className="login-right">
                <h1>Transform Employee Performance Management</h1>

                <p className="quote">
                    "This system helped us standardize employee evaluations, improve transparency, and track KPIs efficiently across teams."
                </p>

                <div className="user-info">
                    <img src="https://i.pravatar.cc/40" alt="user" />
                    <div>
                        <h4>Anita Sharma</h4>
                        <span>HR Manager, TechCorp</span>
                    </div>
                </div>

                {/* OPTIONAL EXTRA INFO */}
                <div style={{ marginTop: "40px", opacity: 0.8 }}>
                    <p>✔ Set Goals & KPIs</p>
                    <p>✔ Monthly Progress Tracking</p>
                    <p>✔ Manager Feedback & Ratings</p>
                    <p>✔ Transparent Evaluation System</p>
                </div>
            </div>

        </div>
    );
};

export default Login;