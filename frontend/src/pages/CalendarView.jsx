import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
        <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Calendar View</h1>
                    <p className="text-zinc-400">Visual overview of scheduled posts</p>
                </div>
                <button
                    onClick={() => navigate('/posts')}
                    className="btn-secondary"
                >
                    List View
                </button>
            </div>

            {/* Calendar Controls */}
            <div className="glass-card p-4 mb-6">
                <div className="flex items-center justify-between">
                    <button
                        onClick={previousMonth}
                        className="p-2 hover:bg-zinc-700 rounded-lg transition-colors"
                    >
                        <ChevronLeft size={24} />
                    </button>

                    <div className="flex items-center gap-2">
                        <CalendarIcon size={20} className="text-blue-400" />
                        <h2 className="text-xl font-bold">
                            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                        </h2>
                    </div>

                    <button
                        onClick={nextMonth}
                        className="p-2 hover:bg-zinc-700 rounded-lg transition-colors"
                    >
                        <ChevronRight size={24} />
                    </button>
                </div>
            </div>

            {/* Calendar Grid */}
            {loading ? (
                <div className="glass-card p-8 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-4 text-zinc-400">Loading calendar...</p>
                </div>
            ) : (
                <div className="glass-card p-4">
                    {/* Day Names */}
                    <div className="grid grid-cols-7 gap-2 mb-2">
                        {dayNames.map(day => (
                            <div key={day} className="text-center text-sm font-medium text-zinc-400 py-2">
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
                                <div
                                    key={index}
                                    className={`min-h-24 p-2 rounded-lg border transition-colors ${day
                                            ? 'border-zinc-700 hover:border-zinc-600 cursor-pointer bg-zinc-800/30'
                                            : 'border-transparent'
                                        } ${hasToday ? 'ring-2 ring-blue-500' : ''}`}
                                    onClick={() => day && dayPosts.length > 0 && setSelectedDay(day)}
                                >
                                    {day && (
                                        <>
                                            <div className={`text-sm font-medium mb-2 ${hasToday ? 'text-blue-400' : ''}`}>
                                                {day}
                                            </div>

                                            {/* Post Indicators */}
                                            {dayPosts.length > 0 && (
                                                <div className="space-y-1">
                                                    {dayPosts.slice(0, 3).map((post, idx) => (
                                                        <div
                                                            key={idx}
                                                            className={`h-1.5 rounded-full ${getStatusColor(post.status)}`}
                                                            title={post.content.substring(0, 50)}
                                                        />
                                                    ))}
                                                    {dayPosts.length > 3 && (
                                                        <div className="text-xs text-zinc-400 mt-1">
                                                            +{dayPosts.length - 3} more
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Legend */}
                    <div className="mt-6 pt-4 border-t border-zinc-700 flex items-center gap-6 text-sm">
                        <span className="text-zinc-400">Status:</span>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                            <span>Scheduled</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                            <span>Published</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                            <span>Failed</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Day Detail Modal */}
            {selectedDay && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={() => setSelectedDay(null)}
                    />

                    <div className="relative glass-card p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
                        <h3 className="text-xl font-bold mb-4">
                            Posts for {monthNames[currentDate.getMonth()]} {selectedDay}, {currentDate.getFullYear()}
                        </h3>

                        <div className="space-y-3">
                            {getPostsForDay(selectedDay).map((post) => (
                                <div
                                    key={post._id}
                                    className="p-4 bg-zinc-800/50 rounded-lg border border-zinc-700 hover:border-zinc-600 cursor-pointer transition-colors"
                                    onClick={() => {
                                        setSelectedDay(null);
                                        navigate(`/edit-post/${post._id}`);
                                    }}
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${post.status === 'scheduled' ? 'bg-blue-600/20 text-blue-400' :
                                                post.status === 'published' ? 'bg-green-600/20 text-green-400' :
                                                    post.status === 'failed' ? 'bg-red-600/20 text-red-400' :
                                                        'bg-zinc-700 text-zinc-300'
                                            }`}>
                                            {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                                        </span>
                                        <span className="text-sm text-zinc-400">
                                            {new Date(post.scheduledAt).toLocaleTimeString('en-US', {
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </span>
                                    </div>
                                    <p className="text-sm">{post.content}</p>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={() => setSelectedDay(null)}
                            className="mt-4 w-full btn-secondary"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CalendarView;
