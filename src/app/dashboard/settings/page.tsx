"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Settings, Users, LogOut, Shield, Key } from "lucide-react";

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/users")
      .then(res => res.json())
      .then(data => setUsers(Array.isArray(data) ? data : []))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="space-y-6">
      <header className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Pengaturan</h1>
        <p className="text-slate-500 mt-1">Kelola preferensi akun dan aplikasi KuduSehat.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 border border-slate-200/50 shadow-sm">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center text-3xl font-black text-primary-700 mb-4">
                {user?.username?.[0]?.toUpperCase() || "U"}
              </div>
              <h2 className="text-xl font-bold text-slate-900">{user?.username}</h2>
              <p className="text-sm text-slate-500 uppercase tracking-widest font-semibold mt-1">{user?.role}</p>
              
              <button 
                onClick={logout}
                className="mt-6 w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2.5 rounded-xl font-bold transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Keluar (Logout)
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 border border-slate-200/50 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-primary-500" />
              Daftar Pengguna Login
            </h3>
            
            <div className="space-y-3">
              {users.map((u) => (
                <div key={u.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-700 font-bold">
                      {u.username[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{u.username}</p>
                      <p className="text-xs text-slate-500 font-medium">Role: {u.role}</p>
                    </div>
                  </div>
                  {u.username === user?.username && (
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                      Aktif Saat Ini
                    </span>
                  )}
                </div>
              ))}
              
              {users.length === 0 && (
                <p className="text-sm text-slate-500 text-center py-4">Memuat pengguna...</p>
              )}
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 border border-slate-200/50 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-amber-500" />
              Keamanan Akun
            </h3>
            <p className="text-sm text-slate-500 mb-4">Ubah password atau kelola pengaturan privasi Anda.</p>
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
              <Key className="w-4 h-4" />
              Ubah Password
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
