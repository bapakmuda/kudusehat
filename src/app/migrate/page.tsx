"use client";

import { useState } from "react";
import { Database, CheckCircle, AlertCircle, Loader2, ArrowRight } from "lucide-react";

type MigrationResult = {
  children: number;
  temperatureLogs: number;
  symptomLogs: number;
  medications: number;
  foodLogs: number;
  consultationLogs: number;
  errors: string[];
};

export default function MigratePage() {
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<MigrationResult | null>(null);
  const [done, setDone] = useState(false);

  const runMigration = async () => {
    setIsRunning(true);
    const res: MigrationResult = {
      children: 0,
      temperatureLogs: 0,
      symptomLogs: 0,
      medications: 0,
      foodLogs: 0,
      consultationLogs: 0,
      errors: [],
    };

    try {
      // --- 1. Migrate Children ---
      const rawChildren = localStorage.getItem("kidscare_children");
      const oldChildren: any[] = rawChildren ? JSON.parse(rawChildren) : [];
      const idMap: Record<string, string> = {}; // old id -> new db id

      for (const child of oldChildren) {
        try {
          const r = await fetch("/api/children", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: child.name,
              birthDate: child.birthDate,
              gender: child.gender,
              weight: child.weight,
            }),
          });
          const newChild = await r.json();
          idMap[child.id] = newChild.id;
          res.children++;
        } catch (e: any) {
          res.errors.push(`Child ${child.name}: ${e.message}`);
        }
      }

      // --- 2. Migrate Temperature Logs ---
      const rawTemps = localStorage.getItem("kidscare_temperature_logs");
      const oldTemps: any[] = rawTemps ? JSON.parse(rawTemps) : [];
      for (const log of oldTemps) {
        const newChildId = idMap[log.childId];
        if (!newChildId) continue;
        try {
          await fetch("/api/logs/temperature", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              childId: newChildId,
              temperature: log.temperature,
              date: log.date,
              time: log.time,
            }),
          });
          res.temperatureLogs++;
        } catch (e: any) {
          res.errors.push(`TempLog: ${e.message}`);
        }
      }

      // --- 3. Migrate Symptom Logs ---
      const rawSymptoms = localStorage.getItem("kidscare_symptom_logs");
      const oldSymptoms: any[] = rawSymptoms ? JSON.parse(rawSymptoms) : [];
      for (const log of oldSymptoms) {
        const newChildId = idMap[log.childId];
        if (!newChildId) continue;
        try {
          await fetch("/api/logs/symptoms", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              childId: newChildId,
              symptom: log.symptom,
              severity: log.severity,
              date: log.date,
              time: log.time,
              notes: log.notes,
            }),
          });
          res.symptomLogs++;
        } catch (e: any) {
          res.errors.push(`SymptomLog: ${e.message}`);
        }
      }

      // --- 4. Migrate Medications ---
      const rawMeds = localStorage.getItem("kidscare_medications");
      const oldMeds: any[] = rawMeds ? JSON.parse(rawMeds) : [];
      for (const med of oldMeds) {
        const newChildId = idMap[med.childId];
        if (!newChildId) continue;
        try {
          await fetch("/api/medications", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              childId: newChildId,
              name: med.name || med.medicationName,
              medicationName: med.medicationName || med.name,
              type: med.type,
              dosage: med.dosage,
              instructions: med.instructions || "",
              scheduleTime: med.scheduleTime,
            }),
          });
          res.medications++;
        } catch (e: any) {
          res.errors.push(`Medication: ${e.message}`);
        }
      }

      // --- 5. Migrate Food Logs ---
      const rawFoods = localStorage.getItem("kidscare_foods");
      const oldFoods: any[] = rawFoods ? JSON.parse(rawFoods) : [];
      for (const food of oldFoods) {
        const newChildId = idMap[food.childId];
        if (!newChildId) continue;
        try {
          await fetch("/api/foods", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              childId: newChildId,
              foodName: food.foodName,
              date: food.date,
              time: food.time,
              notes: food.notes,
            }),
          });
          res.foodLogs++;
        } catch (e: any) {
          res.errors.push(`FoodLog: ${e.message}`);
        }
      }

      // --- 6. Migrate Consultation Logs ---
      const rawConsults = localStorage.getItem("kidscare_consultation_logs");
      const oldConsults: any[] = rawConsults ? JSON.parse(rawConsults) : [];
      for (const log of oldConsults) {
        const newChildId = idMap[log.childId];
        if (!newChildId) continue;
        try {
          await fetch("/api/consultations", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              childId: newChildId,
              sender: log.sender,
              text: log.text,
              timestamp: log.timestamp,
            }),
          });
          res.consultationLogs++;
        } catch (e: any) {
          res.errors.push(`ConsultLog: ${e.message}`);
        }
      }
    } catch (e: any) {
      res.errors.push(`Fatal: ${e.message}`);
    }

    setResult(res);
    setDone(true);
    setIsRunning(false);
  };

  const totalMigrated =
    (result?.children ?? 0) +
    (result?.temperatureLogs ?? 0) +
    (result?.symptomLogs ?? 0) +
    (result?.medications ?? 0) +
    (result?.foodLogs ?? 0) +
    (result?.consultationLogs ?? 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/30">
            <Database className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Migrasi Data</h1>
          <p className="text-slate-500 mt-2">
            Pindahkan semua data lama dari browser ke database secara otomatis.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-slate-100 shadow-xl p-8">
          {!done ? (
            <>
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6">
                <p className="text-sm text-amber-800 font-medium">
                  ⚠️ Pastikan Anda menjalankan ini hanya <strong>sekali</strong> dan dari browser yang sama yang pernah Anda gunakan sebelumnya, agar data lama terbaca dari memori browser.
                </p>
              </div>

              <div className="space-y-3 mb-6 text-sm text-slate-600">
                {[
                  "Profil Anak",
                  "Riwayat Suhu",
                  "Riwayat Gejala & Diagnosa",
                  "Jadwal Obat",
                  "Catatan Meals",
                  "Riwayat Konsultasi AI",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-400" />
                    {item}
                  </div>
                ))}
              </div>

              <button
                onClick={runMigration}
                disabled={isRunning}
                className="w-full flex items-center justify-center gap-3 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-blue-500/20 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isRunning ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Sedang Memindahkan Data...
                  </>
                ) : (
                  <>
                    <Database className="w-5 h-5" />
                    Mulai Migrasi Sekarang
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </>
          ) : (
            <>
              {/* Result */}
              <div className={`rounded-2xl p-5 mb-6 ${result?.errors.length === 0 ? "bg-green-50 border border-green-200" : "bg-amber-50 border border-amber-200"}`}>
                <div className="flex items-center gap-3 mb-2">
                  {result?.errors.length === 0
                    ? <CheckCircle className="w-6 h-6 text-green-600" />
                    : <AlertCircle className="w-6 h-6 text-amber-600" />
                  }
                  <span className="font-bold text-slate-900">
                    {result?.errors.length === 0 ? "Migrasi Berhasil!" : "Migrasi Selesai dengan Peringatan"}
                  </span>
                </div>
                <p className="text-sm text-slate-600">
                  Total <strong>{totalMigrated} data</strong> berhasil dipindahkan ke database.
                </p>
              </div>

              <div className="space-y-2 mb-6">
                {[
                  { label: "Profil Anak", count: result?.children ?? 0 },
                  { label: "Riwayat Suhu", count: result?.temperatureLogs ?? 0 },
                  { label: "Riwayat Gejala", count: result?.symptomLogs ?? 0 },
                  { label: "Jadwal Obat", count: result?.medications ?? 0 },
                  { label: "Catatan Meals", count: result?.foodLogs ?? 0 },
                  { label: "Riwayat Konsultasi", count: result?.consultationLogs ?? 0 },
                ].map((row) => (
                  <div key={row.label} className="flex justify-between items-center py-2 border-b border-slate-100">
                    <span className="text-sm text-slate-600">{row.label}</span>
                    <span className={`text-sm font-bold px-2 py-0.5 rounded-lg ${row.count > 0 ? "text-green-700 bg-green-100" : "text-slate-400 bg-slate-100"}`}>
                      {row.count} data
                    </span>
                  </div>
                ))}
              </div>

              {result && result.errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-6 text-xs text-red-700 space-y-1">
                  {result.errors.map((e, i) => <p key={i}>• {e}</p>)}
                </div>
              )}

              <a
                href="/dashboard"
                className="w-full flex items-center justify-center gap-3 py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-green-500/20"
              >
                <CheckCircle className="w-5 h-5" />
                Buka Dashboard
              </a>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
