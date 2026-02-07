import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach } from '@jest/globals';
import PostList from './PostList';
import { MemoryRouter } from 'react-router-dom';
import API from '../api/axios';

jest.mock('../api/axios', () => ({
    __esModule: true,
    default: {
        get: jest.fn(),
        post: jest.fn(),
        put: jest.fn(),
        delete: jest.fn()
    }
}));

const renderPostList = () => {
    return render(
        <MemoryRouter>
            <PostList />
        </MemoryRouter>
    );
};

describe('PostList', () => {
    beforeEach(() => {
        // Reset mock call history but keep implementation
        API.get.mockClear();
        API.delete.mockClear();
    });

    it('renders post list and fetches data', async () => {
        API.get.mockResolvedValue({
            data: {
                success: true,
                data: [{ _id: '1', content: 'Test Post', status: 'draft', createdAt: new Date() }],
                pagination: { pages: 1, total: 1 }
            }
        });

        renderPostList();

        await waitFor(() => {
            expect(screen.getByText('Test Post')).toBeInTheDocument();
            expect(screen.getByText('1 total posts')).toBeInTheDocument();
        });
    });

    it('handles search and filtering', async () => {
        API.get.mockResolvedValue({
            data: { success: true, data: [], pagination: { pages: 1, total: 0 } }
        });

        renderPostList();

        const searchInput = screen.getByPlaceholderText(/search posts/i);
        fireEvent.change(searchInput, { target: { value: 'query' } });

        await waitFor(() => {
            expect(API.get).toHaveBeenCalledWith(expect.stringContaining('search=query'));
        });

        // Use display value for status filter to avoid ambiguity
        const statusSelect = screen.getByDisplayValue(/all status/i);
        fireEvent.change(statusSelect, { target: { value: 'scheduled' } });

        await waitFor(() => {
            expect(API.get).toHaveBeenCalledWith(expect.stringContaining('status=scheduled'));
        });

        const sortSelect = screen.getByDisplayValue(/newest first/i);
        fireEvent.change(sortSelect, { target: { value: 'createdAt-asc' } });

        await waitFor(() => {
            expect(API.get).toHaveBeenCalledWith(expect.stringContaining('sortOrder=asc'));
        });
    });

    it('handles bulk selection and deletion', async () => {
        const posts = [
            { _id: '1', content: 'P1', status: 'draft' },
            { _id: '2', content: 'P2', status: 'draft' }
        ];
        API.get.mockResolvedValue({
            data: { success: true, data: posts, pagination: { pages: 1, total: 2 } }
        });

        renderPostList();

        await waitFor(() => screen.getByText('P1'));

        const checkboxes = screen.getAllByRole('checkbox');
        fireEvent.click(checkboxes[1]);

        expect(screen.getByText('1 selected')).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: /delete selected/i }));

        // Modal title
        expect(screen.getByText(/delete 1 posts/i)).toBeInTheDocument();
    });
});
