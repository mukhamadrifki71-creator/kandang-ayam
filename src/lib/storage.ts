import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { CatatanAyam, CatatanIkan, KelompokAyam, SupabaseConfig } from '../types';
import { LOCKED_SUPABASE_CONFIG } from './supabaseConfig';

const CONFIG_KEY = 'ternakku_supabase_config';

// Bersihkan cache / mock lokal lama di browser agar data murni dari Supabase
try {
  localStorage.removeItem('ternakku_local_ayam');
  localStorage.removeItem('ternakku_local_ikan');
  localStorage.removeItem('ternakku_local_kelompok_ayam');
  localStorage.removeItem('demo_ayam');
  localStorage.removeItem('demo_ikan');
} catch {
  // abaikan error jika storage dibatasi
}

// ---------------------------------------------------------------------------
// Konfigurasi Supabase Client (Terkunci & Permanen)
// ---------------------------------------------------------------------------

export function getStoredConfig(): SupabaseConfig {
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.url && parsed.anonKey) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Gagal membaca konfigurasi Supabase dari storage', e);
  }

  // Gunakan kredensial terkunci jika tersedia
  return LOCKED_SUPABASE_CONFIG;
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
// OPERASI CATATAN AYAM (Murni Supabase)
// ---------------------------------------------------------------------------

export async function fetchCatatanAyam(clientOverride?: SupabaseClient): Promise<CatatanAyam[]> {
  const client = clientOverride || getSupabaseClient();
  if (!client) {
    throw new Error('Supabase belum terhubung. Silakan masukkan Supabase URL & Anon Key terlebih dahulu.');
  }

  const { data, error } = await client
    .from('catatan_ayam')
    .select('*')
    .order('tanggal', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Gagal mengambil catatan ayam dari Supabase:', error);
    throw new Error(`Gagal mengambil data ayam: ${error.message}`);
  }

  return (data || []).map((item) => ({
    id: String(item.id),
    created_at: item.created_at,
    tanggal: item.tanggal,
    jenis_ayam: item.jenis_ayam || 'Ayam Petelur Coklat (Layer)',
    jumlah_ayam: Number(item.jumlah_ayam || 0),
    pakan_kg: Number(item.pakan_kg || 0),
    jumlah_telur: Number(item.jumlah_telur || 0),
    usia_minggu: item.usia_minggu !== undefined && item.usia_minggu !== null ? Number(item.usia_minggu) : undefined,
    kelompok_id: item.kelompok_id,
    kelompok_nama: item.kelompok_nama || '',
    catatan: item.catatan || '',
  }));
}

export async function saveCatatanAyam(catatan: Omit<CatatanAyam, 'id' | 'created_at'>, clientOverride?: SupabaseClient) {
  const client = clientOverride || getSupabaseClient();
  if (!client) {
    throw new Error('Supabase belum terhubung.');
  }

  const ageTag =
    typeof catatan.usia_minggu === 'number'
      ? `[Usia: ${catatan.usia_minggu} Minggu${catatan.kelompok_nama ? ` | ${catatan.kelompok_nama}` : ''}] `
      : '';
  const formattedCatatan = (ageTag + (catatan.catatan || '')).trim();

  let insertPayload: Record<string, unknown> = {
    tanggal: catatan.tanggal,
    jumlah_ayam: catatan.jumlah_ayam,
    pakan_kg: catatan.pakan_kg,
    jumlah_telur: catatan.jumlah_telur,
    usia_minggu: catatan.usia_minggu,
    kelompok_nama: catatan.kelompok_nama,
    catatan: formattedCatatan,
  };

  let res = await client.from('catatan_ayam').insert([insertPayload]).select();

  // Fallback jika kolom usia_minggu / kelompok_nama belum ada di skema Supabase
  if (res.error && res.error.code === 'PGRST204') {
    const fallbackPayload = {
      tanggal: catatan.tanggal,
      jumlah_ayam: catatan.jumlah_ayam,
      pakan_kg: catatan.pakan_kg,
      jumlah_telur: catatan.jumlah_telur,
      catatan: formattedCatatan,
    };
    res = await client.from('catatan_ayam').insert([fallbackPayload]).select();
  }

  if (res.error) {
    console.error('Gagal menyimpan catatan ayam ke Supabase:', res.error);
    throw new Error(`Gagal menyimpan ke Supabase: ${res.error.message}`);
  }

  return res.data && res.data[0] ? res.data[0] : null;
}

