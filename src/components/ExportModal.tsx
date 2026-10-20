import React, { useState } from 'react';
import { X, Download, Copy, Check, Github, Globe, FileCode } from 'lucide-react';
import { generateStandaloneHtml } from '../lib/standaloneHtml';
import { SupabaseConfig } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  config: SupabaseConfig;
}

export const ExportModal: React.FC<Props> = ({ isOpen, onClose, config }) => {
  const [copied, setCopied] = useState(false);
  const [includeConfig, setIncludeConfig] = useState(true);

  if (!isOpen) return null;

  const htmlContent = generateStandaloneHtml(
    includeConfig ? config.url : '',
    includeConfig ? config.anonKey : ''
  );

  const handleCopy = () => {
    navigator.clipboard.writeText(htmlContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'index.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] shadow-2xl border border-slate-100 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <Github className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">
                File Tunggal (index.html) Siap Deploy ke GitHub Pages
              </h3>
              <p className="text-xs text-slate-500">
                1 file lengkap (HTML + CSS Tailwind CDN + Supabase JS CDN + Real-time logic)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-5 overflow-y-auto">
          {/* Quick instructions for GitHub Pages */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <Globe className="w-4 h-4 text-emerald-600" />
              Cara Deploy ke GitHub Pages (Gratis & 2 Menit):
            </h4>
            <ol className="text-xs text-slate-600 space-y-2 list-decimal list-inside leading-relaxed">
              <li>
                Download file <strong>index.html</strong> menggunakan tombol di bawah.
              </li>
              <li>
                Buka <a href="https://github.com/new" target="_blank" rel="noreferrer" className="text-emerald-600 underline font-semibold">GitHub</a>, buat repository baru (contoh: <code>ternakku</code>) dengan opsi <strong>Public</strong>.
              </li>
              <li>
                Klik <strong>Upload files</strong>, pilih/drag file <code>index.html</code>, lalu klik <strong>Commit changes</strong>.
              </li>
              <li>
                Masuk ke tab <strong>Settings</strong> &rarr; menu <strong>Pages</strong> (di sidebar kiri) &rarr; di bagian <em>Build and deployment</em> pilih Branch: <strong>main</strong> & folder: <strong>/(root)</strong> &rarr; klik <strong>Save</strong>.
              </li>
              <li>
                Tunggu 1 menit, website Anda sudah aktif di: <code className="bg-slate-200/80 px-1 py-0.5 rounded text-slate-800 font-mono">https://username.github.io/ternakku/</code> !
              </li>
            </ol>
          </div>

          {/* Option to embed Supabase keys */}
          <div className="flex items-center justify-between p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl">
            <div>
              <p className="text-xs font-bold text-emerald-900">
                Sertakan Kredensial Supabase Saat Ini di File?
              </p>
              <p className="text-[11px] text-emerald-700">
                {config.url
                  ? `URL: ${config.url}`
                  : 'Kredensial belum diisi di web ini (user bisa mengisi nanti di modal UI).'}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={includeConfig}
                onChange={(e) => setIncludeConfig(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleDownload}
              className="flex-1 min-w-[200px] py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Download File index.html</span>
            </button>
            <button
              onClick={handleCopy}
              className="py-2.5 px-4 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Kode Berhasil Disalin!' : 'Salin Kode HTML'}</span>
            </button>
          </div>

          {/* Code Preview */}
          <div>
            <div className="flex items-center justify-between bg-slate-800 text-slate-300 px-4 py-2 rounded-t-xl text-xs font-semibold">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-emerald-400" />
                <span>Pratinjau Kode index.html (Total ~{htmlContent.length} karakter)</span>
              </div>
              <span className="text-[11px] text-slate-400">Siap copy-paste</span>
            </div>
            <pre className="bg-slate-900 text-slate-300 p-4 rounded-b-xl text-[11px] font-mono overflow-x-auto max-h-64 leading-relaxed">
              {htmlContent.slice(0, 1500)}
              {'\n... [lanjutan kode script & tabel lengkap] ...'}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
