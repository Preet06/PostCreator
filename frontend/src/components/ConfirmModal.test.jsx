import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from '@jest/globals';
import ConfirmModal from './ConfirmModal';

describe('ConfirmModal', () => {
    it('does not render when isOpen is false', () => {
        const { container } = render(
            <ConfirmModal isOpen={false} title="Test" message="Test Msg" onConfirm={() => { }} onClose={() => { }} />
        );
        expect(container).toBeEmptyDOMElement();
    });

    it('renders with title and message when open', () => {
        render(
            <ConfirmModal isOpen={true} title="Delete Post" message="Are you sure?" onConfirm={() => { }} onClose={() => { }} />
        );
        expect(screen.getByText('Delete Post')).toBeInTheDocument();
        expect(screen.getByText('Are you sure?')).toBeInTheDocument();
    });

    it('calls onConfirm and onClose when confirm is clicked', () => {
        const onConfirm = jest.fn();
        const onClose = jest.fn();
        render(
            <ConfirmModal isOpen={true} title="T" message="M" onConfirm={onConfirm} onClose={onClose} />
        );

        fireEvent.click(screen.getByText('Confirm'));
        expect(onConfirm).toHaveBeenCalled();
        expect(onClose).toHaveBeenCalled();
    });

    it('calls onClose when cancel is clicked', () => {
        const onClose = jest.fn();
        render(
            <ConfirmModal isOpen={true} title="T" message="M" onConfirm={() => { }} onClose={onClose} />
        );

        fireEvent.click(screen.getByText('Cancel'));
        expect(onClose).toHaveBeenCalled();
    });
});
