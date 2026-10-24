import React, { useState } from 'react';
import { SupabaseConfig } from '../types';
import { X, Lock, CheckCircle2, AlertCircle, ExternalLink, KeyRound, ShieldCheck } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  config: SupabaseConfig;
  onSave: (config: SupabaseConfig) => void;
  isConnected: boolean;
}

export const ConfigModal: React.FC<Props> = ({
  isOpen,
  onClose,
  config,
  onSave,
  isConnected,
}) => {
  const [url, setUrl] = useState(config.url);
  const [anonKey, setAnonKey] = useState(config.anonKey);
  const [testState, setTestState] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMsg, setTestMsg] = useState('');

  if (!isOpen) return null;

  const handleTest = async () => {
    if (!url.trim() || !anonKey.trim()) {
      setTestState('error');
      setTestMsg('Harap isi Project URL dan Anon Key terlebih dahulu.');
      return;
    }

    setTestState('testing');
    setTestMsg('Menghubungkan & menguji koneksi Supabase...');

    try {
      const client = createClient(url.trim(), anonKey.trim());
      // Test querying catatan_ayam
      const { error } = await client.from('catatan_ayam').select('id').limit(1);
      if (error) throw error;

      setTestState('success');
      setTestMsg('Koneksi berhasil! Database Supabase siap digunakan & dapat dikunci permanen.');
    } catch (err: unknown) {
      setTestState('error');
      const msg = err instanceof Error ? err.message : String(err);
      setTestMsg(
        `Gagal terhubung (${msg}). Pastikan script di menu "SQL Schema" sudah dijalankan di Supabase SQL Editor.`
      );
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      url: url.trim(),
      anonKey: anonKey.trim(),
    });
    onClose();
  };

  const handleClear = () => {
    if (window.confirm('Kosongkan kredensial Supabase yang terkunci saat ini?')) {
      setUrl('');
      setAnonKey('');
      onSave({ url: '', anonKey: '' });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <Lock className="w-4 h-4 text-emerald-700" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Kunci Kredensial Supabase (Permanen)</h3>
              <p className="text-xs text-slate-500">Data murni langsung dari database Supabase, tanpa cache lokal</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-emerald-800">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Kredensial Dikunci Permanen</span>
            </div>
            <p className="text-emerald-700 leading-relaxed text-[11px]">
              Kredensial yang Anda simpan di sini akan dikunci secara permanen di aplikasi. Anda tidak perlu memasukkannya ulang saat membuka kembali aplikasi atau saat cache browser dibersihkan.
            </p>
            <p className="text-emerald-700 leading-relaxed text-[11px] pt-1 border-t border-emerald-200/60">
              Kredensial dapat dilihat di <a href="https://supabase.com" target="_blank" rel="noreferrer" className="underline font-bold inline-flex items-center gap-0.5">Supabase Dashboard <ExternalLink className="w-3 h-3" /></a> &rarr; <strong>Project Settings</strong> &rarr; <strong>API</strong>.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
              <span>Project URL Supabase</span>
            </label>
            <input
              type="url"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://xyzabcdefghijklm.supabase.co"
              className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
              <KeyRound className="w-3 h-3 text-slate-400" />
              <span>Project API Key (Anon / Public)</span>
            </label>
            <textarea
              rows={3}
              required
              value={anonKey}
              onChange={(e) => setAnonKey(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
            />
          </div>

          {/* Test connection alert */}
          {testState !== 'idle' && (
            <div
              className={`p-3 rounded-xl text-xs flex items-start gap-2 ${
                testState === 'testing'
                  ? 'bg-blue-50 text-blue-800 border border-blue-200'
                  : testState === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              {testState === 'testing' && <span className="animate-spin">⏳</span>}
              {testState === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />}
              {testState === 'error' && <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />}
              <span className="leading-relaxed">{testMsg}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <div>
              {isConnected && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-xs text-rose-600 hover:text-rose-800 hover:underline font-semibold cursor-pointer"
                >
                  Kosongkan Kredensial
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleTest}
                disabled={testState === 'testing'}
                className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition cursor-pointer"
              >
                {testState === 'testing' ? 'Menguji...' : 'Tes Koneksi'}
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Simpan & Kunci Kredensial</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
