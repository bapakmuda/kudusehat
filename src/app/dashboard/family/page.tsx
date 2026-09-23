"use client";

import { useState } from "react";
import { Plus, UserCircle, Calendar, Edit2, CheckCircle2, X } from "lucide-react";
import { useFamily, ChildProfile } from "@/context/FamilyContext";

export default function FamilyAndChildren() {
  const { children, addChild, updateChild } = useFamily();

  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);

  // Fungsi untuk menghitung umur
  const calculateAge = (dateString: string) => {
    if (!dateString) return "";

    const today = new Date();
    const birthDate = new Date(dateString);

    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();

    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    if (age < 0) return "Belum lahir";
    if (age === 0) {
      const months = (today.getFullYear() - birthDate.getFullYear()) * 12 + (today.getMonth() - birthDate.getMonth());
      return `${months} Bulan`;
    }

    return `${age} Tahun`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !birthDate || !gender) return;

    if (editingId) {
      updateChild(editingId, { name, birthDate, gender });
      setEditingId(null);
    } else {
      addChild({ name, birthDate, gender });
    }

    setName("");
    setBirthDate("");
    setGender("");
  };

  const handleEditClick = (child: ChildProfile) => {
    setEditingId(child.id);
    setName(child.name);
    setBirthDate(child.birthDate);
    setGender(child.gender);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setName("");
    setBirthDate("");
    setGender("");
  };

  return (
    <div className="p-6 md:p-8 space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto">
      <header>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Family & Children</h1>
        <p className="text-slate-500 mt-1">Kelola profil anggota keluarga dan anak.</p>
      </header>

      {/* Form Tambah/Edit Anak */}
      <div className={`bg-white rounded-3xl p-6 md:p-8 border ${editingId ? 'border-primary-400 shadow-primary-500/10' : 'border-slate-100 shadow-slate-200/40'} shadow-xl transition-all duration-300`}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            {editingId ? (
              <><Edit2 className="w-5 h-5 text-primary-500" /> Edit Profil Anak</>
            ) : (
              <><Plus className="w-5 h-5 text-primary-500" /> Tambah Profil Anak Baru</>
            )}
          </h2>
          {editingId && (
            <button type="button" onClick={cancelEdit} className="text-sm font-medium text-slate-500 hover:text-slate-700 flex items-center gap-1">
              <X className="w-4 h-4" /> Batal Edit
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Nama Lengkap
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserCircle className="w-5 h-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="appearance-none block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-xl shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-transparent transition-all"
                  placeholder="Nama anak"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Jenis Kelamin
              </label>
              <select
                required
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="appearance-none block w-full px-4 py-3 border border-slate-300 rounded-xl shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-transparent transition-all"
              >
                <option value="" disabled>Pilih Jenis Kelamin</option>
                <option value="Laki-laki">Laki-laki</option>
                <option value="Perempuan">Perempuan</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Tanggal Lahir
              </label>
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="w-5 h-5 text-slate-400" />
                  </div>
                  <input
                    type="date"
                    required
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="appearance-none block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-xl shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-transparent transition-all"
                  />
                </div>

                <div className="bg-primary-50 px-6 py-3 rounded-xl border border-primary-100 flex items-center justify-center shrink-0 min-w-[150px]">
                  <span className="text-sm text-primary-700 font-medium mr-2">Umur:</span>
                  <span className="text-lg font-bold text-primary-600 ">
                    {birthDate ? calculateAge(birthDate) : "-"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center px-6 py-3 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all shadow-primary-500/30 hover:shadow-lg"
            >
              {editingId ? (
                <><CheckCircle2 className="w-4 h-4 mr-2" /> Simpan Perubahan</>
              ) : (
                <><Plus className="w-4 h-4 mr-2" /> Tambah Profil Anak</>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Daftar Anak */}
      <div>
        <h3 className="text-lg font-bold text-slate-900 mb-4">Daftar Anak</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {children.map((child) => (
            <div key={child.id} className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-all group">
              <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center shrink-0 text-2xl shadow-inner">
                {child.gender === "Laki-laki" ? "👦🏻" : "👧🏻"}
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-slate-900 group-hover:text-primary-600 transition-colors">{child.name}</h4>
                <div className="flex gap-2 text-xs mt-1 text-slate-500 ">
                  <span className="bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 ">{child.gender}</span>
                  <span className="bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 ">{calculateAge(child.birthDate)}</span>
                </div>
              </div>
              <button
                onClick={() => handleEditClick(child)}
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-primary-50 text-slate-400 hover:text-primary-600 transition-colors "
                title="Edit Profil"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
