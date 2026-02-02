import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Loader2, AlertCircle } from 'lucide-react';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            await register(name, email, password);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
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
                    <h2 className="text-2xl font-bold">Start Creating</h2>
                    <p className="text-muted">Join PostCreator today</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label className="input-label">Full Name</label>
                        <input
                            type="text"
                            required
                            className="input-field"
                            placeholder="John Doe"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    <div className="input-group">
                        <label className="input-label">Email</label>
                        <input
                            type="email"
                            required
                            className="input-field"
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div className="input-group">
                        <label className="input-label">Password</label>
                        <input
                            type="password"
                            required
                            className="input-field"
                            placeholder="Min. 8 characters"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
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
                        {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : 'Create Account'}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-sm text-muted">
                        Already have an account?{' '}
                        <Link to="/login" className="font-semibold text-blue-500 hover:text-blue-400">
                            Sign In
                        </Link>
                    </p>
                </div>
            </div>
        </motion.div>
    );
};

export default Register;
