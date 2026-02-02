import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import CreatePost from './pages/CreatePost';

const DashboardPlaceholder = () => {
  const { logout, user } = useAuth();
  return (
    <div className="glass-card text-center">
      <h1 className="text-3xl font-bold mb-4">Hello, {user?.name}!</h1>
      <p className="text-muted mb-8">Welcome to your dashboard. We're building something great here.</p>
      <button onClick={logout} className="btn-primary" style={{ background: '#ef4444' }}>
        Logout
      </button>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardPlaceholder />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-post"
            element={
              <ProtectedRoute>
                <CreatePost />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
