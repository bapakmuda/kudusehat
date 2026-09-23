"use client";

import { useState } from "react";
import { BrainCircuit, Sparkles, AlertTriangle, FileText, ChevronRight, Activity, Thermometer, Calendar } from "lucide-react";
import { useFamily } from "@/context/FamilyContext";

export default function AISummaryPage() {
  const { children, activeChildId, setActiveChildId, temperatureLogs, symptomLogs, medications } = useFamily();
  const [isGenerating, setIsGenerating] = useState(false);
  const [summary, setSummary] = useState<any>(null);

  const activeChild = children.find(c => c.id === activeChildId);

  const handleGenerateSummary = () => {
    if (!activeChildId) return;
    setIsGenerating(true);
    
    // Simulate AI Generation Delay
    setTimeout(() => {
      setIsGenerating(false);
      setSummary({
        status: "Membaik", // Membaik, Perlu Perhatian, Kritis
        summaryText: `Berdasarkan data 3 hari terakhir, kondisi ${activeChild?.name} terlihat membaik. Suhu tertinggi sempat mencapai 38.5°C namun sekarang sudah stabil di angka normal (36.5°C). Gejala batuk berdahak masih tercatat namun intensitasnya terpantau menurun sejak pemberian Paracetamol secara teratur.`,
        recommendations: [
          "Lanjutkan pemberian obat Paracetamol sesuai jadwal jika suhu kembali naik di atas 37.8°C.",
          "Pastikan asupan cairan (air putih/susu) tercukupi untuk mencegah dehidrasi.",
          "Pantau apakah batuk berdahak semakin sering saat malam hari."
        ],
        questionsForDoctor: [
          "Dok, apakah perlu tambahan obat pengencer dahak jika batuknya masih ada setelah 5 hari?",
          "Berapa lama batas aman mengkonsumsi obat penurun panas secara terus menerus?"
        ]
      });
    }, 2500);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Membaik": return "text-green-600 bg-green-50 border-green-200";
      case "Perlu Perhatian": return "text-orange-600 bg-orange-50 border-orange-200";
      default: return "text-red-600 bg-red-50 border-red-200";
    }
  };

  const activeTemps = temperatureLogs.filter(l => l.childId === activeChildId).length;
  const activeSymptoms = symptomLogs.filter(l => l.childId === activeChildId).length;
  const activeMeds = medications.filter(l => l.childId === activeChildId).length;

  return (
    <div className="p-6 md:p-8 space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
      <header>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <BrainCircuit className="w-8 h-8 text-indigo-500" />
          AI Health Summary
        </h1>
        <p className="text-slate-500 mt-1">Dapatkan ringkasan kondisi dan saran cerdas berdasarkan data yang Anda catat.</p>
      </header>

      {/* Child Selector */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl p-4 border border-slate-200/50 shadow-sm flex flex-col md:flex-row items-start md:items-center gap-4">
        <label className="font-bold text-slate-700 shrink-0">Analisis untuk:</label>
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full snap-x">
          {children.map(child => (
            <button
              key={child.id}
              type="button"
              onClick={() => {
                setActiveChildId(child.id);
                setSummary(null); // Reset summary when changing child
              }}
              className={`snap-start px-4 py-2 rounded-xl text-sm font-bold transition-all shrink-0 ${
                activeChildId === child.id 
                  ? "bg-primary-600 text-white shadow-md shadow-primary-500/20" 
                  : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
              }`}
            >
              {child.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Kolom Kiri: AI Generator & Data Stats */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-8 shadow-xl shadow-indigo-500/20 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>
            
            <BrainCircuit className="w-12 h-12 mb-4 text-indigo-100" />
            <h2 className="text-2xl font-bold mb-2">Minta AI Merangkum</h2>
            <p className="text-indigo-100 mb-8 text-sm">
              AI kami akan membaca seluruh catatan suhu, gejala, dan obat anak Anda untuk menyusun laporan cerdas.
            </p>

            <button
              onClick={handleGenerateSummary}
              disabled={isGenerating || !activeChildId}
              className="w-full flex items-center justify-center gap-2 bg-white text-indigo-600 font-bold py-4 px-6 rounded-xl shadow-lg hover:bg-indigo-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {isGenerating ? (
                <>
                  <Sparkles className="w-5 h-5 animate-spin" />
                  AI Sedang Berpikir...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  Generate Summary
                </>
              )}
            </button>
          </div>

          <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 border border-slate-200/50 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4">Data yang akan dianalisis:</h3>
            <ul className="space-y-3">
              <li className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-slate-600"><Thermometer className="w-4 h-4 text-orange-500"/> Catatan Suhu</span>
                <span className="font-bold text-slate-900">{activeTemps} Data</span>
              </li>
              <li className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-slate-600"><Activity className="w-4 h-4 text-indigo-500"/> Catatan Gejala</span>
                <span className="font-bold text-slate-900">{activeSymptoms} Data</span>
              </li>
              <li className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-slate-600"><Calendar className="w-4 h-4 text-blue-500"/> Jadwal Obat</span>
                <span className="font-bold text-slate-900">{activeMeds} Data</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Kolom Kanan: AI Result */}
        <div className="lg:col-span-8 h-full">
          {summary ? (
            <div className="bg-white rounded-3xl p-8 border border-indigo-100 shadow-xl shadow-indigo-500/5 h-full animate-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-start justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-indigo-500" />
                    Hasil Analisis AI
                  </h2>
                  <p className="text-slate-500 mt-1">Untuk {activeChild?.name} • Dibuat baru saja</p>
                </div>
                <div className={`px-4 py-2 rounded-xl border font-bold flex items-center gap-2 ${getStatusColor(summary.status)}`}>
                  <div className="w-2 h-2 rounded-full bg-current animate-pulse"></div>
                  {summary.status}
                </div>
              </div>

              <div className="prose prose-slate max-w-none">
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 mb-8">
                  <p className="text-slate-700 leading-relaxed font-medium m-0">
                    {summary.summaryText}
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-orange-500" />
                      Rekomendasi Pemantauan
                    </h3>
                    <ul className="space-y-3">
                      {summary.recommendations.map((rec: string, i: number) => (
                        <li key={i} className="flex items-start gap-3">
                          <ChevronRight className="w-5 h-5 text-primary-500 shrink-0 mt-0.5" />
                          <span className="text-slate-600 text-sm leading-relaxed">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-blue-500" />
                      Pertanyaan untuk Dokter
                    </h3>
                    <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
                      <p className="text-sm text-blue-700 mb-4">
                        Jika Anda berencana konsultasi, tanyakan hal berikut:
                      </p>
                      <ul className="space-y-3">
                        {summary.questionsForDoctor.map((q: string, i: number) => (
                          <li key={i} className="flex items-start gap-3">
                            <div className="w-5 h-5 rounded-full bg-blue-200 text-blue-700 flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">{i+1}</div>
                            <span className="text-blue-900 font-medium text-sm leading-relaxed">{q}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 pt-6 border-t border-slate-100">
                <p className="text-xs text-slate-400 text-center">
                  <strong>Disclaimer:</strong> Analisis ini dihasilkan oleh AI (Simulasi) dan tidak dapat menggantikan diagnosis dari dokter atau tenaga kesehatan profesional.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-white/50 backdrop-blur-sm rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-12 h-full min-h-[400px]">
              <BrainCircuit className="w-16 h-16 text-slate-300 mb-4" />
              <h3 className="text-xl font-bold text-slate-400 mb-2">Belum ada analisis</h3>
              <p className="text-slate-500 text-center max-w-sm">
                Tekan tombol "Generate Summary" di sebelah kiri untuk meminta AI merangkum seluruh catatan kesehatan {activeChild?.name || 'anak'}.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
