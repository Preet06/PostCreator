import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Plus, TrendingUp, Calendar, CheckCircle, AlertTriangle, Activity } from 'lucide-react';

const Dashboard = () => {
    const { user } = useAuth();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        total: 0,
        scheduled: 0,
        published: 0,
        failed: 0
    });

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await axios.get('/posts');
                const postData = response.data.data;
                setPosts(postData);

                // Calculate stats
                const newStats = {
                    total: postData.length,
                    scheduled: postData.filter(p => p.status === 'scheduled').length,
                    published: postData.filter(p => p.status === 'published').length,
                    failed: postData.filter(p => p.status === 'failed').length
                };
                setStats(newStats);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const getStatusBadge = (status) => {
        return <span className={`status-badge ${status}`}>{status.toUpperCase()}</span>;
    };

    const handleConnectTwitter = async () => {
        try {
            const response = await axios.get('/twitter/connect');
            if (response.data.url) {
                // Redirect user to Twitter
                window.location.href = response.data.url;
            }
        } catch (error) {
            console.error('Error initiating Twitter connection:', error);
            const msg = error.response?.data?.message || error.message || 'Unknown error';
            alert(`Failed to start Twitter connection: ${msg}`);
        }
    };

    return (
        <div className="dashboard-container page-enter-active">
            {!user?.twitterTokens?.accessToken && (
                <div className="twitter-connect-card">
                    <div className="twitter-info">
                        <h2>Connect your account</h2>
                        <p>You need to link your Twitter account to start scheduling posts.</p>
                    </div>
                    <button onClick={handleConnectTwitter} className="btn-twitter">Connect Twitter</button>
                </div>
            )}

            <div className="stats-grid">
                <div className="glass-card-elevated hover-lift animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
                    <div className="flex items-start justify-between mb-4">
                        <div className="p-3 bg-blue-500/20 rounded-lg animate-pulse">
                            <TrendingUp className="text-blue-400" size={24} />
                        </div>
                        <div className="text-xs text-zinc-500 font-mono bg-zinc-800/50 px-2 py-1 rounded">
                            TOTAL
                        </div>
                    </div>
                    <span className="stat-label">Total Posts</span>
                    <span className="stat-value">{stats.total}</span>
                    <div className="mt-3 h-1 bg-zinc-700 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full animate-fadeInUp"
                            style={{ width: `${Math.min((stats.total / 10) * 100, 100)}%` }}
                        />
                    </div>
                </div>
                <div className="glass-card-elevated hover-lift animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
                    <div className="flex items-start justify-between mb-4">
                        <div className="p-3 bg-blue-500/20 rounded-lg animate-pulse">
                            <Calendar className="text-blue-400" size={24} />
                        </div>
                        <div className="text-xs text-zinc-500 font-mono bg-zinc-800/50 px-2 py-1 rounded">
                            SCHEDULED
                        </div>
                    </div>
                    <span className="stat-label">Scheduled</span>
                    <span className="stat-value text-blue-400">{stats.scheduled}</span>
                    <div className="mt-3 h-1 bg-zinc-700 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full animate-fadeInUp"
                            style={{ width: `${Math.min((stats.scheduled / 10) * 100, 100)}%` }}
                        />
                    </div>
                </div>
                <div className="glass-card-elevated hover-lift animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
                    <div className="flex items-start justify-between mb-4">
                        <div className="p-3 bg-green-500/20 rounded-lg animate-pulse">
                            <CheckCircle className="text-green-400" size={24} />
                        </div>
                        <div className="text-xs text-zinc-500 font-mono bg-zinc-800/50 px-2 py-1 rounded">
                            PUBLISHED
                        </div>
                    </div>
                    <span className="stat-label">Published</span>
                    <span className="stat-value text-green-400">{stats.published}</span>
                    <div className="mt-3 h-1 bg-zinc-700 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full animate-fadeInUp"
                            style={{ width: `${Math.min((stats.published / 10) * 100, 100)}%` }}
                        />
                    </div>
                </div>
                <div className="glass-card-elevated hover-lift animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
                    <div className="flex items-start justify-between mb-4">
                        <div className="p-3 bg-red-500/20 rounded-lg animate-pulse">
                            <AlertTriangle className="text-red-400" size={24} />
                        </div>
                        <div className="text-xs text-zinc-500 font-mono bg-zinc-800/50 px-2 py-1 rounded">
                            FAILED
                        </div>
                    </div>
                    <span className="stat-label">Failed</span>
                    <span className="stat-value text-red-400">{stats.failed}</span>
                    <div className="mt-3 h-1 bg-zinc-700 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-red-500 to-red-400 rounded-full animate-fadeInUp"
                            style={{ width: `${Math.min((stats.failed / 10) * 100, 100)}%` }}
                        />
                    </div>
                </div>
            </div>

            <div className="recent-posts glass-card-elevated animate-slideInRight">
                <div className="flex-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                            <Activity className="text-blue-400" size={20} />
                        </div>
                        <h3 className="text-xl font-bold">Recent Posts</h3>
                    </div>
                    <Link to="/create-post" className="nav-link text-sm flex items-center gap-1 px-3 py-1 bg-blue-500/10 rounded-lg hover:bg-blue-500/20 transition-all">
                        Create New →
                    </Link>
                </div>

                <div className="table-container">
                    {loading ? (
                        <div className="space-y-3">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="skeleton h-16 rounded-lg"></div>
                            ))}
                        </div>
                    ) : posts.length === 0 ? (
                        <div className="empty-state">
                            <div className="mb-4 p-6 bg-zinc-800/30 rounded-2xl border border-zinc-700 text-center">
                                <div className="text-6xl mb-4 opacity-20">📝</div>
                                <p className="text-zinc-400 mb-6">No posts yet. Create your first post to see it here!</p>
                                <Link to="/create-post" className="btn-elevated mx-auto" style={{ maxWidth: '200px', display: 'flex' }}>
                                    <Plus size={20} />
                                    Create Post
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {posts.slice(0, 5).map((post, index) => (
                                <div
                                    key={post._id}
                                    className="bg-zinc-800/30 rounded-lg border border-zinc-700 p-4 hover:border-zinc-600 hover:bg-zinc-800/50 transition-all hover-lift animate-fadeInUp"
                                    style={{ animationDelay: `${0.1 * index}s` }}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1 min-w-0 mr-4">
                                            <p className="text-sm text-zinc-300 mb-2 truncate" style={{ maxWidth: '300px' }}>
                                                {post.content}
                                            </p>
                                            <div className="flex items-center gap-3 text-xs text-zinc-500">
                                                <span>{getStatusBadge(post.status)}</span>
                                                {post.scheduledAt && (
                                                    <span className="flex items-center gap-1">
                                                        <Calendar size={12} />
                                                        {new Date(post.scheduledAt).toLocaleDateString()}
                                                    </span>
                                                )}
                                                <div className="flex items-center gap-2">
                                                    <Link
                                                        to={`/edit-post/${post._id}`}
                                                        className="text-blue-400 hover:text-blue-300 text-xs"
                                                    >
                                                        Edit
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Navigation Links */}
            <div className="flex gap-4 mt-6 justify-center">
                <Link to="/posts" className="nav-link text-sm">
                    View All Posts →
                </Link>
                <Link to="/calendar" className="nav-link text-sm">
                    Calendar View →
                </Link>
            </div>

            {/* Floating Action Button */}
            <Link
                to="/create-post"
                className="fab animate-float"
                title="Create New Post"
            >
                <Plus size={24} />
            </Link>
        </div>
    );
};

export default Dashboard;
