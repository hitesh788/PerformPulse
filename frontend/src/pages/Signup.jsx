import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { toast } from 'react-toastify';
import '../pages/Login.css'; // Reusing improved auth styles

const Signup = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '', email: '', password: '', role: 'Employee', managerId: '', department: ''
    });


    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const dataToSend = { ...formData };
            if (!dataToSend.managerId) delete dataToSend.managerId;

            const { data } = await api.post('/auth/signup', dataToSend);
            localStorage.setItem('userInfo', JSON.stringify(data));
            toast.success('Account created successfully!');

            setTimeout(() => {
                navigate(`/${data.role.toLowerCase()}`);
            }, 500);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error creating account');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-wrapper">
            <div className="login-container-new signup-reverse">

                {/* LEFT SIDE: BRANDING (Reverse split for signup) */}
                <div className="login-right-section signup-side">
                    <div className="brand-content">
                        <div className="brand-logo">
                            <span className="logo-text">PerformPulse</span>
                        </div>

                        <div className="hero-text">
                            <h1>Join the Future of Work.</h1>
                            <p>Enable your employees to reach their full potential with our comprehensive performance management suite.</p>
                        </div>

                        <div className="signup-perks">
                            <div className="perk-item">
                                <div className="perk-check">✓</div>
                                <span>Unlimited goal tracking</span>
                            </div>
                            <div className="perk-item">
                                <div className="perk-check">✓</div>
                                <span>Advanced analytics & reporting</span>
                            </div>
                            <div className="perk-item">
                                <div className="perk-check">✓</div>
                                <span>Seamless HR integration</span>
                            </div>
                            <div className="perk-item">
                                <div className="perk-check">✓</div>
                                <span>Enterprise-grade security</span>
                            </div>
                        </div>

                        <div className="testimonial-mini">
                            <p>"PerformPulse transformed our quarterly reviews from a chore into a strategic advantage."</p>
                            <span>— Sarah Jenkins, COO at GlobalLogic</span>
                        </div>
                    </div>

                    <div className="abstract-bg">
                        <div className="circle-1"></div>
                        <div className="circle-4"></div>
                    </div>
                </div>

                {/* RIGHT SIDE: SIGNUP FORM */}
                <div className="login-left-section animate-fade-in">
                    <div className="login-form-box">
                        <div className="brand-logo-mobile">
                            <span className="logo-text">PerformPulse</span>
                        </div>

                        <div className="form-header">
                            <h2>Create Your Account</h2>
                            <p>Get started with PerformPulse today</p>
                        </div>

                        <form onSubmit={submitHandler} className="login-entry-form">
                            <div className="form-row">
                                <div className="input-group">
                                    <label>Full Name</label>
                                    <input name="name" type="text" onChange={handleChange} required />
                                </div>
                            </div>

                            <div className="input-group">
                                <label>Work Email</label>
                                <input name="email" type="email" onChange={handleChange} required />
                            </div>

                            <div className="input-group">
                                <label>Password</label>
                                <input name="password" type="password" onChange={handleChange} required />
                            </div>

                            <div className="form-row grid-2">
                                <div className="input-group">
                                    <label>Professional Role</label>
                                    <select name="role" onChange={handleChange} value={formData.role} className="modern-select">
                                        <option value="Employee">Employee</option>
                                        <option value="Manager">Manager</option>
                                        <option value="Admin">Administrator</option>
                                    </select>
                                </div>
                                <div className="input-group">
                                    <label>Department</label>
                                    <input name="department" type="text" onChange={handleChange} placeholder="e.g. Engineering, Sales" />
                                </div>
                            </div>

                            {formData.role === 'Employee' && (
                                <div className="input-group" style={{ marginTop: '1rem' }}>
                                    <label>Manager ID (Optional)</label>
                                    <input name="managerId" type="text" onChange={handleChange} />
                                </div>
                            )}


                            <button
                                type="submit"
                                className={`primary-login-btn ${loading ? 'loading' : ''}`}
                                disabled={loading}
                            >
                                {loading ? 'Creating Account...' : 'Get Started Free'}
                            </button>
                        </form>

                        <p className="auth-switch">
                            Already have an account? <Link to="/login">Sign in here</Link>
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Signup;

