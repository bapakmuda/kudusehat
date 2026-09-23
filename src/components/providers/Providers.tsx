"use client";

import { AuthProvider } from "@/context/AuthContext";
import SplashScreen from "@/components/ui/SplashScreen";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <SplashScreen />
      {children}
    </AuthProvider>
  );
}
