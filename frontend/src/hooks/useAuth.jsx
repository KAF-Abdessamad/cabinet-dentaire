import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import api from '../api.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const checkAuth = useCallback(async () => {
        // 1. Try meta tag first (if served by Blade)
        const userMeta = document.querySelector('meta[name="user-data"]');
        if (userMeta) {
            try {
                const userData = JSON.parse(userMeta.content);
                if (userData && userData.name) {
                    setUser(userData);
                    setLoading(false);
                    return;
                }
            } catch (e) {
                console.error('Error parsing user data:', e);
            }
        }

        // 2. Otherwise, try calling the API
        try {
            const response = await api.get('/api/user');
            if (response.data && response.data.id) {
                setUser(response.data);
            }
        } catch (error) {
            // 401 is normal if not logged in
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    const login = async (email, password) => {
        try {
            await api.get('/sanctum/csrf-cookie');
            const response = await api.post('/api/login', { email, password });
            
            if (response.data.user) {
                setUser(response.data.user);
                return { success: true };
            }
        } catch (error) {
            return { 
                success: false, 
                error: error.response?.data?.message || 'Login failed' 
            };
        }
    };

    const logout = async () => {
        try {
            await api.post('/api/logout');
            setUser(null);
            window.location.href = '/login/auth';
        } catch (error) {
            console.error('Logout error:', error);
            setUser(null);
            window.location.href = '/login/auth';
        }
    };

    const value = {
        user,
        login,
        logout,
        loading,
        isAuthenticated: !!user,
        checkAuth
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
