import React, { useState } from 'react';
import { CatatanAyam } from '../types';
import { Plus, Trash2, Calendar, Egg, Utensils, Users, Sparkles, TrendingUp } from 'lucide-react';
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
  const [tanggal, setTanggal] = useState(todayStr);
  const [jumlahAyam, setJumlahAyam] = useState<string>('120');
  const [pakanKg, setPakanKg] = useState<string>('15');
  const [jumlahTelur, setJumlahTelur] = useState<string>('98');
  const [catatan, setCatatan] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Statistics
  const latestRecord = ayamList.length > 0 ? ayamList[0] : null;
  const currentPopulasi = latestRecord ? latestRecord.jumlah_ayam : 0;
  
  // Find today's record or fallback to latest
  const todayRecord = ayamList.find((r) => r.tanggal === todayStr) || latestRecord;
  const telurHariIni = todayRecord ? todayRecord.jumlah_telur : 0;
  const pakanHariIni = todayRecord ? todayRecord.pakan_kg : 0;
  const productivityRate =
    currentPopulasi > 0 ? Math.round((telurHariIni / currentPopulasi) * 100) : 0;

  const totalTelurSemua = ayamList.reduce((acc, c) => acc + (Number(c.jumlah_telur) || 0), 0);
  const totalPakanSemua = ayamList.reduce((acc, c) => acc + (Number(c.pakan_kg) || 0), 0);

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
        catatan: catatan.trim(),
      });
      setCatatan('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Yakin ingin menghapus catatan ayam ini?')) {
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
      {/* 4 Key Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Populasi Ayam</span>
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-slate-800">{currentPopulasi}</span>
            <span className="text-xs text-slate-500">ekor</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Data terbaru</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Telur Hari Ini</span>
            <Egg className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-amber-600">{telurHariIni}</span>
            <span className="text-xs text-slate-500">butir</span>
          </div>
          <p className="text-[11px] text-amber-600/80 mt-1 font-medium">
            Total tercatat: {totalTelurSemua} butir
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Pakan Ayam</span>
            <Utensils className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-emerald-700">{pakanHariIni}</span>
            <span className="text-xs text-slate-500">kg/hari</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Total {totalPakanSemua.toFixed(1)} kg pakan
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Produktivitas</span>
            <TrendingUp className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-indigo-600">{productivityRate}%</span>
            <span className="text-xs text-slate-500">rasio telur</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {productivityRate >= 80 ? '🌟 Sangat Produktif' : productivityRate >= 60 ? '👍 Normal' : '⚠️ Perlu Evaluasi'}
          </p>
        </div>
      </div>

      {/* AI Smart Advisor & Prediction */}
      <AyamSmartAdvisor ayamList={ayamList} />

      {/* Form Input Harian */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-lg">
              🐔
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">Catat Perkembangan Ternak Ayam</h3>
              <p className="text-xs text-slate-500">Jumlah ayam, konsumsi pakan harian, dan hasil panen telur</p>
            </div>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            <Sparkles className="w-3.5 h-3.5" /> Auto-sync Realtime
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Tanggal Catatan
              </label>
              <input
                type="date"
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                required
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-slate-50/70"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                Jumlah Ayam Hidup (Ekor)
              </label>
              <input
                type="number"
                min="0"
                value={jumlahAyam}
                onChange={(e) => setJumlahAyam(e.target.value)}
                placeholder="Contoh: 120"
                required
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                <Utensils className="w-3.5 h-3.5 text-slate-400" />
                Pakan Harian (Kg)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={pakanKg}
                onChange={(e) => setPakanKg(e.target.value)}
                placeholder="Contoh: 15.0"
                required
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                <Egg className="w-3.5 h-3.5 text-slate-400" />
                Jumlah Telur (Butir)
              </label>
              <input
                type="number"
                min="0"
                value={jumlahTelur}
                onChange={(e) => setJumlahTelur(e.target.value)}
                placeholder="Contoh: 98"
                required
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Catatan Kondisi / Keterangan (Opsional)
            </label>
            <input
              type="text"
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              placeholder="Contoh: Suhu kandang hangat, nafsu makan stabil, diberi multivitamin..."
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center justify-end pt-1">
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

      {/* Riwayat Catatan */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-slate-800 text-sm">Riwayat Catatan Harian Ayam</h4>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600">
              {ayamList.length} rekaman
            </span>
          </div>
          {isRealtimeActive && (
            <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1.5 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Postgres Changes
            </span>
          )}
        </div>

        {ayamList.length === 0 ? (
          <div className="p-10 text-center text-slate-400">
            <Egg className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-medium">Belum ada catatan ayam tersimpan.</p>
            <p className="text-xs text-slate-400 mt-1">Gunakan formulir di atas untuk mencatat data hari ini.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Tanggal</th>
                  <th className="px-4 py-3">Jumlah Ayam</th>
                  <th className="px-4 py-3">Pakan</th>
                  <th className="px-4 py-3">Produksi Telur</th>
                  <th className="px-4 py-3">Rasio Telur</th>
                  <th className="px-4 py-3">Catatan</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ayamList.map((item) => {
                  const rasio =
                    item.jumlah_ayam > 0
                      ? Math.round((item.jumlah_telur / item.jumlah_ayam) * 100)
                      : 0;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition">
                      <td className="px-4 py-3 font-semibold text-slate-800 whitespace-nowrap">
                        {item.tanggal}
                      </td>
                      <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
                        <span className="font-bold text-slate-900">{item.jumlah_ayam}</span> ekor
                      </td>
                      <td className="px-4 py-3 text-emerald-700 font-bold whitespace-nowrap">
                        {item.pakan_kg} kg
                      </td>
                      <td className="px-4 py-3 text-amber-700 font-bold whitespace-nowrap">
                        {item.jumlah_telur} butir
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                            rasio >= 80
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : rasio >= 60
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}
                        >
                          {rasio}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-xs max-w-xs truncate">
                        {item.catatan || '-'}
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <button
                          onClick={() => handleDelete(item.id)}
                          disabled={deletingId === item.id}
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition"
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
        )}
      </div>
    </div>
  );
};
