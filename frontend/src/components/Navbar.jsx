import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, LogOut, Menu } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="navbar animate-slideInRight">
            <div className="navbar-container">
                <Link to="/" className="navbar-logo hover-glow">
                    Post<span>Creator</span>
                </Link>
                <div className="navbar-links">
                    <Link to="/" className="nav-link hover-lift">Dashboard</Link>
                    <Link to="/create-post" className="nav-link hover-lift">Create Post</Link>
                    <Link to="/posts" className="nav-link hover-lift">Posts</Link>
                    <Link to="/calendar" className="nav-link hover-lift">Calendar</Link>
                    <div className="user-profile glass-card-elevated">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500/20 rounded-lg animate-pulse">
                                <User className="text-blue-400" size={16} />
                            </div>
                            <span className="user-name font-medium">{user?.name}</span>
                        </div>
                        <button onClick={handleLogout} className="btn-logout hover-glow">
                            <LogOut size={14} />
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
