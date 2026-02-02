import { motion } from 'framer-motion';
import { Send, Type, Hash, Sparkles } from 'lucide-react';

const VariationCard = ({ title, content, icon: Icon, onSelect, disabled, isSelected }) => (
    <motion.div
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{
            opacity: 1,
            scale: 1,
            borderColor: isSelected ? 'rgba(59, 130, 246, 0.5)' : 'rgba(39, 39, 42, 1)'
        }}
        className={`glass-card p-6 flex flex-col h-full transition-all group cursor-pointer ${isSelected ? 'ring-2 ring-blue-500/50 bg-blue-500/5' : 'hover:border-blue-500/50'}`}
        onClick={() => !disabled && onSelect(content)}
    >
        <div className="flex items-center gap-2 mb-4">
            <div className={`p-2 rounded-lg transition-colors ${isSelected ? 'bg-blue-500 text-white' : 'bg-blue-500/10 text-blue-500 group-hover:bg-blue-500 group-hover:text-white'}`}>
                <Icon size={18} />
            </div>
            <h3 className="font-semibold text-zinc-100">{title}</h3>
            {isSelected && <Sparkles size={16} className="text-blue-400 ml-auto animate-pulse" />}
        </div>

        <p className="text-zinc-400 text-sm leading-relaxed flex-grow mb-6 whitespace-pre-wrap">
            {content}
        </p>

        <button
            className={`btn-primary py-2 px-4 text-sm w-full ${isSelected ? 'bg-blue-600' : 'opacity-80'}`}
            disabled={disabled}
        >
            {isSelected ? 'Variation Selected' : 'Select Variation'}
        </button>
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
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
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
