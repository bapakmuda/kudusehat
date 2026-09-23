"use client";

import { useState, useEffect } from "react";
import { Thermometer, AlertCircle, Pill, Plus, Activity, ClipboardList, Utensils, Clock, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useFamily, TemperatureLog, Medication, FoodLog } from "@/context/FamilyContext";
import DateTag from "@/components/ui/DateTag";

export default function DashboardOverview() {
  const { children, temperatureLogs, symptomLogs, medications, foodLogs } = useFamily();
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);

  useEffect(() => {
    if (children.length > 0 && !selectedChildId) {
      setSelectedChildId(children[0].id);
    }
  }, [children, selectedChildId]);

  // Fungsi untuk menghitung umur
  const calculateAge = (dateString: string) => {
    const birthDate = new Date(dateString);
    const today = new Date();
    
    if (today < birthDate) return "Belum lahir";

    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    let days = today.getDate() - birthDate.getDate();

    if (days < 0) {
      months--;
      const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      days += prevMonth.getDate();
    }

    if (months < 0) {
      years--;
      months += 12;
    }

    const parts = [];
    if (years > 0) parts.push(`${years} Tahun`);
    if (months > 0) parts.push(`${months} Bulan`);
    if (days > 0 || (years === 0 && months === 0)) parts.push(`${days} Hari`);

    return parts.join(' ');
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 flex flex-col h-[calc(100vh-90px)] md:h-[calc(100vh-40px)] animate-in fade-in duration-500 w-full overflow-hidden">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-3 md:gap-4 mb-4 md:mb-8 shrink-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">Pantau kondisi kesehatan seluruh anak secara bersamaan.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/family" className="inline-flex flex-1 md:flex-none items-center justify-center px-3 md:px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs md:text-sm font-medium transition-colors">
            <Plus className="w-4 h-4 md:mr-2" />
            <span className="hidden md:inline">Tambah Anak</span>
          </Link>
          <Link href="/dashboard/temperature" className="inline-flex flex-1 md:flex-none items-center justify-center px-3 md:px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-xl text-xs md:text-sm font-medium transition-colors shadow-sm shadow-primary-500/20">
            <Thermometer className="w-4 h-4 mr-1.5 md:mr-2" />
            Catat Suhu
          </Link>
        </div>
      </header>

      {/* Mobile Child Selector (Dropdown) */}
      {children.length > 1 && (
        <div className="xl:hidden mb-4 shrink-0 px-1 animate-in slide-in-from-top-2 duration-300">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Pilih Profil Anak</label>
          <div className="relative">
            <select 
              className="w-full appearance-none bg-white/80 backdrop-blur-md border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-sm transition-shadow"
              value={selectedChildId || ""}
              onChange={(e) => setSelectedChildId(e.target.value)}
            >
              {children.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>
      )}

      {children.length > 0 ? (
        <div className="flex-1 min-h-0 grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6 pb-2">
          {children.map(child => {
            const latestLog = temperatureLogs.find(log => log.childId === child.id);
            const childSymptoms = symptomLogs?.filter(log => log.childId === child.id) || [];
            const childTempLogs = temperatureLogs
              .filter(log => log.childId === child.id)
              .sort((a, b) => {
                const dtA = `${a.date} ${a.time}`;
                const dtB = `${b.date} ${b.time}`;
                return dtB.localeCompare(dtA);
              });
            const childSymptomLogs = symptomLogs
              ?.filter(log => log.childId === child.id)
              .sort((a, b) => {
                const dtA = `${a.date} ${a.time}`;
                const dtB = `${b.date} ${b.time}`;
                return dtB.localeCompare(dtA);
              }) || [];
            const childFoodLogs = (foodLogs || []).filter((log: FoodLog) => log.childId === child.id);

            const childMeds = (medications || []).filter(m => m.childId === child.id);
            childMeds.sort((a, b) => a.scheduleTime.localeCompare(b.scheduleTime));
            const medsToShow = childMeds.slice(0, 2);

            // Simulasi AI Status
            let aiStatus = "Belum ada catatan hari ini. Kondisi diasumsikan aman.";
            let statusColor = "text-slate-400";
            let statusBorder = "border-slate-200";

            if (latestLog) {
              if (latestLog.indication === "Demam Tinggi") {
                aiStatus = "Peringatan (AI): Suhu sangat tinggi! Segera berikan obat penurun panas dan hubungi dokter jika tidak turun dalam 2 jam.";
                statusColor = "text-red-500";
                statusBorder = "border-red-300 bg-red-50";
              } else if (latestLog.indication === "Demam Ringan") {
                aiStatus = "Saran (AI): Suhu sedikit di atas normal. Pastikan asupan cairan cukup dan berikan waktu istirahat.";
                statusColor = "text-orange-500";
                statusBorder = "border-orange-300 bg-orange-50";
              } else if (latestLog.indication === "Normal") {
                if (childSymptoms.length > 0) {
                  aiStatus = `Analisis (AI): Suhu normal, namun ada ${childSymptoms.length} gejala tercatat. Tetap pantau perkembangannya hari ini.`;
                  statusColor = "text-indigo-500";
                  statusBorder = "border-indigo-300 bg-indigo-50";
                } else {
                  aiStatus = "Ringkasan (AI): Kondisi sangat baik! Suhu normal dan tidak ada gejala mengkhawatirkan.";
                  statusColor = "text-green-500";
                  statusBorder = "border-green-300 bg-green-50";
                }
              }
            } else if (childSymptoms.length > 0) {
              aiStatus = "Saran (AI): Tercatat ada gejala namun belum ada catatan suhu. Disarankan untuk segera mengukur suhu.";
              statusColor = "text-orange-500";
              statusBorder = "border-orange-300 bg-orange-50";
            }

            return (
              <div
                key={child.id}
                className={`w-full xl:w-auto shrink-0 flex flex-col h-full min-h-0 ${selectedChildId === child.id ? 'block' : 'hidden xl:flex'}`}
              >
                {/* Profil Card (Fixed Header for this column) */}
                <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-4 md:p-6 border border-slate-100 shadow-sm flex items-center gap-3 md:gap-4 shrink-0 z-10">
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-white flex items-center justify-center shrink-0 text-2xl md:text-3xl shadow-sm border border-slate-200 ">
                    {child.gender === "Laki-laki" ? "👦🏻" : "👧🏻"}
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-lg md:text-xl font-bold text-slate-900 truncate">
                      {child.name}
                    </h2>
                    <div className="flex flex-wrap items-center gap-1.5 md:gap-2 mt-0.5 md:mt-1 text-[10px] md:text-xs text-slate-500 ">
                      <span className="bg-white px-2 py-0.5 rounded-md border border-slate-200 ">
                        {child.gender}
                      </span>
                      <span className="bg-white px-2 py-0.5 rounded-md border border-slate-200 ">
                        {calculateAge(child.birthDate)}
                      </span>
                      {child.weight && (
                        <span className="bg-white px-2 py-0.5 rounded-md border border-slate-200 ">
                          BB: {child.weight} kg
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 min-h-0 overflow-y-auto hide-scrollbar pt-6 pb-20 space-y-6">
                  {/* Data Cards (Suhu & Obat) */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Latest Temperature */}
                    <div className="bg-white/80 backdrop-blur-md rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between group hover:border-orange-500/50 transition-colors">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="p-2 bg-orange-50 rounded-lg text-orange-500">
                          <Thermometer className="w-4 h-4" />
                        </div>
                        <h3 className="text-sm font-semibold text-slate-700 ">Suhu Terbaru</h3>
                      </div>

                      {latestLog ? (
                        <div className="flex flex-col items-center justify-center flex-1 text-center">
                          <div className="flex items-end gap-1 mb-1">
                            <span className="text-4xl font-extrabold text-slate-900">{latestLog.temperature}</span>
                            <span className="text-xl font-bold text-slate-400 mb-1">°C</span>
                          </div>
                          <p className={`text-[10px] uppercase tracking-wider font-bold ${
                            latestLog.indication.includes("Demam") ? "text-red-600" : "text-green-600"
                          }`}>
                            {latestLog.indication} • {latestLog.time}
                          </p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center flex-1 text-center opacity-50">
                          <div className="flex items-end gap-1 mb-1">
                            <span className="text-4xl font-extrabold text-slate-900">--</span>
                            <span className="text-xl font-bold text-slate-400 mb-1">°C</span>
                          </div>
                          <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Belum ada data</p>
                        </div>
                      )}
                    </div>

                    {/* Medications Card */}
                    <div className="bg-white/80 backdrop-blur-md rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col group hover:border-blue-500/50 transition-colors">
                      <div className="flex items-center gap-2 mb-4 shrink-0">
                        <div className="p-2 bg-blue-50 rounded-lg text-blue-500">
                          <Pill className="w-4 h-4" />
                        </div>
                        <h3 className="text-sm font-semibold text-slate-700">Jadwal Obat</h3>
                      </div>

                      <div className="flex-1">
                        {childMeds.length > 0 ? (
                          <>
                            {/* Horizontal snap scroll - 1 at a time */}
                            <div className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar gap-3 pb-1">
                              {childMeds.map((med, idx) => (
                                <div
                                  key={med.id}
                                  className="min-w-full snap-center flex flex-col gap-1.5"
                                >
                                  <div className="flex justify-between items-start gap-2">
                                    <h4 className="text-sm font-bold text-slate-900 leading-tight line-clamp-1">
                                      {med.name}
                                    </h4>
                                    <div className="flex items-center gap-1.5 shrink-0">
                                      {/* Per-item given count / frequency */}
                                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                                        (med.givenCount ?? 0) >= (med.frequency ?? 1)
                                          ? 'bg-green-100 text-green-700'
                                          : (med.givenCount ?? 0) > 0
                                          ? 'bg-blue-100 text-blue-700'
                                          : 'bg-slate-100 text-slate-400'
                                      }`}>
                                        {med.givenCount ?? 0}x / {med.frequency ?? 1}x
                                      </span>
                                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${
                                        med.status === 'Diberikan' ? 'bg-green-100 text-green-700' :
                                        med.status === 'Dilewati' ? 'bg-red-100 text-red-700' :
                                        'bg-blue-100 text-blue-700'
                                      }`}>
                                        {med.scheduleTime}
                                      </span>
                                    </div>
                                  </div>
                                  {med.type && (
                                    <p className="text-[10px] text-slate-500">Jenis: {med.type}</p>
                                  )}
                                  <p className={`text-[10px] font-semibold ${
                                    med.status === 'Diberikan' ? 'text-green-600' :
                                    med.status === 'Dilewati' ? 'text-red-500' :
                                    'text-blue-500'
                                  }`}>
                                    {med.status} • {med.dosage}
                                  </p>
                                  {med.instructions && (
                                    <p className="text-[10px] text-slate-500 italic line-clamp-1">📝 {med.instructions}</p>
                                  )}
                                </div>
                              ))}
                            </div>
                            {/* Dot indicators */}
                            {childMeds.length > 1 && (
                              <div className="flex justify-center gap-1 mt-2">
                                {childMeds.map((_, i) => (
                                  <span key={i} className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                                ))}
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="h-full flex flex-col justify-end">
                            <div className="mb-2 opacity-50">
                              <h4 className="text-base font-bold text-slate-900 leading-tight">Tidak ada jadwal</h4>
                            </div>
                            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Kosong</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Status Alert */}
                  <div className={`bg-white/80 backdrop-blur-md rounded-2xl p-4 md:p-5 border shadow-sm ${statusBorder} flex gap-3 items-start`}>
                    <div className="shrink-0 mt-0.5">
                      <AlertCircle className={`w-5 h-5 ${statusColor}`} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800 mb-1">Status Pemantauan</h4>
                      <p className={`text-xs leading-relaxed font-medium ${aiStatus.includes("AI") ? "text-slate-700" : "text-slate-500"}`}>
                        {aiStatus}
                      </p>
                    </div>
                  </div>

                  {/* Makanan Hari Ini */}
                  <div className="bg-white/80 backdrop-blur-md rounded-2xl p-5 md:p-6 border border-slate-100 shadow-sm mt-2 w-full">
                    <div className="flex items-center justify-between mb-4 w-full">
                      <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 shrink-0">
                        <Utensils className="w-4 h-4 text-orange-500" /> Meals
                      </h3>
                      {childFoodLogs.length > 0 && (() => {
                        const sortedFood = [...childFoodLogs].sort((a, b) => b.time.localeCompare(a.time));
                        const latestTime = sortedFood[0].time;
                        const [hours, minutes] = latestTime.split(':').map(Number);
                        const nextHours = (hours + 4) % 24;
                        const nextTimeStr = `${nextHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
                        return (
                          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-orange-50 rounded-lg border border-orange-100 shrink-0">
                            <Clock className="w-3.5 h-3.5 text-orange-500" />
                            <span className="text-[10px] md:text-[11px] font-bold text-orange-700">Makan Berikutnya: {nextTimeStr}</span>
                          </div>
                        );
                      })()}
                    </div>
                    {childFoodLogs.length > 0 ? (
                      <div className="space-y-3 w-full max-h-[220px] overflow-y-auto pr-1 hide-scrollbar">
                        {childFoodLogs.map(log => (
                          <div key={log.id} className="flex items-center justify-between p-3.5 bg-slate-50/80 rounded-2xl border border-slate-100 w-full">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                                <Utensils className="w-4 h-4 text-orange-500" />
                              </div>
                              <div className="flex flex-col">
                                <span className="text-sm font-bold text-slate-800 leading-tight">
                                  {log.foodName}
                                </span>
                                <span className="text-[11px] text-slate-500 font-medium mt-0.5">{log.time}</span>
                              </div>
                            </div>
                            <div>
                              {log.notes === "Berpotensi memperburuk gejala." ? (
                                <span className="text-[10px] font-bold px-3 py-1.5 rounded-full bg-red-100 text-red-600 border border-red-200 whitespace-nowrap">
                                  Melanggar Pantangan
                                </span>
                              ) : (
                                <span className="text-[10px] font-bold px-3 py-1.5 rounded-full bg-green-100 text-green-600 border border-green-200 whitespace-nowrap">
                                  Aman
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-400 font-medium italic py-2">Belum ada catatan makanan yang dimasukkan hari ini.</p>
                    )}
                  </div>

                  {/* History Suhu & Diagnosa */}
                  <div className="bg-white/80 backdrop-blur-md rounded-2xl p-5 md:p-6 border border-slate-100 shadow-sm mt-2">
                    <h3 className="text-sm font-bold text-slate-900 mb-5 flex items-center gap-2">
                      <ClipboardList className="w-4 h-4 text-primary-500" />
                      Riwayat Suhu & Diagnosa Terbaru
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Kolom Suhu */}
                      <div className="bg-slate-50/50 rounded-3xl p-5 border border-slate-100/60 shadow-sm flex flex-col h-full">
                        <div className="flex items-center gap-3 mb-5">
                          <div className="w-10 h-10 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-500 shadow-inner">
                            <Thermometer className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-slate-800 tracking-tight">Riwayat Suhu</h4>
                            <p className="text-[11px] text-slate-500 font-medium">Pemantauan suhu tubuh</p>
                          </div>
                        </div>
                        
                        {childTempLogs.length > 0 ? (
                          <div className="space-y-3 flex-1 max-h-[260px] overflow-y-auto pr-1 hide-scrollbar">
                            {childTempLogs.map(log => (
                              <div key={log.id} className="flex flex-col p-3.5 bg-white rounded-2xl border border-slate-100/80 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden pl-4">
                                <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${log.indication.includes('Demam') ? 'bg-rose-500' : 'bg-emerald-500'}`}></div>
                                
                                <div className="flex justify-between items-center w-full mb-1.5 gap-2">
                                  <span className="text-xl font-black text-slate-800 leading-none">{log.temperature}°C</span>
                                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md whitespace-nowrap ${
                                    log.indication.includes('Demam') ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                                  }`}>
                                    {log.indication}
                                  </span>
                                </div>
                                <span className="text-[11px] text-slate-400 font-medium">{log.date}<DateTag date={log.date} /> • {log.time}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center border-2 border-dashed border-slate-200 rounded-2xl">
                            <Thermometer className="w-8 h-8 text-slate-300 mb-2" />
                            <p className="text-xs text-slate-500 font-medium">Belum ada pemantauan suhu</p>
                          </div>
                        )}
                      </div>

                      {/* Kolom Diagnosa */}
                      <div className="bg-slate-50/50 rounded-3xl p-5 border border-slate-100/60 shadow-sm flex flex-col h-full">
                        <div className="flex items-center gap-3 mb-5">
                          <div className="w-10 h-10 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-500 shadow-inner">
                            <Activity className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-slate-800 tracking-tight">Riwayat Diagnosa</h4>
                            <p className="text-[11px] text-slate-500 font-medium">Keluhan & gejala</p>
                          </div>
                        </div>

                        {childSymptomLogs.length > 0 ? (
                          <div className="space-y-3 flex-1 max-h-[260px] overflow-y-auto pr-1 hide-scrollbar">
                            {childSymptomLogs.map(log => (
                              <div key={log.id} className="flex flex-col p-3.5 bg-white rounded-2xl border border-slate-100/80 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden pl-4">
                                <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                                    log.severity === 'Berat' ? 'bg-red-500' :
                                    log.severity === 'Sedang' ? 'bg-amber-500' :
                                    'bg-emerald-500'
                                  }`}></div>
                                
                                <div className="flex flex-col gap-2 mb-2 w-full">
                                  <span className="text-[15px] font-bold text-slate-800 leading-snug break-words w-full">
                                    {log.symptom}
                                  </span>
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className={`text-[9px] font-bold px-2 py-1 rounded-md uppercase tracking-wider ${
                                      log.severity === 'Berat' ? 'bg-red-50 text-red-700' :
                                      log.severity === 'Sedang' ? 'bg-amber-50 text-amber-700' :
                                      'bg-emerald-50 text-emerald-700'
                                    }`}>
                                      {log.severity}
                                    </span>
                                    <span className="text-[10px] text-slate-500 font-semibold shrink-0 bg-slate-50 px-2 py-1 rounded-md border border-slate-100 flex items-center gap-1">
                                      {log.date}<DateTag date={log.date} /> • {log.time}
                                    </span>
                                  </div>
                                </div>

                                {log.notes && (
                                  <span className="text-[11px] text-slate-500 font-medium italic mt-1.5 line-clamp-2">
                                    "{log.notes}"
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center border-2 border-dashed border-slate-200 rounded-2xl">
                            <Activity className="w-8 h-8 text-slate-300 mb-2" />
                            <p className="text-xs text-slate-500 font-medium">Belum ada keluhan dicatat</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white/80 backdrop-blur-md rounded-2xl p-8 border border-slate-100 shadow-sm text-center max-w-2xl mx-auto w-full mt-12">
          <p className="text-slate-500 mb-4">Belum ada profil anak yang ditambahkan.</p>
          <Link href="/dashboard/family" className="inline-flex items-center text-primary-600 font-medium hover:underline">
            Tambah Profil Anak <Plus className="w-4 h-4 ml-1" />
          </Link>
        </div>
      )}
    </div>
  );
}
