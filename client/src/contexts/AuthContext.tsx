/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

export interface UserProfile {
  name: string;
  preferredLanguage: 'en' | 'es' | 'fr';
  accessibilityPreference: 'none' | 'step-free' | 'visual-assistance';
  ticketSection: string;
  seatNumber: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  login: (code: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  userProfile: UserProfile;
  updateUserProfile: (profile: UserProfile) => void;
}

const defaultProfile: UserProfile = {
  name: 'Alex Johnson',
  preferredLanguage: 'en',
  accessibilityPreference: 'none',
  ticketSection: 'North Stand',
  seatNumber: 'A-12',
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userProfile, setUserProfile] = useState<UserProfile>(defaultProfile);

  // Initialize from storage on mount
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token === 'valid_session') {
      setIsAuthenticated(true);
    }

    const savedProfile = localStorage.getItem('user_profile');
    if (savedProfile) {
      try {
        setUserProfile(JSON.parse(savedProfile));
      } catch (e) {
        console.error('Failed to parse saved user profile:', e);
      }
    }
    
    // Simulate initial loading to prevent flashing
    setTimeout(() => setIsLoading(false), 500);
  }, []);

  const login = async (code: string): Promise<boolean> => {
    // Simulate network delay and validation
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simple mock validation: accept any code length >= 4
        if (code.length >= 4) {
          localStorage.setItem('auth_token', 'valid_session');
          setIsAuthenticated(true);
          resolve(true);
        } else {
          resolve(false);
        }
      }, 1000);
    });
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    setIsAuthenticated(false);
  };

  const updateUserProfile = (newProfile: UserProfile) => {
    setUserProfile(newProfile);
    localStorage.setItem('user_profile', JSON.stringify(newProfile));
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      login, 
      logout, 
      isLoading,
      userProfile,
      updateUserProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
