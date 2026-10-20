import React, { useMemo } from 'react';
import { CatatanAyam, AyamAiAnalysis } from '../types';
import {
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Egg,
  ShieldCheck,
  Wheat,
} from 'lucide-react';

interface Props {
  ayamList: CatatanAyam[];
}

export const AyamSmartAdvisor: React.FC<Props> = ({ ayamList }) => {
  // Hitung prediksi dan monitoring secara otomatis dan instan dari data riwayat
  const analysis: AyamAiAnalysis = useMemo(() => {
    if (!ayamList || ayamList.length === 0) {
      return {
        skor_kesehatan: 80,
        status_kesehatan: 'Siap Memantau',
        prediksi_telur_besok: 0,
        prediksi_tren: 'Masukkan catatan pertama Anda untuk melihat prediksi.',
        evaluasi_pakan: 'Belum ada data pakan',
        gram_per_ekor: 0,
        peringatan: [],
        saran_praktis: [
          'Catat jumlah ayam, pakan, dan telur secara rutin setiap sore.',
          'Pastikan air minum bersih selalu tersedia 24 jam.',
        ],
      };
    }

    const sorted = [...ayamList].sort(
      (a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime()
    );
    const latest = sorted[0];
    const prev = sorted.length > 1 ? sorted[1] : null;

    const populasi = latest.jumlah_ayam || 0;
    const pakanKg = latest.pakan_kg || 0;
    const telur = latest.jumlah_telur || 0;

    // Gram pakan per ekor
    const gramPerEkor = populasi > 0 ? Math.round((pakanKg * 1000) / populasi) : 0;

    // Rasio produksi telur (%)
    const prodPercent = populasi > 0 ? (telur / populasi) * 100 : 0;

    // Prediksi telur besok berdasarkan rata-rata 3 hari terakhir dan tren
    const sample = sorted.slice(0, 3);
    const avgTelur = Math.round(
      sample.reduce((sum, item) => sum + (item.jumlah_telur || 0), 0) / sample.length
    );
    const deltaTelur = prev ? telur - (prev.jumlah_telur || 0) : 0;
    const prediksiBesok = Math.max(0, Math.round(avgTelur + (deltaTelur > 0 ? 1 : deltaTelur < 0 ? -1 : 0)));

    // Tren deskripsi
    let tren = 'Produksi telur stabil dan normal';
    if (deltaTelur > 2) tren = `Tren naik (+${deltaTelur} butir dibanding catatan sebelumnya)`;
    else if (deltaTelur < -2) tren = `Tren turun (${deltaTelur} butir dibanding catatan sebelumnya)`;

    // Evaluasi pakan
    let evaluasiPakan = 'Porsi pakan ideal (110 - 125 gr/ekor/hari)';
    if (gramPerEkor < 105) {
      evaluasiPakan = `Pakan agak kurang (${gramPerEkor} gr/ekor). Standar ayam petelur 110-120 gr/ekor.`;
    } else if (gramPerEkor > 130) {
      evaluasiPakan = `Pakan agak tinggi (${gramPerEkor} gr/ekor). Waspada kegemukan menurunkan produksi.`;
    }

    // Skor kesehatan kandang (0 - 100)
    let skor = 80;
    if (prodPercent >= 85) skor += 15;
    else if (prodPercent >= 75) skor += 10;
    else if (prodPercent < 60) skor -= 20;

    if (gramPerEkor >= 110 && gramPerEkor <= 125) skor += 5;
    else if (gramPerEkor < 100 || gramPerEkor > 135) skor -= 10;

    skor = Math.max(30, Math.min(100, Math.round(skor)));

    let status = 'Kondisi Prima & Produktif';
    if (skor < 70) status = 'Perlu Perhatian';
    else if (skor < 85) status = 'Kondisi Baik & Cukup';

    // Peringatan otomatis
    const alerts: string[] = [];
    if (deltaTelur <= -10) {
      alerts.push(`Terjadi penurunan telur ${Math.abs(deltaTelur)} butir. Periksa kondisi cuaca atau gejala penyakit.`);
    }
    if (gramPerEkor < 100 && populasi > 0) {
      alerts.push(`Asupan pakan ${gramPerEkor} gr/ekor terlalu sedikit, ayam berisiko kekurangan gizi.`);
    }

    // Saran praktis
    const tips: string[] = [];
    if (prodPercent >= 80) {
      tips.push('Pertahankan jam pencahayaan kandang 16 jam per hari (termasuk lampu malam).');
      tips.push('Jaga ventilasi udara tetap segar dan alas sekam kering.');
    } else {
      tips.push('Berikan suplemen vitamin (antistres) di air minum terutama di cuaca panas.');
      tips.push('Cek kualitas jagung dan konsentrat pakan agar protein tercukupi.');
    }
    if (gramPerEkor < 110 && populasi > 0) {
      tips.push('Tingkatkan takaran pakan harian secara bertahap menuju 115-120 gram per ekor.');
    }

    return {
      skor_kesehatan: skor,
      status_kesehatan: status,
      prediksi_telur_besok: prediksiBesok,
      prediksi_tren: tren,
      evaluasi_pakan: evaluasiPakan,
      gram_per_ekor: gramPerEkor,
      peringatan: alerts,
      saran_praktis: tips.slice(0, 3),
    };
  }, [ayamList]);

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 text-white rounded-2xl p-5 border border-slate-800 shadow-md">
      {/* Header Smart Advisor */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
            <Sparkles className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              Prediksi & Pemantauan Cerdas Ayam
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Otomatis
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Analisis cerdas langsung dari data pakan dan panen telur harian Anda
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`text-xs font-bold px-3 py-1 rounded-full border flex items-center gap-1.5 ${
              analysis.skor_kesehatan >= 85
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60'
                : analysis.skor_kesehatan >= 70
                ? 'bg-amber-950/80 text-amber-300 border-amber-700/60'
                : 'bg-rose-950/80 text-rose-300 border-rose-700/60'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            {analysis.status_kesehatan}
          </span>
        </div>
      </div>

      {/* Grid 3 Kartu Analisis Utama */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
        {/* 1. Prediksi Telur Besok */}
        <div className="p-3.5 rounded-xl bg-slate-800/70 border border-slate-700/60">
          <div className="flex items-center justify-between text-amber-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Prediksi Telur Besok</span>
            <Egg className="w-4 h-4" />
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black text-amber-400">
              ~{analysis.prediksi_telur_besok}
            </span>
            <span className="text-xs text-slate-400">butir</span>
          </div>
          <p className="text-[11px] text-slate-300 mt-1.5 flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-slate-400 shrink-0" />
            <span className="truncate">{analysis.prediksi_tren}</span>
          </p>
        </div>

        {/* 2. Konsumsi Pakan per Ekor */}
        <div className="p-3.5 rounded-xl bg-slate-800/70 border border-slate-700/60">
          <div className="flex items-center justify-between text-cyan-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Pakan / Ekor</span>
            <Wheat className="w-4 h-4" />
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black text-cyan-400">
              {analysis.gram_per_ekor}
            </span>
            <span className="text-xs text-slate-400">gr/ekor/hari</span>
          </div>
          <p className="text-[11px] text-slate-300 mt-1.5 line-clamp-1">
            {analysis.evaluasi_pakan}
          </p>
        </div>

        {/* 3. Skor Kesehatan Ternak */}
        <div className="p-3.5 rounded-xl bg-slate-800/70 border border-slate-700/60">
          <div className="flex items-center justify-between text-emerald-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Skor Kondisi</span>
            <span className="text-xs font-bold text-slate-400">{analysis.skor_kesehatan}/100</span>
          </div>
          <div className="w-full bg-slate-900 rounded-full h-2 mt-2.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                analysis.skor_kesehatan >= 85
                  ? 'bg-emerald-500'
                  : analysis.skor_kesehatan >= 70
                  ? 'bg-amber-500'
                  : 'bg-rose-500'
              }`}
              style={{ width: `${analysis.skor_kesehatan}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Standar: Telur &gt;75%, pakan 110-125 gram
          </p>
        </div>
      </div>

      {/* Peringatan jika ada anomali */}
      {analysis.peringatan.length > 0 && (
        <div className="mt-3 p-3 rounded-xl bg-rose-950/40 border border-rose-800/50 text-rose-200">
          <div className="flex items-center gap-1.5 text-xs font-bold text-rose-300 mb-1">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            Perhatian Khusus
          </div>
          <ul className="text-xs space-y-1 text-rose-100 list-disc list-inside">
            {analysis.peringatan.map((warn, i) => (
              <li key={i}>{warn}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Saran Praktis Langsung */}
      <div className="mt-3 p-3.5 rounded-xl bg-slate-800/40 border border-slate-800/60">
        <p className="text-xs font-bold text-emerald-400 mb-2 flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          Saran Perawatan & Nutrisi Hari Ini:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
          {analysis.saran_praktis.map((tip, idx) => (
            <div
              key={idx}
              className="flex items-start gap-2 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/60"
            >
              <span className="text-emerald-400 font-bold shrink-0">•</span>
              <span>{tip}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
