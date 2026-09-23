"use client";

import { useState } from "react";
import { Utensils, AlertTriangle, Info, Clock, Plus, Trash2, X, ChevronDown } from "lucide-react";
import { useFamily, FoodLog, SymptomLog } from "@/context/FamilyContext";
import DateTag from "@/components/ui/DateTag";

const COMMON_RULES = [
  {
    symptoms: ["diare", "mencret", "buang air cair"],
    forbidden: ["susu", "pedas", "asam", "santan", "gorengan", "kopi", "keju"],
    advice: "Hindari makanan/minuman produk susu sapi (dairy), pedas, dan asam saat anak diare. Berikan makanan hambar (BRAT: Pisang, Nasi, Saus Apel, Roti Panggang) dan cairan oralit."
  },
  {
    symptoms: ["batuk", "radang", "sakit tenggorokan", "pilek"],
    forbidden: ["es", "dingin", "gorengan", "cokelat", "manis", "kerupuk", "chiki"],
    advice: "Hindari makanan berminyak, es/dingin, dan manis berlebih. Perbanyak air hangat, kaldu ayam, dan madu (untuk anak > 1 tahun)."
  },
  {
    symptoms: ["muntah", "mual"],
    forbidden: ["santan", "pedas", "asam", "lemak", "berlemak"],
    advice: "Hindari makanan berat, bersantan, dan berlemak tinggi. Berikan makanan dalam porsi sangat kecil tapi sering, serta cairan bening (air, kaldu)."
  },
  {
    symptoms: ["demam", "panas"],
    forbidden: ["junk food", "makanan instan", "soda"],
    advice: "Anak demam butuh banyak cairan. Hindari makanan yang sulit dicerna. Prioritaskan sup berkuah, buah segar (semangka, melon), dan air putih."
  }
];

