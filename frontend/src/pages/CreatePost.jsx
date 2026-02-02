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
        <div className="max-w-4xl mx-auto p-4 pb-20">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card mb-8"
            >
                <div className="flex items-center gap-2 mb-6 text-blue-500">
                    <Sparkles size={24} />
                    <h1 className="text-2xl font-bold text-white">Create New Post</h1>
                </div>

                <form onSubmit={handleGenerate}>
                    <div className="input-group">
                        <label className="input-label font-medium">What's on your mind?</label>
                        <textarea
                            className="input-field min-h-[150px] resize-none"
                            placeholder="Type your post content here..."
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                        />
                        <div className={`text-right text-sm mt-2 font-mono ${isOverLimit ? 'text-red-500' : 'text-zinc-500'}`}>
                            {charCount} / {MAX_CHARS}
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
                        className="btn-primary w-full md:w-auto"
                        disabled={loading || !content.trim() || isOverLimit}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="animate-spin" size={20} />
                                Analyzing & Generating...
                            </>
                        ) : (
                            <>
                                <Sparkles size={20} />
                                Generate AI Variations
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
                                className="flex flex-col md:flex-row gap-4 items-center justify-center bg-blue-500/5 p-6 rounded-2xl border border-blue-500/20"
                            >
                                <button
                                    onClick={handleSaveDraft}
                                    className="btn-secondary w-full md:w-auto flex items-center justify-center gap-2"
                                    disabled={loading}
                                >
                                    <Send size={18} />
                                    Save as Draft
                                </button>
                                <button
                                    onClick={() => setShowScheduler(true)}
                                    className="btn-primary w-full md:w-auto flex items-center justify-center gap-2 px-8"
                                    disabled={loading}
                                >
                                    <Calendar size={18} />
                                    Schedule Post
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
                    className="flex items-center justify-center gap-2 text-green-500 mt-8 font-semibold text-lg"
                >
                    <CheckCircle2 size={24} />
                    Post successfully {showScheduler ? 'scheduled' : 'saved to drafts'}!
                </motion.div>
            )}
        </div>
    );
};

export default CreatePost;
