import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Loader2, CheckCircle2, AlertCircle, Calendar, Send } from 'lucide-react';
import API from '../api/axios';
import VariationSelector from '../components/VariationSelector';
import Scheduler from '../components/Scheduler';

const CreatePost = () => {
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [variations, setVariations] = useState(null);
    const [selectedContent, setSelectedContent] = useState('');
    const [showScheduler, setShowScheduler] = useState(false);
    const [error, setError] = useState('');
    const [saved, setSaved] = useState(false);
    const [lastSavedId, setLastSavedId] = useState(null);

    const MAX_CHARS = 280;

    const handleGenerate = async (e) => {
        e.preventDefault();
        if (!content.trim()) return;

        setError('');
        setLoading(true);
        setVariations(null);
        setSelectedContent('');
        setShowScheduler(false);
        setSaved(false);

        try {
            const res = await API.post('/posts/generate', { content });
            setVariations(res.data.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to generate variations. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectVariation = (content) => {
        setSelectedContent(content);
        setSaved(false);
        setShowScheduler(false);
    };

    const handleSaveDraft = async () => {
        setError('');
        setLoading(true);
        try {
            const res = await API.post('/posts', { content: selectedContent, status: 'draft' });
            setSaved(true);
            setLastSavedId(res.data.data._id);
            // Optionally clear or scroll to success
        } catch (err) {
            setError('Failed to save draft. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSchedule = async (isoDate) => {
        setError('');
        setLoading(true);
        try {
            await API.post('/posts', {
                content: selectedContent,
                status: 'scheduled',
                scheduledAt: isoDate
            });
            setSaved(true);
            setShowScheduler(false);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to schedule post.');
        } finally {
            setLoading(false);
        }
    };

    const charCount = content.length;
    const isOverLimit = charCount > MAX_CHARS;

    return (
        <div className="max-w-4xl mx-auto p-4 pb-20 page-enter-active">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card-elevated mb-8 hover-lift"
            >
                <div className="flex items-center gap-2 mb-6 text-blue-500">
                    <Sparkles size={24} />
                    <h1 className="text-2xl font-bold text-white">Create New Post</h1>
                </div>

                <form onSubmit={handleGenerate}>
                    <div className="input-group">
                        <label className="input-label font-medium flex items-center gap-2">
                            <Sparkles className="text-blue-400" size={16} />
                            What's on your mind?
                        </label>
                        <textarea
                            className="input-enhanced min-h-[150px] resize-none transition-enhanced"
                            placeholder="Type your post content here..."
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                        />
                        <div className={`text-right text-sm mt-2 font-mono p-2 rounded-lg transition-all ${
                            isOverLimit ? 'text-red-500 bg-red-500/10' : 'text-zinc-500 bg-zinc-800/30'
                        }`}>
                            <span className={`inline-flex items-center gap-2 ${isOverLimit ? 'animate-pulse' : ''}`}>
                                {isOverLimit && <AlertCircle size={14} />}
                                {charCount} / {MAX_CHARS}
                            </span>
                            {!isOverLimit && charCount > 0 && (
                                <div className="mt-1">
                                    <div className="h-1 bg-zinc-700 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all"
                                            style={{ width: `${(charCount / MAX_CHARS) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {error && !showScheduler && (
                        <div className="error-message mb-4">
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="btn-elevated w-full md:w-auto transition-enhanced"
                        disabled={loading || !content.trim() || isOverLimit}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="animate-spin" size={20} />
                                <span>Analyzing & Generating...</span>
                                <div className="ml-2 flex gap-1">
                                    <div className="w-1 h-1 bg-white rounded-full animate-pulse"></div>
                                    <div className="w-1 h-1 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                                    <div className="w-1 h-1 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                                </div>
                            </>
                        ) : (
                            <>
                                <Sparkles size={20} />
                                <span>Generate AI Variations</span>
                            </>
                        )}
                    </button>
                </form>
            </motion.div>

            <AnimatePresence>
                {variations && (
                    <div className="space-y-8">
                        <VariationSelector
                            variations={variations}
                            onSelect={handleSelectVariation}
                            selectedContent={selectedContent}
                            isSaved={saved && !showScheduler}
                        />

                        {selectedContent && !saved && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="glass-card-elevated flex flex-col md:flex-row gap-4 items-center justify-center p-6 border-blue-500/20 hover-glow"
                            >
                                <button
                                    onClick={handleSaveDraft}
                                    className="btn-secondary hover-lift flex items-center justify-center gap-2"
                                    disabled={loading}
                                >
                                    <Send size={18} />
                                    <span>Save as Draft</span>
                                </button>
                                <button
                                    onClick={() => setShowScheduler(true)}
                                    className="btn-elevated hover-lift flex items-center justify-center gap-2 px-8"
                                    disabled={loading}
                                >
                                    <Calendar size={18} />
                                    <span>Schedule Post</span>
                                </button>
                            </motion.div>
                        )}
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showScheduler && (
                    <Scheduler
                        onSchedule={handleSchedule}
                        onCancel={() => setShowScheduler(false)}
                    />
                )}
            </AnimatePresence>

            {saved && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card-elevated flex items-center justify-center gap-3 text-green-400 mt-8 font-semibold text-lg p-6 bg-green-500/10 border-green-500/20 animate-glow"
                >
                    <CheckCircle2 size={24} className="animate-pulse" />
                    <span>Post successfully {showScheduler ? 'scheduled' : 'saved to drafts'}!</span>
                    <div className="flex gap-1">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default CreatePost;
