import { KelompokAyam, UsiaAyamDetail } from '../types';

/**
 * Menghitung detail usia, fase biologis, dan prediksi bertelur untuk satu kelompok ayam.
 */
export function hitungDetailUsiaAyam(kelompok: KelompokAyam): UsiaAyamDetail {
  const tglMulai = new Date(kelompok.tanggal_mulai);
  const now = new Date();
  
  // Hitung selisih hari dari tanggal pencatatan
  const diffMs = now.getTime() - tglMulai.getTime();
  const diffDays = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
  
  // Total usia ayam dalam hari
  const initialDays = (kelompok.umur_minggu || 0) * 7;
  const totalHari = initialDays + diffDays;
  const umurMinggu = Math.floor(totalHari / 7);
  const sisaHari = totalHari % 7;

  // Standar ayam petelur mulai bertelur di umur 18 minggu (126 hari)
  const TARGET_LAY_DAYS = 18 * 7; // 126 hari (18 minggu)
  const sudahBertelur = totalHari >= TARGET_LAY_DAYS;
  const sisaHariMenujuBertelur = Math.max(0, TARGET_LAY_DAYS - totalHari);

  // Estimasi tanggal mulai bertelur perdana
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + sisaHariMenujuBertelur);
  const prediksiTglBertelur = targetDate.toISOString().slice(0, 10);

  // Persentase kematangan menuju masa bertelur (0 - 100%)
  const progressMenujuLay = Math.min(
    100,
    Math.round((totalHari / TARGET_LAY_DAYS) * 100)
  );

  // Fase pertumbuhan & reproduksi
  let faseNama = '';
  let faseWarna = '';
  let faseDeskripsi = '';
  let rekomendasi = '';

  if (umurMinggu < 6) {
    faseNama = 'Fase Starter (DOC)';
    faseWarna = 'bg-blue-100 text-blue-800 border-blue-200';
    faseDeskripsi = 'Masa anak ayam (pembentukan rangka, bulu, dan organ dalam). Belum bertelur.';
    rekomendasi = 'Berikan pakan starter berprotein 20-21%. Jaga suhu kandang (brooder) tetap hangat (30-32°C).';
  } else if (umurMinggu < 18) {
    faseNama = 'Fase Grower / Pullet (Dara)';
    faseWarna = 'bg-purple-100 text-purple-800 border-purple-200';
    faseDeskripsi = 'Masa pertumbuhan ayam dara & pematangan saluran reproduksi sebelum bertelur.';
    if (umurMinggu >= 16) {
      rekomendasi = 'Waktu tinggal sebentar lagi! Mulai transisikan ke pakan Pre-Lay (kalsium 2-2.5%) dan siapkan kotak sarang bertelur yang nyaman dan gelap.';
    } else {
      rekomendasi = 'Berikan pakan grower (protein 15-16%). Jangan biarkan ayam terlalu gemuk agar organ bertelur tidak terjepit lemak.';
    }
  } else if (umurMinggu <= 22) {
    faseNama = 'Point of Lay (Awal Bertelur)';
    faseWarna = 'bg-emerald-100 text-emerald-800 border-emerald-300';
    faseDeskripsi = 'Mulai memproduksi telur perdana. Produksi meningkat bertahap 10% s/d 50%.';
    rekomendasi = 'Gunakan pakan layer penuh (kalsium 3.5-4%). Nyalakan lampu malam tambahan (total pencahayaan 14-16 jam per hari) untuk merangsang hormon bertelur.';
  } else if (umurMinggu <= 45) {
    faseNama = 'Puncak Produksi (Peak Laying)';
    faseWarna = 'bg-amber-100 text-amber-900 border-amber-300';
    faseDeskripsi = 'Masa keemasan produksi telur! Persentase bertelur tertinggi (85% - 95%).';
    rekomendasi = 'Pertahankan pakan 115-120 gram/ekor/hari secara disiplin. Jaga air minum dingin dan tambahkan vitamin antistres jika cuaca panas.';
  } else if (umurMinggu <= 72) {
    faseNama = 'Produksi Stabil (Post-Peak)';
    faseWarna = 'bg-teal-100 text-teal-800 border-teal-200';
    faseDeskripsi = 'Produksi stabil di kisaran 75% - 85%. Ukuran butir telur lebih besar.';
    rekomendasi = 'Tambahkan cangkang tiram / grit kalsium sore hari untuk memperkuat ketebalan cangkang telur yang makin besar.';
  } else {
    faseNama = 'Masa Akhir / Menjelang Afkir';
    faseWarna = 'bg-rose-100 text-rose-800 border-rose-200';
    faseDeskripsi = 'Produksi telur mulai turun secara alami di bawah 65%.';
    rekomendasi = 'Waktu yang tepat untuk mendatangkan kelompok/batch ayam baru sebagai peremajaan (replacement flock).';
  }

  // Estimasi potensi butir telur harian saat puncak (85-90% dari jumlah ayam)
  const potensiHarian = Math.max(1, Math.round(kelompok.jumlah * 0.9));

  return {
    kelompok,
    umur_sekarang_minggu: umurMinggu,
    umur_sekarang_hari_total: totalHari,
    umur_sekarang_sisa_hari: sisaHari,
    fase_nama: faseNama,
    fase_warna: faseWarna,
    fase_deskripsi: faseDeskripsi,
    sudah_bertelur: sudahBertelur,
    prediksi_tgl_bertelur: prediksiTglBertelur,
    sisa_hari_menuju_bertelur: sisaHariMenujuBertelur,
    progress_menuju_lay: progressMenujuLay,
    estimasi_potensi_telur_harian: potensiHarian,
    rekomendasi_pakan_dan_cahaya: rekomendasi,
  };
}

/**
 * Format tanggal Indonesia ramah pengguna: "12 November 2026"
 */
export function formatTanggalIndo(dateStr: string): string {
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const d = new Date(year, month, day);
      return d.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    }
  } catch (e) {
    console.error(e);
  }
  return dateStr;
}
