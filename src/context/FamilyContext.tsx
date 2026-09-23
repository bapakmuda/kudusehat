"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export type ChildProfile = {
  id: string;
  name: string;
  birthDate: string;
  gender: string;
  weight?: string;
};

export type TemperatureLog = {
  id: string;
  childId: string;
  temperature: number;
  date: string;
  time: string;
  indication: "Hipotermia" | "Normal" | "Demam Ringan" | "Demam Tinggi";
};

export type SymptomLog = {
  id: string;
  childId: string;
  symptom: string;
  severity: "Ringan" | "Sedang" | "Berat";
  date: string;
  time: string;
  notes?: string;
};

export type Medication = {
  id: string;
  childId: string;
  name: string;
  medicationName?: string;
  type?: string;
  dosage: string;
  instructions: string;
  scheduleTime: string;
  status: "Belum Diberikan" | "Diberikan" | "Dilewati";
  givenCount?: number;
  frequency?: number;
};

export type FoodLog = {
  id: string;
  childId: string;
  foodName: string;
  date: string;
  time: string;
  notes?: string;
};

export type ChatMessage = {
  id: string;
  childId: string;
  sender: "ai" | "user";
  text: string;
  timestamp: string;
  createdAt?: string;
};

type FamilyContextType = {
  children: ChildProfile[];
  addChild: (child: Omit<ChildProfile, "id">) => Promise<void>;
  updateChild: (id: string, child: Omit<ChildProfile, "id">) => Promise<void>;
  deleteChild: (id: string) => Promise<void>;
  activeChildId: string | null;
  setActiveChildId: (id: string) => void;
  activeChild: ChildProfile | undefined;

  temperatureLogs: TemperatureLog[];
  addTemperatureLog: (log: Omit<TemperatureLog, "id" | "indication">) => Promise<void>;
  updateTemperatureLog: (id: string, log: Partial<Omit<TemperatureLog, "id" | "indication" | "childId">>) => Promise<void>;
  deleteTemperatureLog: (id: string) => Promise<void>;

  symptomLogs: SymptomLog[];
  addSymptomLog: (log: Omit<SymptomLog, "id">) => Promise<void>;
  updateSymptomLog: (id: string, log: Partial<Omit<SymptomLog, "id" | "childId">>) => Promise<void>;
  deleteSymptomLog: (id: string) => Promise<void>;

  medications: Medication[];
  addMedication: (med: Omit<Medication, "id" | "status">) => Promise<void>;
  updateMedication: (id: string, med: Omit<Medication, "id" | "status" | "childId" | "givenCount">) => Promise<void>;
  updateMedicationStatus: (id: string, status: "Diberikan" | "Dilewati") => Promise<void>;
  deleteMedication: (id: string) => Promise<void>;

  consultationLogs: ChatMessage[];
  addConsultationLog: (log: Omit<ChatMessage, "id">) => Promise<void>;

  foodLogs: FoodLog[];
  addFoodLog: (log: Omit<FoodLog, "id">) => Promise<void>;
  deleteFoodLog: (id: string) => Promise<void>;

  isLoading: boolean;
};

const FamilyContext = createContext<FamilyContextType | undefined>(undefined);

