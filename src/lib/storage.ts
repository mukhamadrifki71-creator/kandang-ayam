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
    jenis_ayam: 'Ayam Petelur Coklat (Layer)',
    jumlah_ayam: 7,
    pakan_kg: 0.8,
    jumlah_telur: 0,
    usia_minggu: 15,
    kelompok_nama: 'Kelompok Ayam Utama (7 Ekor)',
    catatan: 'Usia 15 minggu, fase dara (pullet) aktif dan sehat, transisi pakan pre-lay',
  },
  {
    id: 'ayam-2',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    tanggal: new Date(Date.now() - 86400000).toISOString().slice(0, 10),
    jenis_ayam: 'Ayam Petelur Coklat (Layer)',
    jumlah_ayam: 7,
    pakan_kg: 0.85,
    jumlah_telur: 0,
    usia_minggu: 15,
    kelompok_nama: 'Kelompok Ayam Utama (7 Ekor)',
    catatan: 'Kandang bersih, nafsu makan sangat baik, persiapan kotak sarang bertelur',
  },
  {
    id: 'ayam-3',
    created_at: new Date().toISOString(),
    tanggal: new Date().toISOString().slice(0, 10),
    jenis_ayam: 'Ayam Petelur Coklat (Layer)',
    jumlah_ayam: 7,
    pakan_kg: 0.85,
    jumlah_telur: 0,
    usia_minggu: 15,
    kelompok_nama: 'Kelompok Ayam Utama (7 Ekor)',
    catatan: 'Kondisi lincah, diprediksi mulai bertelur di umur 18 minggu (~3 minggu lagi)',
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
    jadwal_kuras: new Date().toISOString().slice(0, 10),
    status_air: 'Perlu Kuras',
    catatan: 'Jadwal kuras hari ini (30% air bawah)',
  },
];

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

// ---------------------------------------------------------------------------
// Konfigurasi Supabase Client
// ---------------------------------------------------------------------------
export function getStoredConfig(): SupabaseConfig {
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Gagal membaca konfigurasi Supabase dari storage', e);
  }
  return { url: '', anonKey: '' };
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
    console.error('Gagal inisialisasi Supabase client:', err);
    return null;
  }
}

// ---------------------------------------------------------------------------
// OPERASI CATATAN AYAM (Direct Supabase)
// ---------------------------------------------------------------------------

/**
 * Mengambil seluruh riwayat catatan ayam langsung dari Supabase
 */
export async function fetchCatatanAyam(): Promise<CatatanAyam[]> {
  const client = getSupabaseClient();
  if (!client) {
    throw new Error('Supabase belum terhubung. Silakan masukkan Supabase URL & Key terlebih dahulu.');
  }

  const { data, error } = await client
    .from('catatan_ayam')
    .select('*')
    .order('tanggal', { ascending: false });

  if (error) {
    console.error('Gagal mengambil catatan ayam dari Supabase:', error);
    throw new Error(`Gagal mengambil data: ${error.message}`);
  }

  return (data || []).map((item) => ({
    id: String(item.id),
    created_at: item.created_at,
    tanggal: item.tanggal,
    jenis_ayam: item.jenis_ayam || 'Ayam Petelur Coklat (Layer)',
    jumlah_ayam: Number(item.jumlah_ayam || 0),
    pakan_kg: Number(item.pakan_kg || 0),
    jumlah_telur: Number(item.jumlah_telur || 0),
    usia_minggu: Number(item.usia_minggu || 0), // <--- Kolom Usia Minggu
    kelompok_nama: item.kelompok_nama || item.kelompok_id || '',
    catatan: item.catatan || '',
  }));
}

/**
 * Menyimpan catatan ayam baru langsung ke Supabase
 */
export async function saveCatatanAyam(catatan: Omit<CatatanAyam, 'id' | 'created_at'>) {
  const client = getSupabaseClient();
  if (!client) {
    throw new Error('Supabase belum terhubung.');
  }

  const { data, error } = await client
    .from('catatan_ayam')
    .insert([
      {
        tanggal: catatan.tanggal,
        jenis_ayam: catatan.jenis_ayam,
        jumlah_ayam: catatan.jumlah_ayam,
        pakan_kg: catatan.pakan_kg,
        jumlah_telur: catatan.jumlah_telur,
        usia_minggu: catatan.usia_minggu, // <--- Menyimpan Usia ke Supabase
        kelompok_nama: catatan.kelompok_nama,
        catatan: catatan.catatan,
      },
    ])
    .select();

  if (error) {
    console.error('Gagal menyimpan catatan ayam ke Supabase:', error);
    throw new Error(`Gagal menyimpan: ${error.message}`);
  }

  return data;
}

