import React, { useState } from 'react';
import { CatatanAyam } from '../types';
import {
  Plus,
  Trash2,
  Calendar,
  Egg,
  Utensils,
  Users,
  TrendingUp,
  Tag,
} from 'lucide-react';
import { AyamSmartAdvisor } from './AyamSmartAdvisor';

interface Props {
  ayamList: CatatanAyam[];
  onAdd: (data: Omit<CatatanAyam, 'id' | 'created_at'>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  isRealtimeActive: boolean;
}

export const AyamSection: React.FC<Props> = ({
  ayamList,
  onAdd,
  onDelete,
  isRealtimeActive,
}) => {
  const todayStr = new Date().toISOString().slice(0, 10);

  // Form states - sederhana & mudah diisi
  const [tanggal, setTanggal] = useState(todayStr);
  const [jumlahAyam, setJumlahAyam] = useState<string>('120');
  const [pakanKg, setPakanKg] = useState<string>('15');
  const [jumlahTelur, setJumlahTelur] = useState<string>('102');
  const [jenisAyam, setJenisAyam] = useState<string>('Ayam Petelur');
  const [catatan, setCatatan] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Perhitungan statistik utama
  const latestRecord = ayamList.length > 0 ? ayamList[0] : null;
  const currentPopulasi = latestRecord ? latestRecord.jumlah_ayam : 0;
  const todayRecord = ayamList.find((r) => r.tanggal === todayStr) || latestRecord;
  const telurHariIni = todayRecord ? todayRecord.jumlah_telur : 0;
  const pakanHariIni = todayRecord ? todayRecord.pakan_kg : 0;
  const productivityRate =
    currentPopulasi > 0 ? Math.round((telurHariIni / currentPopulasi) * 100) : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tanggal || !jumlahAyam || !pakanKg || !jumlahTelur) return;

