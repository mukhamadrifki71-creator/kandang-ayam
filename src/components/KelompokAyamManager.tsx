import React, { useState } from 'react';
import { KelompokAyam, UsiaAyamDetail } from '../types';
import { hitungDetailUsiaAyam, formatTanggalIndo } from '../lib/ayamAgeUtils';
import {
  Calendar,
  Plus,
  Egg,
  Sparkles,
  Edit2,
  Trash2,
  X,
  AlertCircle,
  HelpCircle,
  Clock,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';

interface Props {
  kelompokList: KelompokAyam[];
  onAddKelompok: (data: Omit<KelompokAyam, 'id' | 'created_at'>) => void;
  onUpdateKelompok: (id: string, data: Partial<KelompokAyam>) => void;
  onDeleteKelompok: (id: string) => void;
  onSelectPopulasi?: (jumlah: number) => void;
}

export const KelompokAyamManager: React.FC<Props> = ({
  kelompokList,
  onAddKelompok,
  onUpdateKelompok,
  onDeleteKelompok,
  onSelectPopulasi,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<KelompokAyam | null>(null);
  const [itemToDelete, setItemToDelete] = useState<KelompokAyam | null>(null);

  // Form states
  const [nama, setNama] = useState('');
  const [jumlah, setJumlah] = useState('7');
  const [umurMinggu, setUmurMinggu] = useState('15');
  const [tanggalMulai, setTanggalMulai] = useState(new Date().toISOString().slice(0, 10));
  const [jenisRas, setJenisRas] = useState('Ayam Petelur Coklat (Layer)');
  const [catatan, setCatatan] = useState('');

  // Hitung detail semua kelompok
  const details: UsiaAyamDetail[] = kelompokList.map(hitungDetailUsiaAyam);

  const totalEkor = kelompokList.reduce((acc, k) => acc + (Number(k.jumlah) || 0), 0);

  const openAddModal = () => {
    setEditingItem(null);
    setNama(`Kelompok Ayam Baru (${kelompokList.length + 1})`);
    setJumlah('10');
    setUmurMinggu('12');
    setTanggalMulai(new Date().toISOString().slice(0, 10));
    setJenisRas('Ayam Petelur Coklat (Layer)');
    setCatatan('');
    setIsModalOpen(true);
  };

  const openEditModal = (k: KelompokAyam) => {
    setEditingItem(k);
    setNama(k.nama);
    setJumlah(String(k.jumlah));
    setUmurMinggu(String(k.umur_minggu));
    setTanggalMulai(k.tanggal_mulai || new Date().toISOString().slice(0, 10));
    setJenisRas(k.jenis_ras || 'Ayam Petelur Coklat (Layer)');
    setCatatan(k.catatan || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      nama: nama.trim() || 'Kelompok Ayam',
      jumlah: Math.max(1, parseInt(jumlah, 10) || 1),
      umur_minggu: Math.max(0, parseInt(umurMinggu, 10) || 0),
      tanggal_mulai: tanggalMulai || new Date().toISOString().slice(0, 10),
      jenis_ras: jenisRas.trim() || 'Ayam Petelur',
      catatan: catatan.trim(),
    };

    if (editingItem) {
      onUpdateKelompok(editingItem.id, payload);
    } else {
      onAddKelompok(payload);
    }
    setIsModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (!itemToDelete) return;
    onDeleteKelompok(itemToDelete.id);
    setItemToDelete(null);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
      {/* HEADER SECTION */}
      <div className="p-4 sm:p-5 border-b border-slate-100 bg-gradient-to-r from-amber-50/70 via-emerald-50/40 to-slate-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center font-bold text-lg shrink-0 border border-amber-200/60">
            🐔
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-base text-slate-800">
                Data Usia & Prediksi Bertelur Ayam
              </h3>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                {kelompokList.length} Kelompok
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Pantau usia setiap kelompok ayam dan estimasi otomatis kapan mulai bertelur perdana
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="self-stretch sm:self-auto px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Ayam / Angkatan Baru</span>
        </button>
      </div>

      {/* SUMMARY BANNER */}
      <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-700">Total Populasi:</span>
          <span className="font-black text-slate-900 bg-white px-2 py-0.5 rounded-md border border-slate-200">
            {totalEkor} ekor
          </span>
          {onSelectPopulasi && (
            <button
              type="button"
              onClick={() => onSelectPopulasi(totalEkor)}
              className="text-[11px] text-emerald-700 hover:text-emerald-900 font-semibold underline ml-1 cursor-pointer"
              title="Isi jumlah ini ke form catatan harian di bawah"
            >
              Gunakan {totalEkor} di form harian &darr;
            </button>
          )}
        </div>
        <div className="text-[11px] text-slate-500 flex items-center gap-1">
          <Clock className="w-3.5 h-3.5 text-amber-600" />
          <span>Standar kematangan bertelur ayam: umur <strong>18–20 minggu</strong></span>
        </div>
      </div>

      {/* LIST KARTU KELOMPOK AYAM */}
      <div className="p-4 sm:p-5">
        {kelompokList.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <p className="text-sm">Belum ada kelompok ayam yang didaftarkan.</p>
            <button
              onClick={openAddModal}
              className="mt-2 text-xs font-bold text-emerald-600 underline"
            >
              Klik untuk menambah kelompok ayam pertama Anda
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {details.map((item) => {
              const k = item.kelompok;
              return (
                <div
                  key={k.id}
                  className="rounded-2xl border border-slate-200/90 p-4 bg-white hover:border-emerald-300 transition-all shadow-xs space-y-3"
                >
                  {/* Top: Name & Ras */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-sm text-slate-900">{k.nama}</h4>
                        <span className="px-2 py-0.5 text-xs font-bold rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {k.jumlah} ekor
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {k.jenis_ras || 'Ayam Petelur'}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => openEditModal(k)}
                        className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition"
                        title="Edit Data Kelompok"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setItemToDelete(k)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Hapus Kelompok"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Usia & Status Fase Badge */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <div className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-800 font-bold text-xs flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span>
                        Usia: <strong>{item.umur_sekarang_minggu} Minggu</strong>
                        {item.umur_sekarang_sisa_hari > 0 ? ` +${item.umur_sekarang_sisa_hari} hari` : ''}
                      </span>
                      <span className="text-[10px] text-slate-500 font-normal">
                        ({item.umur_sekarang_hari_total} hari)
                      </span>
                    </div>

                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-xl border ${item.fase_warna}`}
                    >
                      {item.fase_nama}
                    </span>
                  </div>

                  {/* KOTAK PREDIKSI BERTELUR */}
                  <div
                    className={`p-3 rounded-xl border ${
                      item.sudah_bertelur
                        ? 'bg-amber-50/70 border-amber-200 text-amber-950'
                        : 'bg-purple-50/70 border-purple-200 text-purple-950'
                    }`}
                  >
                    {item.sudah_bertelur ? (
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-extrabold text-amber-900">
                          <span className="flex items-center gap-1.5">
                            <Egg className="w-4 h-4 text-amber-600" />
                            <span>Masa Bertelur Aktif</span>
                          </span>
                          <span className="text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full text-[10px] font-bold">
                            Siap Panen
                          </span>
                        </div>
                        <p className="text-xs text-amber-900/80 leading-relaxed">
                          Ayam telah memasuki umur produktif bertelur. Potensi panen puncak sekitar{' '}
                          <strong className="text-amber-950 font-black">
                            ~{item.estimasi_potensi_telur_harian} butir/hari
                          </strong>{' '}
                          (dari {k.jumlah} ekor).
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs font-extrabold text-purple-950">
                          <span className="flex items-center gap-1.5">
                            <Sparkles className="w-4 h-4 text-purple-600" />
                            <span>Prediksi Mulai Bertelur:</span>
                          </span>
                          <span className="font-black text-xs text-purple-700 bg-white/90 px-2 py-0.5 rounded-lg border border-purple-200 shadow-2xs">
                            ~{Math.ceil(item.sisa_hari_menuju_bertelur / 7)} minggu lagi ({item.sisa_hari_menuju_bertelur} hari)
                          </span>
                        </div>

                        <div className="flex items-baseline justify-between text-xs text-purple-900">
                          <span>Estimasi Tanggal Telur Pertama:</span>
                          <span className="font-extrabold text-purple-950">
                            {formatTanggalIndo(item.prediksi_tgl_bertelur)}
                          </span>
                        </div>

                        {/* Progress Bar Kematangan */}
                        <div className="space-y-1 pt-1">
                          <div className="flex justify-between text-[10px] font-semibold text-purple-800">
                            <span>Kematangan Menuju Usia Bertelur (18 mgg)</span>
                            <span>{item.progress_menuju_lay}%</span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-purple-200/80 overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-purple-500 to-amber-500 rounded-full transition-all duration-500"
                              style={{ width: `${item.progress_menuju_lay}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Rekomendasi Khusus Sesuai Umur */}
                  <div className="text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200/70 flex items-start gap-2">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <p className="leading-relaxed">
                      <strong>Tips Usia:</strong> {item.rekomendasi_pakan_dan_cahaya}
                    </p>
                  </div>

                  {k.catatan && (
                    <p className="text-[11px] text-slate-400 italic">
                      "{k.catatan}"
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL TAMBAH / EDIT KELOMPOK AYAM */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xl">🐔</span>
                <h3 className="font-extrabold text-sm text-slate-800">
                  {editingItem ? 'Edit Kelompok Ayam' : 'Tambah Kelompok Ayam Baru'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Kelompok / Angkatan
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Kelompok A (7 Ekor) atau Batch 2"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-slate-200 focus:outline-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Jumlah Ayam (Ekor)
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={jumlah}
                    onChange={(e) => setJumlah(e.target.value)}
                    className="w-full text-xs font-bold px-3 py-2 rounded-xl border border-slate-200 focus:outline-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <span>Usia Saat Ini (Minggu)</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="150"
                    required
                    value={umurMinggu}
                    onChange={(e) => setUmurMinggu(e.target.value)}
                    className="w-full text-xs font-bold px-3 py-2 rounded-xl border border-slate-200 focus:outline-emerald-600"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    {parseInt(umurMinggu, 10) >= 18
                      ? 'Sudah usia bertelur (18+ mgg)'
                      : `Tinggal ~${Math.max(0, 18 - (parseInt(umurMinggu, 10) || 0))} mgg lagi bertelur`}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tanggal Pencatatan / Datang
                  </label>
                  <input
                    type="date"
                    required
                    value={tanggalMulai}
                    onChange={(e) => setTanggalMulai(e.target.value)}
                    className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-slate-200 focus:outline-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Jenis / Ras Ayam
                  </label>
                  <input
                    type="text"
                    placeholder="Isa Brown / Lohmann / Kampung"
                    value={jenisRas}
                    onChange={(e) => setJenisRas(e.target.value)}
                    className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-slate-200 focus:outline-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Catatan Tambahan (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Kandang timur, kondisi sehat..."
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-slate-200 focus:outline-emerald-600"
                />
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/80 text-[11px] text-amber-900 flex items-start gap-2">
                <HelpCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p>
                  Aplikasi akan <strong>secara otomatis menambah umur ayam setiap minggu</strong> seiring berjalannya hari, dan memperbarui prediksi tanggal bertelur secara real-time!
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 hover:bg-slate-100 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs transition"
                >
                  {editingItem ? 'Simpan Perubahan' : 'Tambahkan Kelompok'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI HAPUS */}
      {itemToDelete && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 space-y-3">
            <div className="flex items-center gap-2.5 text-rose-600">
              <AlertCircle className="w-5 h-5" />
              <h3 className="font-bold text-sm text-slate-900">Hapus Kelompok Ayam?</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Anda yakin ingin menghapus <strong>{itemToDelete.nama}</strong> ({itemToDelete.jumlah} ekor)?
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-xl text-slate-600 hover:bg-slate-100 transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-1.5 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-700 text-white transition shadow-xs"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
