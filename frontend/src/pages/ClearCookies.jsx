import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const ClearCookies = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleClearAndLogout = async () => {
        // Clear all cookies
        document.cookie.split(";").forEach((c) => {
            document.cookie = c
                .replace(/^ +/, "")
                .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
        });

        await logout();
        navigate('/login');
    };

    return (
        <div className="max-w-md mx-auto mt-20 p-6 glass-card">
            <h2 className="text-2xl font-bold mb-4">Clear Session</h2>
            <p className="mb-4 text-zinc-400">
                If you're experiencing authentication issues, click below to clear all cookies and logout.
            </p>
            <button onClick={handleClearAndLogout} className="btn-primary w-full">
                Clear Cookies & Logout
            </button>
        </div>
    );
};

export default ClearCookies;
