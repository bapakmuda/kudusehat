"use client";

import { useState, useMemo } from "react";
import { Activity, Thermometer, Stethoscope, AlertCircle, Save, Calendar, Clock, Plus, Trash2, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useFamily, TemperatureLog, SymptomLog } from "@/context/FamilyContext";
import DateTag from "@/components/ui/DateTag";

type TimelineItem = 
  | (TemperatureLog & { type: "temperature" })
  | (SymptomLog & { type: "symptom" });

export default function HealthRecordsPage() {
  const { children, activeChildId, setActiveChildId, temperatureLogs, symptomLogs, addSymptomLog, updateTemperatureLog, updateSymptomLog, deleteTemperatureLog, deleteSymptomLog } = useFamily();

  const [symptomDate, setSymptomDate] = useState(new Date().toISOString().split("T")[0]);
  const [symptomTime, setSymptomTime] = useState(new Date().toTimeString().slice(0, 5));
  const [symptom, setSymptom] = useState("");
  const [severity, setSeverity] = useState<"Ringan" | "Sedang" | "Berat">("Ringan");
  const [notes, setNotes] = useState("");
  
  const [editingItem, setEditingItem] = useState<TimelineItem | null>(null);
  const [tempVal, setTempVal] = useState("");

  const handleEdit = (item: TimelineItem) => {
    setEditingItem(item);
    setSymptomDate(item.date);
    setSymptomTime(item.time);
    
    if (item.type === "symptom") {
      setSymptom(item.symptom);
      setSeverity(item.severity as any);
      setNotes(item.notes || "");
    } else {
      setTempVal(item.temperature.toString());
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
    setSymptom("");
    setNotes("");
    setSeverity("Ringan");
    setTempVal("");
    setSymptomDate(new Date().toISOString().split("T")[0]);
    setSymptomTime(new Date().toTimeString().slice(0, 5));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeChildId || !symptomDate || !symptomTime) return;

    if (editingItem) {
      if (editingItem.type === "temperature") {
        updateTemperatureLog(editingItem.id, {
          date: symptomDate,
          time: symptomTime,
          temperature: parseFloat(tempVal)
        });
      } else {
        updateSymptomLog(editingItem.id, {
          symptom,
          severity,
          date: symptomDate,
          time: symptomTime,
          notes
        });
      }
      handleCancelEdit();
    } else {
      if (!symptom) return;
      addSymptomLog({
        childId: activeChildId,
        symptom,
        severity,
        date: symptomDate,
        time: symptomTime,
        notes
      });
      handleCancelEdit();
    }
  };

  // Build Timeline Data
  const timelineData = useMemo(() => {
    if (!activeChildId) return [];

    const temps: TimelineItem[] = temperatureLogs
      .filter(log => log.childId === activeChildId)
      .map(log => ({ ...log, type: "temperature" }));
      
    const symptoms: TimelineItem[] = symptomLogs
      .filter(log => log.childId === activeChildId)
      .map(log => ({ ...log, type: "symptom" }));

    const combined = [...temps, ...symptoms];

    // Sort descending by date and time
    combined.sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}`);
      const dateB = new Date(`${b.date}T${b.time}`);
      return dateB.getTime() - dateA.getTime();
    });

    return combined;
  }, [activeChildId, temperatureLogs, symptomLogs]);

  const getSeverityColor = (sev: string) => {
    switch (sev) {
      case "Ringan": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "Sedang": return "bg-orange-100 text-orange-700 border-orange-200";
      case "Berat": return "bg-red-100 text-red-700 border-red-200 animate-pulse";
      default: return "bg-slate-100 text-slate-700";
    }
  };

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
          <Activity className="w-8 h-8 text-primary-500" />
          Riwayat Kesehatan
        </h1>
        <p className="text-slate-500 mt-1">Garis waktu (timeline) seluruh catatan kesehatan dan gejala anak.</p>
      </header>

      {/* Child Selector */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl p-4 border border-slate-200/50 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 w-full">
          <label className="font-bold text-slate-700 shrink-0 text-sm md:text-base">Pilih Anak:</label>
          
          {children.length === 0 ? (
            <span className="text-sm text-slate-400 italic py-2">Belum ada profil anak</span>
          ) : (
            <>
              {/* Mobile Dropdown */}
              <div className="relative w-full md:hidden">
                <select 
                  className="w-full appearance-none bg-white/80 backdrop-blur-md border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-sm transition-shadow"
                  value={activeChildId || ""}
                  onChange={(e) => setActiveChildId(e.target.value)}
                >
                  {children.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>

              {/* Desktop Buttons */}
              <div className="hidden md:flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full">
                {children.map(child => (
                  <button
                    key={child.id}
                    type="button"
                    onClick={() => setActiveChildId(child.id)}
                    className={`shrink-0 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                      activeChildId === child.id 
                        ? "bg-primary-600 text-white shadow-md shadow-primary-500/20" 
                        : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
                    }`}
                  >
                    {child.name}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
        
        <Link href="/dashboard/temperature" className="shrink-0 inline-flex items-center justify-center px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-bold transition-colors shadow-sm w-full md:w-auto">
          <Thermometer className="w-4 h-4 mr-2" />
          Catat Suhu
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Kolom Kiri: Form Catat Gejala */}
        <div className="lg:col-span-5">
          <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 md:p-8 border border-slate-200/50 shadow-xl shadow-slate-200/40">
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-indigo-500" /> 
              {editingItem ? (editingItem.type === "temperature" ? "Edit Suhu" : "Edit Gejala") : "Catat Gejala Baru"}
            </h2>
            
            <form onSubmit={handleSave} className="space-y-5">
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
                      value={symptomDate}
                      onChange={(e) => setSymptomDate(e.target.value)}
                      className="appearance-none block w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-white/50"
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
                      value={symptomTime}
                      onChange={(e) => setSymptomTime(e.target.value)}
                      className="appearance-none block min-w-0 max-w-full w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-white/50"
                    />
                  </div>
                </div>
              </div>

              {editingItem?.type === "temperature" ? (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Suhu (°C)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={tempVal}
                    onChange={(e) => setTempVal(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                    required
                  />
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Diagnosa / Keluhan</label>
                    <input
                      type="text"
                      value={symptom}
                      onChange={(e) => setSymptom(e.target.value)}
                      placeholder="Contoh: Batuk Berdahak, Demam Berdarah"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Intensitas</label>
                    <div className="grid grid-cols-3 gap-2">
                      {["Ringan", "Sedang", "Berat"].map((level) => (
                        <button
                          key={level}
                          type="button"
                          onClick={() => setSeverity(level as any)}
                          className={`py-2 rounded-xl text-sm font-bold border transition-colors ${
                            severity === level 
                              ? level === "Ringan" ? "bg-yellow-100 border-yellow-300 text-yellow-800" 
                                : level === "Sedang" ? "bg-orange-100 border-orange-300 text-orange-800"
                                : "bg-red-100 border-red-300 text-red-800"
                              : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                          }`}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Catatan Tambahan (Opsional)</label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={2}
                      className="appearance-none block w-full px-4 py-3 border border-slate-200 rounded-xl shadow-sm focus:ring-primary-500 focus:border-primary-500 bg-white/50"
                      placeholder="Kondisi umum anak, misalnya 'Rewel dan sulit makan'"
                    />
                  </div>
                </>
              )}

              <div className="pt-2 flex gap-3">
                {editingItem && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="flex-1 justify-center px-6 py-4 border border-slate-200 rounded-xl text-base font-bold text-slate-600 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-all"
                  >
                    Batal
                  </button>
                )}
                <button
                  type="submit"
                  disabled={!activeChildId}
                  className="flex-1 inline-flex items-center justify-center px-6 py-4 border border-transparent rounded-xl shadow-sm text-base font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all shadow-indigo-500/30 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-5 h-5 mr-2" /> {editingItem ? "Simpan Perubahan" : "Tambah Gejala"}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Kolom Kanan: Health Timeline */}
        <div className="lg:col-span-7">
          <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 md:p-8 border border-slate-200/50 shadow-sm h-full">
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-8">
              <Activity className="w-5 h-5 text-slate-400" />
              Health Timeline
            </h3>
            
            <div className="relative border-l-2 border-slate-100 ml-4 space-y-8 pb-4">
              {timelineData.length > 0 ? (
                timelineData.map((item, index) => (
                  <div key={item.id} className="relative pl-8 group">
                    {/* Timeline dot */}
                    <div className={`absolute -left-[21px] top-1 w-10 h-10 rounded-full flex items-center justify-center border-4 border-white shadow-sm transition-transform group-hover:scale-110 ${
                      item.type === "temperature" ? "bg-orange-100 text-orange-500" : "bg-indigo-100 text-indigo-500"
                    }`}>
                      {item.type === "temperature" ? <Thermometer className="w-4 h-4" /> : <Stethoscope className="w-4 h-4" />}
                    </div>

                    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:border-primary-200 transition-colors">
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-500 flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" /> {item.date}<DateTag date={item.date} />
                          </span>
                          <span className="text-sm font-bold text-slate-500 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" /> {item.time}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {item.type === "temperature" ? (
                            <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${getIndicationColor(item.indication)}`}>
                              {item.indication}
                            </span>
                          ) : (
                            <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${getSeverityColor(item.severity)}`}>
                              {item.severity}
                            </span>
                          )}
                          <button
                            onClick={() => handleEdit(item)}
                            className="p-1.5 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Edit Catatan"
                          >
                            <Save className="w-4 h-4" /> {/* Or Edit icon */}
                          </button>
                          <button
                            onClick={() => {
                              if (confirm("Apakah Anda yakin ingin menghapus catatan ini?")) {
                                if (item.type === "temperature") deleteTemperatureLog(item.id);
                                else deleteSymptomLog(item.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Hapus Catatan"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {item.type === "temperature" ? (
                        <div>
                          <div className="flex items-end gap-1">
                            <span className="text-3xl font-black text-slate-800">{item.temperature}</span>
                            <span className="text-lg font-bold text-slate-500 mb-1">°C</span>
                          </div>
                          <p className="text-sm text-slate-500 mt-1">Pengecekan Suhu Tubuh</p>
                        </div>
                      ) : (
                        <div>
                          <h4 className="text-lg font-bold text-slate-900">{item.symptom}</h4>
                          {item.notes && (
                            <p className="text-sm text-slate-600 mt-2 bg-slate-50 p-3 rounded-lg border border-slate-100">
                              "{item.notes}"
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="pl-8 pt-4">
                  <div className="text-center p-12 border-2 border-dashed border-slate-200 rounded-3xl">
                    <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 font-medium">Belum ada riwayat kesehatan.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
