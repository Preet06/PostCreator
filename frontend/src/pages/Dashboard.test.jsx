import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach } from '@jest/globals';
import Dashboard from './Dashboard';
import { MemoryRouter } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';

jest.mock('../api/axios', () => ({
    default: {
        get: jest.fn(),
        post: jest.fn()
    }
}));

jest.mock('../context/AuthContext', () => ({
    useAuth: jest.fn()
}));

const renderDashboard = () => {
    return render(
        <MemoryRouter>
            <Dashboard />
        </MemoryRouter>
    );
};

describe('Dashboard', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        useAuth.mockReturnValue({
            user: { name: 'Test User', twitterTokens: { accessToken: 'token' } },
            loading: false
        });
    });

    it('renders dashboard with stats', async () => {
        API.get.mockResolvedValueOnce({
            data: { success: true, data: [] }
        });

        renderDashboard();

        await waitFor(() => {
            expect(screen.getByText(/recent posts/i)).toBeInTheDocument();
            expect(screen.getByText(/total posts/i)).toBeInTheDocument();
        });
    });

    it('shows empty state', async () => {
        API.get.mockResolvedValueOnce({
            data: { success: true, data: [] }
        });

        renderDashboard();

        await waitFor(() => {
            expect(screen.getByText(/no posts yet/i)).toBeInTheDocument();
        });
    });

    it('displays post data and counts', async () => {
        const mockPosts = [
            { _id: '1', content: 'Post One Content', status: 'published', createdAt: new Date() }
        ];
        API.get.mockResolvedValueOnce({
            data: { success: true, data: mockPosts }
        });

        renderDashboard();

        await waitFor(() => {
            // Check for content snippet
            expect(screen.getByText(/post one content/i)).toBeInTheDocument();
            // Check for the "1" stat value
            const statValues = screen.getAllByText('1');
            expect(statValues.length).toBeGreaterThan(0);
        });
    });
});
