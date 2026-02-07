import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach } from '@jest/globals';
import EditPost from './EditPost';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
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

const mockPost = {
    _id: '123',
    content: 'Existing post content',
    status: 'draft',
    scheduledAt: null
};

const renderEditPost = (id = '123') => {
    return render(
        <MemoryRouter initialEntries={[`/edit-post/${id}`]}>
            <Routes>
                <Route path="/edit-post/:id" element={<EditPost />} />
            </Routes>
        </MemoryRouter>
    );
};

describe('EditPost', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Ensure mocks are available
        API.get.mockImplementation(() => Promise.resolve({ data: {} }));
        API.put.mockImplementation(() => Promise.resolve({ data: {} }));
        API.delete.mockImplementation(() => Promise.resolve({ data: {} }));
    });

    it('loads and displays post data', async () => {
        API.get.mockResolvedValue({
            data: { success: true, data: [mockPost] }
        });

        renderEditPost();

        await waitFor(() => {
            expect(screen.getByDisplayValue('Existing post content')).toBeInTheDocument();
        });
    });

    it('updates post successfully', async () => {
        API.get.mockResolvedValue({
            data: { success: true, data: [mockPost] }
        });
        API.put.mockResolvedValue({ data: { success: true } });

        renderEditPost();

        await waitFor(() => screen.getByDisplayValue('Existing post content'));

        const textarea = screen.getByDisplayValue('Existing post content');
        fireEvent.change(textarea, { target: { value: 'Updated content' } });

        fireEvent.click(screen.getByRole('button', { name: /update post/i }));

        await waitFor(() => {
            expect(API.put).toHaveBeenCalledWith('/posts/123', expect.objectContaining({
                content: 'Updated content'
            }));
        });
    });

    it('handles delete flow', async () => {
        API.get.mockResolvedValue({
            data: { success: true, data: [mockPost] }
        });

        renderEditPost();

        await waitFor(() => screen.getByDisplayValue('Existing post content'));

        fireEvent.click(screen.getByTitle(/delete post/i));
        expect(screen.getByText(/are you sure you want to delete this post/i)).toBeInTheDocument();

        API.delete.mockResolvedValue({ data: { success: true } });
        fireEvent.click(screen.getByRole('button', { name: 'Delete' }));

        await waitFor(() => {
            expect(API.delete).toHaveBeenCalledWith('/posts/123');
        });
    });
});
