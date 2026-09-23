"use client";

import { useState } from "react";
import { Pill, Plus, CheckCircle, XCircle, Clock, AlertCircle, Trash2, Pencil, X, ChevronDown } from "lucide-react";
import { useFamily, Medication } from "@/context/FamilyContext";

export default function MedicationsPage() {
  const { children, activeChildId, setActiveChildId, medications, addMedication, updateMedication, updateMedicationStatus, deleteMedication } = useFamily();

  const [name, setName] = useState("");
  const [medType, setMedType] = useState("");
  const [dosage, setDosage] = useState("");
  const [instructions, setInstructions] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [frequency, setFrequency] = useState<number>(1);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleNameChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    
    if (val.length > 2) {
      setIsSearching(true);
      setShowDropdown(true);
      try {
        const res = await fetch(`/api/kfa/products?search=${val}`);
        const data = await res.json();
        setSearchResults(data.items || []);
      } catch (err) {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    } else {
      setShowDropdown(false);
      setSearchResults([]);
    }
  };

  const handleSelectMedicine = (med: any) => {
    setName(med.name);
    setMedType(med.active_ingredients || "");
    setShowDropdown(false);
  };

  const resetForm = () => {
    setName(""); setMedType(""); setDosage(""); setInstructions(""); setScheduleTime(""); setFrequency(1); setEditingId(null);
  };

  const handleEditMedication = (med: Medication) => {
    setEditingId(med.id);
    setName(med.name);
    setMedType(med.type || "");
    setDosage(med.dosage);
    setInstructions(med.instructions);
    setScheduleTime(med.scheduleTime);
    setFrequency(med.frequency ?? 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleAddMedication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeChildId || !name || !dosage || !scheduleTime) return;

    if (editingId) {
      await updateMedication(editingId, {
        name,
        medicationName: name,
        type: medType,
        dosage,
        instructions,
        scheduleTime,
        frequency,
      });
    } else {
      await addMedication({
        childId: activeChildId,
        name,
        medicationName: name,
        type: medType,
        dosage,
        instructions,
        scheduleTime,
        frequency,
      });
    }
    resetForm();
  };

  const activeMeds = medications.filter(m => m.childId === activeChildId);

  // Sort meds by time
  const sortedMeds = [...activeMeds].sort((a, b) => a.scheduleTime.localeCompare(b.scheduleTime));

  return (
    <div className="p-6 md:p-8 space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
      <header>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Pill className="w-8 h-8 text-blue-500" />
          Pengelolaan Obat
        </h1>
        <p className="text-slate-500 mt-1">Atur jadwal dan pantau pemberian obat anak setiap harinya.</p>
      </header>

      {/* Child Selector */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl p-4 border border-slate-200/50 shadow-sm flex flex-col md:flex-row items-start md:items-center gap-4">
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Kolom Kiri: Form Tambah Obat */}
        <div className="lg:col-span-5">
          <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 md:p-8 border border-slate-200/50 shadow-xl shadow-slate-200/40">
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              {editingId ? (
                <><Pencil className="w-5 h-5 text-amber-500" /> Edit Obat</>
              ) : (
                <><Plus className="w-5 h-5 text-blue-500" /> Tambah Obat Baru</>
              )}
            </h2>
            {editingId && (
              <div className="mb-4 flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2">
                <Pencil className="w-4 h-4 text-amber-600 shrink-0" />
                <p className="text-xs text-amber-700 font-medium flex-1">Mode edit aktif. Ubah data lalu simpan.</p>
                <button type="button" onClick={resetForm} className="text-amber-600 hover:text-amber-800"><X className="w-4 h-4" /></button>
              </div>
            )}
            
            <form onSubmit={handleAddMedication} className="space-y-5">
              <div className="relative">
                <label className="block text-sm font-medium text-slate-700 mb-2">Nama Obat (Terintegrasi KFA)</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={handleNameChange}
                  onFocus={() => {
                    if (searchResults.length > 0) setShowDropdown(true);
                  }}
                  onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                  className="appearance-none block w-full px-4 py-3 border border-slate-200 rounded-xl shadow-sm focus:ring-primary-500 focus:border-primary-500 bg-white/50"
                  placeholder="Ketik min 3 huruf (cth: Paracetamol)"
                />
                
                {/* Autocomplete Dropdown */}
                {showDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto overflow-x-hidden">
                    {isSearching ? (
                      <div className="p-4 text-sm text-slate-500 text-center animate-pulse">Mencari di database KFA...</div>
                    ) : searchResults.length > 0 ? (
                      searchResults.map((item, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleSelectMedicine(item)}
                          className="w-full text-left px-4 py-3 hover:bg-slate-50 border-b border-slate-100 last:border-0 transition-colors"
                        >
                          <div className="font-bold text-slate-900">{item.name}</div>
                          <div className="text-xs text-slate-500 flex justify-between mt-1">
                            <span>Sediaan: {item.form}</span>
                            <span>KFA: {item.kfa_code}</span>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="p-4 text-sm text-slate-500 text-center">Tidak ditemukan. Coba kata kunci lain.</div>
                    )}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Dosis</label>
                  <input
                    type="text"
                    required
                    value={dosage}
                    onChange={(e) => setDosage(e.target.value)}
                    className="appearance-none block w-full px-4 py-3 border border-slate-200 rounded-xl shadow-sm focus:ring-primary-500 focus:border-primary-500 bg-white/50"
                    placeholder="Contoh: 5 ml"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Frekuensi (x/hari)</label>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => setFrequency(f => Math.max(1, f - 1))} className="w-10 h-10 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-700 font-bold text-lg hover:bg-slate-50 transition-colors shrink-0">−</button>
                    <div className="flex-1 text-center py-3 border border-slate-200 rounded-xl bg-white/50 font-bold text-slate-900 text-lg">{frequency}x</div>
                    <button type="button" onClick={() => setFrequency(f => Math.min(10, f + 1))} className="w-10 h-10 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-700 font-bold text-lg hover:bg-slate-50 transition-colors shrink-0">+</button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Jam Minum</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Clock className="w-4 h-4 text-slate-400" />
                  </div>
                  <input
                    type="time"
                    required
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    className="appearance-none block min-w-0 max-w-full w-full pl-9 pr-3 py-3 border border-slate-200 rounded-xl shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-white/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Instruksi Dokter / Apoteker</label>
                <textarea
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  rows={2}
                  className="appearance-none block w-full px-4 py-3 border border-slate-200 rounded-xl shadow-sm focus:ring-primary-500 focus:border-primary-500 bg-white/50"
                  placeholder="Contoh: Sesudah makan"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={!activeChildId}
                  className={`inline-flex items-center w-full justify-center px-6 py-4 border border-transparent rounded-xl shadow-sm text-base font-bold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                    editingId
                      ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/30 hover:shadow-lg'
                      : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/30 hover:shadow-lg'
                  }`}
                >
                  {editingId ? <><Pencil className="w-5 h-5 mr-2" /> Simpan Perubahan</> : <><Plus className="w-5 h-5 mr-2" /> Simpan Jadwal Obat</>}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Kolom Kanan: Jadwal Obat Hari Ini */}
        <div className="lg:col-span-7">
          <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 md:p-8 border border-slate-200/50 shadow-sm h-full">
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-6">
              <Clock className="w-5 h-5 text-slate-400" />
              Jadwal Obat Hari Ini
            </h3>
            
            <div className="space-y-4">
              {sortedMeds.length > 0 ? (
                sortedMeds.map((med) => (
                  <div 
                    key={med.id} 
                    className={`rounded-2xl p-5 border shadow-sm transition-all ${
                      med.status === "Diberikan" 
                        ? "bg-green-50 border-green-200" 
                        : med.status === "Dilewati"
                        ? "bg-red-50 border-red-200"
                        : "bg-white border-slate-100 hover:border-blue-300"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row justify-between gap-4">
                      <div className="flex gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${
                          med.status === "Diberikan" 
                            ? "bg-green-100 text-green-600 border-green-200" 
                            : med.status === "Dilewati"
                            ? "bg-red-100 text-red-600 border-red-200"
                            : "bg-blue-50 text-blue-500 border-blue-100"
                        }`}>
                          <Pill className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="px-2 py-1 bg-slate-800 text-white rounded-md text-xs font-black tracking-wider">
                              {med.scheduleTime}
                            </span>
                            {med.status !== "Belum Diberikan" && (
                              <span className={`text-xs font-bold uppercase tracking-wider ${
                                med.status === "Diberikan" ? "text-green-600" : "text-red-600"
                              }`}>
                                {med.status}
                              </span>
                            )}
                          </div>
                          <h4 className="text-lg font-bold text-slate-900">{med.name}</h4>
                          {med.type && (
                            <p className="text-xs font-semibold text-slate-500 mb-1">{med.type}</p>
                          )}
                          <p className="text-sm font-semibold text-blue-600 mb-1">Dosis: {med.dosage}</p>
                          {med.instructions && (
                            <p className="text-xs text-slate-500">📝 {med.instructions}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 sm:flex-col sm:justify-center">
                        {(med.givenCount ?? 0) < (med.frequency ?? 1) && (
                          <>
                            <button
                              onClick={() => updateMedicationStatus(med.id, "Diberikan")}
                              className="flex-1 sm:flex-none inline-flex items-center justify-center px-3 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg text-sm font-bold transition-colors"
                            >
                              <CheckCircle className="w-4 h-4 mr-1.5" /> Diberikan
                            </button>
                            {med.status === "Belum Diberikan" && (
                              <button
                                onClick={() => updateMedicationStatus(med.id, "Dilewati")}
                                className="flex-1 sm:flex-none inline-flex items-center justify-center px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-sm font-bold transition-colors"
                              >
                                <XCircle className="w-4 h-4 mr-1.5" /> Dilewati
                              </button>
                            )}
                          </>
                        )}
                        <button
                          onClick={() => handleEditMedication(med)}
                          className="flex-1 sm:flex-none inline-flex items-center justify-center px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-600 rounded-lg text-sm font-bold transition-colors"
                          title="Edit Obat"
                        >
                          <Pencil className="w-4 h-4 mr-1.5 sm:mr-0" /><span className="sm:hidden">Edit</span>
                        </button>
                        <button
                          onClick={() => deleteMedication(med.id)}
                          className="flex-1 sm:flex-none inline-flex items-center justify-center px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-sm font-bold transition-colors w-full sm:w-auto"
                          title="Hapus Obat"
                        >
                          <Trash2 className="w-4 h-4 mr-1.5 sm:mr-0" /> <span className="sm:hidden">Hapus</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center p-12 border-2 border-dashed border-slate-200 rounded-3xl">
                  <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 font-medium">Belum ada jadwal obat untuk anak ini.</p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
