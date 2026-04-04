import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { toast } from 'react-toastify';

const Signup = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '', email: '', password: '', role: 'Employee', managerId: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        try {
            const dataToSend = { ...formData };
            if (!dataToSend.managerId) delete dataToSend.managerId;

            const { data } = await api.post('/auth/signup', dataToSend);
            localStorage.setItem('userInfo', JSON.stringify(data));
            toast.success('Account created successfully!');
            navigate(`/${data.role.toLowerCase()}`);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error creating account');
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>Create Account</h2>
                <form onSubmit={submitHandler}>
                    <div className="form-group">
                        <label>Full Name</label>
                        <input name="name" type="text" onChange={handleChange} required placeholder="John Doe" />
                    </div>
                    <div className="form-group">
                        <label>Email Address</label>
                        <input name="email" type="email" onChange={handleChange} required placeholder="john@example.com" />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input name="password" type="password" onChange={handleChange} required placeholder="Strong password" />
                    </div>
                    <div className="form-group">
                        <label>Role</label>
                        <select name="role" onChange={handleChange} value={formData.role}>
                            <option value="Employee">Employee</option>
                            <option value="Manager">Manager</option>
                            <option value="Admin">Admin</option>
                        </select>
                    </div>
                    {formData.role === 'Employee' && (
                        <div className="form-group">
                            <label>Manager ID (Optional)</label>
                            <input name="managerId" type="text" onChange={handleChange} placeholder="Manager's Object ID" />
                        </div>
                    )}
                    <button type="submit" className="btn btn-primary auth-btn">Sign Up</button>
                </form>
                <div className="auth-link">
                    Already have an account? <Link to="/login">Sign in here</Link>
                </div>
            </div>
        </div>
    );
};

export default Signup;
