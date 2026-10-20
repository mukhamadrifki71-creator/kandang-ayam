import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// AI Poultry Monitoring & Prediction Endpoint
app.post('/api/ai/analyze-ayam', async (req, res) => {
  try {
    const { history, question } = req.body;

    if (!history || !Array.isArray(history) || history.length === 0) {
      return res.status(400).json({ error: 'Data riwayat ayam diperlukan untuk analisis.' });
    }

    const promptText = `
Anda adalah seorang Dokter Hewan dan Ahli Nutrisi Unggas (Poultry Specialist) profesional dan berpengalaman di Indonesia.
Analisis data performa ternak ayam petelur berikut:

Riwayat Catatan Harian Terbaru (Urutan Terkini ke Lampau):
${JSON.stringify(history.slice(0, 14), null, 2)}

Pertanyaan Khusus Peternak (jika ada):
${question ? question : 'Tidak ada pertanyaan khusus, berikan analisis performa menyeluruh.'}

Pedoman Peternakan & Siklus Umur Ayam:
- Perhatikan "jenis_ayam" (contoh: Isa Brown, Lohmann Brown, Hy-Line Brown, Ayam KUB, dll.) dan "tanggal_masuk" kandang.
- Pullet masuk umumnya berumur 16 minggu (112 hari).
- Kurva Siklus Umur Ayam Petelur (Layer Curve):
  * Umur < 18 minggu: Fase Pullet (Belum bertelur)
  * Umur 18 - 24 minggu: Fase Awal Bertelur (Mulai naik 10% - 75%)
  * Umur 25 - 42 minggu: Puncak Produksi / Peak Phase (Standar ras komersial: 88 - 95%; Ayam KUB: 55 - 70%)
  * Umur 43 - 72 minggu: Fase Produksi Stabil (Turun bertahap 0.5%/minggu hingga 75-80%)
  * Umur > 72 minggu: Persiapan Afkir atau Molting
- Standar pakan: ~110 - 125 gram/ekor/hari untuk layer komersial; ~85 - 100 gram untuk ayam kampung/KUB.

Berikan output JSON terstruktur yang akurat, realistis, dan berorientasi pada solusi praktis bagi peternak rakyat.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: promptText,
      config: {
        systemInstruction:
          'Anda adalah asisten pakar peternakan ayam petelur cerdas berbahasa Indonesia. Analisis performa berdasarkan jenis ras ayam dan umur minggu siklus bertelurnya.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            skor_kesehatan: {
              type: Type.INTEGER,
              description: 'Skor kesehatan & efisiensi ternak dari 0 sampai 100',
            },
            status_kesehatan: {
              type: Type.STRING,
              description: 'Status: Sangat Sehat / Normal / Perlu Perhatian / Waspada Kritis',
            },
            prediksi_telur_besok: {
              type: Type.INTEGER,
              description: 'Prediksi angka butir telur yang akan dihasilkan besok',
            },
            prediksi_tren_7hari: {
              type: Type.STRING,
              description: 'Prediksi tren produksi 7 hari ke depan (misal: Cenderung naik bertahap)',
            },
            evaluasi_pakan: {
              type: Type.STRING,
              description: 'Analisis kecukupan gram pakan per ekor per hari dibanding standar',
            },
            evaluasi_siklus: {
              type: Type.STRING,
              description: 'Analisis kesesuaian produksi telur dengan umur minggu siklus dan jenis ras ayam',
            },
            peringatan_anomali: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Daftar peringatan atau potensi risiko yang terdeteksi dari data',
            },
            rekomendasi_tindakan: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  kategori: { type: Type.STRING, description: 'Nutrisi / Kandang / Pencegahan / Air / Siklus' },
                  saran: { type: Type.STRING, description: 'Saran tindakan praktis' },
                  prioritas: { type: Type.STRING, description: 'Tinggi / Sedang / Rutin' },
                },
                required: ['kategori', 'saran', 'prioritas'],
              },
              description: 'Daftar rekomendasi langkah konkret untuk peternak',
            },
            catatan_ahli: {
              type: Type.STRING,
              description: 'Penjelasan naratif ramah untuk peternak mencakup evaluasi siklus',
            },
          },
          required: [
            'skor_kesehatan',
            'status_kesehatan',
            'prediksi_telur_besok',
            'prediksi_tren_7hari',
            'evaluasi_pakan',
            'evaluasi_siklus',
            'peringatan_anomali',
            'rekomendasi_tindakan',
            'catatan_ahli',
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: unknown) {
    console.error('Error analyzing poultry data:', error);
    const msg = error instanceof Error ? error.message : 'Gagal melakukan analisis AI';
    return res.status(500).json({ error: msg });
  }
});

// Setup Vite Dev Server / Static files
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server TernakKu berjalan di http://localhost:${PORT}`);
  });
}

startServer();
