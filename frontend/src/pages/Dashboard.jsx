import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';

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
        <div className="dashboard-container">
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
                <div className="stat-card">
                    <span className="stat-label">Total Posts</span>
                    <span className="stat-value">{stats.total}</span>
                </div>
                <div className="stat-card">
                    <span className="stat-label">Scheduled</span>
                    <span className="stat-value" style={{ color: '#3b82f6' }}>{stats.scheduled}</span>
                </div>
                <div className="stat-card">
                    <span className="stat-label">Published</span>
                    <span className="stat-value" style={{ color: '#22c55e' }}>{stats.published}</span>
                </div>
                <div className="stat-card">
                    <span className="stat-label">Failed</span>
                    <span className="stat-value" style={{ color: '#ef4444' }}>{stats.failed}</span>
                </div>
            </div>

            <div className="recent-posts">
                <div className="flex-between mb-4">
                    <h3 className="text-xl font-bold">Recent Posts</h3>
                    <Link to="/create-post" className="nav-link text-sm">Create New →</Link>
                </div>

                <div className="table-container">
                    {loading ? (
                        <div className="empty-state">Loading your posts...</div>
                    ) : posts.length === 0 ? (
                        <div className="empty-state">
                            <p>No posts yet. Create your first post to see it here!</p>
                            <Link to="/create-post" className="btn-primary mt-4" style={{ maxWidth: '200px', margin: '1rem auto' }}>
                                Create Post
                            </Link>
                        </div>
                    ) : (
                        <table>
                            <thead>
                                <tr>
                                    <th>Content</th>
                                    <th>Status</th>
                                    <th>Scheduled For</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {posts.slice(0, 5).map(post => (
                                    <tr key={post._id}>
                                        <td style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {post.content}
                                        </td>
                                        <td>{getStatusBadge(post.status)}</td>
                                        <td>
                                            {post.scheduledAt ? new Date(post.scheduledAt).toLocaleString() : '-'}
                                        </td>
                                        <td>
                                            <Link to={`/edit-post/${post._id}`} className="text-sm text-blue-500 mr-2">Edit</Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
