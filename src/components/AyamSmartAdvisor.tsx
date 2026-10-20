import React, { useState, useEffect } from 'react';
import { CatatanAyam, AyamAiAnalysis } from '../types';
import {
  Brain,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  RefreshCw,
  Send,
  Zap,
  Egg,
  ShieldAlert,
} from 'lucide-react';

interface Props {
  ayamList: CatatanAyam[];
}

export const AyamSmartAdvisor: React.FC<Props> = ({ ayamList }) => {
  const [analysis, setAnalysis] = useState<AyamAiAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [customQuestion, setCustomQuestion] = useState('');

  // Fallback heuristic engine if offline or server-side call fails
  const computeHeuristicAnalysis = (list: CatatanAyam[]): AyamAiAnalysis => {
    if (list.length === 0) {
      return {
        skor_kesehatan: 85,
        status_kesehatan: 'Belum Ada Data Cukup',
        prediksi_telur_besok: 0,
        prediksi_tren_7hari: 'Menunggu pencatatan data',
        evaluasi_pakan: 'Perlu minimal 1 data harian',
        peringatan_anomali: ['Silakan catat data harian ayam Anda untuk mengaktifkan pemantauan.'],
        rekomendasi_tindakan: [
          {
            kategori: 'Pencatatan',
            saran: 'Catat jumlah ayam, pakan, dan panen telur setiap sore.',
            prioritas: 'Rutin',
          },
        ],
        catatan_ahli: 'Aplikasi siap memantau performa ayam Anda secara real-time.',
      };
    }

    const latest = list[0];
    const prev = list.length > 1 ? list[1] : list[0];

    // Compute metrics
    const gramPerEkor =
      latest.jumlah_ayam > 0 ? (latest.pakan_kg * 1000) / latest.jumlah_ayam : 0;
    const rasioTelur =
      latest.jumlah_ayam > 0 ? (latest.jumlah_telur / latest.jumlah_ayam) * 100 : 0;
    const deltaTelur = latest.jumlah_telur - prev.jumlah_telur;

    // Moving average of last 3 records if available
    const recentSample = list.slice(0, 3);
    const avgTelur =
      recentSample.reduce((acc, c) => acc + c.jumlah_telur, 0) / recentSample.length;
    const predictedTomorrow = Math.round(
      avgTelur + (deltaTelur > 0 ? 1 : deltaTelur < 0 ? -1 : 0)
    );

    // Calculate score
    let score = 80;
    if (rasioTelur >= 85) score += 15;
    else if (rasioTelur >= 75) score += 5;
    else if (rasioTelur < 65) score -= 20;

    if (gramPerEkor >= 110 && gramPerEkor <= 125) score += 5;
    else if (gramPerEkor > 135 || gramPerEkor < 100) score -= 10;

    score = Math.max(20, Math.min(100, Math.round(score)));

    const anomalies: string[] = [];
    if (deltaTelur <= -10) {
      anomalies.push(`Terjadi penurunan telur sebesar ${Math.abs(deltaTelur)} butir dibanding kemarin.`);
    }
    if (gramPerEkor < 105) {
      anomalies.push(`Pakan ${gramPerEkor.toFixed(0)}g/ekor di bawah batas standar ayam petelur (110-120g).`);
    } else if (gramPerEkor > 135) {
      anomalies.push(`Pakan ${gramPerEkor.toFixed(0)}g/ekor berlebih, risiko kegemukan menurunkan produksi telur.`);
    }

    const actions = [
      {
        kategori: 'Nutrisi Pakan',
        saran:
          gramPerEkor < 110
            ? 'Tingkatkan porsi pakan bertahap menjadi 115-120 gram per ekor per hari.'
            : 'Jaga konsistensi formula pakan konsentrat jagung dan bekatul.',
        prioritas: gramPerEkor < 110 ? 'Tinggi' : 'Rutin',
      },
      {
        kategori: 'Pencahayaan',
        saran: 'Pastikan pencahayaan kandang total 16 jam per hari (matahari + lampu malam) untuk merangsang ovulasi.',
        prioritas: 'Sedang',
      },
      {
        kategori: 'Kesehatan & Sanitasi',
        saran: 'Berikan vitamin antistres di air minum terutama saat cuaca panas atau pergantian musim.',
        prioritas: deltaTelur < 0 ? 'Tinggi' : 'Sedang',
      },
    ];

    let status = 'Sangat Sehat & Produktif';
    if (score < 65) status = 'Perlu Perhatian Khusus';
    else if (score < 80) status = 'Normal & Cukup Stabil';

    return {
      skor_kesehatan: score,
      status_kesehatan: status,
      prediksi_telur_besok: predictedTomorrow,
      prediksi_tren_7hari:
        deltaTelur >= 0
          ? 'Tren produksi telur meningkat bertahap jika pakan dan pencahayaan stabil.'
          : 'Ada fluktuasi penurunan, perlu pemantauan asupan pakan dan stres kandang.',
      evaluasi_pakan: `Konsumsi saat ini ${gramPerEkor.toFixed(0)} gram/ekor/hari. ${
        gramPerEkor >= 110 && gramPerEkor <= 125
          ? 'Sangat ideal sesuai standar layer.'
          : gramPerEkor < 110
          ? 'Agak kurang dari standar 115-120 gram.'
          : 'Pemberian pakan agak berlebih.'
      }`,
      peringatan_anomali: anomalies.length > 0 ? anomalies : ['Tidak ditemukan anomali kritis. Kondisi aman.'],
      rekomendasi_tindakan: actions,
      catatan_ahli: `Dengan populasi ${latest.jumlah_ayam} ekor dan rasio telur ${rasioTelur.toFixed(1)}%, performa kandang Anda tergolong ${status}. Lakukan pemeriksaan rutin tempat pakan dan air minum.`,
      generated_at: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    };
  };

  const fetchAiAnalysis = async (userQuestion?: string) => {
    if (ayamList.length === 0) return;
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/ai/analyze-ayam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          history: ayamList,
          question: userQuestion || customQuestion || '',
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();
      setAnalysis({
        ...data,
        generated_at: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      });
      if (userQuestion) {
        setCustomQuestion('');
      }
    } catch (err: unknown) {
      console.warn('AI API endpoint not accessible, using built-in veterinary heuristic engine:', err);
      // Seamless fallback: calculate smart heuristic
      const fallback = computeHeuristicAnalysis(ayamList);
      setAnalysis(fallback);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    if (ayamList.length > 0 && !analysis) {
      fetchAiAnalysis();
    }
  }, [ayamList]);

  if (ayamList.length === 0) {
    return (
      <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-2xl p-6 text-center text-slate-600">
        <Brain className="w-10 h-10 mx-auto text-emerald-600 mb-2 animate-bounce" />
        <h4 className="font-bold text-slate-800 text-sm">Asisten Cerdas Ayam Siap Aktif</h4>
        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
          Tambahkan minimal 1 data harian ayam untuk melihat prediksi telur, analisis kecukupan pakan, dan rekomendasi dokter unggas.
        </p>
      </div>
    );
  }

  const currentAnalysis = analysis || computeHeuristicAnalysis(ayamList);

  return (
    <div className="bg-gradient-to-b from-slate-900 to-slate-950 text-white rounded-2xl border border-slate-800 p-5 shadow-xl space-y-5">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center font-bold shadow-lg">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-base text-white tracking-tight">
                AI Dokter & Prediksi Ayam Cerdas
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-400" />
                Live Monitoring
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Prediksi panen telur, efisiensi pakan harian, dan diagnosis dini potensi penyakit
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          {currentAnalysis.generated_at && (
            <span className="text-[11px] text-slate-400 hidden sm:inline">
              Update {currentAnalysis.generated_at}
            </span>
          )}
          <button
            onClick={() => fetchAiAnalysis()}
            disabled={loading}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-300 font-bold text-xs rounded-xl border border-slate-700 transition flex items-center gap-1.5 disabled:opacity-50"
            title="Analisis Ulang Data Terbaru"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Menganalisis...' : 'Analisis Ulang'}</span>
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* 3 Main Intelligent Indicator Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {/* Card 1: Prediksi Produksi Telur Besok */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Egg className="w-3.5 h-3.5" /> Prediksi Telur Besok
              </span>
              <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-800/60 font-semibold">
                Estimasi AI
              </span>
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-black text-amber-400">
                ~{currentAnalysis.prediksi_telur_besok}
              </span>
              <span className="text-xs text-slate-400 font-medium">butir telur</span>
            </div>
          </div>
          <p className="text-xs text-slate-300 mt-2 bg-slate-900/60 p-2.5 rounded-lg border border-slate-700/50 leading-relaxed">
            {currentAnalysis.prediksi_tren_7hari}
          </p>
        </div>

        {/* Card 2: Skor Kesehatan & Performa Ternak */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5" /> Indeks Kesehatan Kandang
              </span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                  currentAnalysis.skor_kesehatan >= 80
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                    : currentAnalysis.skor_kesehatan >= 65
                    ? 'bg-amber-950 text-amber-300 border-amber-800'
                    : 'bg-rose-950 text-rose-300 border-rose-800'
                }`}
              >
                {currentAnalysis.status_kesehatan}
              </span>
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span
                className={`text-3xl font-black ${
                  currentAnalysis.skor_kesehatan >= 80
                    ? 'text-emerald-400'
                    : currentAnalysis.skor_kesehatan >= 65
                    ? 'text-amber-400'
                    : 'text-rose-400'
                }`}
              >
                {currentAnalysis.skor_kesehatan}
              </span>
              <span className="text-xs text-slate-400 font-medium">/ 100 poin</span>
            </div>
          </div>

          {/* Health progress meter */}
          <div className="mt-3">
            <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-700">
              <div
                className={`h-full transition-all duration-700 rounded-full ${
                  currentAnalysis.skor_kesehatan >= 80
                    ? 'bg-emerald-500'
                    : currentAnalysis.skor_kesehatan >= 65
                    ? 'bg-amber-500'
                    : 'bg-rose-500'
                }`}
                style={{ width: `${currentAnalysis.skor_kesehatan}%` }}
              ></div>
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5 line-clamp-2">
              {currentAnalysis.catatan_ahli}
            </p>
          </div>
        </div>

        {/* Card 3: Evaluasi Pakan & Rasio Gram/Ekor */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" /> Evaluasi Pakan Harian
              </span>
              <span className="text-[10px] bg-slate-900 text-slate-300 px-2 py-0.5 rounded-full border border-slate-700 font-semibold">
                Standar Layer
              </span>
            </div>
            <p className="text-xs text-slate-200 mt-2 font-medium leading-relaxed bg-slate-900/60 p-2.5 rounded-lg border border-slate-700/50">
              {currentAnalysis.evaluasi_pakan}
            </p>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1">
            <span>ℹ️</span> Kebutuhan ideal: 110 - 120 gram per ekor per hari
          </div>
        </div>
      </div>

      {/* Peringatan Anomali & Rekomendasi Dokter Unggas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {/* Kolom 1: Peringatan & Deteksi Dini */}
        <div className="bg-slate-800/60 border border-slate-700/70 rounded-xl p-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5 mb-2.5">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            Deteksi Dini Masalah & Risiko
          </h4>
          <div className="space-y-2">
            {currentAnalysis.peringatan_anomali.map((alert, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-900/50 text-xs text-rose-200 flex items-start gap-2"
              >
                <span className="text-rose-400 font-bold shrink-0 mt-0.5">&bull;</span>
                <span className="leading-relaxed">{alert}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Kolom 2: Rekomendasi Tindakan Nyata */}
        <div className="bg-slate-800/60 border border-slate-700/70 rounded-xl p-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5 mb-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Saran & Tindakan Praktis Peternak
          </h4>
          <div className="space-y-2">
            {currentAnalysis.rekomendasi_tindakan.map((action, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-lg bg-slate-900/70 border border-slate-700/60 text-xs flex items-start justify-between gap-2"
              >
                <div>
                  <span className="inline-block text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 mb-1">
                    {action.kategori}
                  </span>
                  <p className="text-slate-200 text-xs leading-relaxed">{action.saran}</p>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                    action.prioritas === 'Tinggi'
                      ? 'bg-rose-950 text-rose-300 border border-rose-800'
                      : action.prioritas === 'Sedang'
                      ? 'bg-amber-950 text-amber-300 border border-amber-800'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {action.prioritas}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tanya Spesialis AI / Konsultasi Gejala Ayam */}
      <div className="pt-2">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (customQuestion.trim()) {
              fetchAiAnalysis(customQuestion);
            }
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={customQuestion}
            onChange={(e) => setCustomQuestion(e.target.value)}
            placeholder="Tanya dokter unggas AI (misal: 'Ayam ada yang kotoran hijau & lemas, apa solusinya?')"
            className="flex-1 px-3.5 py-2 text-xs rounded-xl bg-slate-900 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-100 placeholder:text-slate-500"
          />
          <button
            type="submit"
            disabled={loading || !customQuestion.trim()}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow-md shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Tanya AI</span>
          </button>
        </form>
      </div>
    </div>
  );
};
