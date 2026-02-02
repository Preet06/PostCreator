import { createContext, useContext, useState, useEffect } from 'react';
import API from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkLoggedIn = async () => {
            try {
                // We always try to fetch /me. If the cookie is present and valid, it works.
                const res = await API.get('/auth/me');
                setUser(res.data);
            } catch (err) {
                setUser(null);
            }
            setLoading(false);
        };
        checkLoggedIn();
    }, []);

    const login = async (email, password) => {
        const res = await API.post('/auth/login', { email, password });
        setUser(res.data);
        return res.data;
    };

    const register = async (name, email, password) => {
        const res = await API.post('/auth/register', { name, email, password });
        setUser(res.data);
        return res.data;
    };

    const logout = async () => {
        try {
            await API.post('/auth/logout');
        } finally {
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