/**
 * Menghapus catatan ayam berdasarkan ID dari Supabase
 */
export async function deleteCatatanAyam(id: string): Promise<void> {
  const client = getSupabaseClient();
  if (!client) {
    throw new Error('Supabase belum terhubung.');
  }

  const { error } = await client
    .from('catatan_ayam')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Gagal menghapus catatan ayam dari Supabase:', error);
    throw new Error(`Gagal menghapus: ${error.message}`);
  }
}

// ---------------------------------------------------------------------------
// OPERASI KELOMPOK / BATCH AYAM (Direct Supabase)
// ---------------------------------------------------------------------------

/**
 * Mengambil daftar kelompok ayam dari Supabase
 */
export async function fetchKelompokAyam(): Promise<KelompokAyam[]> {
  const client = getSupabaseClient();
  if (!client) {
    throw new Error('Supabase belum terhubung.');
  }

  const { data, error } = await client
    .from('kelompok_ayam')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Gagal mengambil kelompok ayam dari Supabase:', error);
    throw new Error(`Gagal mengambil kelompok: ${error.message}`);
  }

  return (data || []).map((item) => ({
    id: String(item.id),
    nama: item.nama,
    jumlah: Number(item.jumlah || item.jumlah_ekor || 0),
    umur_minggu: Number(item.umur_minggu || item.usia_minggu || 0), // <--- Kolom Usia Minggu
    tanggal_mulai: item.tanggal_mulai,
    jenis_ras: item.jenis_ras,
    catatan: item.catatan || item.keterangan || '',
    created_at: item.created_at,
  }));
}

/**
 * Menyimpan kelompok/batch ayam baru ke Supabase
 */
export async function saveKelompokAyam(kelompok: Omit<KelompokAyam, 'id' | 'created_at'>) {
  const client = getSupabaseClient();
  if (!client) {
    throw new Error('Supabase belum terhubung.');
  }

  const { data, error } = await client
    .from('kelompok_ayam')
    .insert([
      {
        nama: kelompok.nama,
        jumlah: kelompok.jumlah,
        umur_minggu: kelompok.umur_minggu, // <--- Menyimpan Usia ke Supabase
        tanggal_mulai: kelompok.tanggal_mulai,
        jenis_ras: kelompok.jenis_ras,
        catatan: kelompok.catatan,
      },
    ])
    .select();

  if (error) {
    console.error('Gagal menyimpan kelompok ayam ke Supabase:', error);
    throw new Error(`Gagal menyimpan kelompok: ${error.message}`);
  }

  return data;
}

/**
 * Menghapus kelompok ayam berdasarkan ID dari Supabase
 */
export async function deleteKelompokAyam(id: string): Promise<void> {
  const client = getSupabaseClient();
  if (!client) {
    throw new Error('Supabase belum terhubung.');
  }

  const { error } = await client
    .from('kelompok_ayam')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Gagal menghapus kelompok ayam dari Supabase:', error);
    throw new Error(`Gagal menghapus kelompok: ${error.message}`);
  }
}

// ---------------------------------------------------------------------------
// OPERASI LOCAL STORAGE (Offline / Demo Fallback)
// ---------------------------------------------------------------------------

export function getLocalAyam(): CatatanAyam[] {
  try {
    const raw = localStorage.getItem(LOCAL_AYAM_KEY);
    if (raw) {
      const parsed: CatatanAyam[] = JSON.parse(raw);
      return parsed.map((item) => ({
        ...item,
        jenis_ayam: item.jenis_ayam || 'Ayam Petelur Coklat (Layer)',
      }));
    }
  } catch (e) {
    console.error('Gagal membaca data ayam lokal:', e);
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
    console.error('Gagal membaca data ikan lokal:', e);
  }
  localStorage.setItem(LOCAL_IKAN_KEY, JSON.stringify(INITIAL_IKAN_DATA));
  return INITIAL_IKAN_DATA;
}

export function saveLocalIkan(data: CatatanIkan[]): void {
  localStorage.setItem(LOCAL_IKAN_KEY, JSON.stringify(data));
}

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
    console.error('Gagal membaca kelompok ayam lokal:', e);
  }
  localStorage.setItem(LOCAL_KELOMPOK_KEY, JSON.stringify(INITIAL_KELOMPOK_AYAM));
  return INITIAL_KELOMPOK_AYAM;
}

export function saveLocalKelompokAyam(data: KelompokAyam[]): void {
  localStorage.setItem(LOCAL_KELOMPOK_KEY, JSON.stringify(data));
}