export async function updateCatatanAyam(
  id: string,
  updates: Partial<CatatanAyam>,
  clientOverride?: SupabaseClient
) {
  const client = clientOverride || getSupabaseClient();
  if (!client) {
    throw new Error('Supabase belum terhubung.');
  }

  const payload: Record<string, unknown> = {};
  if (updates.tanggal !== undefined) payload.tanggal = updates.tanggal;
  if (updates.jumlah_ayam !== undefined) payload.jumlah_ayam = updates.jumlah_ayam;
  if (updates.pakan_kg !== undefined) payload.pakan_kg = updates.pakan_kg;
  if (updates.jumlah_telur !== undefined) payload.jumlah_telur = updates.jumlah_telur;
  if (updates.catatan !== undefined) payload.catatan = updates.catatan;
  if (updates.usia_minggu !== undefined) payload.usia_minggu = updates.usia_minggu;
  if (updates.kelompok_nama !== undefined) payload.kelompok_nama = updates.kelompok_nama;
  if (updates.jenis_ayam !== undefined) payload.jenis_ayam = updates.jenis_ayam;

  let res = await client.from('catatan_ayam').update(payload).eq('id', id).select();

  // Fallback jika usia_minggu atau kelompok_nama belum ada di kolom skema
  if (res.error && res.error.code === 'PGRST204') {
    delete payload.usia_minggu;
    delete payload.kelompok_nama;
    res = await client.from('catatan_ayam').update(payload).eq('id', id).select();
  }

  if (res.error) {
    console.error('Gagal memperbarui catatan ayam di Supabase:', res.error);
    throw new Error(`Gagal memperbarui catatan ayam: ${res.error.message}`);
  }

  return res.data && res.data[0] ? res.data[0] : null;
}

export async function deleteCatatanAyam(id: string, clientOverride?: SupabaseClient): Promise<void> {
  const client = clientOverride || getSupabaseClient();
  if (!client) {
    throw new Error('Supabase belum terhubung.');
  }

  const { error } = await client.from('catatan_ayam').delete().eq('id', id);
  if (error) {
    console.error('Gagal menghapus catatan ayam dari Supabase:', error);
    throw new Error(`Gagal menghapus: ${error.message}`);
  }
}

// ---------------------------------------------------------------------------
// OPERASI CATATAN IKAN (Murni Supabase)
// ---------------------------------------------------------------------------

export async function fetchCatatanIkan(clientOverride?: SupabaseClient): Promise<CatatanIkan[]> {
  const client = clientOverride || getSupabaseClient();
  if (!client) {
    throw new Error('Supabase belum terhubung.');
  }

  const { data, error } = await client
    .from('catatan_ikan')
    .select('*')
    .order('tanggal', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Gagal mengambil data ikan dari Supabase:', error);
    throw new Error(`Gagal mengambil data kolam: ${error.message}`);
  }

  return (data || []).map((item) => ({
    id: String(item.id),
    created_at: item.created_at,
    tanggal: item.tanggal,
    nama_kolam: item.nama_kolam,
    jenis_ikan: item.jenis_ikan,
    jumlah_ikan: Number(item.jumlah_ikan || 0),
    pakan_kg: Number(item.pakan_kg || 0),
    jadwal_kuras: item.jadwal_kuras,
    status_air: item.status_air || 'Bersih',
    catatan: item.catatan || '',
  }));
}

export async function saveCatatanIkan(kolam: Omit<CatatanIkan, 'id' | 'created_at'>, clientOverride?: SupabaseClient) {
  const client = clientOverride || getSupabaseClient();
  if (!client) {
    throw new Error('Supabase belum terhubung.');
  }

  let res = await client.from('catatan_ikan').insert([kolam]).select();
  if (res.error && res.error.code === 'PGRST204' && res.error.message?.includes('status_air')) {
    const { status_air, ...rest } = kolam;
    res = await client.from('catatan_ikan').insert([rest]).select();
  }

  if (res.error) {
    console.error('Gagal menyimpan kolam ke Supabase:', res.error);
    throw new Error(`Gagal menyimpan kolam: ${res.error.message}`);
  }

  return res.data && res.data[0] ? res.data[0] : null;
}

