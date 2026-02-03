import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Save, Loader2, AlertCircle, Calendar, ArrowLeft, Trash2 } from 'lucide-react';
import API from '../api/axios';
import Scheduler from '../components/Scheduler';
import ConfirmModal from '../components/ConfirmModal';

const EditPost = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [content, setContent] = useState('');
    const [scheduledAt, setScheduledAt] = useState(null);
    const [status, setStatus] = useState('draft');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showScheduler, setShowScheduler] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [error, setError] = useState('');

    const MAX_CHARS = 280;

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const allPostsRes = await API.get('/posts');
                const post = allPostsRes.data.data.find(p => p._id === id);

                if (post) {
                    setContent(post.content);
                    setScheduledAt(post.scheduledAt);
                    setStatus(post.status);
                } else {
                    setError('Post not found');
                }
            } catch (err) {
                setError('Failed to fetch post details');
            } finally {
                setLoading(false);
            }
        };
        fetchPost();
    }, [id]);

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        try {
            await API.put(`/posts/${id}`, {
                content,
                status,
                scheduledAt
            });
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update post');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        try {
            await API.delete(`/posts/${id}`);
            navigate('/');
        } catch (err) {
            setError('Failed to delete post');
        }
    };

    const handleSchedule = (isoDate) => {
        setScheduledAt(isoDate);
        setStatus('scheduled');
        setShowScheduler(false);
    };

    if (loading) return (
        <div className="flex-center" style={{ minHeight: '60vh' }}>
            <Loader2 className="animate-spin text-blue-500" size={40} />
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto p-4 pb-20 mt-20">
            <button onClick={() => navigate(-1)} className="nav-link flex items-center gap-2 mb-6">
                <ArrowLeft size={18} /> Back to Dashboard
            </button>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card mb-8"
            >
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2 text-blue-500">
                        <Save size={24} />
                        <h1 className="text-2xl font-bold text-white">Edit Post</h1>
                    </div>
                    <button
                        onClick={() => setShowDeleteModal(true)}
                        className="p-2 hover:bg-red-600/20 text-red-400 rounded-lg transition-colors"
                        title="Delete Post"
                    >
                        <Trash2 size={20} />
                    </button>
                </div>

                <form onSubmit={handleSave}>
                    <div className="input-group">
                        <label className="input-label font-medium">Content</label>
                        <textarea
                            className="input-field min-h-[150px] resize-none"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            maxLength={MAX_CHARS}
                        />
                        <div className={`text-right text-sm mt-2 font-mono ${content.length > MAX_CHARS ? 'text-red-500' : 'text-zinc-500'}`}>
                            {content.length} / {MAX_CHARS}
                        </div>
                    </div>

                    {scheduledAt && (
                        <div className="mb-6 p-4 bg-blue-500/10 rounded-xl border border-blue-500/20 flex justify-between items-center">
                            <div>
                                <span className="text-sm text-zinc-400 block">Scheduled for:</span>
                                <span className="font-semibold">{new Date(scheduledAt).toLocaleString()}</span>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowScheduler(true)}
                                className="text-sm text-blue-500 underline"
                            >
                                Change
                            </button>
                        </div>
                    )}

                    {error && (
                        <div className="error-message mb-4">
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}

                    <div className="flex gap-4">
                        <button
                            type="submit"
                            className="btn-primary flex-1"
                            disabled={saving || !content.trim()}
                        >
                            {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                            Update Post
                        </button>
                        {!scheduledAt && (
                            <button
                                type="button"
                                onClick={() => setShowScheduler(true)}
                                className="btn-secondary flex-1 flex items-center justify-center gap-2"
                                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--surface-border)' }}
                            >
                                <Calendar size={20} />
                                Schedule
                            </button>
                        )}
                    </div>
                </form>
            </motion.div>

            {showScheduler && (
                <div className="fixed inset-0 z-50 flex-center bg-black/60 backdrop-blur-sm p-4">
                    <Scheduler
                        onSchedule={handleSchedule}
                        onCancel={() => setShowScheduler(false)}
                        initialDate={scheduledAt}
                    />
                </div>
            )}

            <ConfirmModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDelete}
                title="Delete Post?"
                message={`Are you sure you want to delete this post? This action cannot be undone.\n\nContent: "${content.substring(0, 100)}..."`}
                confirmText="Delete"
                isDestructive={true}
            />
        </div>
    );
};

export default EditPost;
