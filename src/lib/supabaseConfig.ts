import { SupabaseConfig } from '../types';

/**
 * ============================================================================
 * KONFIGURASI SUPABASE TERKUNCI (LOCKED PERMANENT CREDENTIALS)
 * ============================================================================
 * Kredensial di bawah ini dikunci secara permanen di kode aplikasi.
 * Anda TIDAK PERLU memasukkan ulang URL atau Anon Key setiap kali membuka aplikasi
 * atau saat cache browser dibersihkan.
 *
 * Anda juga dapat mengisinya melalui environment variable VITE_SUPABASE_URL
 * dan VITE_SUPABASE_ANON_KEY.
 */
export const LOCKED_SUPABASE_CONFIG: SupabaseConfig = {
  url: (import.meta.env.VITE_SUPABASE_URL as string) || '',
  anonKey: (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || '',
};

/**
 * Cek apakah konfigurasi Supabase sudah terisi dan valid
 */
export function isSupabaseConfigured(config: SupabaseConfig): boolean {
  return Boolean(
    config.url &&
    config.url.trim().length > 10 &&
    config.anonKey &&
    config.anonKey.trim().length > 20
  );
}
