import React, { useState, useEffect } from 'react';
import { CatatanAyam, KelompokAyam } from '../types';
import {
  Plus,
  Trash2,
  Calendar,
  Egg,
  Utensils,
  Users,
  TrendingUp,
  X,
  AlertTriangle,
  Sparkles,
  Clock,
  Layers,
  Edit2,
  CheckCircle2,
} from 'lucide-react';
import { AyamSmartAdvisor } from './AyamSmartAdvisor';
import { KelompokAyamManager } from './KelompokAyamManager';
import {
  hitungDetailUsiaAyam,
  hitungPrediksiDariUmurMinggu,
  parseUsiaDariCatatan,
  formatTanggalIndo,
} from '../lib/ayamAgeUtils';

interface Props {
  ayamList: CatatanAyam[];
  onAdd: (data: Omit<CatatanAyam, 'id' | 'created_at'>) => Promise<void>;
  onUpdate: (id: string, data: Partial<CatatanAyam>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  isRealtimeActive: boolean;
  kelompokList: KelompokAyam[];
  onAddKelompok: (data: Omit<KelompokAyam, 'id' | 'created_at'>) => void;
  onUpdateKelompok: (id: string, data: Partial<KelompokAyam>) => void;
  onDeleteKelompok: (id: string) => void;
}

export const AyamSection: React.FC<Props> = ({
  ayamList,
  onAdd,
  onUpdate,
  onDelete,
  isRealtimeActive,
  kelompokList,
  onAddKelompok,
  onUpdateKelompok,
  onDeleteKelompok,
}) => {
  const todayStr = new Date().toISOString().slice(0, 10);

  // Total ekor dari semua kelompok ayam jika ada
  const totalPopulasiKelompok = kelompokList.reduce((acc, k) => acc + (Number(k.jumlah) || 0), 0);

  // Form states - jika ada kelompok ayam, gunakan total ekor kelompok sebagai nilai awal
  const [tanggal, setTanggal] = useState(todayStr);
  const [selectedKelompokId, setSelectedKelompokId] = useState<string>(
    kelompokList.length > 0 ? kelompokList[0].id : ''
  );
  const [jumlahAyam, setJumlahAyam] = useState<string>(
    kelompokList.length > 0
      ? String(kelompokList[0].jumlah)
      : totalPopulasiKelompok > 0
      ? String(totalPopulasiKelompok)
      : '7'
  );
  const [usiaMinggu, setUsiaMinggu] = useState<string>(
    kelompokList.length > 0 ? String(kelompokList[0].umur_minggu) : '15'
  );
  const [pakanKg, setPakanKg] = useState<string>('0.9');
  const [jumlahTelur, setJumlahTelur] = useState<string>('0');
  const [catatan, setCatatan] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-sync form when a kelompok is selected
  const handleSelectKelompok = (id: string) => {
    setSelectedKelompokId(id);
    if (!id || id === 'custom') return;
    const target = kelompokList.find((k) => k.id === id);
    if (target) {
      setJumlahAyam(String(target.jumlah));
      const detail = hitungDetailUsiaAyam(target);
      setUsiaMinggu(String(detail.umur_sekarang_minggu));
      // Jika belum di umur bertelur (<18 minggu), set default telur ke 0
      if (!detail.sudah_bertelur) {
        setJumlahTelur('0');
      }
    }
  };

  // Hitung live preview prediksi dari usia di form input
  const umurInputNumber = parseInt(usiaMinggu, 10) || 0;
  const currentPrediksi = hitungPrediksiDariUmurMinggu(umurInputNumber, tanggal);

  // State dialog konfirmasi hapus (tidak menggunakan window.confirm yang sering diblokir iframe)
  const [itemToDelete, setItemToDelete] = useState<CatatanAyam | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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
      const selectedK = kelompokList.find((k) => k.id === selectedKelompokId);
      const parsedAge = parseInt(usiaMinggu, 10);
      await onAdd({
        tanggal,
        jumlah_ayam: parseInt(jumlahAyam, 10) || 0,
        pakan_kg: parseFloat(pakanKg) || 0,
        jumlah_telur: parseInt(jumlahTelur, 10) || 0,
        usia_minggu: !isNaN(parsedAge) ? parsedAge : undefined,
        kelompok_id: selectedK ? selectedK.id : undefined,
        kelompok_nama: selectedK ? selectedK.nama : undefined,
        catatan: catatan.trim(),
      });
      setCatatan('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    const targetId = itemToDelete.id;
    setItemToDelete(null);
    try {
      setIsDeleting(true);
      await onDelete(targetId);
    } catch (err) {
      console.error('Gagal menghapus catatan ayam:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  // State dialog Edit Catatan Ayam & Tambah Telur
  const [itemToEdit, setItemToEdit] = useState<CatatanAyam | null>(null);
  const [editTanggal, setEditTanggal] = useState('');
  const [editJumlahAyam, setEditJumlahAyam] = useState('');
  const [editJumlahTelur, setEditJumlahTelur] = useState('');
  const [editPakanKg, setEditPakanKg] = useState('');
  const [editUsiaMinggu, setEditUsiaMinggu] = useState('');
  const [editCatatan, setEditCatatan] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [quickActionId, setQuickActionId] = useState<string | null>(null);

  const openEditModal = (item: CatatanAyam) => {
    setItemToEdit(item);
    setEditTanggal(item.tanggal);
    setEditJumlahAyam(String(item.jumlah_ayam || 0));
    setEditJumlahTelur(String(item.jumlah_telur || 0));
    setEditPakanKg(String(item.pakan_kg || 0));
    setEditUsiaMinggu(item.usia_minggu !== undefined && item.usia_minggu !== null ? String(item.usia_minggu) : '');
    setEditCatatan(item.catatan || '');
  };

  const handleQuickAddTelur = async (item: CatatanAyam, amount: number) => {
    try {
      setQuickActionId(item.id);
      const current = Number(item.jumlah_telur) || 0;
      const nextVal = Math.max(0, current + amount);
      await onUpdate(item.id, { jumlah_telur: nextVal });
    } catch (err) {
      console.error('Gagal tambah telur cepat:', err);
    } finally {
      setQuickActionId(null);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemToEdit) return;

    try {
      setIsSavingEdit(true);
      await onUpdate(itemToEdit.id, {
        tanggal: editTanggal,
        jumlah_ayam: parseInt(editJumlahAyam, 10) || 0,
        jumlah_telur: parseInt(editJumlahTelur, 10) || 0,
        pakan_kg: parseFloat(editPakanKg) || 0,
        usia_minggu: editUsiaMinggu !== '' ? parseInt(editUsiaMinggu, 10) : undefined,
        catatan: editCatatan.trim(),
      });
      setItemToEdit(null);
    } catch (err) {
      console.error('Gagal menyimpan perubahan catatan ayam:', err);
    } finally {
      setIsSavingEdit(false);
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

      {/* MANAJEMEN USIA AYAM & PREDIKSI WAKTU BERTELUR */}
      <KelompokAyamManager
        kelompokList={kelompokList}
        onAddKelompok={onAddKelompok}
        onUpdateKelompok={onUpdateKelompok}
        onDeleteKelompok={onDeleteKelompok}
        onSelectPopulasi={(jumlah) => setJumlahAyam(String(jumlah))}
      />

      {/* MONITORING & PREDIKSI CERDAS PRODUKSI TELUR & PAKAN */}
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
          {/* BARIS PILIH KELOMPOK & USIA HEWAN */}
          <div className="p-3.5 bg-gradient-to-r from-amber-50/60 to-emerald-50/50 rounded-xl border border-amber-200/70 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-amber-600" />
                  <span>Pilih Kelompok / Angkatan</span>
                </label>
                <select
                  value={selectedKelompokId}
                  onChange={(e) => handleSelectKelompok(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  {kelompokList.map((k) => (
                    <option key={k.id} value={k.id}>
                      🐔 {k.nama} ({k.jumlah} ekor)
                    </option>
                  ))}
                  <option value="custom">&plus; Input Usia & Populasi Manual</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  <span>Usia Hewan (Minggu)</span>
                </label>
                <input
                  type="number"
                  min="0"
                  max="150"
                  value={usiaMinggu}
                  onChange={(e) => setUsiaMinggu(e.target.value)}
                  placeholder="Contoh: 15"
                  className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>Tanggal Catatan</span>
                </label>
                <input
                  type="date"
                  value={tanggal}
                  onChange={(e) => setTanggal(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                />
              </div>
            </div>

            {/* LIVE PREVIEW ANALISIS USIA & PREDIKSI BERTELUR */}
            <div className="p-2.5 rounded-lg bg-white/90 border border-amber-200/90 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 shadow-2xs">
              <div className="flex items-center gap-2">
                <span className="text-base">🔮</span>
                <div>
                  <span className="font-extrabold text-slate-800">
                    Analisis Usia ({umurInputNumber} Minggu):{' '}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${currentPrediksi.badgeColor}`}>
                    {currentPrediksi.faseNama}
                  </span>
                </div>
              </div>
              <div className="font-semibold">
                {currentPrediksi.sudahBertelur ? (
                  <span className="text-emerald-700 flex items-center gap-1">
                    <Egg className="w-3.5 h-3.5 text-amber-500" />
                    <span>Masa Bertelur Aktif (Siap Panen)</span>
                  </span>
                ) : (
                  <span className="text-purple-700 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                    <span>
                      Prediksi Bertelur: ~{currentPrediksi.sisaMinggu} minggu lagi ({formatTanggalIndo(currentPrediksi.prediksiTglBertelur)})
                    </span>
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Jumlah Ayam (Ekor)
              </label>
              <input
                type="number"
                min="0"
                value={jumlahAyam}
                onChange={(e) => setJumlahAyam(e.target.value)}
                placeholder="Contoh: 7"
                required
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Pakan Harian (Kg)
              </label>
              <input
                type="number"
                step="0.05"
                min="0"
                value={pakanKg}
                onChange={(e) => setPakanKg(e.target.value)}
                placeholder="Contoh: 0.9"
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
                placeholder="Contoh: 0"
                required
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              />
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
              placeholder="Contoh: Cuaca cerah, nafsu makan bagus, vaksin berkala..."
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            />
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
                    <th className="py-3 px-4 text-right">Populasi</th>
                    <th className="py-3 px-4">KOLOM USIA HEWAN & PREDIKSI</th>
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
                    const parsedUsia = parseUsiaDariCatatan(item, kelompokList);

                    return (
                      <tr key={item.id} className="hover:bg-slate-50 transition">
                        <td className="py-3 px-4 font-bold text-slate-800 whitespace-nowrap">
                          {item.tanggal}
                        </td>
                        <td className="py-3 px-4 text-right font-semibold text-slate-800 whitespace-nowrap">
                          {pop} ekor
                        </td>

                        {/* KOLOM USIA HEWAN & PREDIKSI BERTELUR */}
                        <td className="py-3 px-4">
                          {parsedUsia.usiaMinggu !== undefined ? (
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-extrabold text-slate-900 text-xs bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 rounded-md">
                                  Usia: {parsedUsia.usiaMinggu} Minggu
                                </span>
                                {parsedUsia.faseNama && (
                                  <span
                                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md border ${
                                      parsedUsia.badgeColor || 'bg-slate-100 text-slate-700'
                                    }`}
                                  >
                                    {parsedUsia.faseNama}
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] font-medium leading-tight">
                                {parsedUsia.sudahBertelur ? (
                                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                                    <Egg className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                    <span>Masa Bertelur Aktif</span>
                                  </span>
                                ) : (
                                  <span className="text-purple-700 font-medium flex items-center gap-1">
                                    <Sparkles className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                                    <span>Prediksi: {parsedUsia.prediksiRingkas}</span>
                                  </span>
                                )}
                              </div>
                              {parsedUsia.kelompokNama && (
                                <span className="text-[10px] text-slate-400 block truncate max-w-[170px]">
                                  {parsedUsia.kelompokNama}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-400 text-xs italic">-</span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-right font-semibold text-emerald-700 whitespace-nowrap">
                          {pakan} kg
                        </td>
                        <td className="py-3 px-4 text-right text-slate-600 whitespace-nowrap">
                          {gramPerEkor} gr
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <span className="font-bold text-amber-700 text-sm">{telur}</span>
                            <span className="text-[11px] text-slate-400">btr</span>
                            <button
                              type="button"
                              onClick={() => handleQuickAddTelur(item, 1)}
                              disabled={quickActionId === item.id}
                              title="Tambah 1 Telur Cepat"
                              className="px-1.5 py-0.5 text-[10px] font-black bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-md transition cursor-pointer shadow-2xs disabled:opacity-50"
                            >
                              +1
                            </button>
                            <button
                              type="button"
                              onClick={() => handleQuickAddTelur(item, 5)}
                              disabled={quickActionId === item.id}
                              title="Tambah 5 Telur Cepat"
                              className="px-1.5 py-0.5 text-[10px] font-black bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-md transition cursor-pointer shadow-2xs disabled:opacity-50"
                            >
                              +5
                            </button>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
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
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => openEditModal(item)}
                              className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition cursor-pointer"
                              title="Edit Catatan & Tambah Telur"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setItemToDelete(item)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                              title="Hapus Catatan"
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

            {/* Mobile Card View (Sangat nyaman di gawai / layar HP) */}
            <div className="sm:hidden divide-y divide-slate-100">
              {ayamList.map((item) => {
                const pop = item.jumlah_ayam || 0;
                const pakan = item.pakan_kg || 0;
                const telur = item.jumlah_telur || 0;
                const prodRate = pop > 0 ? Math.round((telur / pop) * 100) : 0;
                const gramPerEkor = pop > 0 ? Math.round((pakan * 1000) / pop) : 0;
                const parsedUsia = parseUsiaDariCatatan(item, kelompokList);

                return (
                  <div key={item.id} className="p-4 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-slate-800">{item.tanggal}</span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => openEditModal(item)}
                          className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition cursor-pointer"
                          title="Edit Catatan & Tambah Telur"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setItemToDelete(item)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                          title="Hapus Catatan"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* USIA & PREDIKSI HEWAN BADGE DI MOBILE */}
                    {parsedUsia.usiaMinggu !== undefined && (
                      <div className="p-2.5 rounded-xl bg-gradient-to-r from-amber-50/90 to-purple-50/90 border border-amber-200/80 text-xs space-y-1">
                        <div className="flex items-center justify-between gap-1 flex-wrap">
                          <span className="font-black text-slate-900 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                            Usia: {parsedUsia.usiaMinggu} Minggu
                          </span>
                          {parsedUsia.faseNama && (
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md border ${
                                parsedUsia.badgeColor || 'bg-slate-100'
                              }`}
                            >
                              {parsedUsia.faseNama}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] font-semibold">
                          {parsedUsia.sudahBertelur ? (
                            <span className="text-emerald-700 flex items-center gap-1">
                              <Egg className="w-3.5 h-3.5 text-amber-500" /> Masa Bertelur Aktif
                            </span>
                          ) : (
                            <span className="text-purple-700 flex items-center gap-1">
                              <Sparkles className="w-3.5 h-3.5 text-purple-600" /> Prediksi: {parsedUsia.prediksiRingkas}
                            </span>
                          )}
                        </div>
                        {parsedUsia.kelompokNama && (
                          <span className="text-[10px] text-slate-500 block">
                            Kelompok: {parsedUsia.kelompokNama}
                          </span>
                        )}
                      </div>
                    )}

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
                      <div className="bg-amber-50/80 p-1.5 rounded-lg border border-amber-200/60">
                        <p className="text-[10px] text-amber-800 font-bold uppercase">Telur</p>
                        <p className="text-xs font-extrabold text-amber-700">
                          {telur} <span className="text-[10px] font-semibold text-indigo-600">({prodRate}%)</span>
                        </p>
                        <div className="flex items-center justify-center gap-1 mt-1">
                          <button
                            type="button"
                            onClick={() => handleQuickAddTelur(item, 1)}
                            disabled={quickActionId === item.id}
                            title="Tambah 1 Telur"
                            className="px-1.5 py-0.5 text-[10px] font-black bg-amber-200 hover:bg-amber-300 text-amber-950 rounded cursor-pointer transition shadow-2xs disabled:opacity-50"
                          >
                            +1
                          </button>
                          <button
                            type="button"
                            onClick={() => handleQuickAddTelur(item, 5)}
                            disabled={quickActionId === item.id}
                            title="Tambah 5 Telur"
                            className="px-1.5 py-0.5 text-[10px] font-black bg-white text-amber-800 border border-amber-300 hover:bg-amber-100 rounded cursor-pointer transition shadow-2xs disabled:opacity-50"
                          >
                            +5
                          </button>
                        </div>
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

      {/* MODAL EDIT CATATAN AYAM & TAMBAH TELUR */}
      {itemToEdit && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-emerald-50/60">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                  <Egg className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-800">
                    Edit Catatan & Tambah Telur
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Tanggal: {itemToEdit.tanggal} {itemToEdit.kelompok_nama ? `| ${itemToEdit.kelompok_nama}` : ''}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setItemToEdit(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-200/50 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-5 space-y-4">
              {/* Highlight Card: Input & Tambah Telur */}
              <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-amber-900 flex items-center gap-1.5">
                    <Egg className="w-4 h-4 text-amber-600" />
                    <span>Jumlah Telur (Butir)</span>
                  </label>
                  {/* Live Productivity Preview */}
                  {parseInt(editJumlahAyam, 10) > 0 && (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">
                      Produktivitas: {Math.round(((parseInt(editJumlahTelur, 10) || 0) / parseInt(editJumlahAyam, 10)) * 100)}%
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    required
                    value={editJumlahTelur}
                    onChange={(e) => setEditJumlahTelur(e.target.value)}
                    className="w-full px-3 py-2 text-lg font-black text-amber-950 bg-white border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="0"
                  />
                </div>

                {/* Quick Add Buttons */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-amber-200/60">
                  <span className="text-[10px] font-bold text-amber-800">Tambah Cepat:</span>
                  {[1, 2, 5, 10, 20].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => {
                        const cur = parseInt(editJumlahTelur, 10) || 0;
                        setEditJumlahTelur(String(cur + num));
                      }}
                      className="px-2 py-1 text-[11px] font-bold bg-white text-amber-800 hover:bg-amber-100 border border-amber-300 rounded-md transition cursor-pointer shadow-2xs"
                    >
                      +{num}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setEditJumlahTelur('0')}
                    className="ml-auto text-[10px] text-slate-500 hover:text-slate-800 underline cursor-pointer"
                  >
                    Reset (0)
                  </button>
                </div>
              </div>

              {/* Tanggal & Populasi */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Tanggal Catatan
                  </label>
                  <input
                    type="date"
                    required
                    value={editTanggal}
                    onChange={(e) => setEditTanggal(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Populasi (Ekor)
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={editJumlahAyam}
                    onChange={(e) => setEditJumlahAyam(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Usia & Pakan */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Usia Ayam (Minggu)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={editUsiaMinggu}
                    onChange={(e) => setEditUsiaMinggu(e.target.value)}
                    placeholder="Contoh: 18"
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Pakan (Kg)
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    min="0"
                    required
                    value={editPakanKg}
                    onChange={(e) => setEditPakanKg(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Catatan Tambahan
                </label>
                <input
                  type="text"
                  value={editCatatan}
                  onChange={(e) => setEditCatatan(e.target.value)}
                  placeholder="Kondisi ayam, jenis pakan, dll."
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setItemToEdit(null)}
                  disabled={isSavingEdit}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition shadow-xs cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{isSavingEdit ? 'Menyimpan...' : 'Simpan Perubahan ke Supabase'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DIALOG KONFIRMASI HAPUS (BEBAS DARI BLOKIR IFRAME) */}
      {itemToDelete && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-800">Hapus Catatan Ayam?</h3>
                  <p className="text-[11px] text-slate-500">Tindakan ini tidak dapat dibatalkan</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="my-3.5 bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-xs text-slate-600 space-y-1">
              <p><span className="font-bold text-slate-700">Tanggal:</span> {itemToDelete.tanggal}</p>
              <p><span className="font-bold text-slate-700">Populasi:</span> {itemToDelete.jumlah_ayam} ekor | <span className="font-bold text-slate-700">Telur:</span> {itemToDelete.jumlah_telur} butir</p>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 hover:bg-slate-100 transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-700 text-white transition shadow-xs flex items-center gap-1.5 disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeleting ? 'Menghapus...' : 'Ya, Hapus'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
