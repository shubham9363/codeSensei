import { createContext, useState, useContext, useEffect } from 'react';
import { login as apiLogin, signup as apiSignup, getMe, updateProgress } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('codesensei_token');
    if (token) {
      getMe().then(res => setUser(res.data)).catch(() => {
        localStorage.removeItem('codesensei_token');
      }).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await apiLogin({ email, password });
    localStorage.setItem('codesensei_token', res.data.token);
    setUser(res.data.user);
    return res.data.user;
  };

  const signup = async (name, email, password, role) => {
    const res = await apiSignup({ name, email, password, role });
    localStorage.setItem('codesensei_token', res.data.token);
    setUser(res.data.user);
    return res.data.user;
  };

  const logout = () => {
    localStorage.removeItem('codesensei_token');
    setUser(null);
  };

  const syncProgress = async (updates) => {
    try {
      const res = await updateProgress(updates);
      setUser(res.data);
    } catch (err) {
      console.error('Failed to sync progress:', err);
    }
  };

  const refreshUser = async () => {
    try {
      const res = await getMe();
      setUser(res.data);
    } catch (err) { /* ignore */ }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, signup, logout, loading, syncProgress, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
