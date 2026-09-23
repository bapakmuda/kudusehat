"use client";

import { useEffect, useState } from "react";

export default function SplashScreen() {
  const [show, setShow] = useState(true);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    // Tampilkan selama 3 detik, lalu mulai transisi fade out
    const timer = setTimeout(() => {
      setIsFading(true);
      setTimeout(() => {
        setShow(false);
      }, 500); // Durasi fade out
    }, 2500); // Berjalan selama 2.5 detik + 0.5s fade

    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center transition-opacity duration-500 ease-in-out ${isFading ? "opacity-0" : "opacity-100"
        }`}
    >
      <div className="relative w-64 h-64">
        {/* Efek Asap */}
        <div className="absolute bottom-4 left-4 w-12 h-12 bg-slate-200 rounded-full blur-md animate-smoke-1"></div>
        <div className="absolute bottom-6 left-8 w-10 h-10 bg-slate-300 rounded-full blur-sm animate-smoke-2"></div>
        <div className="absolute bottom-2 left-12 w-14 h-14 bg-slate-200 rounded-full blur-md animate-smoke-3"></div>

        {/* Logo Ondel-Ondel Berlari */}
        <div className="absolute inset-0 flex items-center justify-center animate-run">
          <img
            src="/logo.png"
            alt="KuduSehat Logo"
            className="w-40 h-40 object-contain drop-shadow-xl"
          />
        </div>
      </div>

      <h1 className="mt-8 text-4xl font-matcha font-black bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-primary-400 animate-pulse">
        KuduSehat
      </h1>
      <p className="mt-2 text-slate-500 font-medium">Tunggu ya Dad & Moms...</p>
    </div>
  );
}
