import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pencil, Trash2, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import API from '../api/axios';
import ConfirmModal from '../components/ConfirmModal';

const PostList = () => {
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Filters
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('createdAt');
    const [sortOrder, setSortOrder] = useState('desc');

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalPosts, setTotalPosts] = useState(0);

    // Selection
    const [selectedPosts, setSelectedPosts] = useState([]);

    // Modals
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, postId: null, content: '' });
    const [bulkDeleteModal, setBulkDeleteModal] = useState(false);

    useEffect(() => {
        fetchPosts();
    }, [statusFilter, searchQuery, currentPage, sortBy, sortOrder]);

    const fetchPosts = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: currentPage,
                limit: 20,
                sortBy,
                sortOrder
            });

            if (statusFilter !== 'all') params.append('status', statusFilter);
            if (searchQuery) params.append('search', searchQuery);

            const response = await API.get(`/posts?${params}`);
            setPosts(response.data.data);
            setTotalPages(response.data.pagination.pages);
            setTotalPosts(response.data.pagination.total);
            setError('');
        } catch (err) {
            setError('Failed to fetch posts');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (postId) => {
        try {
            await API.delete(`/posts/${postId}`);
            fetchPosts();
            setSelectedPosts(selectedPosts.filter(id => id !== postId));
        } catch (err) {
            alert('Failed to delete post');
        }
    };

    const handleBulkDelete = async () => {
        try {
            await API.delete('/posts/bulk', { data: { postIds: selectedPosts } });
            fetchPosts();
            setSelectedPosts([]);
        } catch (err) {
            alert('Failed to delete posts');
        }
    };

    const toggleSelectAll = () => {
        if (selectedPosts.length === posts.length) {
            setSelectedPosts([]);
        } else {
            setSelectedPosts(posts.map(p => p._id));
        }
    };

    const toggleSelect = (postId) => {
        if (selectedPosts.includes(postId)) {
            setSelectedPosts(selectedPosts.filter(id => id !== postId));
        } else {
            setSelectedPosts([...selectedPosts, postId]);
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            draft: 'bg-zinc-700 text-zinc-300',
            scheduled: 'bg-blue-600/20 text-blue-400',
            published: 'bg-green-600/20 text-green-400',
            failed: 'bg-red-600/20 text-red-400'
        };
        return (
            <span className={`px-2 py-1 rounded text-xs font-medium ${styles[status]}`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    const formatDate = (date) => {
        if (!date) return 'Draft';
        return new Date(date).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getRelativeTime = (date) => {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
        return formatDate(date);
    };

    return (
        <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Manage Posts</h1>
                <p className="text-zinc-400">{totalPosts} total posts</p>
            </div>

            {/* Filters */}
            <div className="glass-card p-4 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search posts..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full pl-10 pr-4 py-2 bg-zinc-800/50 border border-zinc-700 rounded-lg focus:outline-none focus:border-blue-500"
                        />
                    </div>

                    {/* Status Filter */}
                    <div className="flex items-center gap-2">
                        <Filter size={20} className="text-zinc-400" />
                        <select
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="px-4 py-2 bg-zinc-800/50 border border-zinc-700 rounded-lg focus:outline-none focus:border-blue-500"
                        >
                            <option value="all">All Status</option>
                            <option value="draft">Draft</option>
                            <option value="scheduled">Scheduled</option>
                            <option value="published">Published</option>
                            <option value="failed">Failed</option>
                        </select>
                    </div>

                    {/* Sort */}
                    <select
                        value={`${sortBy}-${sortOrder}`}
                        onChange={(e) => {
                            const [field, order] = e.target.value.split('-');
                            setSortBy(field);
                            setSortOrder(order);
                        }}
                        className="px-4 py-2 bg-zinc-800/50 border border-zinc-700 rounded-lg focus:outline-none focus:border-blue-500"
                    >
                        <option value="createdAt-desc">Newest First</option>
                        <option value="createdAt-asc">Oldest First</option>
                        <option value="scheduledAt-desc">Schedule (Latest)</option>
                        <option value="scheduledAt-asc">Schedule (Earliest)</option>
                    </select>
                </div>

                {/* Bulk Actions */}
                {selectedPosts.length > 0 && (
                    <div className="mt-4 flex items-center gap-4 p-3 bg-blue-600/10 border border-blue-600/30 rounded-lg">
                        <span className="text-sm text-blue-400">{selectedPosts.length} selected</span>
                        <button
                            onClick={() => setBulkDeleteModal(true)}
                            className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm font-medium transition-colors"
                        >
                            Delete Selected
                        </button>
                        <button
                            onClick={() => setSelectedPosts([])}
                            className="text-sm text-zinc-400 hover:text-white"
                        >
                            Clear Selection
                        </button>
                    </div>
                )}
            </div>

            {/* Posts Table */}
            {loading ? (
                <div className="glass-card p-8 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-4 text-zinc-400">Loading posts...</p>
                </div>
            ) : error ? (
                <div className="glass-card p-8 text-center text-red-400">{error}</div>
            ) : posts.length === 0 ? (
                <div className="glass-card p-8 text-center">
                    <p className="text-zinc-400 mb-4">No posts found</p>
                    <button onClick={() => navigate('/create')} className="btn-primary">
                        Create Your First Post
                    </button>
                </div>
            ) : (
                <>
                    <div className="glass-card overflow-hidden">
                        <table className="w-full">
                            <thead className="border-b border-zinc-700">
                                <tr className="text-left text-sm text-zinc-400">
                                    <th className="p-4">
                                        <input
                                            type="checkbox"
                                            checked={selectedPosts.length === posts.length}
                                            onChange={toggleSelectAll}
                                            className="rounded"
                                        />
                                    </th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4">Content</th>
                                    <th className="p-4">Scheduled</th>
                                    <th className="p-4">Created</th>
                                    <th className="p-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {posts.map((post) => (
                                    <tr key={post._id} className="border-b border-zinc-800 hover:bg-zinc-800/30">
                                        <td className="p-4">
                                            <input
                                                type="checkbox"
                                                checked={selectedPosts.includes(post._id)}
                                                onChange={() => toggleSelect(post._id)}
                                                className="rounded"
                                            />
                                        </td>
                                        <td className="p-4">{getStatusBadge(post.status)}</td>
                                        <td className="p-4 max-w-md">
                                            <p className="truncate">{post.content}</p>
                                        </td>
                                        <td className="p-4 text-sm text-zinc-400">
                                            {formatDate(post.scheduledAt)}
                                        </td>
                                        <td className="p-4 text-sm text-zinc-400">
                                            {getRelativeTime(post.createdAt)}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => navigate(`/edit-post/${post._id}`)}
                                                    className="p-2 hover:bg-zinc-700 rounded transition-colors"
                                                    title="Edit"
                                                >
                                                    <Pencil size={16} />
                                                </button>
                                                <button
                                                    onClick={() => setDeleteModal({
                                                        isOpen: true,
                                                        postId: post._id,
                                                        content: post.content
                                                    })}
                                                    className="p-2 hover:bg-red-600/20 text-red-400 rounded transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="mt-6 flex items-center justify-between">
                            <p className="text-sm text-zinc-400">
                                Page {currentPage} of {totalPages}
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="p-2 border border-zinc-700 rounded-lg hover:border-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="p-2 border border-zinc-700 rounded-lg hover:border-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, postId: null, content: '' })}
                onConfirm={() => handleDelete(deleteModal.postId)}
                title="Delete Post?"
                message={`Are you sure you want to delete this post? This action cannot be undone.\n\nContent: "${deleteModal.content.substring(0, 100)}..."`}
                confirmText="Delete"
                isDestructive={true}
            />

            {/* Bulk Delete Modal */}
            <ConfirmModal
                isOpen={bulkDeleteModal}
                onClose={() => setBulkDeleteModal(false)}
                onConfirm={handleBulkDelete}
                title={`Delete ${selectedPosts.length} Posts?`}
                message={`Are you sure you want to delete ${selectedPosts.length} selected posts? This action cannot be undone.`}
                confirmText="Delete All"
                isDestructive={true}
            />
        </div>
    );
};

export default PostList;
