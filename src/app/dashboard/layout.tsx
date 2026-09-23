import Sidebar from "@/components/layout/Sidebar";
import BottomNav from "@/components/layout/BottomNav";
import { FamilyProvider } from "@/context/FamilyContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <FamilyProvider>
      <div 
        className="flex h-screen overflow-hidden relative selection:bg-pink-300 selection:text-slate-900 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/bg.png')" }}
      >
        {/* Overlay tipis agar konten tetap mudah dibaca */}
        <div className="absolute inset-0 bg-white/40 backdrop-blur-sm z-0"></div>

        <Sidebar />
        
        {/* Area Utama (Tengah) dibuat lebih terang dengan background putih semi-transparan */}
        <main className="flex-1 overflow-y-auto pb-20 md:pb-0 relative scroll-smooth z-10 bg-white/50 backdrop-blur-sm border-l border-white/40 shadow-inner">
          <div className="max-w-7xl mx-auto min-h-full">
            {children}
          </div>
        </main>
        <BottomNav />
      </div>
    </FamilyProvider>
  );
}
