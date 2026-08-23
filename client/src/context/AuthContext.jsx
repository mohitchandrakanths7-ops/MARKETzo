import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [seller, setSeller] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('marketzo_token'));
  const [isLoading, setIsLoading] = useState(true);

  // Load user session on mount
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('marketzo_token');
      if (savedToken) {
        try {
          const res = await api.getProfile();
          if (res.success) {
            setUser(res.user);
            setSeller(res.seller || null);
          }
        } catch (err) {
          console.warn('Session expired or invalid, logging out.');
          localStorage.removeItem('marketzo_token');
          setToken(null);
          setUser(null);
          setSeller(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials) => {
    const res = await api.login(credentials);
    if (res.success && res.token) {
      localStorage.setItem('marketzo_token', res.token);
      setToken(res.token);
      setUser(res.user);
      setSeller(res.seller || null);
    }
    return res;
  };

  const register = async (userData) => {
    const res = await api.register(userData);
    if (res.success && res.token) {
      localStorage.setItem('marketzo_token', res.token);
      setToken(res.token);
      setUser(res.user);
      setSeller(res.seller || null);
    }
    return res;
  };

  const demoLogin = async (role = 'customer') => {
    const res = await api.demoLogin(role);
    if (res.success && res.token) {
      localStorage.setItem('marketzo_token', res.token);
      setToken(res.token);
      setUser(res.user);
      setSeller(res.seller || null);
    }
    return res;
  };

  const becomeSeller = async (data) => {
    const res = await api.becomeSeller(data);
    if (res.success) {
      if (res.token) {
        localStorage.setItem('marketzo_token', res.token);
        setToken(res.token);
      }
      if (res.user) {
        setUser(res.user);
      }
      if (res.seller) {
        setSeller(res.seller);
      }
    }
    return res;
  };

  const logout = () => {
    localStorage.removeItem('marketzo_token');
    setToken(null);
    setUser(null);
    setSeller(null);
  };

  const refreshProfile = async () => {
    try {
      const res = await api.getProfile();
      if (res.success) {
        setUser(res.user);
        setSeller(res.seller || null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      seller,
      token,
      isLoading,
      isAuthenticated: !!user,
      isSeller: user?.role === 'seller',
      isAdmin: user?.role === 'admin',
      login,
      register,
      demoLogin,
      becomeSeller,
      logout,
      refreshProfile,
      setUser,
      setSeller
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
