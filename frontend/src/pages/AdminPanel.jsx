import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { toast } from 'react-toastify';

const SuspendConfirmToast = ({ userName, onConfirm, closeToast }) => (
    <div style={{ fontFamily: 'Inter, sans-serif' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '1.1rem' }}>⚠️</span>
            <strong style={{ fontSize: '0.95rem', color: '#1e293b' }}>Suspend Account</strong>
        </div>
        <p style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '1rem', lineHeight: 1.5 }}>
            Remove <span style={{ fontWeight: 800, color: '#ef4444' }}>{userName}</span> from the enterprise directory? This action cannot be undone.
        </p>
        <div style={{ display: 'flex', gap: '0.6rem' }}>
            <button
                onClick={() => { onConfirm(); closeToast(); }}
                style={{ flex: 1, padding: '0.5rem', borderRadius: '8px', border: 'none', background: '#ef4444', color: 'white', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}
            >
                Suspend
            </button>
            <button
                onClick={closeToast}
                style={{ flex: 1, padding: '0.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', color: '#64748b', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}
            >
                Cancel
            </button>
        </div>
    </div>
);

const AdminPanel = () => {
    const [activeTab, setActiveTab] = useState('directory');
    const [users, setUsers] = useState([]);
    const [cycles, setCycles] = useState([]);
    const [logs, setLogs] = useState([]);
    const [stats, setStats] = useState({ employees: 0, managers: 0, admins: 0 });
    const [searchTerm, setSearchTerm] = useState('');

    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('CREATE');
    const [formData, setFormData] = useState({ _id: '', name: '', email: '', password: '', role: 'Employee', managerId: '', department: 'General' });

    useEffect(() => {
        fetchUsers();
        fetchCycles();
        fetchLogs();
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
        } catch (error) { console.error(error); }
    };

    const fetchCycles = async () => {
        try {
            const res = await api.get('/admin/cycles');
            setCycles(res.data);
        } catch (error) { console.error(error); }
    };

    const fetchLogs = async () => {
        try {
            const res = await api.get('/admin/logs');
            setLogs(res.data);
        } catch (error) { console.error(error); }
    };

    const handleToggleCycle = async (id, currentStatus) => {
        const nextStatus = currentStatus === 'Active' ? 'Completed' : 'Active';
        try {
            await api.put(`/admin/cycles/${id}`, { status: nextStatus });
            toast.success(`Cycle marked as ${nextStatus}`);
            fetchCycles();
            fetchLogs();
        } catch (error) { toast.error('Failed to update cycle'); }
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

    const handleSuspend = (id) => {
        const targetUser = users.find(u => u._id === id);
        toast(
            ({ closeToast }) => (
                <SuspendConfirmToast
                    userName={targetUser?.name || 'this user'}
                    onConfirm={async () => {
                        try {
                            await api.delete(`/auth/users/${id}`);
                            toast.success(`✅ ${targetUser?.name}'s account has been suspended and removed from the enterprise directory.`);
                            fetchUsers();
                            fetchLogs();
                        } catch (error) {
                            toast.error('⛔ Authorization failed. Unable to suspend account.');
                        }
                    }}
                    closeToast={closeToast}
                />
            ),
            {
                autoClose: false,
                closeOnClick: false,
                closeButton: false,
                style: { minWidth: '320px', padding: '1rem' }
            }
        );
    };

    return (
        <div>
            <div className="dashboard-header" style={{ marginBottom: '3rem', borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: 'var(--primary-color)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1.2px', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary-color)', boxShadow: '0 0 10px var(--primary-glow)' }}></span>
                            Root Authority Active
                        </div>
                        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>Enterprise Command Center</h1>
                        <p className="subtitle" style={{ fontSize: '1.1rem' }}>Orchestrate global corporate assets, appraisal cycles, and compliance trails.</p>
                    </div>
                </div>
            </div>

            <div className="admin-tabs" style={{ display: 'flex', gap: '1rem', marginBottom: '3rem', background: 'rgba(255,255,255,0.4)', padding: '0.5rem', borderRadius: '14px', width: 'fit-content', border: '1px solid rgba(0,0,0,0.05)' }}>
                {['directory', 'cycles', 'logs'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        style={{
                            background: activeTab === tab ? 'white' : 'transparent',
                            border: 'none',
                            padding: '0.8rem 1.5rem',
                            fontSize: '0.85rem',
                            fontWeight: 800,
                            color: activeTab === tab ? 'var(--primary-color)' : 'var(--text-muted)',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            textTransform: 'uppercase',
                            letterSpacing: '1px',
                            transition: 'all 0.3s ease',
                            boxShadow: activeTab === tab ? '0 4px 12px rgba(0,0,0,0.05)' : 'none'
                        }}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {activeTab === 'directory' && (
                <div className="animate-fade-in">
                    <div className="grid-cards" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', marginBottom: '3rem' }}>
                        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', borderLeft: '4px solid var(--primary-color)' }}>
                            <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.1)', color: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>👥</div>
                            <div><h3 style={{ fontSize: '1.5rem', fontWeight: 900 }}>{users.length}</h3><p style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Corporate Identities</p></div>
                        </div>
                        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', borderLeft: '4px solid var(--secondary-color)' }}>
                            <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>🎯</div>
                            <div><h3 style={{ fontSize: '1.5rem', fontWeight: 900 }}>{stats.managers}</h3><p style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Leaders Provisioned</p></div>
                        </div>
                        <div
                            className="glass-card"
                            onClick={openCreateModal}
                            style={{ textAlign: 'left', border: '2px dashed var(--primary-color)', cursor: 'pointer', background: 'rgba(99, 102, 241, 0.02)', display: 'flex', alignItems: 'center', gap: '1rem' }}
                        >
                            <div style={{ fontSize: '1.5rem' }}>➕</div>
                            <div>
                                <div style={{ color: 'var(--primary-color)', fontWeight: 900, fontSize: '0.9rem' }}>PROVISION ASSET</div>
                                <p style={{ fontSize: '0.75rem', color: '#64748b' }}>Onboard new corporate credentials</p>
                            </div>
                        </div>
                    </div>

                    <div className="glass-card" style={{ padding: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <div>
                                <h2 style={{ fontSize: '1.5rem', marginBottom: '0.3rem' }}>Identity Governance</h2>
                                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Manage clearances and departmental assignments for all personnel.</p>
                            </div>
                            <input
                                type="text"
                                placeholder="Universal Identity Search..."
                                value={searchTerm}
                                onChange={handleSearch}
                                style={{ padding: '0.8rem 1.2rem', borderRadius: '12px', border: '1px solid #e2e8f0', width: '300px', background: '#f8fafc' }}
                            />
                        </div>
                        <table>
                            <thead>
                                <tr>
                                    <th style={{ background: '#f8fafc', color: '#64748b' }}>Identity Pool</th>
                                    <th style={{ background: '#f8fafc', color: '#64748b' }}>Registry URI</th>
                                    <th style={{ background: '#f8fafc', color: '#64748b' }}>Clearance</th>
                                    <th style={{ background: '#f8fafc', color: '#64748b' }}>Department</th>
                                    <th style={{ background: '#f8fafc', color: '#64748b', textAlign: 'right' }}>Management</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map(u => (
                                    <tr key={u._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td>
                                            <div style={{ fontWeight: 800, color: 'var(--text-main)' }}>{u.name}</div>
                                            <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontFamily: 'monospace' }}>UUID: {u._id}</div>
                                        </td>
                                        <td style={{ fontWeight: 500, color: '#64748b' }}>{u.email}</td>
                                        <td>{getRoleBadge(u.role)}</td>
                                        <td><span className="badge badge-operational" style={{ fontSize: '0.7rem', background: '#f1f5f9', color: '#475569' }}>{u.department || 'General'}</span></td>
                                        <td style={{ textAlign: 'right' }}>
                                            <button onClick={() => openEditModal(u)} className="btn" style={{ padding: '0.5rem 1rem', background: 'white', color: 'var(--primary-color)', border: '1px solid var(--primary-color)' }}>Update</button>
                                            <button onClick={() => handleSuspend(u._id)} className="btn" style={{ padding: '0.5rem 1rem', color: '#ef4444', marginLeft: '0.5rem', background: 'rgba(239, 68, 68, 0.05)' }}>Suspend</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'cycles' && (
                <div className="animate-fade-in">
                    <div className="glass-card" style={{ padding: '2.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                            <div>
                                <h2 style={{ fontSize: '1.6rem', marginBottom: '0.4rem' }}>Appraisal Orchestration</h2>
                                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Orchestrate timelines for organizational performance assessments.</p>
                            </div>
                            <button className="btn btn-primary" style={{ padding: '1rem 2rem', fontWeight: 800 }}>+ Define Appraisal Module</button>
                        </div>
                        <table>
                            <thead>
                                <tr>
                                    <th style={{ background: '#f8fafc' }}>Review Cycle Designation</th>
                                    <th style={{ background: '#f8fafc' }}>Active Window</th>
                                    <th style={{ background: '#f8fafc' }}>Operational Status</th>
                                    <th style={{ background: '#f8fafc', textAlign: 'right' }}>Control Vector</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cycles.map(c => (
                                    <tr key={c._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td><div style={{ fontWeight: 800, fontSize: '1.1rem' }}>{c.name}</div></td>
                                        <td style={{ fontWeight: 600, color: '#64748b' }}>{new Date(c.startDate).toLocaleDateString()} &mdash; {new Date(c.endDate).toLocaleDateString()}</td>
                                        <td>
                                            <span style={{
                                                display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 1rem',
                                                borderRadius: '100px', fontSize: '0.8rem', fontWeight: 800,
                                                background: c.status === 'Active' ? '#f0fdf4' : '#f8fafc',
                                                color: c.status === 'Active' ? '#166534' : '#64748b',
                                                border: c.status === 'Active' ? '1px solid #bbf7d0' : '1px solid #e2e8f0'
                                            }}>
                                                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: c.status === 'Active' ? '#22c55e' : '#cbd5e1' }}></span>
                                                {c.status.toUpperCase()}
                                            </span>
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            <button
                                                className="btn"
                                                onClick={() => handleToggleCycle(c._id, c.status)}
                                                style={{ padding: '0.7rem 1.2rem', fontWeight: 700, background: c.status === 'Active' ? 'rgba(239, 68, 68, 0.05)' : 'rgba(34, 197, 94, 0.05)', color: c.status === 'Active' ? '#ef4444' : '#10b981', border: '1px solid' }}
                                            >
                                                {c.status === 'Active' ? 'Deactivate Module' : 'Enable Access'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'logs' && (
                <div className="animate-fade-in">
                    <div className="glass-card" style={{ padding: '2.5rem', background: '#020617', border: '1px solid #1e293b' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <div>
                                <h2 style={{ fontSize: '1.6rem', color: '#f8fafc', marginBottom: '0.4rem' }}>Critical System Audit</h2>
                                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Real-time immutable trail of high-privilege administrative operations.</p>
                            </div>
                            <button className="btn" onClick={fetchLogs} style={{ background: '#1e293b', color: '#f8fafc', border: '1px solid #334155' }}>RE-SYNC LOGS</button>
                        </div>
                        <div className="terminal-logs" style={{
                            background: '#0a0a0a', border: '1px solid #1e293b', padding: '1.5rem',
                            borderRadius: '16px', fontFamily: '"JetBrains Mono", "Fira Code", monospace',
                            maxHeight: '600px', overflowY: 'auto', color: '#94a3b8', fontSize: '0.9rem',
                            boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.5)'
                        }}>
                            {logs.map((log, idx) => (
                                <div key={log._id} style={{ marginBottom: '1rem', borderBottom: '1px solid #1e293b', paddingBottom: '0.8rem', opacity: 0.9 }}>
                                    <span style={{ color: '#475569' }}>[{idx.toString().padStart(4, '0')}]</span>{' '}
                                    <span style={{ color: '#0ea5e9' }}>{new Date(log.createdAt).toISOString()}</span>{' '}
                                    <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>USR::{log.userName.toUpperCase().replace(/\s/g, '_')}</span>{' '}
                                    <span style={{ color: '#10b981' }}>EVENT::{log.action.toUpperCase()}</span> &mdash;
                                    <span style={{ color: '#e2e8f0' }}> {log.details}</span>
                                </div>
                            ))}
                            {logs.length === 0 && <div style={{ textAlign: 'center', padding: '5rem', color: '#334155' }}>NO RECENT SECURITY EVENTS LOGGED</div>}
                        </div>
                    </div>
                </div>
            )}


            {showModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="glass-card" style={{ width: '100%', maxWidth: '500px', background: 'white', margin: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ margin: 0 }}>{modalMode === 'CREATE' ? 'Provision Account' : 'Edit Privilege'}</h2>
                            <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
                        </div>
                        <form onSubmit={handleModalSubmit}>
                            <div className="form-group"><label>Full Name</label><input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required /></div>
                            <div className="form-group"><label>Email Address</label><input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required /></div>
                            {modalMode === 'CREATE' && <div className="form-group"><label>Security Password</label><input type="password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} required /></div>}
                            <div className="form-group">
                                <label>Clearance</label>
                                <select value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}>
                                    <option value="Employee">Employee</option><option value="Manager">Manager</option><option value="Admin">Admin</option>
                                </select>
                            </div>
                            <div className="form-group"><label>Department</label><input type="text" value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })} /></div>
                            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>{modalMode === 'CREATE' ? 'Provision' : 'Save Changes'}</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPanel;

