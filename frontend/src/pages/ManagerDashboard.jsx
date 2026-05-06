import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { toast } from 'react-toastify';

const ManagerDashboard = () => {
    const user = JSON.parse(localStorage.getItem('userInfo'));
    const [employees, setEmployees] = useState([]);
    const [selectedEmp, setSelectedEmp] = useState(null);
    const [kpis, setKpis] = useState([]);
    const [feedback, setFeedback] = useState({ feedbackText: '', rating: 3, potentialRating: 2, performanceRating: 2 });
    const [kpiScores, setKpiScores] = useState({});
    const [existingFeedback, setExistingFeedback] = useState(null);
    const [isDrafting, setIsDrafting] = useState(false);
    const [broadcastMsg, setBroadcastMsg] = useState('');
    const [isBroadcasting, setIsBroadcasting] = useState(false);

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            const res = await api.get('/auth/users');
            const team = res.data.filter(u => u.managerId === user._id || u.role === 'Employee');
            setEmployees(team);
        } catch (error) {
            console.error(error);
        }
    };

    const handleBroadcast = async (e) => {
        e.preventDefault();
        if (!broadcastMsg.trim()) return;
        setIsBroadcasting(true);
        try {
            await api.post('/notification/broadcast', { message: broadcastMsg });
            toast.success('Broadcast sent to all employees!');
            setBroadcastMsg('');
        } catch (error) {
            toast.error('Failed to send broadcast');
        } finally {
            setIsBroadcasting(false);
        }
    };

    const handleSelectEmployee = async (emp) => {
        setSelectedEmp(emp);
        try {
            const res = await api.get(`/kpi/${emp._id}`);
            setKpis(res.data);
            const fbRes = await api.get(`/evaluation/feedback/${emp._id}`);
            if (fbRes.data && fbRes.data.length > 0) {
                const fb = fbRes.data[fbRes.data.length - 1]; // get latest
                setExistingFeedback(fb);
                setFeedback({
                    feedbackText: fb.feedback,
                    rating: fb.rating,
                    potentialRating: fb.potentialRating || 2,
                    performanceRating: fb.performanceRating || 2
                });
            } else {
                setExistingFeedback(null);
                setFeedback({ feedbackText: '', rating: 3, potentialRating: 2, performanceRating: 2 });
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleScoreChange = (kpiId, val) => {
        setKpiScores({ ...kpiScores, [kpiId]: val });
    };

    const submitKpiScore = async (kpiId) => {
        try {
            await api.post('/evaluation/score', {
                employeeId: selectedEmp._id,
                kpiId,
                value: Number(kpiScores[kpiId])
            });
            toast.success('Score synchronized successfully');
        } catch (error) {
            toast.error('Error updating score');
        }
    };

    const submitFeedback = async (e) => {
        e.preventDefault();
        try {
            await api.post('/evaluation/feedback', {
                employeeId: selectedEmp._id,
                feedback: feedback.feedbackText,
                rating: feedback.rating,
                potentialRating: feedback.potentialRating,
                performanceRating: feedback.performanceRating
            });
            toast.success('Enterprise Evaluation submitted successfully!');
        } catch (error) {
            toast.error('Error submitting evaluation');
        }
    };

    const generateAIDraft = () => {
        setIsDrafting(true);
        toast.info("Synthesizing multi-dimensional performance data...");
        setTimeout(() => {
            const completedCount = kpis.filter(k => k.progress >= k.target && k.target > 0).length;
            const completionRatio = kpis.length > 0 ? (completedCount / kpis.length) : 0;

            let sentiment = "exceeds organizational expectations";
            if (completionRatio < 0.5) sentiment = "shows potential but requires tactical realignment";
            else if (completionRatio < 0.8) sentiment = "maintains steady operational throughput";

            const text = `Executive Summary: ${selectedEmp.name} ${sentiment} across the current appraisal window. Analysis of ${kpis.length} core KPI benchmarks indicates a ${(completionRatio * 100).toFixed(0)}% absolute target achievement rate. 

Key Strengths: Demonstrates high-integrity execution and consistent alignment with ${selectedEmp.department || 'departmental'} strategic pillars. 

Strategic Vector: To optimize future high-impact contributions, I recommend focusing on scaling cross-functional leadership and accelerating innovation within their core service ownership areas.`;

            setFeedback(prev => ({ ...prev, feedbackText: text }));
            setIsDrafting(false);
            toast.success("AI Synthesis complete.");
        }, 1500);
    };


    const isCellActive = (perf, pot) => {
        return feedback.performanceRating === perf && feedback.potentialRating === pot;
    };

    const boxLabels = [
        { perf: 1, pot: 3, label: "Enigma" }, { perf: 2, pot: 3, label: "Growth Employee" }, { perf: 3, pot: 3, label: "Future Leader" },
        { perf: 1, pot: 2, label: "Dilemma" }, { perf: 2, pot: 2, label: "Core Employee" }, { perf: 3, pot: 2, label: "High Impact" },
        { perf: 1, pot: 1, label: "Underperformer" }, { perf: 2, pot: 1, label: "Effective" }, { perf: 3, pot: 1, label: "Trusted Pro" }
    ];

    return (
        <div>
            <div className="dashboard-header" style={{ marginBottom: '3rem', borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: 'var(--primary-color)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary-color)' }}></span>
                            Leadership Command Active
                        </div>
                        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>Talent & Performance Management</h1>
                        <p className="subtitle" style={{ fontSize: '1.1rem' }}>Oversee team execution metrics and orchestrate enterprise growth.</p>
                    </div>
                </div>
            </div>

            <div className="grid-cards" style={{ gridTemplateColumns: '1fr 1fr 1.5fr', marginBottom: '2.5rem' }}>
                <div className="glass-card" style={{ borderTop: '4px solid var(--primary-color)' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '1rem' }}>Team Strength</div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--text-main)', lineHeight: 1 }}>{employees.length}</div>
                    <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#64748b' }}>Direct corporate reports</p>
                </div>
                <div className="glass-card" style={{ borderTop: '4px solid var(--secondary-color)' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '1rem' }}>Operational Status</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--secondary-color)', lineHeight: 1 }}>SYNCHRONIZED</div>
                    <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#64748b' }}>All KPI cycles updated</p>
                </div>
                <div className="glass-card" style={{ borderLeft: '4px solid var(--primary-color)', background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                        <div>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Organization Broadcast</h3>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Send a priority notification company-wide.</p>
                        </div>
                    </div>
                    <form onSubmit={handleBroadcast}>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <input
                                type="text"
                                value={broadcastMsg}
                                onChange={(e) => setBroadcastMsg(e.target.value)}
                                placeholder="State your announcement..."
                                style={{
                                    flex: 1, padding: '0.8rem', borderRadius: '10px',
                                    border: '1px solid #e2e8f0', outline: 'none', background: 'white'
                                }}
                                required
                            />
                            <button
                                type="submit"
                                className={`btn btn-primary ${isBroadcasting ? 'loading' : ''}`}
                                disabled={isBroadcasting}
                                style={{ whiteSpace: 'nowrap' }}
                            >
                                {isBroadcasting ? 'Sending...' : 'Transmit'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>


            <div className="grid-cards" style={{ gridTemplateColumns: 'minmax(320px, 1fr) minmax(600px, 2.5fr)', gap: '2rem' }}>
                <div className="glass-card" style={{ padding: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.3rem', marginBottom: '1.5rem', borderLeft: '4px solid var(--primary-color)', paddingLeft: '1rem' }}>Registry Inventory</h2>
                    <div style={{ maxHeight: 'calc(100vh - 400px)', overflowY: 'auto', paddingRight: '0.5rem' }}>
                        {employees.map(emp => (
                            <div
                                key={emp._id}
                                style={{
                                    padding: '1.2rem',
                                    cursor: 'pointer',
                                    borderRadius: '16px',
                                    marginBottom: '0.8rem',
                                    background: selectedEmp?._id === emp._id ? 'var(--primary-color)' : 'white',
                                    color: selectedEmp?._id === emp._id ? 'white' : 'var(--text-main)',
                                    boxShadow: selectedEmp?._id === emp._id ? '0 10px 20px var(--primary-glow)' : '0 2px 8px rgba(0,0,0,0.03)',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    border: '1px solid #f1f5f9',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1rem'
                                }}
                                onClick={() => handleSelectEmployee(emp)}
                            >
                                <div style={{
                                    width: '40px', height: '40px', borderRadius: '12px',
                                    background: selectedEmp?._id === emp._id ? 'rgba(255,255,255,0.2)' : 'rgba(99, 102, 241, 0.1)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.9rem'
                                }}>
                                    {emp.name[0]}
                                </div>
                                <div>
                                    <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>{emp.name}</div>
                                    <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>{emp.department || 'Corporate'} Office</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {selectedEmp ? (
                    <div className="animate-slide-up">
                        <div className="glass-card" style={{ padding: '2rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                                <div>
                                    <h2 style={{ fontSize: '1.5rem', marginBottom: '0.3rem' }}>Metric Audit: {selectedEmp.name}</h2>
                                    <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Verify and synchronize specific KPI achievements for this cycle.</p>
                                </div>
                                <span className="badge badge-operational" style={{ padding: '0.5rem 1rem' }}>Active Review Cycle</span>
                            </div>
                            <div style={{ overflowX: 'auto' }}>
                                <table>
                                    <thead>
                                        <tr>
                                            <th style={{ background: '#f8fafc', color: '#475569' }}>KPI Focus</th>
                                            <th style={{ background: '#f8fafc', color: '#475569' }}>Stratagem</th>
                                            <th style={{ background: '#f8fafc', color: '#475569' }}>Target</th>
                                            <th style={{ background: '#f8fafc', color: '#475569' }}>Achievement</th>
                                            <th style={{ background: '#f8fafc', color: '#475569' }}>Audit (1-5)</th>
                                            <th style={{ background: '#f8fafc' }}></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {kpis.map(kpi => (
                                            <tr key={kpi._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                <td style={{ fontWeight: 700 }}>{kpi.title}</td>
                                                <td><span className="badge badge-operational" style={{ fontSize: '0.65rem' }}>{kpi.category}</span></td>
                                                <td style={{ fontWeight: 600 }}>{kpi.target}</td>
                                                <td style={{ fontWeight: 800, color: 'var(--primary-color)' }}>{kpi.progress}</td>
                                                <td>
                                                    <input
                                                        type="number" min="1" max="5"
                                                        value={kpiScores[kpi._id] || ''}
                                                        onChange={(e) => handleScoreChange(kpi._id, e.target.value)}
                                                        style={{ width: '64px', padding: '0.6rem', border: '1px solid #e2e8f0', borderRadius: '8px', textAlign: 'center', fontWeight: 'bold' }}
                                                    />
                                                </td>
                                                <td style={{ textAlign: 'right' }}>
                                                    <button className="btn btn-primary" onClick={() => submitKpiScore(kpi._id)} style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>Commit Audit</button>
                                                </td>
                                            </tr>
                                        ))}
                                        {kpis.length === 0 && <tr><td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>Awaiting KPI initiation from employee.</td></tr>}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="glass-card" style={{ padding: '2.5rem' }}>
                            <h2 style={{ fontSize: '1.5rem', marginBottom: '2rem', borderLeft: '4px solid var(--secondary-color)', paddingLeft: '1.5rem' }}>Strategic Talent Mapping</h2>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
                                <div className="nine-box-container" style={{ margin: 0, maxWidth: '100%' }}>
                                    <div className="nine-box-y-axis" style={{ fontSize: '0.7rem' }}>POTENTIAL &rarr;</div>
                                    <div className="nine-box-grid" style={{ height: '350px' }}>
                                        {boxLabels.map(cell => (
                                            <div
                                                key={`${cell.perf}-${cell.pot}`}
                                                className={`nine-box-cell ${isCellActive(cell.perf, cell.pot) ? 'active' : ''}`}
                                                onClick={() => setFeedback({ ...feedback, performanceRating: cell.perf, potentialRating: cell.pot })}
                                                style={{ cursor: 'pointer', padding: '0.5rem', fontSize: '0.75rem' }}
                                            >
                                                {cell.label}
                                            </div>
                                        ))}
                                    </div>
                                    <div></div>
                                    <div className="nine-box-x-axis" style={{ fontSize: '0.7rem' }}>PERFORMANCE &rarr;</div>
                                </div>

                                <div>
                                    <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--text-main)' }}>Qualitative Synthesis</h3>
                                    <form onSubmit={submitFeedback}>
                                        <div className="form-group">
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                                <label style={{ margin: 0 }}>Executive Assessment</label>
                                                <button
                                                    type="button"
                                                    onClick={generateAIDraft}
                                                    className="btn"
                                                    style={{ padding: '0.3rem 0.8rem', fontSize: '0.75rem', background: '#eff6ff', color: 'var(--primary-color)', border: '1px solid #dbeafe', fontWeight: 700 }}
                                                    disabled={isDrafting}
                                                >
                                                    {isDrafting ? 'Processing Data...' : '✨ AI Objective Draft'}
                                                </button>
                                            </div>
                                            <textarea
                                                rows="5"
                                                value={feedback.feedbackText}
                                                onChange={e => setFeedback({ ...feedback, feedbackText: e.target.value })}
                                                style={{ borderRadius: '14px', background: '#f8fafc', fontSize: '0.9rem', lineHeight: 1.6 }}
                                                required
                                            />
                                        </div>
                                        <div className="form-group" style={{ maxWidth: '180px' }}>
                                            <label>Overall Vector Rating</label>
                                            <input
                                                type="number" min="1" max="5" required
                                                value={feedback.rating === undefined || Number.isNaN(feedback.rating) ? '' : feedback.rating}
                                                onChange={e => setFeedback({ ...feedback, rating: e.target.value ? parseInt(e.target.value) : '' })}
                                                style={{ fontWeight: 800, textAlign: 'center', fontSize: '1.2rem', padding: '0.8rem' }}
                                            />
                                        </div>
                                        <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1.2rem', fontSize: '1.1rem', fontWeight: 800 }}>Dispatch Comprehensive Evaluation</button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', background: 'rgba(255,255,255,0.3)', border: '2px dashed #cbd5e1' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔭</div>
                        <h3 style={{ fontWeight: 600 }}>Awaiting Profile Selection</h3>
                        <p style={{ fontSize: '0.9rem' }}>Select a corporate identity from the registry to begin assessment.</p>
                    </div>
                )}
            </div>

        </div>
    );
};

export default ManagerDashboard;
