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
  Table,
  LayoutGrid,
  CheckCircle2,
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
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
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
      <div className="p-4 sm:p-5 border-b border-slate-100 bg-gradient-to-r from-amber-50/70 via-emerald-50/40 to-slate-50 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center font-bold text-lg shrink-0 border border-amber-200/60">
            🐔
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-extrabold text-base text-slate-800">
                Data Usia & Prediksi Bertelur Hewan
              </h3>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                {kelompokList.length} Kelompok
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Pantau usia setiap kelompok ayam secara akurat & estimasi tanggal otomatis mulai bertelur perdana
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch md:self-auto flex-wrap">
          {/* VIEW SWITCHER: TABEL vs KARTU */}
          <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>Tabel Matriks Usia</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                viewMode === 'cards'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Kartu Detail</span>
            </button>
          </div>

          <button
            type="button"
            onClick={openAddModal}
            className="flex-1 md:flex-none px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Ayam / Angkatan Baru</span>
          </button>
        </div>
      </div>

      {/* SUMMARY BANNER */}
      <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-700">Total Populasi:</span>
            <span className="font-black text-slate-900 bg-white px-2 py-0.5 rounded-md border border-slate-200">
              {totalEkor} ekor
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200 font-semibold">
              Menunggu Bertelur: {details.filter((d) => !d.sudah_bertelur).length} kelompok (
              {details
                .filter((d) => !d.sudah_bertelur)
                .reduce((acc, d) => acc + (Number(d.kelompok.jumlah) || 0), 0)}{' '}
              ekor)
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 font-semibold">
              Sudah Bertelur Aktif: {details.filter((d) => d.sudah_bertelur).length} kelompok
            </span>
          </div>

          {onSelectPopulasi && (
            <button
              type="button"
              onClick={() => onSelectPopulasi(totalEkor)}
              className="text-[11px] text-emerald-700 hover:text-emerald-900 font-bold underline cursor-pointer"
              title="Isi jumlah ini ke form catatan harian di bawah"
            >
              Gunakan {totalEkor} ekor di form catatan harian &darr;
            </button>
          )}
        </div>

        <div className="text-[11px] text-slate-500 flex items-center gap-1">
          <Clock className="w-3.5 h-3.5 text-amber-600" />
          <span>Ayam petelur mulai berproduksi di usia <strong>18–20 minggu</strong></span>
        </div>
      </div>

      {/* CONTENT: TABEL MATRIKS USIA ATAU KARTU DETAIL */}
      <div className="p-4 sm:p-5">
        {kelompokList.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <p className="text-sm">Belum ada kelompok ayam yang didaftarkan.</p>
            <button
              onClick={openAddModal}
              className="mt-2 text-xs font-bold text-emerald-600 underline cursor-pointer"
            >
              Klik untuk menambah kelompok ayam pertama Anda
            </button>
          </div>
        ) : viewMode === 'table' ? (
          /* TAMPILAN TABEL MATRIKS USIA HEWAN & PREDIKSI */
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-100 text-slate-600 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Kelompok / Batch Ayam</th>
                  <th className="py-3 px-3 text-right">Populasi</th>
                  <th className="py-3 px-4">KOLOM USIA SAAT INI</th>
                  <th className="py-3 px-4">Fase Biologis</th>
                  <th className="py-3 px-4">PREDIKSI BERTELUR PERDANA</th>
                  <th className="py-3 px-4 text-right">Potensi Panen</th>
                  <th className="py-3 px-4">Rekomendasi Pakan/Cahaya</th>
                  <th className="py-3 px-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {details.map((item) => {
                  const k = item.kelompok;
                  return (
                    <tr key={k.id} className="hover:bg-slate-50 transition">
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        <div>
                          <span className="text-xs">{k.nama}</span>
                          <span className="block text-[11px] text-slate-400 font-normal">
                            {k.jenis_ras || 'Ayam Petelur'}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-3 text-right font-black text-slate-800 whitespace-nowrap">
                        {k.jumlah} ekor
                      </td>

                      {/* KOLOM USIA SAAT INI */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="space-y-0.5">
                          <span className="font-black text-xs text-amber-950 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 inline-block">
                            {item.umur_sekarang_minggu} Minggu
                            {item.umur_sekarang_sisa_hari > 0 ? ` +${item.umur_sekarang_sisa_hari} hr` : ''}
                          </span>
                          <span className="text-[10px] text-slate-400 block font-normal">
                            Total {item.umur_sekarang_hari_total} hari
                          </span>
                        </div>
                      </td>

                      {/* FASE BIOLOGIS */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${item.fase_warna}`}>
                          {item.fase_nama}
                        </span>
                      </td>

                      {/* PREDIKSI BERTELUR PERDANA */}
                      <td className="py-3.5 px-4">
                        {item.sudah_bertelur ? (
                          <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-xs whitespace-nowrap">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>Masa Bertelur Aktif</span>
                          </div>
                        ) : (
                          <div className="space-y-1 min-w-[190px]">
                            <div className="flex items-center justify-between text-xs font-bold text-purple-900">
                              <span className="flex items-center gap-1">
                                <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                                <span>~{Math.ceil(item.sisa_hari_menuju_bertelur / 7)} mg lagi</span>
                              </span>
                              <span className="text-[10px] text-purple-700 font-medium">
                                ({item.sisa_hari_menuju_bertelur} hari)
                              </span>
                            </div>
                            <span className="text-[11px] font-semibold text-slate-600 block">
                              Tgl: {formatTanggalIndo(item.prediksi_tgl_bertelur)}
                            </span>
                            <div className="w-full h-1.5 rounded-full bg-purple-100 overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-purple-500 to-amber-500 rounded-full"
                                style={{ width: `${item.progress_menuju_lay}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                      </td>

                      {/* POTENSI PANEN */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <span className="font-extrabold text-amber-800 text-xs bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          ~{item.estimasi_potensi_telur_harian} btr/hari
                        </span>
                      </td>

                      {/* REKOMENDASI PAKAN */}
                      <td className="py-3.5 px-4 text-slate-600 text-[11px] max-w-[220px]">
                        <span className="line-clamp-2" title={item.rekomendasi_pakan_dan_cahaya}>
                          {item.rekomendasi_pakan_dan_cahaya}
                        </span>
                      </td>

                      {/* AKSI */}
                      <td className="py-3.5 px-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => openEditModal(k)}
                            className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition cursor-pointer"
                            title="Edit Data Kelompok"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setItemToDelete(k)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                            title="Hapus Kelompok"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          /* TAMPILAN KARTU DETAIL */
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
                        className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition cursor-pointer"
                        title="Edit Data Kelompok"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setItemToDelete(k)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
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

        {/* ANALISIS PANEN BERTAHAP MULTI-ANGKATAN */}
        {kelompokList.length > 0 && (
          <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-emerald-50/80 via-amber-50/60 to-purple-50/80 border border-emerald-200/80 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-base">📊</span>
              <h4 className="font-extrabold text-xs sm:text-sm text-slate-800">
                Analisis Panen Bertahap Multi-Angkatan Ayam
              </h4>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Setiap kali Anda menambahkan ayam baru di kemudian hari, sistem otomatis menyusun jadwal panen bergilir.
              Saat ini total estimasi potensi produksi jika semua kelompok telah masuk masa bertelur puncak adalah{' '}
              <strong className="text-emerald-800 font-extrabold">
                ~{details.reduce((acc, d) => acc + d.estimasi_potensi_telur_harian, 0)} butir telur per hari
              </strong>{' '}
              dari total {totalEkor} ekor populasi.
            </p>
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
                className="text-slate-400 hover:text-slate-600 p-1 rounded cursor-pointer"
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
                </div>
              </div>

              {/* 1-CLICK QUICK PRESETS USIA HEWAN */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1.5">
                  Pilihan Cepat Tahap Usia Ayam:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { label: '🐥 DOC (1 mg)', val: 1 },
                    { label: '🐣 Grower (8 mg)', val: 8 },
                    { label: '🐔 Pullet / Dara (15 mg)', val: 15 },
                    { label: '🥚 Siap Telur (18 mg)', val: 18 },
                    { label: '🏆 Puncak (24 mg)', val: 24 },
                  ].map((preset) => (
                    <button
                      key={preset.val}
                      type="button"
                      onClick={() => setUmurMinggu(String(preset.val))}
                      className={`text-[10px] px-2 py-1 rounded-lg border font-semibold transition cursor-pointer ${
                        parseInt(umurMinggu, 10) === preset.val
                          ? 'bg-amber-100 text-amber-900 border-amber-300 shadow-2xs font-bold'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  {parseInt(umurMinggu, 10) >= 18
                    ? '✅ Ayam sudah memasuki usia bertelur (18+ minggu).'
                    : `🔮 Tinggal ~${Math.max(0, 18 - (parseInt(umurMinggu, 10) || 0))} minggu lagi menuju masa bertelur.`}
                </span>
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
                  className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs transition cursor-pointer"
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
