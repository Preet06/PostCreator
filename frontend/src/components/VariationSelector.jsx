import { motion } from 'framer-motion';
import { Send, Type, Hash, Sparkles, CheckCircle2 } from 'lucide-react';

const VariationCard = ({ title, content, icon: Icon, onSelect, disabled, isSelected }) => (
    <motion.div
        layout
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{
            opacity: 1,
            scale: isSelected ? 1.02 : 1,
            y: 0,
        }}
        whileHover={{ 
            scale: 1.02,
            y: -4,
        }}
        whileTap={{ scale: 0.98 }}
        className={`glass-card-elevated p-6 flex flex-col h-full transition-all group cursor-pointer relative overflow-hidden ${
            isSelected ? 'ring-2 ring-blue-500/50 bg-blue-500/5 animate-glow' : 'hover:border-blue-500/30'
        }`}
        onClick={() => !disabled && onSelect(content)}
    >
        {/* Background gradient for selected state */}
        {isSelected && (
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent pointer-events-none" />
        )}
        
        <div className="flex items-center gap-3 mb-4 relative z-10">
            <motion.div 
                className={`p-3 rounded-xl transition-all ${isSelected ? 'bg-blue-500 text-white animate-pulse' : 'bg-blue-500/10 text-blue-500 group-hover:bg-blue-500 group-hover:text-white group-hover:scale-110'}`}
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
            >
                <Icon size={20} />
            </motion.div>
            <h3 className="font-semibold text-zinc-100 text-lg">{title}</h3>
            {isSelected && (
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="ml-auto"
                >
                    <Sparkles size={16} className="text-blue-400 animate-pulse" />
                </motion.div>
            )}
        </div>

        <div className="flex-grow mb-6 relative z-10">
            <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap">
                {content}
            </p>
            {/* Character count indicator */}
            <div className="mt-3 text-xs text-zinc-500 font-mono">
                {content.length} characters
            </div>
        </div>

        <motion.button
            className={`btn-elevated py-3 px-4 text-sm w-full transition-all ${
                isSelected ? 'bg-blue-600 animate-pulse' : ''
            }`}
            disabled={disabled}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
        >
            {isSelected ? (
                <span className="flex items-center justify-center gap-2">
                    <CheckCircle2 size={16} />
                    Variation Selected
                </span>
            ) : (
                <span className="flex items-center justify-center gap-2">
                    <Send size={16} />
                    Select Variation
                </span>
            )}
        </motion.button>

        {/* Hover effect overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </motion.div>
);

const VariationSelector = ({ variations, onSelect, selectedContent, isSaved }) => {
    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
            <VariationCard
                title="Original"
                content={variations.original}
                icon={Type}
                onSelect={onSelect}
                isSelected={selectedContent === variations.original}
                disabled={isSaved}
            />
            <VariationCard
                title="Emoji-Heavy"
                content={variations.emoji}
                icon={Sparkles}
                onSelect={onSelect}
                isSelected={selectedContent === variations.emoji}
                disabled={isSaved}
            />
            <VariationCard
                title="Hashtag-Focused"
                content={variations.hashtag}
                icon={Hash}
                onSelect={onSelect}
                isSelected={selectedContent === variations.hashtag}
                disabled={isSaved}
            />
        </motion.div>
    );
};

export default VariationSelector;
