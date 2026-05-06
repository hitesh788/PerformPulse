import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import EmployeeDashboard from './pages/EmployeeDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import AdminPanel from './pages/AdminPanel';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import ForgotPassword from './pages/ForgotPassword';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Layout component to handle conditional UI elements
const AppLayout = ({ children }) => {
    const location = useLocation();
    const isAuthPage = ['/login', '/signup', '/forgot-password'].includes(location.pathname);
    const user = JSON.parse(localStorage.getItem('userInfo'));

    return (
        <div className="app-container">
            <ToastContainer position="top-right" autoClose={2000} />

            {/* Hide Navbar on Login/Signup for a clean enterprise look */}
            {!isAuthPage && <Navbar />}

            <main className={isAuthPage ? "auth-main" : "main-content"}>
                {children}
            </main>
        </div>
    );
};

function App() {
    const user = JSON.parse(localStorage.getItem('userInfo'));

    return (
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <AppLayout>
                <Routes>
                    <Route path="/" element={<Navigate to={user ? `/${user.role.toLowerCase()}` : '/login'} />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/admin" element={<ProtectedRoute><AdminPanel /></ProtectedRoute>} />
                    <Route path="/employee" element={<ProtectedRoute><EmployeeDashboard /></ProtectedRoute>} />
                    <Route path="/manager" element={<ProtectedRoute><ManagerDashboard /></ProtectedRoute>} />
                    <Route path="/analytics" element={<ProtectedRoute><AnalyticsDashboard /></ProtectedRoute>} />
                </Routes>
            </AppLayout>
        </Router>
    );
}

export default App;

