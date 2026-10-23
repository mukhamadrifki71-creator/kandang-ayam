import { CatatanAyam, KelompokAyam, UsiaAyamDetail } from '../types';

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

/**
 * Menghitung status dan prediksi bertelur berdasarkan umur dalam minggu.
 */
export function hitungPrediksiDariUmurMinggu(umurMinggu: number, tanggalRef?: string) {
  const TARGET_LAY_WEEKS = 18;
  const sudahBertelur = umurMinggu >= TARGET_LAY_WEEKS;
  const sisaMinggu = Math.max(0, TARGET_LAY_WEEKS - umurMinggu);
  const sisaHari = sisaMinggu * 7;

  let baseDate = new Date();
  if (tanggalRef) {
    try {
      const parsed = new Date(tanggalRef);
      if (!isNaN(parsed.getTime())) {
        baseDate = parsed;
      }
    } catch {
      // fallback to current date
    }
  }

  const targetDate = new Date(baseDate);
  targetDate.setDate(targetDate.getDate() + sisaHari);
  const prediksiTglBertelur = targetDate.toISOString().slice(0, 10);

  let faseNama = '';
  let badgeColor = '';
  let ringkasanPrediksi = '';

  if (umurMinggu < 6) {
    faseNama = 'Starter (DOC)';
    badgeColor = 'bg-blue-100 text-blue-800 border-blue-200';
    ringkasanPrediksi = `~${sisaMinggu} minggu lagi (${formatTanggalIndo(prediksiTglBertelur)})`;
  } else if (umurMinggu < 18) {
    faseNama = 'Grower / Pullet';
    badgeColor = 'bg-purple-100 text-purple-800 border-purple-200';
    ringkasanPrediksi = `~${sisaMinggu} minggu lagi (${formatTanggalIndo(prediksiTglBertelur)})`;
  } else if (umurMinggu <= 22) {
    faseNama = 'Point of Lay';
    badgeColor = 'bg-emerald-100 text-emerald-800 border-emerald-300';
    ringkasanPrediksi = 'Mulai masa bertelur awal';
  } else if (umurMinggu <= 45) {
    faseNama = 'Puncak Telur';
    badgeColor = 'bg-amber-100 text-amber-900 border-amber-300';
    ringkasanPrediksi = 'Puncak produktivitas telur';
  } else if (umurMinggu <= 72) {
    faseNama = 'Produksi Stabil';
    badgeColor = 'bg-teal-100 text-teal-800 border-teal-200';
    ringkasanPrediksi = 'Masa bertelur aktif stabil';
  } else {
    faseNama = 'Menjelang Afkir';
    badgeColor = 'bg-rose-100 text-rose-800 border-rose-200';
    ringkasanPrediksi = 'Produksi menurun secara alami';
  }

  return {
    umurMinggu,
    sudahBertelur,
    sisaMinggu,
    sisaHari,
    prediksiTglBertelur,
    faseNama,
    badgeColor,
    ringkasanPrediksi,
  };
}

/**
 * Mengekstrak informasi usia dan kelompok dari CatatanAyam secara cerdas,
 * mencocokkan dengan data kelompokList atau catatan tag.
 */
export function parseUsiaDariCatatan(
  item: CatatanAyam,
  kelompokList: KelompokAyam[] = []
): {
  usiaMinggu?: number;
  kelompokNama?: string;
  faseNama?: string;
  badgeColor?: string;
  sudahBertelur?: boolean;
  prediksiRingkas?: string;
} {
  // 1. Jika item memiliki usia_minggu eksplisit
  if (typeof item.usia_minggu === 'number' && item.usia_minggu >= 0) {
    const calc = hitungPrediksiDariUmurMinggu(item.usia_minggu, item.tanggal);
    return {
      usiaMinggu: item.usia_minggu,
      kelompokNama: item.kelompok_nama,
      faseNama: calc.faseNama,
      badgeColor: calc.badgeColor,
      sudahBertelur: calc.sudahBertelur,
      prediksiRingkas: calc.ringkasanPrediksi,
    };
  }

  // 2. Cek apakah ada kelompok_id yang cocok
  if (item.kelompok_id) {
    const matched = kelompokList.find((k) => k.id === item.kelompok_id);
    if (matched) {
      const detail = hitungDetailUsiaAyam(matched);
      return {
        usiaMinggu: detail.umur_sekarang_minggu,
        kelompokNama: matched.nama,
        faseNama: detail.fase_nama,
        badgeColor: detail.fase_warna,
        sudahBertelur: detail.sudah_bertelur,
        prediksiRingkas: detail.sudah_bertelur
          ? 'Masa Bertelur Aktif'
          : `~${Math.ceil(detail.sisa_hari_menuju_bertelur / 7)} mgg (${formatTanggalIndo(detail.prediksi_tgl_bertelur)})`,
      };
    }
  }

  // 3. Cek apakah di catatan ada string "[Usia: X mg]" atau "[Usia: X Minggu]"
  if (item.catatan) {
    const regex = /\[Usia:\s*(\d+)\s*(?:minggu|mg)?/i;
    const match = item.catatan.match(regex);
    if (match && match[1]) {
      const parsedAge = parseInt(match[1], 10);
      if (!isNaN(parsedAge)) {
        const calc = hitungPrediksiDariUmurMinggu(parsedAge, item.tanggal);
        return {
          usiaMinggu: parsedAge,
          kelompokNama: item.kelompok_nama,
          faseNama: calc.faseNama,
          badgeColor: calc.badgeColor,
          sudahBertelur: calc.sudahBertelur,
          prediksiRingkas: calc.ringkasanPrediksi,
        };
      }
    }
  }

  // 4. Jika jumlah ayam sama persis dengan kelompok unik (misal 7 ekor matching kelompok 7 ekor)
  if (kelompokList.length > 0) {
    const matchedByCount = kelompokList.filter((k) => Number(k.jumlah) === Number(item.jumlah_ayam));
    if (matchedByCount.length === 1) {
      const detail = hitungDetailUsiaAyam(matchedByCount[0]);
      return {
        usiaMinggu: detail.umur_sekarang_minggu,
        kelompokNama: matchedByCount[0].nama,
        faseNama: detail.fase_nama,
        badgeColor: detail.fase_warna,
        sudahBertelur: detail.sudah_bertelur,
        prediksiRingkas: detail.sudah_bertelur
          ? 'Masa Bertelur Aktif'
          : `~${Math.ceil(detail.sisa_hari_menuju_bertelur / 7)} mgg (${formatTanggalIndo(detail.prediksi_tgl_bertelur)})`,
      };
    }
  }

  return {};
}
