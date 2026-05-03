import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthCtx = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('tf_token');
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      api.get('/auth/me')
        .then(({ data }) => setCurrentUser(data.account))
        .catch(() => localStorage.removeItem('tf_token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = (token, account) => {
    localStorage.setItem('tf_token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setCurrentUser(account);
  };

  const logout = () => {
    localStorage.removeItem('tf_token');
    delete api.defaults.headers.common['Authorization'];
    setCurrentUser(null);
  };

  return (
    <AuthCtx.Provider value={{ currentUser, loading, login, logout, isAdmin: currentUser?.accountRole === 'admin' }}>
      {children}
    </AuthCtx.Provider>
  );
};

export const useAuth = () => useContext(AuthCtx);
