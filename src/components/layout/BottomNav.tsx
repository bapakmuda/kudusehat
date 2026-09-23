"use client";

import Link from "next/link";
import { LayoutDashboard, Activity, Pill, Users, Stethoscope, Utensils, LogOut } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";

const bottomNavItems = [
  { name: "Home", href: "/dashboard", icon: LayoutDashboard },
  { name: "Meals", href: "/dashboard/food", icon: Utensils },
  { name: "Records", href: "/dashboard/records", icon: Activity },
  { name: "Meds", href: "/dashboard/medications", icon: Pill },
  { name: "Consult", href: "/dashboard/consultation", icon: Stethoscope },
  { name: "Family", href: "/dashboard/family", icon: Users },
];

export default function BottomNav() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const { logout } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-t border-slate-200 pb-safe pt-1 shadow-[0_-10px_40px_rgba(0,0,0,0.03)]">
      <div className="flex items-center justify-around px-2">
        {bottomNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className="flex flex-col items-center justify-center w-full py-2 px-1 text-slate-500 hover:text-primary-600 transition-colors group "
            >
              <div className="p-1.5 rounded-full group-hover:bg-primary-50 transition-colors mb-0.5">
                <Icon className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
              </div>
              <span className="text-[10px] font-medium">{item.name}</span>
            </Link>
          );
        })}
        <button
          onClick={logout}
          className="flex flex-col items-center justify-center w-full py-2 px-1 text-slate-500 hover:text-red-600 transition-colors group "
        >
          <div className="p-1.5 rounded-full group-hover:bg-red-50 transition-colors mb-0.5">
            <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
          </div>
          <span className="text-[10px] font-medium">Logout</span>
        </button>
      </div>
    </nav>
  );
}
