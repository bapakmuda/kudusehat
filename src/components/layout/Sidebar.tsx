"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard,
  Users,
  Activity,
  Pill,
  BrainCircuit,
  Bell,
  FileText,
  Settings,
  Stethoscope,
  Utensils,
  LogOut
} from "lucide-react";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Family & Children", href: "/dashboard/family", icon: Users },
  { name: "Health Records", href: "/dashboard/records", icon: Activity },
  { name: "Medications", href: "/dashboard/medications", icon: Pill },
  { name: "Meals", href: "/dashboard/food", icon: Utensils },
  { name: "Consultation", href: "/dashboard/consultation", icon: Stethoscope },
  { name: "AI Health Summary", href: "/dashboard/ai-summary", icon: BrainCircuit },
  { name: "Notifications", href: "/dashboard/notifications", icon: Bell },
  { name: "Reports", href: "/dashboard/reports", icon: FileText },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-slate-200/20 bg-slate-900/15 backdrop-blur-lg h-screen sticky top-0 overflow-y-auto shrink-0 transition-all duration-300 relative z-20 shadow-[4px_0_24px_rgba(0,0,0,0.05)]">
      <div className="p-6 flex items-center gap-3">
        <div className="w-14 h-14 shrink-0">
          <img src="/logo.png" alt="Logo KuduSehat" className="w-full h-full object-contain" />
        </div>
        <span className="text-2xl font-matcha font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 ">
          KuduSehat
        </span>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                isActive 
                  ? "bg-primary-600 text-white shadow-md shadow-primary-500/30 font-bold" 
                  : "text-slate-600 hover:text-primary-700 hover:bg-white/50"
              }`}
            >
              <Icon className={`w-5 h-5 transition-colors ${
                isActive ? "text-white" : "text-slate-500 group-hover:text-primary-600"
              }`} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-100 ">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 ">
          <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
            <span className="text-primary-700 font-bold text-sm">
              {user?.username?.[0]?.toUpperCase() || "U"}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-900 truncate">
              {user?.username || "Pengguna"}
            </p>
            <p className="text-xs text-slate-500 truncate capitalize">{user?.role || "parent"}</p>
          </div>
          <button
            onClick={logout}
            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            title="Keluar"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
