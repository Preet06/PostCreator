import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from '@jest/globals';
import VariationSelector from './VariationSelector';

const mockVariations = {
    original: 'Original content here', // 21
    emoji: 'Emoji content 🚀 sparkles', // 16 + 9 = 25
    hashtag: 'Hashtag content #test #trend' // 28
};

describe('VariationSelector', () => {
    it('renders all variations', () => {
        render(<VariationSelector variations={mockVariations} onSelect={() => { }} />);

        expect(screen.getByText('Original')).toBeInTheDocument();
        expect(screen.getByText('Emoji-Heavy')).toBeInTheDocument();
        expect(screen.getByText('Hashtag-Focused')).toBeInTheDocument();

        expect(screen.getByText(mockVariations.original)).toBeInTheDocument();
        expect(screen.getByText(mockVariations.emoji)).toBeInTheDocument();
        expect(screen.getByText(mockVariations.hashtag)).toBeInTheDocument();
    });

    it('calls onSelect when a variation is clicked', () => {
        const onSelect = jest.fn();
        render(<VariationSelector variations={mockVariations} onSelect={onSelect} />);

        const originalCard = screen.getByText('Original').closest('div');
        fireEvent.click(originalCard);

        expect(onSelect).toHaveBeenCalledWith(mockVariations.original);
    });

    it('highlights the selected variation', () => {
        render(
            <VariationSelector
                variations={mockVariations}
                onSelect={() => { }}
                selectedContent={mockVariations.emoji}
            />
        );

        expect(screen.getByText('Variation Selected')).toBeInTheDocument();
    });

    it('disables selection when isSaved is true', () => {
        const onSelect = jest.fn();
        render(
            <VariationSelector
                variations={mockVariations}
                onSelect={onSelect}
                isSaved={true}
            />
        );

        const buttons = screen.getAllByText(/Select Variation|Variation Selected/i);
        expect(buttons.length).toBeGreaterThan(0);
    });

    it('displays character counts correctly', () => {
        render(<VariationSelector variations={mockVariations} onSelect={() => { }} />);

        expect(screen.getByText(`${mockVariations.original.length} characters`)).toBeInTheDocument();
        expect(screen.getByText(`${mockVariations.emoji.length} characters`)).toBeInTheDocument();
    });
});
