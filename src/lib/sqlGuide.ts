export const SUPABASE_SQL_SCHEMA = `-- 1. Buat Tabel Catatan Ayam (Simpel & Cepat)
CREATE TABLE IF NOT EXISTS public.catatan_ayam (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  tanggal DATE DEFAULT CURRENT_DATE NOT NULL,
  jumlah_ayam INTEGER NOT NULL CHECK (jumlah_ayam >= 0),
  pakan_kg NUMERIC(8, 2) NOT NULL CHECK (pakan_kg >= 0),
  jumlah_telur INTEGER NOT NULL CHECK (jumlah_telur >= 0),
  usia_minggu INTEGER DEFAULT NULL,
  kelompok_nama TEXT DEFAULT NULL,
  jenis_ayam TEXT DEFAULT 'Ayam Petelur',
  catatan TEXT DEFAULT ''
);

-- JIKA TABEL SUDAH ADA SEBELUMNYA, TAMBAHKAN KOLOM USIA & JENIS JIKA BELUM ADA:
ALTER TABLE public.catatan_ayam 
  ADD COLUMN IF NOT EXISTS usia_minggu INTEGER DEFAULT NULL;
ALTER TABLE public.catatan_ayam 
  ADD COLUMN IF NOT EXISTS kelompok_nama TEXT DEFAULT NULL;
ALTER TABLE public.catatan_ayam 
  ADD COLUMN IF NOT EXISTS jenis_ayam TEXT DEFAULT 'Ayam Petelur';

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

-- 3. Buat Tabel Kelompok/Angkatan Ayam (Manajemen Usia & Prediksi Bertelur)
CREATE TABLE IF NOT EXISTS public.kelompok_ayam (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  nama TEXT NOT NULL,
  jumlah INTEGER NOT NULL CHECK (jumlah > 0),
  umur_minggu INTEGER NOT NULL CHECK (umur_minggu >= 0),
  tanggal_mulai DATE DEFAULT CURRENT_DATE NOT NULL,
  jenis_ras TEXT DEFAULT 'Ayam Petelur Coklat (Layer)',
  catatan TEXT DEFAULT ''
);

-- 4. Aktifkan Row Level Security (RLS) & Berikan Akses Publik (Anon Key)
ALTER TABLE public.catatan_ayam ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catatan_ikan ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kelompok_ayam ENABLE ROW LEVEL SECURITY;

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

CREATE POLICY "Akses Publik Penuh Kelompok Ayam" 
  ON public.kelompok_ayam 
  FOR ALL 
  TO anon, authenticated 
  USING (true) 
  WITH CHECK (true);

-- 5. PENTING: Aktifkan Real-Time Supabase (onpostgreschanges)
ALTER PUBLICATION supabase_realtime ADD TABLE public.catatan_ayam;
ALTER PUBLICATION supabase_realtime ADD TABLE public.catatan_ikan;
ALTER PUBLICATION supabase_realtime ADD TABLE public.kelompok_ayam;
`;

export const SUPABASE_STEPS = [
  {
    step: 1,
    title: 'Buka Supabase SQL Editor',
    desc: 'Di menu sebelah kiri Supabase Dashboard, klik "SQL Editor", klik "New query".',
  },
  {
    step: 2,
    title: 'Jalankan Script SQL',
    desc: 'Salin script SQL di atas dan tempel di editor query Supabase, lalu klik "Run".',
  },
  {
    step: 3,
    title: 'Ambil API Key',
    desc: 'Buka Project Settings > Data API, salin Project URL dan anon public key Anda.',
  },
  {
    step: 4,
    title: 'Selesai & Real-Time Langsung Aktif',
    desc: 'Masukkan URL & Key ke aplikasi ini. Data ayam dan ikan Anda akan tersimpan dan sinkron otomatis di semua HP dan komputer!',
  },
];
