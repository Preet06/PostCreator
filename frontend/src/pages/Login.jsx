import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Mail, Lock, Loader2, AlertCircle } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid email or password');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-center w-full px-4"
        >
            <div className="glass-card w-full max-w-md">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold">Welcome Back</h2>
                    <p className="text-muted">Sign in to manage your posts</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label className="input-label">Email</label>
                        <div className="relative">
                            <input
                                type="email"
                                required
                                className="input-field"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="input-group">
                        <label className="input-label">Password</label>
                        <div className="relative">
                            <input
                                type="password"
                                required
                                className="input-field"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="error-message mb-4"
                        >
                            <AlertCircle size={16} />
                            {error}
                        </motion.div>
                    )}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="btn-primary"
                    >
                        {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : 'Sign In'}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-sm text-muted">
                        Don't have an account?{' '}
                        <Link to="/register" className="font-semibold text-blue-500 hover:text-blue-400">
                            Create Account
                        </Link>
                    </p>
                </div>
            </div>
        </motion.div>
    );
};

export default Login;
