import { render, screen, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CalendarView from './CalendarView';
import { MemoryRouter } from 'react-router-dom';
import API from '../api/axios';

vi.mock('../api/axios', () => ({
    default: {
        get: vi.fn()
    }
}));

const renderCalendarView = async () => {
    await act(async () => {
        render(
            <MemoryRouter>
                <CalendarView />
            </MemoryRouter>
        );
    });
};

describe('CalendarView', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders calendar header', async () => {
        API.get.mockResolvedValueOnce({
            data: { success: true, data: [] }
        });

        await renderCalendarView();

        expect(screen.getByText(/Calendar View/i)).toBeInTheDocument();

        await waitFor(() => {
            expect(API.get).toHaveBeenCalledWith(expect.stringContaining('/posts/calendar'));
        });
    });
});
