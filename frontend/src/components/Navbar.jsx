import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/" className="navbar-logo">
                    Post<span>Creator</span>
                </Link>
                <div className="navbar-links">
                    <Link to="/" className="nav-link">Dashboard</Link>
                    <Link to="/create-post" className="nav-link">Create Post</Link>
                    <Link to="/posts" className="nav-link">Posts</Link>
                    <Link to="/calendar" className="nav-link">Calendar</Link>
                    <div className="user-profile">
                        <span className="user-name">{user?.name}</span>
                        <button onClick={handleLogout} className="btn-logout">
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
