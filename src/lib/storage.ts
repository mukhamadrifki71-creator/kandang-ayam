import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { CatatanAyam, CatatanIkan, SupabaseConfig } from '../types';

const CONFIG_KEY = 'ternakku_supabase_config';
const LOCAL_AYAM_KEY = 'ternakku_local_ayam';
const LOCAL_IKAN_KEY = 'ternakku_local_ikan';

export const INITIAL_AYAM_DATA: CatatanAyam[] = [
  {
    id: 'ayam-1',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    tanggal: new Date(Date.now() - 86400000 * 2).toISOString().slice(0, 10),
    jumlah_ayam: 120,
    pakan_kg: 14.5,
    jumlah_telur: 98,
    catatan: 'Kondisi ayam sehat, nafsu makan bagus',
  },
  {
    id: 'ayam-2',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    tanggal: new Date(Date.now() - 86400000).toISOString().slice(0, 10),
    jumlah_ayam: 120,
    pakan_kg: 15.0,
    jumlah_telur: 102,
    catatan: 'Cuaca cerah, ventilasi kandang dibuka penuh',
  },
  {
    id: 'ayam-3',
    created_at: new Date().toISOString(),
    tanggal: new Date().toISOString().slice(0, 10),
    jumlah_ayam: 119,
    pakan_kg: 14.8,
    jumlah_telur: 105,
    catatan: '1 ekor dipisah ke kandang karantina (agak lemas)',
  },
];

export const INITIAL_IKAN_DATA: CatatanIkan[] = [
  {
    id: 'ikan-1',
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    tanggal: new Date(Date.now() - 86400000 * 3).toISOString().slice(0, 10),
    nama_kolam: 'Kolam Bioflok A1',
    jenis_ikan: 'Nila Merah',
    jumlah_ikan: 500,
    pakan_kg: 4.5,
    jadwal_kuras: new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10),
    status_air: 'Cukup',
    catatan: 'Air warna hijau stabil, aerator berjalan lancar',
  },
  {
    id: 'ikan-2',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    tanggal: new Date(Date.now() - 86400000).toISOString().slice(0, 10),
    nama_kolam: 'Kolam Terpal B2',
    jenis_ikan: 'Lele Sangkuriang',
    jumlah_ikan: 800,
    pakan_kg: 6.2,
    jadwal_kuras: new Date().toISOString().slice(0, 10), // Hari ini!
    status_air: 'Perlu Kuras',
    catatan: 'Kuras dasar 30% dan tambah air baru hari ini',
  },
  {
    id: 'ikan-3',
    created_at: new Date().toISOString(),
    tanggal: new Date().toISOString().slice(0, 10),
    nama_kolam: 'Kolam Tanah C1',
    jenis_ikan: 'Gurame Soang',
    jumlah_ikan: 250,
    pakan_kg: 2.0,
    jadwal_kuras: new Date(Date.now() + 86400000 * 6).toISOString().slice(0, 10),
    status_air: 'Bersih',
    catatan: 'Diberi tambahan daun talas sore hari',
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
    if (raw) return JSON.parse(raw);
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
