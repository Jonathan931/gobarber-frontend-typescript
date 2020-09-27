import React, { createContext, useCallback, useState, useContext } from 'react';

import api from '../services/api';

interface User {
  id: string;
  name: string;
  avatar_url: string;
}

interface AuthState {
  token: string;
  user: User;
}

interface SignInCredentials {
  email: string;
  password: string;
}

interface AuthContextData {
  user: User;
  signIn(credentials: SignInCredentials): Promise<void>;
  signOut(): void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC = ({ children }) => {
  const [data, setData] = useState<AuthState>(() => {
    const token = localStorage.getItem('@BoBarber:token');
    const user = localStorage.getItem('@BoBarber:user');

    if (token && user) return { token, user: JSON.parse(user) };

    return {} as AuthState;
  });

  const signIn = useCallback(async ({ email, password }) => {
    const response = await api.post('sessions', {
      email,
      password,
    });

    const { token, user } = response.data;

    localStorage.setItem('@BoBarber:token', token);
    localStorage.setItem('@BoBarber:user', JSON.stringify(user));

    setData({ token, user });
  }, []);

  const signOut = useCallback(() => {
    localStorage.removeItem('@BoBarber:token');
    localStorage.removeItem('@BoBarber:user');

    setData({} as AuthState);
  }, []);

  return (
    <AuthContext.Provider value={{ user: data.user, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextData {
  const content = useContext(AuthContext);

  if (!content) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return content;
}
