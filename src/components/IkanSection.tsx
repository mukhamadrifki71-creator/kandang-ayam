import React, { useState } from 'react';
import { CatatanIkan } from '../types';
import { Plus, Trash2, Calendar, Waves, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';

interface Props {
  ikanList: CatatanIkan[];
  onAdd: (data: Omit<CatatanIkan, 'id' | 'created_at'>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onQuickKuras: (id: string) => Promise<void>;
  isRealtimeActive: boolean;
}

const COMMON_FISH_TYPES = ['Nila Merah', 'Lele Sangkuriang', 'Gurame', 'Patin', 'Ikan Mas', 'Bawal'];

export const IkanSection: React.FC<Props> = ({
  ikanList,
  onAdd,
  onDelete,
  onQuickKuras,
  isRealtimeActive,
}) => {
  const todayStr = new Date().toISOString().slice(0, 10);
  const defaultJadwal = new Date(Date.now() + 5 * 86400000).toISOString().slice(0, 10);

  const [namaKolam, setNamaKolam] = useState('');
  const [jenisIkan, setJenisIkan] = useState('Nila Merah');
  const [jumlahIkan, setJumlahIkan] = useState<string>('500');
  const [pakanKg, setPakanKg] = useState<string>('4.5');
  const [jadwalKuras, setJadwalKuras] = useState(defaultJadwal);
  const [statusAir, setStatusAir] = useState('Bersih');
  const [catatan, setCatatan] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Statistics
  const totalKolam = ikanList.length;
  const totalPopulasi = ikanList.reduce((acc, c) => acc + (Number(c.jumlah_ikan) || 0), 0);
  const totalPakan = ikanList.reduce((acc, c) => acc + (Number(c.pakan_kg) || 0), 0);

  // Check ponds that need draining today or overdue
  const pondsNeedDrain = ikanList.filter((item) => {
    return item.jadwal_kuras <= todayStr || item.status_air === 'Perlu Kuras';
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaKolam || !jenisIkan || !jumlahIkan || !pakanKg || !jadwalKuras) return;

    try {
      setIsSubmitting(true);
      await onAdd({
        tanggal: todayStr,
        nama_kolam: namaKolam.trim(),
        jenis_ikan: jenisIkan.trim(),
        jumlah_ikan: parseInt(jumlahIkan, 10) || 0,
        pakan_kg: parseFloat(pakanKg) || 0,
        jadwal_kuras: jadwalKuras,
        status_air: statusAir,
        catatan: catatan.trim(),
      });
      setNamaKolam('');
      setCatatan('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Hapus data kolam ini?')) {
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
      {/* Kolam Perlu Kuras Urgent Alert Banner */}
      {pondsNeedDrain.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-start sm:items-center justify-between gap-3 text-rose-900 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-rose-100 rounded-lg text-rose-600 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm">
                Perhatian: {pondsNeedDrain.length} Kolam Perlu Kuras Air!
              </h4>
              <p className="text-xs text-rose-700 mt-0.5">
                Kolam:{' '}
                {pondsNeedDrain
                  .map((p) => `${p.nama_kolam} (${p.jenis_ikan})`)
                  .join(', ')}{' '}
                telah mencapai atau melewati jadwal kuras air.
              </p>
            </div>
          </div>
          <span className="hidden sm:inline-block px-3 py-1 bg-rose-600 text-white font-bold text-xs rounded-full">
            Segera Kuras
          </span>
        </div>
      )}

      {/* 4 Key Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Kolam</p>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black text-slate-800">{totalKolam}</span>
            <span className="text-xs text-slate-500">kolam aktif</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Bioflok & Terpal</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Populasi Ikan</p>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black text-cyan-600">{totalPopulasi.toLocaleString('id-ID')}</span>
            <span className="text-xs text-slate-500">ekor</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Semua jenis kolam</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pakan Harian</p>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black text-emerald-600">{totalPakan.toFixed(1)}</span>
            <span className="text-xs text-slate-500">kg/hari</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Kebutuhan pellet</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Status Kuras</p>
          <div className="flex items-baseline gap-1 mt-1">
            <span
              className={`text-2xl font-black ${
                pondsNeedDrain.length > 0 ? 'text-rose-600' : 'text-emerald-600'
              }`}
            >
              {pondsNeedDrain.length}
            </span>
            <span className="text-xs text-slate-500">kolam jatuh tempo</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {pondsNeedDrain.length === 0 ? '✅ Semua jadwal aman' : '⚠️ Perlu pergantian air'}
          </p>
        </div>
      </div>

      {/* Form Tambah Kolam / Catatan */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-100 text-cyan-800 flex items-center justify-center font-bold text-lg">
              🐟
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">Manajemen Kolam & Kuras Air</h3>
              <p className="text-xs text-slate-500">Pantau populasi ikan, pakan pelet harian, dan jadwal kuras air</p>
            </div>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-cyan-700 font-semibold bg-cyan-50 px-2.5 py-1 rounded-full border border-cyan-200">
            <Waves className="w-3.5 h-3.5" /> Monitoring Air
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Nama / ID Kolam</label>
              <input
                type="text"
                value={namaKolam}
                onChange={(e) => setNamaKolam(e.target.value)}
                placeholder="Contoh: Kolam Bioflok A1"
                required
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Jenis Ikan</label>
              <input
                type="text"
                value={jenisIkan}
                onChange={(e) => setJenisIkan(e.target.value)}
                placeholder="Contoh: Nila Merah / Lele"
                required
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
              />
              <div className="flex flex-wrap gap-1 mt-1.5">
                {COMMON_FISH_TYPES.slice(0, 4).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setJenisIkan(type)}
                    className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 hover:bg-cyan-100 text-slate-600 hover:text-cyan-800 transition"
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Populasi Ikan (Ekor)</label>
              <input
                type="number"
                min="0"
                value={jumlahIkan}
                onChange={(e) => setJumlahIkan(e.target.value)}
                placeholder="Contoh: 500"
                required
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Pakan Harian (Kg)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={pakanKg}
                onChange={(e) => setPakanKg(e.target.value)}
                placeholder="Contoh: 4.5"
                required
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Jadwal Kuras Air Berikutnya
              </label>
              <input
                type="date"
                value={jadwalKuras}
                onChange={(e) => setJadwalKuras(e.target.value)}
                required
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 bg-slate-50/70"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Kondisi Air Saat Ini</label>
              <select
                value={statusAir}
                onChange={(e) => setStatusAir(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 bg-white"
              >
                <option value="Bersih">Jernih / Bersih (Ideal)</option>
                <option value="Cukup">Cukup / Normal</option>
                <option value="Perlu Kuras">Keruh / Berbau (Perlu Kuras)</option>
                <option value="Selesai Kuras">Baru Saja Dikuras</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Catatan Kolam (Opsional)
            </label>
            <input
              type="text"
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              placeholder="Contoh: Aerator aktif normal, respon makan agresif, ditambah probiotik..."
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
            />
          </div>

          <div className="flex items-center justify-end pt-1">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-6 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-sm rounded-xl transition shadow-xs flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span>{isSubmitting ? 'Menyimpan...' : 'Simpan Catatan Kolam'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Daftar Kolam & Jadwal Kuras */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-slate-800 text-sm">Daftar Kolam & Monitoring Kuras</h4>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600">
              {ikanList.length} kolam
            </span>
          </div>
          {isRealtimeActive && (
            <span className="text-[11px] font-semibold text-cyan-700 flex items-center gap-1.5 bg-cyan-50 px-2 py-0.5 rounded-full border border-cyan-200">
              <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></span>
              Live Postgres Changes
            </span>
          )}
        </div>

        {ikanList.length === 0 ? (
          <div className="p-10 text-center text-slate-400">
            <Waves className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-medium">Belum ada kolam ikan yang tercatat.</p>
            <p className="text-xs text-slate-400 mt-1">Tambahkan data kolam pertama Anda di atas.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Nama Kolam</th>
                  <th className="px-4 py-3">Jenis Ikan</th>
                  <th className="px-4 py-3">Populasi</th>
                  <th className="px-4 py-3">Pakan</th>
                  <th className="px-4 py-3">Jadwal Kuras Air</th>
                  <th className="px-4 py-3">Kualitas Air</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ikanList.map((item) => {
                  const isPastOrToday = item.jadwal_kuras <= todayStr;
                  const daysDiff = Math.ceil(
                    (new Date(item.jadwal_kuras).getTime() - new Date(todayStr).getTime()) /
                      (1000 * 60 * 60 * 24)
                  );

                  let statusBadge = (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" /> {item.status_air || 'Bersih'}
                    </span>
                  );

                  if (isPastOrToday || item.status_air === 'Perlu Kuras') {
                    statusBadge = (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 animate-pulse">
                        <AlertTriangle className="w-3 h-3" /> Perlu Kuras
                      </span>
                    );
                  } else if (item.status_air === 'Cukup') {
                    statusBadge = (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                        <Clock className="w-3 h-3" /> Cukup
                      </span>
                    );
                  }

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition">
                      <td className="px-4 py-3 font-bold text-slate-800 whitespace-nowrap">
                        {item.nama_kolam}
                        {item.catatan && (
                          <span className="block text-[11px] font-normal text-slate-400">
                            {item.catatan}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-cyan-700 font-semibold whitespace-nowrap">
                        {item.jenis_ikan}
                      </td>
                      <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
                        <span className="font-bold text-slate-900">
                          {item.jumlah_ikan.toLocaleString('id-ID')}
                        </span>{' '}
                        ekor
                      </td>
                      <td className="px-4 py-3 text-emerald-700 font-bold whitespace-nowrap">
                        {item.pakan_kg} kg
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`font-semibold ${
                              isPastOrToday ? 'text-rose-600 font-bold' : 'text-slate-700'
                            }`}
                          >
                            {item.jadwal_kuras}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {daysDiff === 0
                              ? '(Hari ini)'
                              : daysDiff < 0
                              ? `(Terlambat ${Math.abs(daysDiff)} hari)`
                              : `(${daysDiff} hari lagi)`}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">{statusBadge}</td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => onQuickKuras(item.id)}
                            className="px-2.5 py-1 text-xs font-semibold text-cyan-700 bg-cyan-50 hover:bg-cyan-100 rounded-lg transition border border-cyan-200"
                            title="Tandai telah dikuras & perpanjang jadwal 7 hari"
                          >
                            Kuras Air
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            disabled={deletingId === item.id}
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition"
                            title="Hapus Kolam"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
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
