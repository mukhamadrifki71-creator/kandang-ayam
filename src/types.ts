export interface CatatanAyam {
  id: string;
  created_at?: string;
  tanggal: string; // YYYY-MM-DD
  jumlah_ayam: number;
  pakan_kg: number;
  jumlah_telur: number;
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
