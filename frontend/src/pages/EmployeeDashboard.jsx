import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { toast } from 'react-toastify';
import io from 'socket.io-client';


const EmployeeDashboard = () => {
    const user = JSON.parse(localStorage.getItem('userInfo'));
    const [kpis, setKpis] = useState([]);
    const [scores, setScores] = useState({ averageScore: 0, scores: [] });
    const [feedbacks, setFeedbacks] = useState([]);
    const [badges, setBadges] = useState([]);
    const [newKpi, setNewKpi] = useState({ title: '', description: '', target: '', category: 'Operational Excellence' });

    // Peer Review state
    const [peers, setPeers] = useState([]);
    const [peerReview, setPeerReview] = useState({ targetId: '', rating: 3, comment: '' });

    const categories = ['Innovation', 'Customer Success', 'Operational Excellence', 'Team Leadership'];

    const [leaderboard, setLeaderboard] = useState([]);

    useEffect(() => {
        fetchData();
        fetchPeers();

        // Real-time re-sync on notifications
        const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000');
        socket.emit('join', user._id);
        socket.on('newNotification', () => {
            fetchData(); // Refresh scores/feedbacks if a manager updates something
        });

        return () => socket.disconnect();
    }, []);

    const fetchLeaderboard = async () => {
        try {
            const res = await api.get('/score/leaderboard');
            setLeaderboard(res.data);
        } catch (error) {
            console.error('Error fetching leaderboard', error);
        }
    };


    const fetchPeers = async () => {
        try {
            const res = await api.get('/peer-review/peers');

            // If the database happens to have no other registered employees except this one, 
            // aggressively inject sophisticated enterprise dummy colleagues for portfolio presentation!
            if (res.data.length === 0) {
                setPeers([
                    { _id: 'mock1', name: 'Alexander Sterling', email: 'alex.s@enterprise.com', role: 'Employee' },
                    { _id: 'mock2', name: 'Sophia Chen', email: 'sophia.c@enterprise.com', role: 'Employee' },
                    { _id: 'mock3', name: 'Marcus Johnson', email: 'marcus.j@enterprise.com', role: 'Employee' },
                    { _id: 'mock4', name: 'Elena Rodriguez', email: 'elena.r@enterprise.com', role: 'Employee' }
                ]);
            } else {
                setPeers(res.data);
            }
        } catch (error) {
            console.error('Error fetching peers', error);
        }
    };

    const fetchData = async () => {
        try {
            fetchLeaderboard();
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

    const handlePeerReviewSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/peer-review', peerReview);
            setPeerReview({ targetId: '', rating: 3, comment: '' });
            toast.success("Anonymous Peer Review submitted securely!");
        } catch (error) {
            toast.error("Failed to submit peer review.");
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
            <div className="dashboard-header" style={{ marginBottom: '3rem', borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: 'var(--primary-color)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary-color)' }}></span>
                            Operational Active
                        </div>
                        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>Welcome back, {user.name}</h1>
                        <p className="subtitle" style={{ fontSize: '1.1rem' }}>Your performance trajectory is synchronized with <strong>{user.department || 'General'}</strong> objectives.</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <button onClick={() => window.print()} className="btn btn-primary" style={{ background: 'white', color: 'var(--primary-color)', border: '1.5px solid var(--primary-color)', fontWeight: 700 }}>
                            Generate Performance Report
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid-cards" style={{ gridTemplateColumns: '1fr 1fr 1fr', marginBottom: '3rem' }}>
                <div className="glass-card" style={{ background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)', borderTop: '4px solid var(--primary-color)' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '1rem' }}>Aggregate Score</div>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem' }}>
                        <span style={{ fontSize: '3.5rem', fontWeight: 900, color: 'var(--text-main)', lineHeight: 1 }}>{scores.averageScore}</span>
                        <span style={{ fontSize: '1.5rem', fontWeight: 600, color: '#94a3b8', paddingBottom: '0.4rem' }}> / 5.0</span>
                    </div>
                    <p style={{ marginTop: '1rem', fontSize: '0.85rem', color: '#64748b' }}>Computed from {scores.scores?.length || 0} verified KPI audits.</p>
                </div>

                <div className="glass-card" style={{ borderTop: '4px solid var(--secondary-color)' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '1rem' }}>Talent Recognition</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                        {badges.length > 0 ? badges.map((b, i) => (
                            <span key={i} style={{ padding: '0.4rem 0.8rem', background: 'rgba(37, 99, 235, 0.05)', border: `1px solid ${b.color}`, color: b.color, borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700 }}>
                                {b.title}
                            </span>
                        )) : <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Awaiting milestone recognition...</span>}
                    </div>
                    <p style={{ marginTop: '1rem', fontSize: '0.85rem', color: '#64748b' }}>Recognition based on behavioral excellence.</p>
                </div>

                <div className="glass-card" style={{ borderTop: '4px solid #10b981' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '1rem' }}>Execution Velocity</div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--text-main)', lineHeight: 1 }}>
                        {Math.round(radarData.reduce((acc, curr) => acc + curr.value, 0) / categories.length)}%
                    </div>
                    <div style={{ marginTop: '1.2rem', height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${Math.round(radarData.reduce((acc, curr) => acc + curr.value, 0) / categories.length)}%`, height: '100%', background: '#10b981' }}></div>
                    </div>
                    <p style={{ marginTop: '1rem', fontSize: '0.85rem', color: '#64748b' }}>Mean alignment across strategic pillars.</p>
                </div>
            </div>

            <div className="grid-cards" style={{ gridTemplateColumns: 'minmax(300px, 1fr) minmax(400px, 1.5fr) minmax(300px, 1fr)', gap: '2rem' }}>
                <div className="glass-card">
                    <h2 style={{ fontSize: '1.2rem', borderLeft: '3px solid var(--primary-color)', paddingLeft: '1rem' }}>Objective Alignment</h2>
                    <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.5rem', marginBottom: '1.5rem' }}>Define new performance vectors synchronized with team vision.</p>
                    <form onSubmit={handleCreateKpi}>
                        <div className="form-group"><label>KPI Title</label><input type="text" required value={newKpi.title} onChange={e => setNewKpi({ ...newKpi, title: e.target.value })} /></div>
                        <div className="form-group">
                            <label>Strategic Pillar</label>
                            <select value={newKpi.category} onChange={e => setNewKpi({ ...newKpi, category: e.target.value })}>
                                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>
                        <div className="form-group"><label>Target Metric</label><input type="number" required value={newKpi.target} onChange={e => setNewKpi({ ...newKpi, target: e.target.value })} /></div>
                        <button className="btn btn-primary" type="submit" style={{ width: '100%', marginTop: '1rem', fontWeight: 700 }}>Initiate Objective</button>
                    </form>
                </div>

                <div className="glass-card">
                    <h2 style={{ fontSize: '1.2rem', borderLeft: '3px solid var(--secondary-color)', paddingLeft: '1rem' }}>Competency Mapping</h2>
                    <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.5rem', marginBottom: '1rem' }}>Multidimensional distribution of your operational impact.</p>
                    <div style={{ height: 300, width: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                                <PolarGrid stroke="#e2e8f0" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                <Radar name="Alignment" dataKey="value" stroke="var(--primary-color)" fill="var(--primary-color)" fillOpacity={0.4} />
                                <Tooltip />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="glass-card">
                    <h2 style={{ fontSize: '1.2rem', borderLeft: '3px solid #10b981', paddingLeft: '1rem' }}>Elite Leaderboard</h2>
                    <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.5rem', marginBottom: '1.5rem' }}>Top organizational performers based on latest audit cycles.</p>
                    <div className="leaderboard-list">
                        {leaderboard.length > 0 ? leaderboard.map((entry, index) => (
                            <div key={index} style={{
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.8rem',
                                background: entry.name === user.name ? 'rgba(37, 99, 235, 0.05)' : 'white',
                                borderRadius: '12px', marginBottom: '0.5rem', border: entry.name === user.name ? '1px solid var(--primary-color)' : '1px solid #f1f5f9'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <span style={{ fontWeight: 800, color: index < 3 ? 'var(--secondary-color)' : '#cbd5e1', fontSize: '1.1rem' }}>#{index + 1}</span>
                                    <span style={{ fontWeight: entry.name === user.name ? 700 : 500, color: 'var(--text-main)' }}>{entry.name}</span>
                                </div>
                                <span style={{ fontWeight: 800, color: 'var(--primary-color)', fontSize: '1.1rem' }}>{entry.score}</span>
                            </div>
                        )) : <p style={{ textAlign: 'center', color: '#94a3b8', marginTop: '2rem', fontStyle: 'italic', fontSize: '0.9rem' }}>Synchronizing rankings...</p>}
                    </div>
                </div>
            </div>



            <div className="glass-card" style={{ padding: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <div>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.3rem' }}>Operational Progress Matrix</h2>
                        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Detailed breakdown of your current organizational commitments.</p>
                    </div>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th style={{ background: '#f8fafc', color: '#475569', fontWeight: 700 }}>Objective Title</th>
                            <th style={{ background: '#f8fafc', color: '#475569', fontWeight: 700 }}>Strategic Pillar</th>
                            <th style={{ background: '#f8fafc', color: '#475569', fontWeight: 700 }}>Target</th>
                            <th style={{ background: '#f8fafc', color: '#475569', fontWeight: 700 }}>Execution Path</th>
                            <th style={{ background: '#f8fafc', color: '#475569', fontWeight: 700 }}>Synchronize</th>
                        </tr>
                    </thead>
                    <tbody style={{ borderTop: 'none' }}>
                        {kpis.map(kpi => {
                            const progressPct = Math.min((kpi.progress / kpi.target) * 100, 100).toFixed(0);
                            return (
                                <tr key={kpi._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ fontWeight: 700, color: 'var(--text-main)' }}>{kpi.title}</td>
                                    <td><span className={`badge ${getBadgeClass(kpi.category)}`} style={{ textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: '0.5px' }}>{kpi.category}</span></td>
                                    <td style={{ fontWeight: 600 }}>{kpi.target}</td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ flex: 1, height: '10px', background: '#f1f5f9', borderRadius: '5px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                                                <div style={{ width: `${progressPct}%`, height: '100%', background: 'linear-gradient(90deg, var(--primary-color), var(--primary-hover))', borderRadius: '5px' }}></div>
                                            </div>
                                            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary-color)', minWidth: '40px' }}>{progressPct}%</span>
                                        </div>
                                    </td>
                                    <td>
                                        <input
                                            type="number"
                                            defaultValue={kpi.progress}
                                            onBlur={(e) => handleUpdateProgress(kpi._id, e.target.value)}
                                            style={{ width: '70px', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '8px', textAlign: 'center', fontWeight: 'bold' }}
                                        />
                                    </td>
                                </tr>
                            )
                        })}
                        {kpis.length === 0 && <tr><td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8', fontStyle: 'italic' }}>No active objectives found in current cycle.</td></tr>}
                    </tbody>
                </table>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '2rem' }}>
                <div className="glass-card" style={{ marginBottom: 0 }}>
                    <h2 style={{ fontSize: '1.4rem' }}>Managerial Synthesis</h2>
                    <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.5rem' }}>Direct qualitative feedback from your leadership chain.</p>
                    {feedbacks.length === 0 ? (
                        <div style={{ padding: '2rem', textAlign: 'center', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                            <p style={{ color: '#94a3b8' }}>Awaiting executive synthesis for this period.</p>
                        </div>
                    ) : feedbacks.map(fb => (
                        <div key={fb._id} style={{ padding: '1.5rem', background: 'white', borderRadius: '16px', border: '1px solid #f1f5f9', boxShadow: '0 4px 12px rgba(0,0,0,0.02)', marginTop: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <div>
                                    <h4 style={{ color: 'var(--text-main)', marginBottom: '0.2rem' }}>{fb.managerId?.name}</h4>
                                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Management Review</span>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--primary-color)' }}>{fb.rating}<small style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>/5</small></div>
                                </div>
                            </div>
                            <p style={{ color: '#475569', lineHeight: 1.7, fontSize: '0.95rem', background: '#f8fafc', padding: '1rem', borderRadius: '12px' }}>{fb.feedback}</p>
                        </div>
                    ))}
                </div>

                <div className="glass-card" style={{ marginBottom: 0 }}>
                    <h2 style={{ fontSize: '1.4rem' }}>Peer Perspective</h2>
                    <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.5rem' }}>Contribute to a high-trust culture through constructive peer assessments.</p>
                    <form onSubmit={handlePeerReviewSubmit} style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                            <div className="form-group">
                                <label style={{ fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', color: '#64748b' }}>Select Target Colleague</label>
                                <select required value={peerReview.targetId} onChange={e => setPeerReview({ ...peerReview, targetId: e.target.value })} style={{ borderRadius: '10px' }}>
                                    <option value="" disabled>-- Select Identity --</option>
                                    {peers.map(p => <option key={p._id} value={p._id}>{p.name} ({p.department || 'Corporate'})</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label style={{ fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', color: '#64748b' }}>Rating</label>
                                <input type="number" min="1" max="5" required value={peerReview.rating} onChange={e => setPeerReview({ ...peerReview, rating: parseInt(e.target.value) })} style={{ borderRadius: '10px' }} />
                            </div>
                        </div>
                        <div className="form-group">
                            <label style={{ fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', color: '#64748b' }}>Constructive Synthesis</label>
                            <textarea rows="3" required value={peerReview.comment} onChange={e => setPeerReview({ ...peerReview, comment: e.target.value })} style={{ borderRadius: '12px' }} placeholder="Provide specific examples of technical or behavioral excellence..."></textarea>
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem', fontWeight: 800 }}>Dispatch Secure Assessment</button>
                    </form>
                </div>
            </div>

        </div>
    );
};

export default EmployeeDashboard;
