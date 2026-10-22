import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { CatatanAyam, CatatanIkan, KelompokAyam, SupabaseConfig } from '../types';

const CONFIG_KEY = 'ternakku_supabase_config';
const LOCAL_AYAM_KEY = 'ternakku_local_ayam';
const LOCAL_IKAN_KEY = 'ternakku_local_ikan';
const LOCAL_KELOMPOK_KEY = 'ternakku_local_kelompok_ayam';

export const INITIAL_AYAM_DATA: CatatanAyam[] = [
  {
    id: 'ayam-1',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    tanggal: new Date(Date.now() - 86400000 * 2).toISOString().slice(0, 10),
    jenis_ayam: 'Ayam Petelur',
    jumlah_ayam: 120,
    pakan_kg: 14.5,
    jumlah_telur: 104,
    catatan: 'Kondisi ayam sehat, nafsu makan bagus',
  },
  {
    id: 'ayam-2',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    tanggal: new Date(Date.now() - 86400000).toISOString().slice(0, 10),
    jenis_ayam: 'Ayam Petelur',
    jumlah_ayam: 120,
    pakan_kg: 15.0,
    jumlah_telur: 106,
    catatan: 'Cuaca cerah, ventilasi kandang dibuka penuh',
  },
  {
    id: 'ayam-3',
    created_at: new Date().toISOString(),
    tanggal: new Date().toISOString().slice(0, 10),
    jenis_ayam: 'Ayam Petelur',
    jumlah_ayam: 120,
    pakan_kg: 14.8,
    jumlah_telur: 105,
    catatan: 'Produksi telur stabil dan bagus',
  },
];

export const INITIAL_IKAN_DATA: CatatanIkan[] = [
  {
    id: 'ikan-1',
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    tanggal: new Date(Date.now() - 86400000 * 3).toISOString().slice(0, 10),
    nama_kolam: 'Kolam Bioflok 1',
    jenis_ikan: 'Nila Merah',
    jumlah_ikan: 500,
    pakan_kg: 4.5,
    jadwal_kuras: new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 10),
    status_air: 'Bersih',
    catatan: 'Air warna hijau stabil, aerator lancar',
  },
  {
    id: 'ikan-2',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    tanggal: new Date(Date.now() - 86400000).toISOString().slice(0, 10),
    nama_kolam: 'Kolam Terpal 2',
    jenis_ikan: 'Lele Sangkuriang',
    jumlah_ikan: 800,
    pakan_kg: 6.0,
    jadwal_kuras: new Date().toISOString().slice(0, 10), // Hari ini!
    status_air: 'Perlu Kuras',
    catatan: 'Jadwal kuras hari ini (30% air bawah)',
  },
];

export function getStoredConfig(): SupabaseConfig {
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed reading Supabase config from localStorage', e);
  }
  return {
    url: '',
    anonKey: '',
  };
}

export function saveStoredConfig(config: SupabaseConfig): void {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
}

let cachedClient: SupabaseClient | null = null;
let cachedKey = '';

export function getSupabaseClient(config?: SupabaseConfig): SupabaseClient | null {
  const current = config || getStoredConfig();
  if (!current.url || !current.anonKey) {
    cachedClient = null;
    return null;
  }
  const key = `${current.url}__${current.anonKey}`;
  if (cachedClient && cachedKey === key) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(current.url, current.anonKey);
    cachedKey = key;
    return cachedClient;
  } catch (err) {
    console.error('Error initializing Supabase client:', err);
    return null;
  }
}

// Local storage fallback helpers
export function getLocalAyam(): CatatanAyam[] {
  try {
    const raw = localStorage.getItem(LOCAL_AYAM_KEY);
    if (raw) {
      const parsed: CatatanAyam[] = JSON.parse(raw);
      return parsed.map((item) => ({
        ...item,
        jenis_ayam: item.jenis_ayam || 'Ayam Petelur',
      }));
    }
  } catch (e) {
    console.error(e);
  }
  localStorage.setItem(LOCAL_AYAM_KEY, JSON.stringify(INITIAL_AYAM_DATA));
  return INITIAL_AYAM_DATA;
}

export function saveLocalAyam(data: CatatanAyam[]): void {
  localStorage.setItem(LOCAL_AYAM_KEY, JSON.stringify(data));
}

export function getLocalIkan(): CatatanIkan[] {
  try {
    const raw = localStorage.getItem(LOCAL_IKAN_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  localStorage.setItem(LOCAL_IKAN_KEY, JSON.stringify(INITIAL_IKAN_DATA));
  return INITIAL_IKAN_DATA;
}

export function saveLocalIkan(data: CatatanIkan[]): void {
  localStorage.setItem(LOCAL_IKAN_KEY, JSON.stringify(data));
}

export const INITIAL_KELOMPOK_AYAM: KelompokAyam[] = [
  {
    id: 'kelompok-1',
    nama: 'Kelompok Ayam Utama',
    jumlah: 7,
    umur_minggu: 15,
    tanggal_mulai: new Date().toISOString().slice(0, 10),
    jenis_ras: 'Ayam Petelur Coklat (Layer)',
    catatan: '7 ekor ayam sehat, tinggal ~3 minggu lagi memasuki usia bertelur',
    created_at: new Date().toISOString(),
  },
];

export function getLocalKelompokAyam(): KelompokAyam[] {
  try {
    const raw = localStorage.getItem(LOCAL_KELOMPOK_KEY);
    if (raw) {
      const parsed: KelompokAyam[] = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading kelompok ayam from localStorage', e);
  }
  localStorage.setItem(LOCAL_KELOMPOK_KEY, JSON.stringify(INITIAL_KELOMPOK_AYAM));
  return INITIAL_KELOMPOK_AYAM;
}

export function saveLocalKelompokAyam(data: KelompokAyam[]): void {
  localStorage.setItem(LOCAL_KELOMPOK_KEY, JSON.stringify(data));
}
