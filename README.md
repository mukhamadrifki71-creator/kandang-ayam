# 🌾 TernakKu - Manajemen Ternak Ayam & Kolam Ikan Real-Time

Aplikasi modern, ringan, dan cepat untuk mencatat perkembangan ternak ayam petelur (populasi, konsumsi pakan, produksi telur) serta manajemen kolam ikan (populasi, pakan, jadwal kuras air). Terintegrasi dengan **Supabase Real-Time** dan dapat berjalan offline/lokal di browser.

---

## 🚀 Panduan Deploy GitHub Pages (Agar Web Langsung Muncul, Bukan README)

Jika saat di-deploy ke GitHub Pages yang muncul hanya file README ini, hal itu terjadi karena GitHub Pages secara bawaan mencari file website yang sudah siap saji. 

Pilih salah satu cara mudah berikut agar aplikasi Anda langsung aktif:

### 🌟 Cara 1: Menggunakan Folder `/docs` (Paling Cepat & Direkomendasikan)
Di repository ini sudah tersedia file website siap saji di dalam folder **`docs/`**.
1. Buka repository Anda di **GitHub**.
2. Klik tab **Settings** (ikon gerigi di atas).
3. Di bilah samping kiri, klik **Pages**.
4. Di bagian **Build and deployment**:
   - **Source**: Pilih `Deploy from a branch`
   - **Branch**: Pilih `main` (atau `master`)
   - **Folder**: Ubah dari `/(root)` menjadi **`/docs`** ⚠️ *(Langkah penting)*
   - Klik tombol **Save**.
5. Tunggu sekitar 1 menit, lalu refresh halaman Settings > Pages. Link website Anda akan muncul di atas (contoh: `https://username.github.io/nama-repo/`) dan bisa langsung dibuka di HP maupun laptop!

---

### ⚡ Cara 2: Menggunakan GitHub Actions (Otomatis Build)
Repository ini sudah dilengkapi file konfigurasi workflow `.github/workflows/deploy.yml`.
1. Masuk ke tab **Settings** > **Pages** di repository GitHub Anda.
2. Pada bagian **Source**, ubah dropdown dari *Deploy from a branch* menjadi **GitHub Actions**.
3. Selesai! GitHub akan otomatis meng-compile dan memperbarui website Anda setiap kali Anda melakukan `git push`.

---

## 🛠️ Fitur Utama Aplikasi

- 🐔 **Pencatatan Ayam**: Pantau populasi, konsumsi pakan harian (kg & gram/ekor), serta produksi telur (butir & rasio produktivitas %).
- 🐟 **Manajemen Kolam Ikan**: Catat jenis ikan, populasi, pakan harian, jadwal kuras air berkala dengan status air (Bersih / Cukup / Perlu Kuras).
- 🗑️ **Tombol Hapus Berfungsi Sempurna**: Hapus catatan dengan pembaruan instan (*optimistic delete*) baik dalam mode lokal maupun saat terhubung ke database.
- ⚡ **Supabase Cloud & Offline Mode**: Dapat dijalankan tanpa setup database (tersimpan otomatis di browser) atau hubungkan ke Supabase URL & Anon Key untuk sinkronisasi antar perangkat tanpa refresh.
- 📱 **Desain Responsif**: Tampilan rapi dan nyaman dibuka dari layar HP smartphone maupun desktop/laptop.

---

## 📂 Struktur File Penting

- `docs/index.html`: File tunggal mandiri (HTML + CSS Tailwind + Supabase JS) siap saji untuk GitHub Pages tanpa proses build.
- `src/`: Kode sumber React 19 + TypeScript + Vite.
- `.github/workflows/deploy.yml`: Workflow otomatis build & deploy GitHub Pages.
- `index.html`: Entry point Vite untuk server pengembangan lokal.
