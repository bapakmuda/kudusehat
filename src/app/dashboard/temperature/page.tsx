"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import DateTag from "@/components/ui/DateTag";
import { useState, useEffect } from "react";
import { Thermometer, Calendar, Clock, Activity, AlertCircle, Save } from "lucide-react";
import { useFamily, TemperatureLog } from "@/context/FamilyContext";

export default function TemperaturePage() {
  const { children, activeChildId, setActiveChildId, temperatureLogs, addTemperatureLog } = useFamily();

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [temperature, setTemperature] = useState("");
  const [liveIndication, setLiveIndication] = useState<string | null>(null);

  useEffect(() => {
    // Set default date to today and time to now
    const now = new Date();
    setDate(now.toISOString().split("T")[0]);
    setTime(now.toTimeString().slice(0, 5));
  }, []);

  useEffect(() => {
    const tempValue = parseFloat(temperature);
    if (isNaN(tempValue)) {
      setLiveIndication(null);
      return;
    }
    
    if (tempValue < 36.5) setLiveIndication("Hipotermia");
    else if (tempValue <= 37.5) setLiveIndication("Normal");
    else if (tempValue <= 38.5) setLiveIndication("Demam Ringan");
    else setLiveIndication("Demam Tinggi");
  }, [temperature]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeChildId || !date || !time || !temperature) return;

    addTemperatureLog({
      childId: activeChildId,
      date,
      time,
      temperature: parseFloat(temperature),
    });

    setTemperature(""); // Reset temperature input
    // Keep date and time slightly fresh
    const now = new Date();
    setTime(now.toTimeString().slice(0, 5));
  };

  const activeLogs = temperatureLogs.filter(log => log.childId === activeChildId);

  const getIndicationColor = (indication: string) => {
    switch (indication) {
      case "Normal": return "bg-green-100 text-green-700 border-green-200";
      case "Demam Ringan": return "bg-orange-100 text-orange-700 border-orange-200";
      case "Demam Tinggi": return "bg-red-100 text-red-700 border-red-200 animate-pulse";
      case "Hipotermia": return "bg-blue-100 text-blue-700 border-blue-200";
      default: return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
      <header>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Thermometer className="w-8 h-8 text-orange-500" />
          Catat Suhu
        </h1>
        <p className="text-slate-500 mt-1">Pantau perkembangan suhu badan anak dengan indikator otomatis.</p>
      </header>

      {/* Child Selector */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl p-4 border border-slate-200/50 shadow-sm flex flex-col md:flex-row items-start md:items-center gap-4">
        <label className="font-bold text-slate-700 shrink-0">Pilih Anak:</label>
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full snap-x">
          {children.map(child => (
            <button
              key={child.id}
              type="button"
              onClick={() => setActiveChildId(child.id)}
              className={`snap-start px-4 py-2 rounded-xl text-sm font-bold transition-all shrink-0 ${
                activeChildId === child.id 
                  ? "bg-primary-600 text-white shadow-md shadow-primary-500/20" 
                  : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
              }`}
            >
              {child.name}
            </button>
          ))}
          {children.length === 0 && (
            <span className="text-sm text-slate-500 italic">Belum ada anak. Silakan tambah di menu Family.</span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Kolom Kiri: Form */}
        <div className="lg:col-span-5">
          <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 md:p-8 border border-slate-200/50 shadow-xl shadow-slate-200/40">
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary-500" /> 
              Form Pengukuran
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Tanggal</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar className="w-4 h-4 text-slate-400" />
                    </div>
                    <input
                      type="date"
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="appearance-none block w-full pl-9 pr-3 py-3 border border-slate-200 rounded-xl shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-white/50"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Jam</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Clock className="w-4 h-4 text-slate-400" />
                    </div>
                    <input
                      type="time"
                      required
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="appearance-none block w-full pl-9 pr-3 py-3 border border-slate-200 rounded-xl shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-white/50"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Suhu (°C)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Thermometer className="w-5 h-5 text-slate-400" />
                  </div>
                  <input
                    type="number"
                    step="0.1"
                    min="30"
                    max="45"
                    required
                    value={temperature}
                    onChange={(e) => setTemperature(e.target.value)}
                    className="appearance-none block w-full pl-10 pr-3 py-4 border border-slate-200 rounded-xl shadow-sm focus:ring-primary-500 focus:border-primary-500 text-lg font-bold bg-white/50"
                    placeholder="Contoh: 36.5"
                  />
                </div>
              </div>

              {/* Live Indication Badge */}
              {liveIndication && (
                <div className={`mt-2 px-4 py-3 rounded-xl border flex items-center justify-between transition-all ${getIndicationColor(liveIndication)}`}>
                  <span className="font-bold">Indikasi:</span>
                  <span className="font-black tracking-wide uppercase text-sm">{liveIndication}</span>
                </div>
              )}

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={!activeChildId}
                  className="inline-flex items-center w-full justify-center px-6 py-4 border border-transparent rounded-xl shadow-sm text-base font-bold text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all shadow-primary-500/30 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-5 h-5 mr-2" /> Simpan Catatan Suhu
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Kolom Kanan: Riwayat Suhu */}
        <div className="lg:col-span-7">
          <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 md:p-8 border border-slate-200/50 shadow-sm h-full">
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-6">
              <Clock className="w-5 h-5 text-slate-400" />
              Riwayat Pengukuran
            </h3>
            
            <div className="space-y-4">
              {activeLogs.length > 0 ? (
                activeLogs.map((log) => (
                  <div key={log.id} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:border-primary-300 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 border ${getIndicationColor(log.indication)}`}>
                        <Thermometer className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-end gap-2">
                          <span className="text-2xl font-black text-slate-800">{log.temperature}</span>
                          <span className="text-sm font-bold text-slate-500 mb-1">°C</span>
                        </div>
                        <div className="text-xs text-slate-500 font-medium flex gap-2">
                          <span>{log.date}<DateTag date={log.date} /></span>
                          <span>•</span>
                          <span>Pukul {log.time}</span>
                        </div>
                      </div>
                    </div>
                    <div className={`px-3 py-1.5 rounded-lg border text-xs font-bold uppercase tracking-wider ${getIndicationColor(log.indication)}`}>
                      {log.indication}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center p-12 border-2 border-dashed border-slate-200 rounded-3xl">
                  <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 font-medium">Belum ada riwayat suhu untuk anak ini.</p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
