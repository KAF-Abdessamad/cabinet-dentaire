import { useState, useEffect, createContext, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Get initial user data from meta tag
        const userMeta = document.querySelector('meta[name="user-data"]');
        if (userMeta) {
            try {
                const userData = JSON.parse(userMeta.content);
                if (userData.name) {
                    setUser(userData);
                }
            } catch (e) {
                console.error('Error parsing user data:', e);
            }
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            // Get CSRF token first
            await axios.get('/sanctum/csrf-cookie');
            
            const response = await axios.post('/login', {
                email,
                password
            });
            
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
            await axios.post('/logout');
            setUser(null);
            window.location.href = '/login';
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const value = {
        user,
        login,
        logout,
        loading,
        isAuthenticated: !!user
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
