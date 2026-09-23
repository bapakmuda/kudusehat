"use client";

import { useState, useEffect } from "react";
import { Bell, Smartphone, Pill, AlertTriangle, MessageCircle, Check, Settings2, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function NotificationsPage() {
  const { user } = useAuth();
  const [webPush, setWebPush] = useState(true);
  const [whatsapp, setWhatsapp] = useState(false);
  const [quietHours, setQuietHours] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fallback icon mapping based on type
  const getIcon = (type: string) => {
    switch (type) {
      case "reminder": return Pill;
      case "alert": return AlertTriangle;
      default: return MessageCircle;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case "reminder": return { text: "text-blue-500", bg: "bg-blue-50" };
      case "alert": return { text: "text-orange-500", bg: "bg-orange-50" };
      default: return { text: "text-indigo-500", bg: "bg-indigo-50" };
    }
  };

  const loadData = async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const [settingsRes, notifRes] = await Promise.all([
        fetch(`/api/notifications/settings?userId=${user.id}`),
        fetch(`/api/notifications?userId=${user.id}`)
      ]);
      if (settingsRes.ok) {
        const set = await settingsRes.json();
        setWebPush(set.webPush ?? true);
        setWhatsapp(set.whatsapp ?? false);
        setQuietHours(set.quietHours ?? false);
      }
      if (notifRes.ok) {
        const notifs = await notifRes.json();
        setNotifications(notifs);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const updateSetting = async (key: string, value: boolean) => {
    if (!user) return;
    
    // Optimistic UI
    if (key === 'webPush') setWebPush(value);
    if (key === 'whatsapp') setWhatsapp(value);
    if (key === 'quietHours') setQuietHours(value);

    try {
      await fetch("/api/notifications/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, [key]: value })
      });
    } catch (err) {
      console.error("Failed to update setting");
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id })
      });
      loadData();
    } catch (err) {
      console.error("Failed to mark as read");
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
      <header>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Bell className="w-8 h-8 text-primary-500" />
          Pusat Pemberitahuan
        </h1>
        <p className="text-slate-500 mt-1">Kelola preferensi notifikasi dan lihat pesan masuk dari sistem KuduSehat.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Kolom Kiri: Pengaturan Notifikasi */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 md:p-8 border border-slate-200/50 shadow-xl shadow-slate-200/40">
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Settings2 className="w-5 h-5 text-slate-500" /> 
              Preferensi Pengiriman
            </h2>
            
            <div className="space-y-6">
              {/* Web Push */}
              <div className="flex items-center justify-between">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center shrink-0">
                    <Bell className="w-5 h-5 text-primary-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">Web Push Notifications</h3>
                    <p className="text-xs text-slate-500 mt-1">Terima pop-up notifikasi langsung di browser/HP Anda.</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={webPush} onChange={(e) => updateSetting('webPush', e.target.checked)} />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                </label>
              </div>

              {/* WhatsApp */}
              <div className="flex items-center justify-between">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center shrink-0">
                    <Smartphone className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">WhatsApp Alerts</h3>
                    <p className="text-xs text-slate-500 mt-1">Terima pengingat penting via pesan WhatsApp keluarga.</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={whatsapp} onChange={(e) => updateSetting('whatsapp', e.target.checked)} />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                </label>
              </div>

              <div className="border-t border-slate-100 pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900">Jam Tenang (Quiet Hours)</h3>
                    <p className="text-xs text-slate-500 mt-1">Jangan kirimkan notifikasi selain tingkat prioritas darurat saat anak sedang tidur (20:00 - 06:00).</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={quietHours} onChange={(e) => updateSetting('quietHours', e.target.checked)} />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-slate-700"></div>
                  </label>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Kolom Kanan: Daftar Notifikasi */}
        <div className="lg:col-span-7">
          <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 md:p-8 border border-slate-200/50 shadow-sm h-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                Pesan Masuk
              </h3>
              <button onClick={markAllAsRead} className="text-sm font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1">
                <Check className="w-4 h-4" /> Tandai semua dibaca
              </button>
            </div>
            
            <div className="space-y-4">
              {isLoading ? (
                <div className="flex justify-center p-8 text-primary-500">
                  <Loader2 className="w-8 h-8 animate-spin" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center p-8 text-slate-500">
                  <Bell className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                  <p>Belum ada notifikasi.</p>
                </div>
              ) : (
                notifications.map((notif) => {
                  const Icon = getIcon(notif.type);
                  const { text, bg } = getColor(notif.type);
                  
                  // Format time (simplistic approach for demo)
                  const date = new Date(notif.createdAt);
                  const timeString = date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

                  return (
                    <div 
                      key={notif.id} 
                      className={`rounded-2xl p-5 border transition-all ${
                        notif.read ? "bg-white border-slate-100" : "bg-primary-50/50 border-primary-200 shadow-sm"
                      }`}
                    >
                      <div className="flex gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 border border-white shadow-sm ${bg} ${text}`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-4 mb-1">
                            <h4 className={`text-base font-bold ${notif.read ? "text-slate-700" : "text-slate-900"}`}>
                              {notif.title}
                            </h4>
                            <span className="text-xs font-bold text-slate-400 shrink-0 whitespace-nowrap">
                              {timeString}
                            </span>
                          </div>
                          <p className={`text-sm ${notif.read ? "text-slate-500" : "text-slate-600 font-medium"}`}>
                            {notif.message}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
