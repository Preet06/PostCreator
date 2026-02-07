import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach } from '@jest/globals';
import CreatePost from './CreatePost';
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

const renderCreatePost = () => {
    return render(
        <MemoryRouter>
            <CreatePost />
        </MemoryRouter>
    );
};

const mockVariations = {
    original: 'Original text',
    emoji: 'Emoji text 🚀',
    hashtag: 'Hashtag text #cool'
};

describe('CreatePost', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Ensure mocks are available
        API.post.mockImplementation(() => Promise.resolve({ data: {} }));
        API.get.mockImplementation(() => Promise.resolve({ data: {} }));
    });

    it('renders the create post form', () => {
        renderCreatePost();
        expect(screen.getByPlaceholderText(/type your post content/i)).toBeInTheDocument();
    });

    it('handles AI generation successfully', async () => {
        API.post.mockResolvedValue({
            data: { success: true, data: mockVariations }
        });

        renderCreatePost();
        fireEvent.change(screen.getByPlaceholderText(/type your post content/i), { target: { value: 'Test' } });
        fireEvent.click(screen.getByText(/generate ai variations/i));

        await waitFor(() => {
            expect(screen.getByText('Original text')).toBeInTheDocument();
        });
    });

    it('handles draft saving', async () => {
        API.post.mockResolvedValue({ data: { success: true, data: mockVariations } });

        renderCreatePost();
        fireEvent.change(screen.getByPlaceholderText(/type your post content/i), { target: { value: 'p' } });
        fireEvent.click(screen.getByText(/generate ai variations/i));

        await waitFor(() => screen.getByText('Original text'));

        const selectButtons = screen.getAllByRole('button', { name: /select variation/i });
        fireEvent.click(selectButtons[0]);

        API.post.mockResolvedValue({ data: { success: true, data: { _id: '1' } } });
        fireEvent.click(screen.getByRole('button', { name: /save as draft/i }));

        await waitFor(() => {
            expect(screen.getByText(/saved to drafts/i)).toBeInTheDocument();
        });
    });

    it('handles scheduling flow', async () => {
        API.post.mockResolvedValue({ data: { success: true, data: mockVariations } });

        renderCreatePost();
        fireEvent.change(screen.getByPlaceholderText(/type your post content/i), { target: { value: 'p' } });
        fireEvent.click(screen.getByText(/generate ai variations/i));

        await waitFor(() => screen.getByText('Original text'));

        const selectButtons = screen.getAllByRole('button', { name: /select variation/i });
        fireEvent.click(selectButtons[0]);

        fireEvent.click(screen.getByRole('button', { name: /schedule post/i }));

        // Wait for scheduler to appear - match 'Schedule Post' which is the title in Scheduler.jsx
        await waitFor(() => {
            const schedulerHeaders = screen.getAllByText(/schedule post/i);
            expect(schedulerHeaders.length).toBeGreaterThan(0);
        });
    });
});
