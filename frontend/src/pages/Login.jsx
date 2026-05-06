import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import '../pages/Login.css';
import { toast } from 'react-toastify';

const Login = () => {
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const submitHandler = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const { data } = await api.post('/auth/login', { email, password });

            localStorage.setItem('userInfo', JSON.stringify(data));
            toast.success('Login successful!');

            // Small delay for smooth transition
            setTimeout(() => {
                navigate(`/${data.role.toLowerCase()}`);
            }, 500);
        } catch (err) {
            const msg = err.response?.data?.message || 'Invalid email or password';
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-wrapper">
            <div className="login-container-new">

                {/* LEFT SIDE: AUTH FORM */}
                <div className="login-left-section animate-fade-in">
                    <div className="login-form-box">
                        <div className="brand-logo-mobile">
                            <span className="logo-text">PerformPulse</span>
                        </div>

                        <div className="form-header">
                            <h2>Welcome Back</h2>
                            <p>Enter your credentials to access your performance dashboard</p>
                        </div>

                        <form onSubmit={submitHandler} className="login-entry-form">
                            <div className="input-group">
                                <label htmlFor="email">Work Email</label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="input-group">
                                <div className="label-row">
                                    <label htmlFor="password">Password</label>
                                    <Link to="/forgot-password" id="forgot-password-link">Forgot password?</Link>
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>

                            {error && (
                                <div id="errorMsg" className="error-banner">
                                    <span className="error-icon">⚠️</span>
                                    {error}
                                </div>
                            )}

                            <button
                                id="loginBtn"
                                type="submit"
                                className={`primary-login-btn ${loading ? 'loading' : ''}`}
                                disabled={loading}
                            >
                                {loading ? 'Signing in...' : 'Sign In'}
                            </button>
                        </form>

                        <p className="auth-switch">
                            Don't have an account? <Link to="/signup">Start free trial</Link>
                        </p>
                    </div>
                </div>

                {/* RIGHT SIDE: BRANDING/VISUAL */}
                <div className="login-right-section">
                    <div className="brand-content">
                        <div className="brand-logo">
                            <span className="logo-text">PerformPulse</span>
                        </div>

                        <div className="hero-text">
                            <h1>Elevate Your Team's Performance.</h1>
                            <p>The all-in-one platform for goal tracking, continuous feedback, and data-driven evaluations.</p>
                        </div>

                        <div className="feature-list">
                            <div className="feature-item">
                                <div className="feature-icon">🎯</div>
                                <div className="feature-info">
                                    <h4>Precision Goal Setting</h4>
                                    <p>Align team objectives with company OKRs effortlessly.</p>
                                </div>
                            </div>
                            <div className="feature-item">
                                <div className="feature-icon">📈</div>
                                <div className="feature-info">
                                    <h4>Real-time Analytics</h4>
                                    <p>Visualize progress with enterprise-grade dashboards.</p>
                                </div>
                            </div>
                            <div className="feature-item">
                                <div className="feature-icon">🔄</div>
                                <div className="feature-info">
                                    <h4>360° Feedback</h4>
                                    <p>Foster a culture of growth with seamless feedback loops.</p>
                                </div>
                            </div>
                        </div>

                        <div className="trust-badge">
                            <p>Trusted by 500+ global enterprises</p>
                        </div>
                    </div>

                    {/* Abstract Decorative Elements */}
                    <div className="abstract-bg">
                        <div className="circle-1"></div>
                        <div className="circle-2"></div>
                        <div className="circle-3"></div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Login;