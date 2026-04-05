import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Signup from './pages/Signup';
import EmployeeDashboard from './pages/EmployeeDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import AdminPanel from './pages/AdminPanel';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
    const user = JSON.parse(localStorage.getItem('userInfo'));

    return (
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <div className="app-container">
                <ToastContainer position="top-right" autoClose={2000} />
                <Navbar />
                <main className="main-content">
                    <Routes>
                        <Route path="/" element={<Navigate to={user ? `/${user.role.toLowerCase()}` : '/login'} />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/signup" element={<Signup />} />
                        <Route path="/employee" element={<EmployeeDashboard />} />
                        <Route path="/manager" element={<ManagerDashboard />} />
                        <Route path="/admin" element={<AdminPanel />} />
                        <Route path="/analytics" element={<AnalyticsDashboard />} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

export default App;
