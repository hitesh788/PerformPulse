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
            <div className="dashboard-header">
                <h1>Talent & Performance Management</h1>
                <div className="subtitle">Oversee team KPIs and map enterprise talent.</div>
            </div>

            <div className="grid-cards" style={{ gridTemplateColumns: 'minmax(300px, 1fr) minmax(600px, 2fr)' }}>
                <div className="glass-card">
                    <h2>Direct Reports</h2>
                    <ul style={{ listStyleType: 'none', padding: 0, marginTop: '1.5rem' }}>
                        {employees.map(emp => (
                            <li
                                key={emp._id}
                                style={{
                                    padding: '1rem',
                                    cursor: 'pointer',
                                    borderRadius: '12px',
                                    marginBottom: '0.5rem',
                                    background: selectedEmp?._id === emp._id ? 'var(--primary-color)' : 'white',
                                    color: selectedEmp?._id === emp._id ? 'white' : 'var(--text-main)',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                                    transition: 'all 0.2s ease',
                                    fontWeight: 600
                                }}
                                onClick={() => handleSelectEmployee(emp)}
                            >
                                {emp.name} <br />
                                <span style={{ fontSize: '0.8rem', fontWeight: 400, opacity: 0.8 }}>{emp.email}</span>
                            </li>
                        ))}
                        {employees.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No direct reports assigned.</p>}
                    </ul>
                </div>

                {selectedEmp ? (
                    <div>
                        <div className="glass-card">
                            <h2>KPI Assessment: {selectedEmp.name}</h2>
                            <div style={{ marginTop: '1.5rem', overflowX: 'auto' }}>
                                <table>
                                    <thead>
                                        <tr>
                                            <th>KPI Title</th>
                                            <th>Category</th>
                                            <th>Target</th>
                                            <th>Progress</th>
                                            <th>Audit Score (1-5)</th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {kpis.map(kpi => (
                                            <tr key={kpi._id}>
                                                <td style={{ fontWeight: 500 }}>{kpi.title}</td>
                                                <td><span className="badge badge-operational">{kpi.category}</span></td>
                                                <td>{kpi.target}</td>
                                                <td>{kpi.progress}</td>
                                                <td>
                                                    <input
                                                        type="number" min="1" max="5"
                                                        value={kpiScores[kpi._id] || ''}
                                                        placeholder="-"
                                                        onChange={(e) => handleScoreChange(kpi._id, e.target.value)}
                                                        style={{ width: '60px', padding: '0.4rem', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                                                    />
                                                </td>
                                                <td>
                                                    <button className="btn btn-primary" onClick={() => submitKpiScore(kpi._id)} style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>Commit</button>
                                                </td>
                                            </tr>
                                        ))}
                                        {kpis.length === 0 && <tr><td colSpan="6" style={{ textAlign: 'center' }}>No KPIs defined by employee.</td></tr>}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="glass-card">
                            <h2>Enterprise 9-Box Talent Mapping</h2>
                            <div className="nine-box-container">
                                <div className="nine-box-y-axis">POTENTIAL (LOW &rarr; HIGH)</div>
                                <div className="nine-box-grid">
                                    {boxLabels.map(cell => (
                                        <div
                                            key={`${cell.perf}-${cell.pot}`}
                                            className={`nine-box-cell ${isCellActive(cell.perf, cell.pot) ? 'active' : ''}`}
                                            onClick={() => setFeedback({ ...feedback, performanceRating: cell.perf, potentialRating: cell.pot })}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            {cell.label}
                                        </div>
                                    ))}
                                </div>
                                <div></div>
                                <div className="nine-box-x-axis">PERFORMANCE (LOW &rarr; HIGH)</div>
                            </div>

                            <form onSubmit={submitFeedback} style={{ marginTop: '2rem' }}>
                                <div className="form-group">
                                    <label>Comprehensive Qualitative Feedback</label>
                                    <textarea
                                        rows="4"
                                        value={feedback.feedbackText}
                                        onChange={e => setFeedback({ ...feedback, feedbackText: e.target.value })}
                                        placeholder="Provide detailed insights regarding achievements, leadership qualities, and areas of growth..."
                                        required
                                    />
                                </div>
                                <div className="form-group" style={{ width: '200px' }}>
                                    <label>Overall Rating (1-5)</label>
                                    <input
                                        type="number" min="1" max="5" required
                                        value={feedback.rating === undefined || Number.isNaN(feedback.rating) ? '' : feedback.rating}
                                        onChange={e => setFeedback({ ...feedback, rating: e.target.value ? parseInt(e.target.value) : '' })}
                                    />
                                </div>
                                <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}>Finalize Cycle Evaluation</button>
                            </form>
                        </div>
                    </div>
                ) : (
                    <div className="glass-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                        <h3>Select a team member to manage evaluation</h3>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManagerDashboard;
