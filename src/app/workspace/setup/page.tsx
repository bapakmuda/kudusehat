import { Users, Save } from "lucide-react";
import Link from "next/link";

export default function WorkspaceSetup() {
  return (
    <div className="min-h-screen bg-slate-50 #0a0f1c] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 ">
            Setup Family Workspace
          </h2>
          <p className="mt-2 text-slate-600 ">
            Buat ruang lingkup kesehatan keluarga Anda.
          </p>
        </div>

        <div className="bg-white shadow-xl shadow-slate-200/50 sm:rounded-3xl border border-slate-100 p-8">
          <form className="space-y-6" action="/dashboard">
            <div>
              <label className="block text-sm font-medium text-slate-700 ">
                Nama Keluarga / Workspace
              </label>
              <input
                type="text"
                required
                className="mt-2 appearance-none block w-full px-4 py-3 border border-slate-300 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-transparent transition-all"
                placeholder="Keluarga bahagia..."
              />
            </div>
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700 ">
                  Zona Waktu
                </label>
                <select
                  className="mt-2 block w-full px-4 py-3 border border-slate-300 rounded-xl shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-transparent transition-all"
                >
                  <option>Waktu Indonesia Barat (WIB)</option>
                  <option>Waktu Indonesia Tengah (WITA)</option>
                  <option>Waktu Indonesia Timur (WIT)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 ">
                  Kanal Notifikasi Default
                </label>
                <select
                  className="mt-2 block w-full px-4 py-3 border border-slate-300 rounded-xl shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-transparent transition-all"
                >
                  <option>Web Push Notification</option>
                  <option>WhatsApp (Jika tersedia)</option>
                </select>
              </div>
            </div>
            
            <div className="pt-6 border-t border-slate-200 flex justify-end">
              <button
                type="submit"
                className="inline-flex justify-center items-center py-3 px-6 border border-transparent shadow-sm text-sm font-medium rounded-xl text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all hover:shadow-lg hover:shadow-primary-500/30"
              >
                <Save className="w-4 h-4 mr-2" />
                Simpan & Lanjut ke Dashboard
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
