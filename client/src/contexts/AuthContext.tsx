import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '@/services/api';

interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: AuthUser | null;
  userRole: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (profileData: any) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in
  useEffect(() => {
    const initializeAuth = async () => {
      const token = apiClient.getToken();
      if (token) {
        try {
          const response = await apiClient.getCurrentUser();
          if (response.success && response.data?.user) {
            setUser(response.data.user);
            setUserRole(response.data.user.role || 'customer');
          } else {
            // Invalid token, clear it
            apiClient.setToken(null);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          apiClient.setToken(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const response = await apiClient.login(email, password);
      if (response.success && response.data?.user) {
        setUser(response.data.user);
        setUserRole(response.data.user.role || 'customer');
        return { error: null };
      }
      return { error: new Error(response.message || 'Login failed') };
    } catch (error: any) {
      return { error };
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const response = await apiClient.register(email, password, fullName);
      if (response.success && response.data?.user) {
        setUser(response.data.user);
        setUserRole(response.data.user.role || 'customer');
        return { error: null };
      }
      return { error: new Error(response.message || 'Registration failed') };
    } catch (error: any) {
      return { error };
    }
  };

  const signOut = async () => {
    apiClient.logout();
    setUser(null);
    setUserRole(null);
  };

  const updateProfile = async (profileData: any) => {
    try {
      const response = await apiClient.updateProfile(profileData);
      if (response.success && response.data?.user) {
        setUser(response.data.user);
        return response;
      }
      throw new Error(response.message || 'Failed to update profile');
    } catch (error) {
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, userRole, loading, signIn, signUp, signOut, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