export function FamilyProvider({ children: reactChildren }: { children: React.ReactNode }) {
  const [children, setChildren] = useState<ChildProfile[]>([]);
  const [activeChildId, setActiveChildId] = useState<string | null>(null);
  const [temperatureLogs, setTemperatureLogs] = useState<TemperatureLog[]>([]);
  const [symptomLogs, setSymptomLogs] = useState<SymptomLog[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [consultationLogs, setConsultationLogs] = useState<ChatMessage[]>([]);
  const [foodLogs, setFoodLogs] = useState<FoodLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load all data from database on mount
  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    try {
      const [
        childrenRes,
        tempRes,
        symptomRes,
        medRes,
        foodRes,
        consultRes,
      ] = await Promise.all([
        fetch("/api/children"),
        fetch("/api/logs/temperature"),
        fetch("/api/logs/symptoms"),
        fetch("/api/medications"),
        fetch("/api/foods"),
        fetch("/api/consultations"),
      ]);

      const [
        childrenData,
        tempData,
        symptomData,
        medData,
        foodData,
        consultData,
      ] = await Promise.all([
        childrenRes.json(),
        tempRes.json(),
        symptomRes.json(),
        medRes.json(),
        foodRes.json(),
        consultRes.json(),
      ]);

      setChildren(childrenData);
      if (childrenData.length > 0) {
        setActiveChildId((prev) => prev || childrenData[0].id);
      }
      setTemperatureLogs(tempData);
      setSymptomLogs(symptomData);
      setMedications(medData.map((m: Medication) => ({ ...m, medicationName: m.medicationName || m.name })));
      setFoodLogs(foodData);
      setConsultationLogs(consultData);
    } catch (e) {
      console.error("Failed to load data:", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // ---- Children ----
  const addChild = async (child: Omit<ChildProfile, "id">) => {
    const res = await fetch("/api/children", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(child),
    });
    const newChild = await res.json();
    setChildren((prev) => {
      const updated = [...prev, newChild];
      if (updated.length === 1) setActiveChildId(newChild.id);
      return updated;
    });
  };

  const updateChild = async (id: string, child: Omit<ChildProfile, "id">) => {
    const res = await fetch(`/api/children/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(child),
    });
    const updated = await res.json();
    setChildren((prev) => prev.map((c) => (c.id === id ? updated : c)));
  };

  const deleteChild = async (id: string) => {
    await fetch(`/api/children/${id}`, { method: "DELETE" });
    setChildren((prev) => {
      const remaining = prev.filter((c) => c.id !== id);
      if (activeChildId === id) {
        setActiveChildId(remaining[0]?.id || null);
      }
      return remaining;
    });
    // Cascade: clear related local state
    setTemperatureLogs((prev) => prev.filter((l) => l.childId !== id));
    setSymptomLogs((prev) => prev.filter((l) => l.childId !== id));
    setMedications((prev) => prev.filter((m) => m.childId !== id));
    setFoodLogs((prev) => prev.filter((f) => f.childId !== id));
    setConsultationLogs((prev) => prev.filter((c) => c.childId !== id));
  };

  // ---- Temperature ----
  const addTemperatureLog = async (log: Omit<TemperatureLog, "id" | "indication">) => {
    const res = await fetch("/api/logs/temperature", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(log),
    });
    const newLog = await res.json();
    setTemperatureLogs((prev) => [...prev, newLog]);
  };

  const updateTemperatureLog = async (id: string, log: Partial<Omit<TemperatureLog, "id" | "indication" | "childId">>) => {
    const res = await fetch("/api/logs/temperature", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...log }),
    });
    if (res.ok) {
      const updated = await res.json();
      setTemperatureLogs((prev) => prev.map((l) => l.id === id ? updated : l));
    }
  };

  const deleteTemperatureLog = async (id: string) => {
    await fetch(`/api/logs/temperature?id=${id}`, { method: "DELETE" });
    setTemperatureLogs((prev) => prev.filter((t) => t.id !== id));
  };

  // ---- Symptoms ----
  const addSymptomLog = async (log: Omit<SymptomLog, "id">) => {
    const res = await fetch("/api/logs/symptoms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(log),
    });
    const newLog = await res.json();
    setSymptomLogs((prev) => [...prev, newLog]);
  };

  const updateSymptomLog = async (id: string, log: Partial<Omit<SymptomLog, "id" | "childId">>) => {
    const res = await fetch("/api/logs/symptoms", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...log }),
    });
    if (res.ok) {
      const updated = await res.json();
      setSymptomLogs((prev) => prev.map((l) => l.id === id ? updated : l));
    }
  };

  const deleteSymptomLog = async (id: string) => {
    await fetch(`/api/logs/symptoms?id=${id}`, { method: "DELETE" });
    setSymptomLogs((prev) => prev.filter((s) => s.id !== id));
  };

  // ---- Medications ----
  const addMedication = async (med: Omit<Medication, "id" | "status">) => {
    const res = await fetch("/api/medications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(med),
    });
    const newMed = await res.json();
    setMedications((prev) => {
      const exists = prev.find(m => m.id === newMed.id);
      if (exists) {
        return prev.map(m => m.id === newMed.id ? { ...newMed, medicationName: newMed.medicationName || newMed.name } : m);
      }
      return [...prev, { ...newMed, medicationName: newMed.medicationName || newMed.name }];
    });
  };

  const updateMedication = async (id: string, med: Omit<Medication, "id" | "status" | "childId" | "givenCount">) => {
    const res = await fetch("/api/medications", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...med }),
    });
    const updated = await res.json();
    setMedications((prev) => prev.map((m) => (m.id === id ? { ...updated, medicationName: updated.medicationName || updated.name } : m)));
  };

  const updateMedicationStatus = async (id: string, status: "Diberikan" | "Dilewati") => {
    const res = await fetch("/api/medications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    const updated = await res.json();
    setMedications((prev) => prev.map((m) => (m.id === id ? { ...updated, medicationName: updated.medicationName || updated.name } : m)));
  };

  const deleteMedication = async (id: string) => {
    await fetch(`/api/medications?id=${id}`, { method: "DELETE" });
    setMedications((prev) => prev.filter((m) => m.id !== id));
  };

  // ---- Consultations ----
  const addConsultationLog = async (log: Omit<ChatMessage, "id">) => {
    const res = await fetch("/api/consultations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(log),
    });
    const newLog = await res.json();
    setConsultationLogs((prev) => [...prev, newLog]);
  };

  // ---- Food ----
  const addFoodLog = async (log: Omit<FoodLog, "id">) => {
    const res = await fetch("/api/foods", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(log),
    });
    const newLog = await res.json();
    setFoodLogs((prev) => [...prev, newLog]);
  };

  const deleteFoodLog = async (id: string) => {
    await fetch(`/api/foods?id=${id}`, { method: "DELETE" });
    setFoodLogs((prev) => prev.filter((f) => f.id !== id));
  };

  const activeChild = children.find((c) => c.id === activeChildId);

  return (
    <FamilyContext.Provider
      value={{
        children,
        addChild,
        updateChild,
        deleteChild,
        activeChildId,
        setActiveChildId,
        activeChild,
        temperatureLogs,
        addTemperatureLog,
        updateTemperatureLog,
        deleteTemperatureLog,
        symptomLogs,
        addSymptomLog,
        updateSymptomLog,
        deleteSymptomLog,
        medications,
        addMedication,
        updateMedication,
        updateMedicationStatus,
        deleteMedication,
        consultationLogs,
        addConsultationLog,
        foodLogs,
        addFoodLog,
        deleteFoodLog,
        isLoading,
      }}
    >
      {reactChildren}
    </FamilyContext.Provider>
  );
}

export function useFamily() {
  const context = useContext(FamilyContext);
  if (context === undefined) {
    throw new Error("useFamily must be used within a FamilyProvider");
  }
  return context;
}
