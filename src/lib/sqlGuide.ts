export const SUPABASE_SQL_SCHEMA = `-- 1. Buat Tabel Catatan Ayam
CREATE TABLE IF NOT EXISTS public.catatan_ayam (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  tanggal DATE DEFAULT CURRENT_DATE NOT NULL,
  jumlah_ayam INTEGER NOT NULL CHECK (jumlah_ayam >= 0),
  pakan_kg NUMERIC(8, 2) NOT NULL CHECK (pakan_kg >= 0),
  jumlah_telur INTEGER NOT NULL CHECK (jumlah_telur >= 0),
  catatan TEXT DEFAULT ''
);

-- 2. Buat Tabel Catatan Ikan
CREATE TABLE IF NOT EXISTS public.catatan_ikan (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  tanggal DATE DEFAULT CURRENT_DATE NOT NULL,
  nama_kolam TEXT NOT NULL,
  jenis_ikan TEXT NOT NULL,
  jumlah_ikan INTEGER NOT NULL CHECK (jumlah_ikan >= 0),
  pakan_kg NUMERIC(8, 2) NOT NULL CHECK (pakan_kg >= 0),
  jadwal_kuras DATE NOT NULL,
  status_air TEXT DEFAULT 'Bersih',
  catatan TEXT DEFAULT ''
);

-- 3. Aktifkan Row Level Security (RLS) & Berikan Akses Publik (Anon Key)
ALTER TABLE public.catatan_ayam ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catatan_ikan ENABLE ROW LEVEL SECURITY;

-- Kebijakan akses penuh untuk pengguna website (Anon Key)
CREATE POLICY "Akses Publik Penuh Catatan Ayam" 
  ON public.catatan_ayam 
  FOR ALL 
  TO anon, authenticated 
  USING (true) 
  WITH CHECK (true);

CREATE POLICY "Akses Publik Penuh Catatan Ikan" 
  ON public.catatan_ikan 
  FOR ALL 
  TO anon, authenticated 
  USING (true) 
  WITH CHECK (true);

-- 4. PENTING: Aktifkan Real-Time Supabase (onpostgreschanges)
-- Menambahkan kedua tabel ke publication realtime agar perubahan langsung diteruskan ke web browser
ALTER PUBLICATION supabase_realtime ADD TABLE public.catatan_ayam;
ALTER PUBLICATION supabase_realtime ADD TABLE public.catatan_ikan;
`;

export const SUPABASE_STEPS = [
  {
    step: 1,
    title: 'Buat Project di Supabase',
    desc: 'Buka https://supabase.com, daftar/masuk gratis, lalu klik "New Project". Masukkan nama project (contoh: TernakKu) dan password database.',
  },
  {
    step: 2,
    title: 'Jalankan SQL Schema',
    desc: 'Di menu sebelah kiri Supabase Dashboard, klik "SQL Editor", klik "New query", tempelkan script SQL di atas, lalu klik "Run".',
  },
  {
    step: 3,
    title: 'Salin Project URL & Anon Key',
    desc: 'Buka menu "Project Settings" (ikon gerigi) -> "API". Salin "Project URL" dan "anon public key".',
  },
  {
    step: 4,
    title: 'Hubungkan ke Website / GitHub Pages',
    desc: 'Masukkan URL dan Anon Key pada menu Pengaturan di website ini atau masukkan langsung ke kode index.html sebelum deploy.',
  },
];
