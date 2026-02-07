import { render, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthProvider, useAuth } from './AuthContext';
import API from '../api/axios';

vi.mock('../api/axios');

const TestComponent = () => {
    const { user, login, logout, loading } = useAuth();
    if (loading) return <div>Loading...</div>;
    return (
        <div>
            <div data-testid="user">{user ? user.email : 'null'}</div>
            <button onClick={() => login('test@test.com', 'password')}>Login</button>
            <button onClick={() => logout()}>Logout</button>
        </div>
    );
};

describe('AuthContext', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('checks login status on mount', async () => {
        API.get.mockResolvedValue({ data: { email: 'test@test.com' } });

        const { getByTestId } = render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        await waitFor(() => {
            expect(getByTestId('user')).toHaveTextContent('test@test.com');
        });
        expect(API.get).toHaveBeenCalledWith('/auth/me');
    });

    it('handles login successfully', async () => {
        API.get.mockRejectedValue(new Error('Unauthorized'));
        API.post.mockResolvedValue({ data: { email: 'test@test.com' } });

        const { getByTestId, getByText } = render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        await waitFor(() => {
            expect(getByTestId('user')).toHaveTextContent('null');
        });

        getByText('Login').click();

        await waitFor(() => {
            expect(getByTestId('user')).toHaveTextContent('test@test.com');
        });
        expect(API.post).toHaveBeenCalledWith('/auth/login', { email: 'test@test.com', password: 'password' });
    });

    it('handles logout', async () => {
        API.get.mockResolvedValue({ data: { email: 'test@test.com' } });
        API.post.mockResolvedValue({});

        const { getByTestId, getByText } = render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        await waitFor(() => {
            expect(getByTestId('user')).toHaveTextContent('test@test.com');
        });

        getByText('Logout').click();

        await waitFor(() => {
            expect(getByTestId('user')).toHaveTextContent('null');
        });
        expect(API.post).toHaveBeenCalledWith('/auth/logout');
    });
});