    try {
      setIsSubmitting(true);
      await onAdd({
        tanggal,
        jumlah_ayam: parseInt(jumlahAyam, 10) || 0,
        pakan_kg: parseFloat(pakanKg) || 0,
        jumlah_telur: parseInt(jumlahTelur, 10) || 0,
        jenis_ayam: jenisAyam.trim() || 'Ayam Petelur',
        catatan: catatan.trim(),
      });
      setCatatan('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Hapus catatan ayam ini?')) {
      try {
        setDeletingId(id);
        await onDelete(id);
      } finally {
        setDeletingId(null);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* 4 KARTU STATISTIK UTAMA */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Total Populasi</span>
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black text-slate-800">{currentPopulasi}</span>
            <span className="text-xs text-slate-500">ekor</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Telur Hari Ini</span>
            <Egg className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black text-amber-600">{telurHariIni}</span>
            <span className="text-xs text-slate-500">butir</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Pakan Hari Ini</span>
            <Utensils className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black text-emerald-600">{pakanHariIni}</span>
            <span className="text-xs text-slate-500">kg</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Produktivitas</span>
            <TrendingUp className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black text-indigo-600">{productivityRate}%</span>
            <span className="text-xs text-slate-500">rasio telur</span>
          </div>
        </div>
      </div>

      {/* MONITORING & PREDIKSI CERDAS AYAM */}
      <AyamSmartAdvisor ayamList={ayamList} />

      {/* FORM INPUT CATATAN AYAM (SIMPEL & CEPAT) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Tambah Catatan Harian Ayam</h3>
              <p className="text-xs text-slate-500">Catat jumlah pakan dan hasil panen telur</p>
            </div>
          </div>
          <span className="text-xs font-medium px-2 py-1 rounded bg-slate-100 text-slate-600">
            Form Simpel
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tanggal Catatan
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={tanggal}
                  onChange={(e) => setTanggal(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Jumlah Ayam (Ekor)
              </label>
              <input
                type="number"
                min="0"
                value={jumlahAyam}
                onChange={(e) => setJumlahAyam(e.target.value)}
                placeholder="Contoh: 120"
                required
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Pakan Harian (Kg)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={pakanKg}
                onChange={(e) => setPakanKg(e.target.value)}
                placeholder="Contoh: 15"
                required
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Jumlah Telur (Butir)
              </label>
              <input
                type="number"
                min="0"
                value={jumlahTelur}
                onChange={(e) => setJumlahTelur(e.target.value)}
                placeholder="Contoh: 102"
                required
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Jenis / Ras Ayam (Opsional)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={jenisAyam}
                  onChange={(e) => setJenisAyam(e.target.value)}
                  placeholder="Contoh: Ayam Petelur, Isa Brown, KUB"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                />
              </div>
              <div className="flex flex-wrap gap-1 mt-1.5">
                {['Ayam Petelur', 'Isa Brown', 'Lohmann', 'Ayam KUB'].map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setJenisAyam(opt)}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 transition border border-slate-200"
                  >
                    + {opt}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Catatan Tambahan (Opsional)
              </label>
              <input
                type="text"
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                placeholder="Contoh: Cuaca cerah, nafsu makan bagus..."
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition shadow-xs flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span>{isSubmitting ? 'Menyimpan...' : 'Simpan Catatan Ayam'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* RIWAYAT CATATAN AYAM */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-500" />
            <h4 className="font-bold text-sm text-slate-800">Riwayat Catatan Ayam</h4>
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-semibold">
              {ayamList.length} catatan
            </span>
          </div>

          {isRealtimeActive && (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Real-time Aktif
            </span>
          )}
        </div>

        {ayamList.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            <Egg className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm font-medium">Belum ada catatan ayam tersimpan.</p>
            <p className="text-xs text-slate-400 mt-1">
              Gunakan formulir di atas untuk mencatat data harian kandang ayam Anda.
            </p>
          </div>
        ) : (
          <div>
            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Tanggal</th>
                    <th className="py-3 px-4">Jenis Ayam</th>
                    <th className="py-3 px-4 text-right">Populasi</th>
                    <th className="py-3 px-4 text-right">Pakan (Kg)</th>
                    <th className="py-3 px-4 text-right">Pakan/Ekor</th>
                    <th className="py-3 px-4 text-right">Telur (Butir)</th>
                    <th className="py-3 px-4 text-right">Produktivitas</th>
                    <th className="py-3 px-4">Catatan</th>
                    <th className="py-3 px-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {ayamList.map((item) => {
                    const pop = item.jumlah_ayam || 0;
                    const pakan = item.pakan_kg || 0;
                    const telur = item.jumlah_telur || 0;
                    const gramPerEkor = pop > 0 ? Math.round((pakan * 1000) / pop) : 0;
                    const prodRate = pop > 0 ? Math.round((telur / pop) * 100) : 0;

                    return (
                      <tr key={item.id} className="hover:bg-slate-50 transition">
                        <td className="py-3 px-4 font-bold text-slate-800 whitespace-nowrap">
                          {item.tanggal}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-semibold">
                            {item.jenis_ayam || 'Ayam Petelur'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-semibold text-slate-800">
                          {pop} ekor
                        </td>
                        <td className="py-3 px-4 text-right font-semibold text-emerald-700">
                          {pakan} kg
                        </td>
                        <td className="py-3 px-4 text-right text-slate-600">
                          {gramPerEkor} gr
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-amber-700">
                          {telur} butir
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span
                            className={`font-bold px-2 py-0.5 rounded-full text-[11px] ${
                              prodRate >= 80
                                ? 'bg-emerald-100 text-emerald-800'
                                : prodRate >= 65
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {prodRate}%
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-500 max-w-[180px] truncate">
                          {item.catatan || '-'}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => handleDelete(item.id)}
                            disabled={deletingId === item.id}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Hapus Catatan"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View (Sangat nyaman di gawai / layar HP) */}
            <div className="sm:hidden divide-y divide-slate-100">
              {ayamList.map((item) => {
                const pop = item.jumlah_ayam || 0;
                const pakan = item.pakan_kg || 0;
                const telur = item.jumlah_telur || 0;
                const prodRate = pop > 0 ? Math.round((telur / pop) * 100) : 0;
                const gramPerEkor = pop > 0 ? Math.round((pakan * 1000) / pop) : 0;

                return (
                  <div key={item.id} className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-800">{item.tanggal}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 font-semibold text-slate-600">
                          {item.jenis_ayam || 'Ayam Petelur'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        disabled={deletingId === item.id}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-2 py-1 text-center bg-slate-50 rounded-xl p-2">
                      <div>
                        <p className="text-[10px] text-slate-500 font-medium">Populasi</p>
                        <p className="text-xs font-bold text-slate-800">{pop} ekor</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-500 font-medium">Pakan</p>
                        <p className="text-xs font-bold text-emerald-700">
                          {pakan} kg <span className="text-[10px] text-slate-500 font-normal">({gramPerEkor}g)</span>
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-500 font-medium">Telur</p>
                        <p className="text-xs font-bold text-amber-700">
                          {telur} <span className="text-[10px] font-semibold text-indigo-600">({prodRate}%)</span>
                        </p>
                      </div>
                    </div>

                    {item.catatan && (
                      <p className="text-xs text-slate-500 italic">
                        "{item.catatan}"
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