export default function FoodConsumptionPage() {
  const { children, activeChildId, setActiveChildId, activeChild, foodLogs, addFoodLog, deleteFoodLog, symptomLogs } = useFamily();
  
  const [foodName, setFoodName] = useState("");
  const [time, setTime] = useState("");
  const [showWarning, setShowWarning] = useState<{ symptom: string; advice: string } | null>(null);

  const activeFoodLogs = foodLogs.filter(log => log.childId === activeChildId);
  const activeSymptoms = symptomLogs.filter(log => log.childId === activeChildId && log.date === new Date().toISOString().split("T")[0]);

  const checkFoodConflict = (food: string) => {
    const foodLower = food.toLowerCase();
    let foundWarning = null;

    for (const symptom of activeSymptoms) {
      const symptomLower = symptom.symptom.toLowerCase();
      for (const rule of COMMON_RULES) {
        // Check if child has this symptom
        const hasSymptom = rule.symptoms.some(s => symptomLower.includes(s));
        if (hasSymptom) {
          // Check if food contains forbidden words
          const isForbidden = rule.forbidden.some(f => foodLower.includes(f));
          if (isForbidden) {
            foundWarning = {
              symptom: symptom.symptom,
              advice: rule.advice
            };
            break;
          }
        }
      }
      if (foundWarning) break;
    }

    setShowWarning(foundWarning);
    return foundWarning;
  };

  const handleAddFood = (e: React.FormEvent) => {
    e.preventDefault();
    if (!foodName || !time || !activeChildId) return;

    const conflict = checkFoodConflict(foodName);

    addFoodLog({
      childId: activeChildId,
      foodName,
      date: new Date().toISOString().split("T")[0],
      time,
      notes: conflict ? "Berpotensi memperburuk gejala." : "Aman dikonsumsi."
    });

    setFoodName("");
    setTime("");
  };

  return (
    <div className="p-6 md:p-8 animate-in fade-in duration-500 max-w-5xl mx-auto w-full">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-white/50 flex items-center justify-center text-orange-500 shadow-sm border border-orange-200/50">
            <Utensils className="w-7 h-7" />
          </div>
          Meals
        </h1>
        <p className="text-slate-500 text-lg mt-2">Pantau asupan makanan anak dan cegah makanan pantangan saat sakit.</p>
      </header>

      {/* Child Selector */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl p-4 border border-slate-200/50 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 w-full">
          <label className="font-bold text-slate-700 shrink-0 text-sm md:text-base">Pilih Anak:</label>
          
          {children.length === 0 ? (
            <span className="text-sm text-slate-400 italic py-2">Belum ada profil anak</span>
          ) : (
            <>
              {/* Mobile Dropdown */}
              <div className="relative w-full md:hidden">
                <select 
                  className="w-full appearance-none bg-white/80 backdrop-blur-md border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-sm"
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
              <div className="hidden md:flex gap-2 w-full">
                {children.map(child => (
                  <button
                    key={child.id}
                    type="button"
                    onClick={() => setActiveChildId(child.id)}
                    className={`shrink-0 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                      activeChildId === child.id 
                        ? "bg-orange-500 text-white shadow-md shadow-orange-500/20" 
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

      {!activeChildId ? (
        <div className="bg-white/50 backdrop-blur-sm rounded-3xl p-12 text-center border border-slate-200/50">
          <Utensils className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-700 mb-2">Pilih Profil Anak</h3>
          <p className="text-slate-500">Pilih profil anak di atas untuk mencatat asupan makanannya.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Form */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 border border-white/60 shadow-sm">
              <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Plus className="w-5 h-5 text-orange-500" />
                Catat Konsumsi
              </h2>
              
              <form onSubmit={handleAddFood} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Nama Makanan/Minuman</label>
                  <input 
                    type="text" 
                    value={foodName}
                    onChange={(e) => setFoodName(e.target.value)}
                    placeholder="Contoh: Susu Cokelat, Nasi Goreng" 
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 rounded-xl px-4 py-3 text-slate-900 transition-all outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Jam Konsumsi</label>
                  <input 
                    type="time" 
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 rounded-xl px-4 py-3 text-slate-900 transition-all outline-none"
                  />
                </div>
                
                <button 
                  type="submit"
                  disabled={!foodName || !time}
                  className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl font-bold shadow-lg shadow-orange-500/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Simpan Catatan
                </button>
              </form>
            </div>

            {/* Warning Dialog */}
            {showWarning && (
              <div className="bg-red-50/90 backdrop-blur-md rounded-3xl p-6 border border-red-100 shadow-sm relative animate-in fade-in zoom-in-95 duration-300">
                <button 
                  onClick={() => setShowWarning(null)}
                  className="absolute top-4 right-4 text-red-400 hover:text-red-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0 text-red-600 mt-1">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-red-900 text-lg mb-1">Peringatan Pantangan!</h3>
                    <p className="text-red-800 text-sm mb-3">
                      Makanan yang baru saja Anda catat mengandung bahan yang dilarang untuk gejala <strong className="bg-red-200/50 px-1.5 py-0.5 rounded">{showWarning.symptom}</strong> yang sedang dialami {activeChild?.name}.
                    </p>
                    <div className="bg-white/60 rounded-xl p-3 border border-red-100">
                      <p className="text-sm text-red-900 font-medium">Saran Perawatan:</p>
                      <p className="text-xs text-red-700 mt-1 leading-relaxed">{showWarning.advice}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* History */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] h-full min-h-[500px]">
              <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Clock className="w-5 h-5 text-slate-400" />
                Riwayat Konsumsi Makanan
              </h2>

              {activeFoodLogs.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                  <Utensils className="w-12 h-12 mb-3 opacity-20" />
                  <p>Belum ada catatan makanan untuk anak ini.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeFoodLogs.slice().reverse().map(log => (
                    <div key={log.id} className="flex items-center justify-between p-4 bg-slate-50/80 rounded-2xl border border-slate-100 hover:border-orange-200 transition-colors group">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center shrink-0 text-orange-500 border border-orange-200/50">
                          <Utensils className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-lg">{log.foodName}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-sm font-medium text-slate-500 bg-white px-2 py-0.5 rounded-md shadow-sm border border-slate-200">
                              {log.time}
                            </span>
                            <span className="text-sm text-slate-400">{log.date}<DateTag date={log.date} /></span>
                          </div>
                          {log.notes === "Berpotensi memperburuk gejala." && (
                            <span className="inline-flex items-center gap-1 mt-2 text-[10px] font-bold text-red-600 bg-red-50 border border-red-100 px-2 py-0.5 rounded-full">
                              <AlertTriangle className="w-3 h-3" />
                              Melanggar Pantangan
                            </span>
                          )}
                        </div>
                      </div>
                      <button 
                        onClick={() => deleteFoodLog(log.id)}
                        className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                        title="Hapus"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
