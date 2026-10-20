import React, { useState } from 'react';
import { X, Copy, Check, Database, Sparkles, Terminal } from 'lucide-react';
import { SUPABASE_SQL_SCHEMA, SUPABASE_STEPS } from '../lib/sqlGuide';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const SqlGuideModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] shadow-2xl border border-slate-100 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Panduan SQL & Setup Supabase Real-time</h3>
              <p className="text-xs text-slate-500">Skema tabel catatan_ayam, catatan_ikan, & publication realtime</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5 overflow-y-auto">
          {/* Steps */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Langkah Cepat Setup Database (1 Menit)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {SUPABASE_STEPS.map((step) => (
                <div
                  key={step.step}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[10px] flex items-center justify-center">
                      {step.step}
                    </span>
                    <span className="font-bold text-slate-800">{step.title}</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed text-[11px]">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* SQL Code Block */}
          <div>
            <div className="flex items-center justify-between bg-slate-800 text-slate-200 px-4 py-2.5 rounded-t-xl text-xs font-semibold">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span>Script SQL Schema & Real-Time Activation</span>
              </div>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition shadow-xs"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Tersalin!' : 'Salin SQL'}</span>
              </button>
            </div>
            <pre className="bg-slate-900 text-emerald-400 p-4 rounded-b-xl text-xs font-mono overflow-x-auto max-h-72 leading-relaxed selection:bg-emerald-800 selection:text-white">
              {SUPABASE_SQL_SCHEMA}
            </pre>
          </div>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Kenapa baris ALTER PUBLICATION supabase_realtime penting?</p>
              <p className="text-amber-800 text-[11px] mt-0.5">
                Baris ini yang membuat Supabase mengalirkan event <code>postgres_changes</code> secara live ke browser Anda. Setiap ada perubahan pada <code>catatan_ayam</code> atau <code>catatan_ikan</code>, semua layar pengguna langsung terupdate tanpa perlu reload halaman!
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg transition"
          >
            Tutup Panduan
          </button>
        </div>
      </div>
    </div>
  );
};
