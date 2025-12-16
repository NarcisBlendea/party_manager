"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";

export interface User {
  id: string;
  name: string;
  pin: string; // Simple 4 digit pin
  isAdmin: boolean;
  createdAt: number;
}

interface AuthContextType {
  user: User | null;
  users: User[]; // List of all users (for checking duplicates)
  login: (name: string, pin: string) => boolean;
  register: (name: string, pin: string) => boolean;
  logout: () => void;
  deleteUser: (id: string) => void; // Admin only function basically
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  // Load users and session
  useEffect(() => {
    const savedUsers = localStorage.getItem("revelion_users");
    const sessionUser = sessionStorage.getItem("revelion_session");
    
    if (savedUsers) {
      setUsers(JSON.parse(savedUsers));
    }
    if (sessionUser) {
      setUser(JSON.parse(sessionUser));
    }
    setIsMounted(true);
  }, []);

  // Sync users to storage
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("revelion_users", JSON.stringify(users));
    }
  }, [users, isMounted]);

  const login = (name: string, pin: string): boolean => {
    // Special Admin Backdoor
    if (name.toLowerCase() === "admin" && pin === "1234") {
        const adminUser: User = { id: "admin", name: "Administrator", pin: "1234", isAdmin: true, createdAt: 0 };
        setUser(adminUser);
        sessionStorage.setItem("revelion_session", JSON.stringify(adminUser));
        return true;
    }

    const foundUser = users.find(u => u.name.toLowerCase() === name.toLowerCase() && u.pin === pin);
    if (foundUser) {
      setUser(foundUser);
      sessionStorage.setItem("revelion_session", JSON.stringify(foundUser));
      return true;
    }
    return false;
  };

  const register = (name: string, pin: string): boolean => {
    if (users.some(u => u.name.toLowerCase() === name.toLowerCase())) {
      return false; // User already exists
    }

    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      pin,
      isAdmin: false,
      createdAt: Date.now()
    };

    setUsers(prev => [...prev, newUser]);
    setUser(newUser); // Auto login
    sessionStorage.setItem("revelion_session", JSON.stringify(newUser));
    return true;
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem("revelion_session");
    sessionStorage.removeItem("revelion_admin_auth"); // Clear old admin auth if exists
    router.push("/");
  };

  const deleteUser = (id: string) => {
      setUsers(prev => prev.filter(u => u.id !== id));
      if (user?.id === id) logout();
  };

  return (
    <AuthContext.Provider value={{ user, users, login, register, logout, deleteUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within a AuthProvider");
  }
  return context;
}
