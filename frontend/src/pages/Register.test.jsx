import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach } from '@jest/globals';
import Register from './Register';
import { MemoryRouter } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

jest.mock('../context/AuthContext', () => ({
    useAuth: jest.fn()
}));

const renderRegister = () => {
    return render(
        <MemoryRouter>
            <Register />
        </MemoryRouter>
    );
};

describe('Register', () => {
    const mockRegister = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        useAuth.mockReturnValue({
            register: mockRegister,
            loading: false,
            error: null
        });
    });

    it('renders register form', () => {
        renderRegister();
        expect(screen.getByPlaceholderText(/john doe/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/name@example\.com/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/min\. 8 characters/i)).toBeInTheDocument();
    });

    it('handles form submission', async () => {
        renderRegister();

        fireEvent.change(screen.getByPlaceholderText(/john doe/i), { target: { value: 'Test User' } });
        fireEvent.change(screen.getByPlaceholderText(/name@example\.com/i), { target: { value: 'test@example.com' } });
        fireEvent.change(screen.getByPlaceholderText(/min\. 8 characters/i), { target: { value: 'password123' } });

        fireEvent.click(screen.getByRole('button', { name: /create account/i }));

        await waitFor(() => {
            expect(mockRegister).toHaveBeenCalledWith('Test User', 'test@example.com', 'password123');
        });
    });
});
