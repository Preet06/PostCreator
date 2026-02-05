import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import API from '../api/axios';

const CalendarView = () => {
    const navigate = useNavigate();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [posts, setPosts] = useState({});
    const [loading, setLoading] = useState(true);
    const [selectedDay, setSelectedDay] = useState(null);

    useEffect(() => {
        fetchCalendarPosts();
    }, [currentDate]);

    const fetchCalendarPosts = async () => {
        try {
            setLoading(true);
            const month = currentDate.getMonth() + 1;
            const year = currentDate.getFullYear();

            const response = await API.get(`/posts/calendar?month=${month}&year=${year}`);
            setPosts(response.data.data);
        } catch (err) {
            console.error('Failed to fetch calendar posts:', err);
        } finally {
            setLoading(false);
        }
    };

    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        const days = [];

        // Add empty cells for days before month starts
        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push(null);
        }

        // Add days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            days.push(day);
        }

        return days;
    };

    const getDateKey = (day) => {
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, '0');
        const dayStr = String(day).padStart(2, '0');
        return `${year}-${month}-${dayStr}`;
    };

    const getPostsForDay = (day) => {
        if (!day) return [];
        const dateKey = getDateKey(day);
        return posts[dateKey] || [];
    };

    const previousMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
    };

    const isToday = (day) => {
        const today = new Date();
        return day === today.getDate() &&
            currentDate.getMonth() === today.getMonth() &&
            currentDate.getFullYear() === today.getFullYear();
    };

    const getStatusColor = (status) => {
        const colors = {
            scheduled: 'bg-blue-500',
            published: 'bg-green-500',
            failed: 'bg-red-500',
            draft: 'bg-zinc-500'
        };
        return colors[status] || 'bg-zinc-500';
    };

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const days = getDaysInMonth(currentDate);

    return (
        <div className="max-w-7xl mx-auto page-enter-active">
            {/* Header */}
            <div className="mb-8 flex items-center justify-between animate-fadeInUp">
                <div>
                    <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-white to-zinc-300 bg-clip-text text-transparent">Calendar View</h1>
                    <p className="text-zinc-400">Visual overview of scheduled posts</p>
                </div>
                <button
                    onClick={() => navigate('/posts')}
                    className="btn-secondary hover-lift"
                >
                    <span>List View</span>
                </button>
            </div>

            {/* Calendar Controls */}
            <div className="glass-card-elevated p-6 mb-6 animate-slideInRight">
                <div className="flex items-center justify-between">
                    <button
                        onClick={previousMonth}
                        className="p-3 hover:bg-zinc-700 rounded-lg transition-all hover-lift hover-glow"
                    >
                        <ChevronLeft size={24} />
                    </button>

                    <div className="flex items-center gap-3">
                        <motion.div 
                            className="p-2 bg-blue-500/20 rounded-lg"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        >
                            <CalendarIcon size={24} className="text-blue-400" />
                        </motion.div>
                        <h2 className="text-xl font-bold text-white">
                            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                        </h2>
                    </div>

                    <button
                        onClick={nextMonth}
                        className="p-3 hover:bg-zinc-700 rounded-lg transition-all hover-lift hover-glow"
                    >
                        <ChevronRight size={24} />
                    </button>
                </div>
            </div>

            {/* Calendar Grid */}
            {loading ? (
                <div className="glass-card-elevated p-12 text-center">
                    <div className="flex justify-center mb-4">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            className="relative"
                        >
                            <div className="w-16 h-16 border-4 border-zinc-700 border-t-blue-500 rounded-full"></div>
                        </motion.div>
                    </div>
                    <p className="text-zinc-400">Loading calendar...</p>
                </div>
            ) : (
                <div className="glass-card-elevated p-6 animate-fadeInUp">
                    {/* Day Names */}
                    <div className="grid grid-cols-7 gap-2 mb-4">
                        {dayNames.map(day => (
                            <div key={day} className="text-center text-sm font-semibold text-zinc-400 py-2 uppercase tracking-wider">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendar Days */}
                    <div className="grid grid-cols-7 gap-2">
                        {days.map((day, index) => {
                            const dayPosts = getPostsForDay(day);
                            const hasToday = isToday(day);

                            return (
                                <motion.div
                                    key={index}
                                    layout
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.01 }}
                                    className={`min-h-24 p-3 rounded-lg border transition-all cursor-pointer relative overflow-hidden ${
                                        day
                                            ? 'border-zinc-700 hover:border-zinc-600 bg-zinc-800/30 hover:bg-zinc-800/50 hover-lift'
                                            : 'border-transparent'
                                    } ${hasToday ? 'ring-2 ring-blue-500 animate-glow' : ''}`}
                                    onClick={() => day && dayPosts.length > 0 && setSelectedDay(day)}
                                >
                                    {day && (
                                        <>
                                            <div className={`text-sm font-medium mb-2 flex items-center justify-between ${
                                                hasToday ? 'text-blue-400 font-bold' : ''
                                            }`}>
                                                <span>{day}</span>
                                                {hasToday && (
                                                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                                                )}
                                            </div>

                                            {/* Post Indicators */}
                                            {dayPosts.length > 0 && (
                                                <div className="space-y-1">
                                                    {dayPosts.slice(0, 3).map((post, idx) => (
                                                        <motion.div
                                                            key={idx}
                                                            initial={{ width: 0 }}
                                                            animate={{ width: '100%' }}
                                                            transition={{ delay: (index * 0.01) + (idx * 0.1) }}
                                                            className={`h-1.5 rounded-full ${getStatusColor(post.status)} hover:scale-y-150 transition-transform`}
                                                            title={post.content.substring(0, 50)}
                                                        />
                                                    ))}
                                                    {dayPosts.length > 3 && (
                                                        <motion.div 
                                                            initial={{ opacity: 0 }}
                                                            animate={{ opacity: 1 }}
                                                            className="text-xs text-zinc-400 mt-1 bg-zinc-700/50 rounded px-1 text-center"
                                                        >
                                                            +{dayPosts.length - 3} more
                                                        </motion.div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Hover overlay */}
                                            {dayPosts.length > 0 && (
                                                <div className="absolute inset-0 bg-blue-500/5 opacity-0 hover:opacity-100 transition-opacity pointer-events-none" />
                                            )}
                                        </>
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* Enhanced Legend */}
                    <div className="mt-8 pt-6 border-t border-zinc-700 flex items-center justify-center gap-8 text-sm">
                        <span className="text-zinc-400 font-medium">Status:</span>
                        <div className="flex items-center gap-2 hover-lift cursor-pointer">
                            <div className="w-4 h-4 rounded-full bg-blue-500 animate-pulse"></div>
                            <span>Scheduled</span>
                        </div>
                        <div className="flex items-center gap-2 hover-lift cursor-pointer">
                            <div className="w-4 h-4 rounded-full bg-green-500 animate-pulse"></div>
                            <span>Published</span>
                        </div>
                        <div className="flex items-center gap-2 hover-lift cursor-pointer">
                            <div className="w-4 h-4 rounded-full bg-red-500 animate-pulse"></div>
                            <span>Failed</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Enhanced Day Detail Modal */}
            {selectedDay && (
                <motion.div 
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <div
                        className="absolute inset-0 bg-black/70 backdrop-blur-md"
                        onClick={() => setSelectedDay(null)}
                    />

                    <motion.div 
                        className="relative glass-card-elevated p-6 max-w-2xl w-full max-h-[80vh] overflow-hidden animate-scaleIn"
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                    >
                        <div className="flex items-center justify-between mb-6 pb-4 border-b border-zinc-700">
                            <h3 className="text-xl font-bold bg-gradient-to-r from-white to-zinc-300 bg-clip-text text-transparent">
                                Posts for {monthNames[currentDate.getMonth()]} {selectedDay}, {currentDate.getFullYear()}
                            </h3>
                            <button
                                onClick={() => setSelectedDay(null)}
                                className="p-2 hover:bg-zinc-700 rounded-lg transition-all hover-lift"
                            >
                                ×
                            </button>
                        </div>

                        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                            {getPostsForDay(selectedDay).map((post, index) => (
                                <motion.div
                                    key={post._id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="p-4 bg-zinc-800/50 rounded-lg border border-zinc-700 hover:border-zinc-600 hover:bg-zinc-800/70 cursor-pointer transition-all hover-lift"
                                    onClick={() => {
                                        setSelectedDay(null);
                                        navigate(`/edit-post/${post._id}`);
                                    }}
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <span className={`status-badge-enhanced ${post.status}`}>
                                            {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                                        </span>
                                        <span className="text-sm text-zinc-400 flex items-center gap-2">
                                            <CalendarIcon size={14} />
                                            {new Date(post.scheduledAt).toLocaleTimeString('en-US', {
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </span>
                                    </div>
                                    <p className="text-sm text-zinc-300 leading-relaxed">{post.content}</p>
                                    <div className="mt-3 text-xs text-zinc-500 font-mono">
                                        {post.content.length} characters
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        <button
                            onClick={() => setSelectedDay(null)}
                            className="mt-6 w-full btn-secondary hover-lift"
                        >
                            Close
                        </button>
                    </motion.div>
                </motion.div>
            )}
        </div>
    );
};

export default CalendarView;
