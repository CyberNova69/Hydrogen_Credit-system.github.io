import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

export interface User {
  id: string;
  role: 'producer' | 'buyer' | 'regulator' | 'public';
  name: string;
  email?: string;
  company?: string;
  credits?: number;
  budget?: number;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, role: string, email?: string, company?: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
    }
    setLoading(false);
  }, []);

  const login = async (username: string, role: string, email?: string, company?: string) => {
    try {
      // Mock login - pure JavaScript implementation
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
      
      const mockToken = `mock-jwt-token-${Date.now()}`;
      const mockUser: User = {
        id: `${role}-${Date.now()}`,
        role: role as User['role'],
        name: username,
        email: email || `${username}@example.com`,
        company: company || `${username} Company`,
        credits: role === 'producer' ? Math.floor(Math.random() * 200) + 50 : 
                 role === 'buyer' ? Math.floor(Math.random() * 100) + 10 : 0,
        budget: role === 'buyer' ? Math.floor(Math.random() * 10000) + 1000 : undefined
      };
      
      setToken(mockToken);
      setUser(mockUser);
      
      localStorage.setItem('token', mockToken);
      localStorage.setItem('user', JSON.stringify(mockUser));
      
      axios.defaults.headers.common['Authorization'] = `Bearer ${mockToken}`;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};