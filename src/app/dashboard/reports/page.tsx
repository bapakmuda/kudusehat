"use client";

import { useState } from "react";
import { FileText, Download, Printer, Calendar as CalendarIcon, Filter, Activity, Thermometer, Pill } from "lucide-react";
import { useFamily } from "@/context/FamilyContext";
import DateTag from "@/components/ui/DateTag";

export default function ReportsPage() {
  const { children, activeChildId, setActiveChildId, temperatureLogs, symptomLogs, medications } = useFamily();
  
  const [dateFilter, setDateFilter] = useState("7 Hari Terakhir");
  const activeChild = children.find(c => c.id === activeChildId);

  const activeTemps = temperatureLogs.filter(l => l.childId === activeChildId);
  const activeSymptoms = symptomLogs.filter(l => l.childId === activeChildId);
  const activeMeds = medications.filter(l => l.childId === activeChildId);

  const maxTemp = activeTemps.length > 0 ? Math.max(...activeTemps.map(t => t.temperature)) : 0;
  
  return (
    <div className="p-6 md:p-8 space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="w-8 h-8 text-teal-500" />
            Laporan Medis
          </h1>
          <p className="text-slate-500 mt-1">Cetak dan bagikan riwayat kesehatan anak kepada dokter.</p>
        </div>
        <div className="flex gap-2">
          <button className="inline-flex items-center justify-center px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-bold transition-colors">
            <Printer className="w-4 h-4 mr-2" /> Cetak
          </button>
          <button className="inline-flex items-center justify-center px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-bold transition-colors shadow-sm shadow-teal-500/20">
            <Download className="w-4 h-4 mr-2" /> Download PDF
          </button>
        </div>
      </header>

      {/* Filter Bar */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl p-4 border border-slate-200/50 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <label className="font-bold text-slate-700 shrink-0">Laporan untuk:</label>
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 snap-x w-full">
            {children.map(child => (
              <button
                key={child.id}
                type="button"
                onClick={() => setActiveChildId(child.id)}
                className={`snap-start px-4 py-2 rounded-xl text-sm font-bold transition-all shrink-0 ${
                  activeChildId === child.id 
                    ? "bg-teal-600 text-white shadow-md shadow-teal-500/20" 
                    : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
                }`}
              >
                {child.name}
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex items-center gap-2 shrink-0">
          <Filter className="w-4 h-4 text-slate-400" />
          <select 
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-700 px-3 py-2 focus:ring-teal-500 focus:border-teal-500"
          >
            <option>Hari Ini</option>
            <option>7 Hari Terakhir</option>
            <option>Bulan Ini</option>
            <option>Semua Waktu</option>
          </select>
        </div>
      </div>

      {/* Report Preview */}
      <div className="bg-white rounded-3xl p-8 md:p-12 border border-slate-200 shadow-2xl shadow-slate-200/50 max-w-4xl mx-auto min-h-[800px] relative">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <FileText className="w-48 h-48" />
        </div>

        <div className="relative z-10 border-b-2 border-slate-800 pb-6 mb-8">
          <h2 className="text-3xl font-black text-slate-900 uppercase tracking-widest mb-2">KuduSehat Report</h2>
          <div className="flex justify-between items-end">
            <div>
              <p className="text-lg font-bold text-slate-700">Nama Pasien: <span className="text-teal-700">{activeChild?.name}</span></p>
              <p className="text-slate-500 mt-1">Jenis Kelamin: {activeChild?.gender} • TTL: {activeChild?.birthDate}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-slate-500 uppercase">Periode</p>
              <p className="text-lg font-black text-slate-800">{dateFilter}</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 grid grid-cols-3 gap-6 mb-12">
          <div className="bg-orange-50 border border-orange-100 rounded-2xl p-6 text-center">
            <Thermometer className="w-8 h-8 text-orange-500 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-500 uppercase mb-1">Suhu Tertinggi</p>
            <p className="text-3xl font-black text-slate-900">{maxTemp > 0 ? maxTemp : "--"}°C</p>
          </div>
          <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 text-center">
            <Activity className="w-8 h-8 text-indigo-500 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-500 uppercase mb-1">Total Gejala</p>
            <p className="text-3xl font-black text-slate-900">{activeSymptoms.length}</p>
          </div>
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 text-center">
            <Pill className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-500 uppercase mb-1">Jadwal Obat</p>
            <p className="text-3xl font-black text-slate-900">{activeMeds.length}</p>
          </div>
        </div>

        <div className="relative z-10 space-y-8">
          <div>
            <h3 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-2 mb-4">Ringkasan Gejala Tercatat</h3>
            {activeSymptoms.length > 0 ? (
              <ul className="space-y-3">
                {activeSymptoms.map((sym, i) => (
                  <li key={i} className="flex gap-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="font-bold text-slate-700 w-24 shrink-0">{sym.date}<DateTag date={sym.date} /></div>
                    <div className="flex-1">
                      <p className="font-bold text-slate-900">{sym.symptom} <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-200 text-slate-600 ml-2">{sym.severity}</span></p>
                      {sym.notes && <p className="text-sm text-slate-500 mt-1">{sym.notes}</p>}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-slate-500 italic">Tidak ada gejala yang dicatat pada periode ini.</p>
            )}
          </div>

          <div>
            <h3 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-2 mb-4">Riwayat Penggunaan Obat</h3>
            {activeMeds.length > 0 ? (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="p-3 font-bold text-sm text-slate-600 rounded-l-lg">Nama Obat & Dosis</th>
                    <th className="p-3 font-bold text-sm text-slate-600">Jam Jadwal</th>
                    <th className="p-3 font-bold text-sm text-slate-600 rounded-r-lg">Status Terakhir</th>
                  </tr>
                </thead>
                <tbody>
                  {activeMeds.map((med, i) => (
                    <tr key={i} className="border-b border-slate-100">
                      <td className="p-3">
                        <p className="font-bold text-slate-900">{med.name}</p>
                        <p className="text-sm text-slate-500">{med.dosage}</p>
                      </td>
                      <td className="p-3 font-bold text-slate-700">{med.scheduleTime}</td>
                      <td className="p-3">
                        <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase ${
                          med.status === "Diberikan" ? "bg-green-100 text-green-700" :
                          med.status === "Dilewati" ? "bg-red-100 text-red-700" :
                          "bg-slate-100 text-slate-600"
                        }`}>
                          {med.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-slate-500 italic">Tidak ada jadwal obat yang dicatat pada periode ini.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
