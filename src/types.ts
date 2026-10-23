export interface CatatanAyam {
  id: string;
  created_at?: string;
  tanggal: string; // YYYY-MM-DD
  jumlah_ayam: number;
  pakan_kg: number;
  jumlah_telur: number;
  usia_minggu?: number; // umur ayam dalam minggu
  kelompok_id?: string; // id kelompok ayam jika terkait
  kelompok_nama?: string; // nama kelompok ayam (misal: "Kelompok Ayam 7 Ekor")
  jenis_ayam?: string; // opsional, contoh: 'Ayam Petelur', 'Isa Brown'
  nama_kandang?: string; // opsional backwards compatibility
  catatan?: string;
}

export interface CatatanIkan {
  id: string;
  created_at?: string;
  tanggal: string; // YYYY-MM-DD
  nama_kolam: string;
  jenis_ikan: string;
  jumlah_ikan: number;
  pakan_kg: number;
  jadwal_kuras: string; // YYYY-MM-DD
  status_air?: string; // 'Bersih' | 'Cukup' | 'Perlu Kuras'
  catatan?: string;
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

export interface AyamAiAnalysis {
  skor_kesehatan: number;
  status_kesehatan: string;
  prediksi_telur_besok: number;
  prediksi_tren: string;
  evaluasi_pakan: string;
  gram_per_ekor: number;
  peringatan: string[];
  saran_praktis: string[];
}

export interface KelompokAyam {
  id: string;
  nama: string; // misal: "Kelompok 1 (7 Ekor)"
  jumlah: number; // misal: 7
  umur_minggu: number; // umur awal dalam minggu saat dicatat
  tanggal_mulai: string; // YYYY-MM-DD saat umur_minggu dicatat
  jenis_ras?: string; // misal: "Isa Brown", "Lohmann Brown", "Ayam Kampung Petelur"
  catatan?: string;
  created_at?: string;
}

export interface UsiaAyamDetail {
  kelompok: KelompokAyam;
  umur_sekarang_minggu: number;
  umur_sekarang_hari_total: number;
  umur_sekarang_sisa_hari: number;
  fase_nama: string;
  fase_warna: string;
  fase_deskripsi: string;
  sudah_bertelur: boolean;
  prediksi_tgl_bertelur: string; // YYYY-MM-DD
  sisa_hari_menuju_bertelur: number;
  progress_menuju_lay: number; // 0 - 100%
  estimasi_potensi_telur_harian: number; // butir per hari saat puncak
  rekomendasi_pakan_dan_cahaya: string;
}
