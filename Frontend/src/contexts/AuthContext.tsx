import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { jwtDecode, JwtPayload } from 'jwt-decode';

interface User {
  id: string;
  name: string;
  email: string;
}

interface MyTokenPayload extends JwtPayload {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  authLoading: boolean; // NEW
  loadUserFromToken: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true); // NEW

  const loadUserFromToken = async () => {
    setAuthLoading(true);
    const token = localStorage.getItem('token');
    if (!token) {
      setUser(null);
      setAuthLoading(false);
      return;
    }

    try {
      jwtDecode<MyTokenPayload>(token); // you can remove this if backend validation is enough

      const res = await fetch("http://localhost:5000/auth/me", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch user");

      const userData: User = await res.json();
      setUser(userData);
    } catch (error) {
      console.error('Invalid token or failed fetch:', error);
      logout(false); // avoid infinite loop
    } finally {
      setAuthLoading(false); // Done checking
    }
  };

  const logout = (reload: boolean = true) => {
    localStorage.removeItem('token');
    setUser(null);
    if (reload) window.location.href = '/'; // optional redirect after logout
  };

  useEffect(() => {
    loadUserFromToken();
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, isLoggedIn: !!user, authLoading, loadUserFromToken, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};
