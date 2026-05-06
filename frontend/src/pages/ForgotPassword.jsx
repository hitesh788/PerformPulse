import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { toast } from 'react-toastify';
import '../pages/Login.css';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/auth/forgot-password', { email });
            setSubmitted(true);
            toast.success('Recovery link dispatched.');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error processing request');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-wrapper">
            <div className="login-container-new" style={{ maxWidth: '600px', margin: 'auto' }}>
                <div className="login-left-section animate-fade-in" style={{ width: '100%', borderRadius: '24px' }}>
                    <div className="login-form-box">
                        <div className="form-header">
                            <h2>Reset Password</h2>
                            <p>Enter your verified enterprise email to receive recovery instructions.</p>
                        </div>

                        {!submitted ? (
                            <form onSubmit={handleSubmit} className="login-entry-form">
                                <div className="input-group">
                                    <label htmlFor="email">Work Email</label>
                                    <input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className={`primary-login-btn ${loading ? 'loading' : ''}`}
                                    disabled={loading}
                                >
                                    {loading ? 'Processing...' : 'Send Recovery Link'}
                                </button>
                            </form>
                        ) : (
                            <div className="success-banner" style={{ textAlign: 'center', padding: '2rem' }}>
                                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✉️</div>
                                <h4>Check your inbox</h4>
                                <p>We've sent recovery instructions to <strong>{email}</strong>.</p>
                                <button
                                    className="primary-login-btn"
                                    style={{ marginTop: '1.5rem' }}
                                    onClick={() => setSubmitted(false)}
                                >
                                    Try another email
                                </button>
                            </div>
                        )}

                        <p className="auth-switch">
                            Remember your password? <Link to="/login">Sign In</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
