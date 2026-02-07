import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Globe, X } from 'lucide-react';

const Scheduler = ({ onSchedule, onCancel, initialDate }) => {
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
    const [error, setError] = useState('');

    useEffect(() => {
        if (initialDate) {
            const d = new Date(initialDate);
            setDate(d.toISOString().split('T')[0]);
            setTime(d.toTimeString().split(' ')[0].substring(0, 5));
        } else {
            // Default to 1 hour from now
            const now = new Date();
            now.setHours(now.getHours() + 1);
            setDate(now.toISOString().split('T')[0]);
            setTime(now.toTimeString().split(' ')[0].substring(0, 5));
        }
    }, [initialDate]);

    const handleConfirm = () => {
        const selectedDateTime = new Date(`${date}T${time}`);

        if (selectedDateTime <= new Date()) {
            setError('Please select a future date and time.');
            return;
        }

        setError('');
        onSchedule(selectedDateTime.toISOString());
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="glass-card mt-6 p-6 border-blue-500/30"
        >
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Calendar size={20} className="text-blue-500" />
                    Schedule Post
                </h3>
                <button onClick={onCancel} className="text-zinc-500 hover:text-white transition-colors">
                    <X size={20} />
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="input-group">
                    <label htmlFor="date-input" className="input-label flex items-center gap-2">
                        <Calendar size={14} /> Date
                    </label>
                    <input
                        id="date-input"
                        type="date"
                        className="input-field"
                        value={date}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={(e) => setDate(e.target.value)}
                    />
                </div>
                <div className="input-group">
                    <label htmlFor="time-input" className="input-label flex items-center gap-2">
                        <Clock size={14} /> Time
                    </label>
                    <input
                        id="time-input"
                        type="time"
                        className="input-field"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                    />
                </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-zinc-400 mb-6 bg-zinc-900/50 p-2 rounded-lg">
                <Globe size={14} />
                <span>Timezone: {timezone}</span>
                <span className="text-[10px] ml-auto uppercase font-bold text-zinc-500">Auto-Detected</span>
            </div>

            {error && (
                <p className="text-red-500 text-sm mb-4 flex items-center gap-2">
                    <X size={14} /> {error}
                </p>
            )}

            <div className="flex gap-4">
                <button
                    onClick={handleConfirm}
                    className="btn-primary flex-1"
                >
                    Confirm Schedule
                </button>
                <button
                    onClick={onCancel}
                    className="flex-1 px-6 py-3 rounded-xl border border-zinc-800 text-zinc-400 font-semibold hover:bg-zinc-800 transition-all"
                >
                    Cancel
                </button>
            </div>
        </motion.div>
    );
};

export default Scheduler;
