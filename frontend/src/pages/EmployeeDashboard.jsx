import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { toast } from 'react-toastify';

const EmployeeDashboard = () => {
    const user = JSON.parse(localStorage.getItem('userInfo'));
    const [kpis, setKpis] = useState([]);
    const [scores, setScores] = useState({ averageScore: 0, scores: [] });
    const [feedbacks, setFeedbacks] = useState([]);
    const [badges, setBadges] = useState([]);
    const [newKpi, setNewKpi] = useState({ title: '', description: '', target: '', category: 'Operational Excellence' });

    const categories = ['Innovation', 'Customer Success', 'Operational Excellence', 'Team Leadership'];

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [kpiRes, scoreRes, feedbackRes] = await Promise.all([
                api.get('/kpi'),
                api.get(`/score/${user._id}`),
                api.get(`/evaluation/feedback/${user._id}`)
            ]);
            setKpis(kpiRes.data);
            setScores(scoreRes.data);
            setFeedbacks(feedbackRes.data);

            const earnedBadges = [];
            const avgScoreNumber = parseFloat(scoreRes.data.averageScore || 0);

            if (avgScoreNumber >= 4.0) earnedBadges.push({ title: 'Top Performer 🏆', color: 'var(--secondary-color)' });

            const kpiDocs = kpiRes.data;
            const completedKpis = kpiDocs.filter(k => k.target > 0 && k.progress >= k.target);
            if (completedKpis.length >= 3) earnedBadges.push({ title: 'Execution Master 🎯', color: 'var(--primary-color)' });

            if (kpiDocs.some(k => k.category === 'Innovation' && k.target > 0 && k.progress >= k.target)) {
                earnedBadges.push({ title: 'Innovator 💡', color: '#f59e0b' });
            }

            setBadges(earnedBadges);
        } catch (error) {
            console.error(error);
        }
    };

    const handleCreateKpi = async (e) => {
        e.preventDefault();
        try {
            await api.post('/kpi', newKpi);
            setNewKpi({ title: '', description: '', target: '', category: 'Operational Excellence' });
            fetchData();
            toast.success('KPI Corporate Objective Aligned!');
        } catch (error) {
            toast.error('Error aligning objective');
            console.error(error);
        }
    };

    const handleUpdateProgress = async (id, progress) => {
        try {
            await api.put(`/progress/${id}`, { progress: parseInt(progress) });
            fetchData();
            toast.success('Status Update Synchronized');
        } catch (error) {
            toast.error('Update failed');
            console.error(error);
        }
    };

    const getBadgeClass = (category) => {
        switch (category) {
            case 'Innovation': return 'badge-innovation';
            case 'Customer Success': return 'badge-customer';
            case 'Team Leadership': return 'badge-leadership';
            default: return 'badge-operational';
        }
    };

    // Process data for radar chart (Multi-dimensional view based on category)
    const radarData = categories.map(cat => {
        const catKpis = kpis.filter(k => k.category === cat);
        if (catKpis.length === 0) return { subject: cat, value: 0 };
        const avgProgress = catKpis.reduce((acc, curr) => acc + (curr.progress / curr.target) * 100, 0) / catKpis.length;
        return { subject: cat, value: Math.min(avgProgress, 100) };
    });

    return (
        <div>
            <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h1 style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        Employee Dashboard
                        <button onClick={() => window.print()} className="btn btn-primary" style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem', borderRadius: '8px' }}>
                            📄 Export PDF
                        </button>
                    </h1>
                    <div className="subtitle">Welcome back, {user.name}. Here is your performance alignment.</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                        {badges.map((b, i) => (
                            <span key={i} style={{ padding: '0.3rem 0.6rem', background: 'rgba(255,255,255,0.8)', border: `1.5px solid ${b.color}`, color: b.color, borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700 }}>
                                {b.title}
                            </span>
                        ))}
                    </div>
                    <div style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Overall Score</div>
                    <div style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--primary-color)', lineHeight: 1 }}>{scores.averageScore}<span style={{ fontSize: '1.5rem', color: '#cbd5e1' }}>/5</span></div>
                </div>
            </div>

            <div className="grid-cards">
                <div className="glass-card">
                    <h2>Create Goal (KPI)</h2>
                    <form onSubmit={handleCreateKpi} style={{ marginTop: '1.5rem' }}>
                        <div className="form-group">
                            <label>KPI Title</label>
                            <input type="text" required value={newKpi.title} onChange={e => setNewKpi({ ...newKpi, title: e.target.value })} placeholder="e.g. Increase user retention" />
                        </div>
                        <div className="form-group">
                            <label>Alignment Category</label>
                            <select value={newKpi.category} onChange={e => setNewKpi({ ...newKpi, category: e.target.value })}>
                                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>
                        <div className="form-group" style={{ display: 'flex', gap: '1rem' }}>
                            <div style={{ flex: 1 }}>
                                <label>Target Value</label>
                                <input type="number" required value={newKpi.target} onChange={e => setNewKpi({ ...newKpi, target: e.target.value })} />
                            </div>
                        </div>
                        <button className="btn btn-primary" type="submit" style={{ width: '100%' }}>Create KPI</button>
                    </form>
                </div>

                <div className="glass-card" style={{ gridColumn: 'span 2' }}>
                    <h2>Competency Radar</h2>
                    <div style={{ height: 350, marginTop: '1rem', width: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                                <PolarGrid stroke="#e2e8f0" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                <Radar name="Completion %" dataKey="value" stroke="var(--primary-color)" fill="var(--primary-color)" fillOpacity={0.5} />
                                <Tooltip />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="glass-card">
                <h2>My KPIs & Progress</h2>
                <table>
                    <thead>
                        <tr>
                            <th>KPI Title</th>
                            <th>Category</th>
                            <th>Target</th>
                            <th>Progress</th>
                            <th>Status Update</th>
                        </tr>
                    </thead>
                    <tbody>
                        {kpis.map(kpi => {
                            const progressPct = Math.min((kpi.progress / kpi.target) * 100, 100).toFixed(0);
                            return (
                                <tr key={kpi._id}>
                                    <td style={{ fontWeight: 600 }}>{kpi.title}</td>
                                    <td><span className={`badge ${getBadgeClass(kpi.category)}`}>{kpi.category}</span></td>
                                    <td>{kpi.target}</td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{ width: '100px', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                                                <div style={{ width: `${progressPct}%`, height: '100%', background: 'var(--primary-color)' }}></div>
                                            </div>
                                            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>{progressPct}%</span>
                                        </div>
                                    </td>
                                    <td>
                                        <input
                                            type="number"
                                            defaultValue={kpi.progress}
                                            onBlur={(e) => handleUpdateProgress(kpi._id, e.target.value)}
                                            style={{ width: '80px', padding: '0.4rem', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                                        />
                                    </td>
                                </tr>
                            )
                        })}
                        {kpis.length === 0 && <tr><td colSpan="5" style={{ textAlign: 'center', color: '#94a3b8' }}>No KPIs defined yet.</td></tr>}
                    </tbody>
                </table>
            </div>

            <div className="glass-card">
                <h2>Managerial Review & Insights</h2>
                {feedbacks.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>Awaiting structural performance review from your management chain.</p> : feedbacks.map(fb => (
                    <div key={fb._id} style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.5)', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.05)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <h4 style={{ color: 'var(--primary-color)' }}>Reviewed by {fb.managerId?.name}</h4>
                            <span style={{ fontWeight: 700, fontSize: '1.2rem' }}>Q-Review Score: {fb.rating}/5</span>
                        </div>
                        <p style={{ fontStyle: 'italic', color: '#475569', lineHeight: 1.8 }}>"{fb.feedback}"</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default EmployeeDashboard;
