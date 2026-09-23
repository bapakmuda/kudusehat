"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export type User = {
  id: string;
  username: string;
  role: string;
};

type AuthContextType = {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check local storage for session on mount
    const stored = localStorage.getItem("kidscare_user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch (e) {
        console.error("Invalid user data");
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    
    const isPublicPath = pathname === "/login" || pathname === "/register" || pathname === "/";
    
    if (!user && !isPublicPath) {
      router.replace("/login");
    } else if (user && isPublicPath) {
      router.replace("/dashboard");
    }
  }, [user, isLoaded, pathname, router]);

  const login = (u: User) => {
    setUser(u);
    localStorage.setItem("kidscare_user", JSON.stringify(u));
    router.push("/dashboard");
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("kidscare_user");
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {/* Jika belum dimuat dan mencoba akses dashboard, tahan rendering */}
      {(!isLoaded && pathname?.startsWith("/dashboard")) ? null : children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
