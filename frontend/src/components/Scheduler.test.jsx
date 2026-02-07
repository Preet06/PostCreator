import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Scheduler from './Scheduler';

describe('Scheduler', () => {
    const onSchedule = vi.fn();
    const onCancel = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        // Mock current time to a fixed point: 2026-02-06T18:00:00
        vi.setSystemTime(new Date('2026-02-06T18:00:00'));
    });

    it('renders with default values (1 hour from now)', () => {
        render(<Scheduler onSchedule={onSchedule} onCancel={onCancel} />);

        expect(screen.getByLabelText(/Date/i)).toHaveValue('2026-02-06');
        expect(screen.getByLabelText(/Time/i)).toHaveValue('19:00');
    });

    it('renders with initialDate if provided', () => {
        const initialDate = '2026-02-10T10:30:00.000Z';
        render(<Scheduler onSchedule={onSchedule} onCancel={onCancel} initialDate={initialDate} />);

        expect(screen.getByLabelText(/Date/i)).toHaveValue('2026-02-10');
        // Note: Time might vary based on local zone if not careful, but ISO split is used in component
    });

    it('shows error when confirming a past date', async () => {
        render(<Scheduler onSchedule={onSchedule} onCancel={onCancel} />);

        const dateInput = screen.getByLabelText(/Date/i);
        fireEvent.change(dateInput, { target: { value: '2020-01-01' } });

        const confirmButton = screen.getByText('Confirm Schedule');
        fireEvent.click(confirmButton);

        expect(screen.getByText(/Please select a future date and time/i)).toBeInTheDocument();
        expect(onSchedule).not.toHaveBeenCalled();
    });

    it('calls onSchedule with correct ISO string when confirmed', () => {
        render(<Scheduler onSchedule={onSchedule} onCancel={onCancel} />);

        const confirmButton = screen.getByText('Confirm Schedule');
        fireEvent.click(confirmButton);

        // Match the ISO string - 19:00 local time on 2026-02-06
        const expectedDate = new Date('2026-02-06T19:00:00');
        expect(onSchedule).toHaveBeenCalledWith(expectedDate.toISOString());
    });

    it('calls onCancel when cancel button is clicked', () => {
        render(<Scheduler onSchedule={onSchedule} onCancel={onCancel} />);

        const cancelButton = screen.getByText('Cancel');
        fireEvent.click(cancelButton);

        expect(onCancel).toHaveBeenCalled();
    });
});