export async function deleteCatatanIkan(id: string, clientOverride?: SupabaseClient): Promise<void> {
  const client = clientOverride || getSupabaseClient();
  if (!client) {
    throw new Error('Supabase belum terhubung.');
  }

  const { error } = await client.from('catatan_ikan').delete().eq('id', id);
  if (error) {
    console.error('Gagal menghapus catatan ikan dari Supabase:', error);
    throw new Error(`Gagal menghapus kolam: ${error.message}`);
  }
}

// ---------------------------------------------------------------------------
// OPERASI KELOMPOK / BATCH AYAM (Murni Supabase)
// ---------------------------------------------------------------------------

export async function fetchKelompokAyam(clientOverride?: SupabaseClient): Promise<KelompokAyam[]> {
  const client = clientOverride || getSupabaseClient();
  if (!client) return [];

  const { data, error } = await client
    .from('kelompok_ayam')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    // Jika tabel kelompok_ayam belum dibuat di Supabase, kembalikan array kosong tanpa crash
    console.warn('Tabel kelompok_ayam belum tersedia di Supabase:', error.message);
    return [];
  }

  return (data || []).map((item) => ({
    id: String(item.id),
    nama: item.nama,
    jumlah: Number(item.jumlah || item.jumlah_ekor || 0),
    umur_minggu: Number(item.umur_minggu || item.usia_minggu || 0),
    tanggal_mulai: item.tanggal_mulai,
    jenis_ras: item.jenis_ras || 'Ayam Petelur Coklat (Layer)',
    catatan: item.catatan || item.keterangan || '',
    created_at: item.created_at,
  }));
}

export async function saveKelompokAyam(kelompok: Omit<KelompokAyam, 'id' | 'created_at'>, clientOverride?: SupabaseClient) {
  const client = clientOverride || getSupabaseClient();
  if (!client) {
    throw new Error('Supabase belum terhubung.');
  }

  const { data, error } = await client
    .from('kelompok_ayam')
    .insert([
      {
        nama: kelompok.nama,
        jumlah: kelompok.jumlah,
        umur_minggu: kelompok.umur_minggu,
        tanggal_mulai: kelompok.tanggal_mulai,
        jenis_ras: kelompok.jenis_ras,
        catatan: kelompok.catatan,
      },
    ])
    .select();

  if (error) {
    console.error('Gagal menyimpan kelompok ayam ke Supabase:', error);
    throw new Error(`Gagal menyimpan kelompok ayam: ${error.message}`);
  }

  return data && data[0] ? data[0] : null;
}

export async function updateKelompokAyam(id: string, updates: Partial<KelompokAyam>, clientOverride?: SupabaseClient) {
  const client = clientOverride || getSupabaseClient();
  if (!client) {
    throw new Error('Supabase belum terhubung.');
  }

  const { data, error } = await client
    .from('kelompok_ayam')
    .update(updates)
    .eq('id', id)
    .select();

  if (error) {
    console.error('Gagal memperbarui kelompok ayam di Supabase:', error);
    throw new Error(`Gagal memperbarui kelompok: ${error.message}`);
  }

  return data && data[0] ? data[0] : null;
}

export async function deleteKelompokAyam(id: string, clientOverride?: SupabaseClient): Promise<void> {
  const client = clientOverride || getSupabaseClient();
  if (!client) {
    throw new Error('Supabase belum terhubung.');
  }

  const { error } = await client.from('kelompok_ayam').delete().eq('id', id);
  if (error) {
    console.error('Gagal menghapus kelompok ayam dari Supabase:', error);
    throw new Error(`Gagal menghapus kelompok: ${error.message}`);
  }
}

// ---------------------------------------------------------------------------
// STUB PENGGANTI (Tanpa Mock Data Palsu / Tanpa Cache Dummy)
// ---------------------------------------------------------------------------
export const INITIAL_AYAM_DATA: CatatanAyam[] = [];
export const INITIAL_IKAN_DATA: CatatanIkan[] = [];
export const INITIAL_KELOMPOK_AYAM: KelompokAyam[] = [];

export function getLocalAyam(): CatatanAyam[] {
  return [];
}
export function saveLocalAyam(_data: CatatanAyam[]): void {}

export function getLocalIkan(): CatatanIkan[] {
  return [];
}
export function saveLocalIkan(_data: CatatanIkan[]): void {}

export function getLocalKelompokAyam(): KelompokAyam[] {
  return [];
}
export function saveLocalKelompokAyam(_data: KelompokAyam[]): void {}