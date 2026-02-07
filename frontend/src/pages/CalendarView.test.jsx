import { render, screen, waitFor, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from '@jest/globals';
import CalendarView from './CalendarView';
import { MemoryRouter } from 'react-router-dom';
import API from '../api/axios';

jest.mock('../api/axios', () => ({
    default: {
        get: jest.fn()
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
        jest.clearAllMocks();
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
