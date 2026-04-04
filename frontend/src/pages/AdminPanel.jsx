import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { toast } from 'react-toastify';

const AdminPanel = () => {
    const [users, setUsers] = useState([]);
    const [stats, setStats] = useState({ employees: 0, managers: 0, admins: 0 });
    const [searchTerm, setSearchTerm] = useState('');

    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('CREATE');
    const [formData, setFormData] = useState({ _id: '', name: '', email: '', password: '', role: 'Employee', managerId: '' });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await api.get('/auth/users');
            setUsers(res.data);

            const counts = { employees: 0, managers: 0, admins: 0 };
            res.data.forEach(u => {
                if (u.role === 'Employee') counts.employees++;
                if (u.role === 'Manager') counts.managers++;
                if (u.role === 'Admin') counts.admins++;
            });
            setStats(counts);
        } catch (error) {
            console.error(error);
        }
    };

    const roleData = [
        { name: 'Employees', value: stats.employees },
        { name: 'Managers', value: stats.managers },
        { name: 'Admins', value: stats.admins }
    ];

    const COLORS = ['#6366f1', '#10b981', '#f59e0b'];

    const getRoleBadge = (role) => {
        switch (role) {
            case 'Admin': return <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#d97706' }}>System Admin</span>;
            case 'Manager': return <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#059669' }}>Manager</span>;
            default: return <span className="badge" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#4f46e5' }}>Employee</span>;
        }
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.role.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const openCreateModal = () => {
        setModalMode('CREATE');
        setFormData({ _id: '', name: '', email: '', password: '', role: 'Employee', managerId: '' });
        setShowModal(true);
    };

    const openEditModal = (user) => {
        setModalMode('EDIT');
        setFormData({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            managerId: user.managerId || '',
            password: '' // Optional password reset placeholder, typically better to leave out or handle carefully
        });
        setShowModal(true);
    };

    const handleModalSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...formData };
            if (!payload.managerId || payload.managerId.trim() === '') {
                delete payload.managerId;
                payload.managerId = null;
            }

            if (modalMode === 'CREATE') {
                await api.post('/auth/signup', payload); // Reusing signup internally to create users
                toast.success('User provisioned successfully');
            } else {
                await api.put(`/auth/users/${payload._id}`, payload);
                toast.success('User profile updated');
            }
            setShowModal(false);
            fetchUsers();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error processing request');
        }
    };

    const handleSuspend = async (id) => {
        if (window.confirm('Are you sure you want to suspend/delete this account entirely from the enterprise boundary?')) {
            try {
                await api.delete(`/auth/users/${id}`);
                toast.success('Account suspended and removed');
                fetchUsers();
            } catch (error) {
                toast.error('Failed to suspend account');
            }
        }
    };

    return (
        <div>
            <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h1>Enterprise Administration</h1>
                    <div className="subtitle">Manage directory topology and global system access.</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <button className="btn btn-primary" onClick={openCreateModal} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '1.2rem' }}>+</span> Provision New User
                    </button>
                </div>
            </div>

            <div className="grid-cards" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
                <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1.5rem 2rem' }}>
                    <div style={{ width: '60px', height: '60px', borderRadius: '15px', background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1', fontSize: '1.5rem', fontWeight: 'bold' }}>
                        {users.length}
                    </div>
                    <div>
                        <h3 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.4rem' }}>Total Accounts</h3>
                        <p style={{ margin: 0, color: 'var(--text-muted)' }}>Registered network users</p>
                    </div>
                </div>

                <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1.5rem 2rem' }}>
                    <div style={{ width: '60px', height: '60px', borderRadius: '15px', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981', fontSize: '1.5rem', fontWeight: 'bold' }}>
                        {stats.managers}
                    </div>
                    <div>
                        <h3 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.4rem' }}>Leadership</h3>
                        <p style={{ margin: 0, color: 'var(--text-muted)' }}>Active manager level nodes</p>
                    </div>
                </div>

                <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1.5rem 2rem' }}>
                    <div style={{ width: '60px', height: '60px', borderRadius: '15px', background: 'rgba(244, 63, 94, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f43f5e', fontSize: '1.5rem', fontWeight: 'bold' }}>
                        On
                    </div>
                    <div>
                        <h3 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.4rem' }}>Review Cycle</h3>
                        <p style={{ margin: 0, color: 'var(--text-muted)' }}>Q3 Appraisal Live Status</p>
                    </div>
                </div>
            </div>

            <div className="grid-cards" style={{ gridTemplateColumns: 'minmax(300px, 1fr) minmax(500px, 2fr)' }}>
                <div className="glass-card">
                    <h2>Organizational Distribution</h2>
                    <div style={{ height: '300px', width: '100%', marginTop: '1rem' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={roleData} innerRadius={70} outerRadius={100} paddingAngle={5} dataKey="value">
                                    {roleData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="glass-card" style={{ overflowX: 'auto' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2>Directory Access Control</h2>
                        <input
                            type="text"
                            placeholder="Search accounts..."
                            value={searchTerm}
                            onChange={handleSearch}
                            style={{ padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' }}
                        />
                    </div>
                    <table style={{ marginTop: '1.5rem' }}>
                        <thead>
                            <tr>
                                <th>Identity</th>
                                <th>Contact Registry</th>
                                <th>Privilege Level</th>
                                <th>Manager Key</th>
                                <th>Control Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map(u => (
                                <tr key={u._id}>
                                    <td>
                                        <div style={{ fontWeight: 600 }}>{u.name}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{u._id.slice(-6).toUpperCase()}</div>
                                    </td>
                                    <td>{u.email}</td>
                                    <td>{getRoleBadge(u.role)}</td>
                                    <td style={{ fontFamily: 'monospace', color: 'var(--text-muted)' }}>{u.managerId ? u.managerId.slice(-6).toUpperCase() : 'ROOT'}</td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button onClick={() => openEditModal(u)} style={{ padding: '0.4rem 0.8rem', border: '1px solid #e2e8f0', borderRadius: '6px', background: 'white', cursor: 'pointer', fontWeight: 600, color: 'var(--primary-color)' }}>Edit</button>
                                            <button onClick={() => handleSuspend(u._id)} style={{ padding: '0.4rem 0.8rem', border: '1px solid #fee2e2', borderRadius: '6px', background: '#fef2f2', cursor: 'pointer', fontWeight: 600, color: '#ef4444' }}>Suspend</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredUsers.length === 0 && <tr><td colSpan="5" style={{ textAlign: 'center' }}>No matching accounts found.</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="glass-card" style={{ width: '100%', maxWidth: '500px', background: 'white', margin: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ margin: 0 }}>{modalMode === 'CREATE' ? 'Provision New User' : 'Edit Privilege & Identity'}</h2>
                            <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
                        </div>

                        <form onSubmit={handleModalSubmit}>
                            <div className="form-group">
                                <label>Full Name</label>
                                <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label>Email Address</label>
                                <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required />
                            </div>
                            {modalMode === 'CREATE' && (
                                <div className="form-group">
                                    <label>Password Policy (String)</label>
                                    <input type="password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} required={modalMode === 'CREATE'} />
                                </div>
                            )}
                            <div className="form-group">
                                <label>Role Clearance</label>
                                <select value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}>
                                    <option value="Employee">Employee</option>
                                    <option value="Manager">Manager</option>
                                    <option value="Admin">Admin</option>
                                </select>
                            </div>
                            {(formData.role === 'Employee') && (
                                <div className="form-group">
                                    <label>Manager Node Key (Optional Object ID)</label>
                                    <input type="text" value={formData.managerId} onChange={e => setFormData({ ...formData, managerId: e.target.value })} placeholder="e.g. 64b9..." />
                                </div>
                            )}
                            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
                                {modalMode === 'CREATE' ? 'Submit Identity' : 'Save Changes'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
};

export default AdminPanel;
