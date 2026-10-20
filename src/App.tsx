import { useState, useEffect, useRef, useCallback } from 'react';
import { CatatanAyam, CatatanIkan, SupabaseConfig } from './types';
import {
  getStoredConfig,
  saveStoredConfig,
  getSupabaseClient,
  getLocalAyam,
  saveLocalAyam,
  getLocalIkan,
  saveLocalIkan,
} from './lib/storage';
import { AyamSection } from './components/AyamSection';
import { IkanSection } from './components/IkanSection';
import { ConfigModal } from './components/ConfigModal';
import { SqlGuideModal } from './components/SqlGuideModal';
import { ExportModal } from './components/ExportModal';
import {
  Database,
  Download,
  Settings,
  Sparkles,
  Info,
  Layers,
  TrendingUp,
  X,
  Fish,
} from 'lucide-react';
import { RealtimeChannel } from '@supabase/supabase-js';

export default function App() {
  const [activeTab, setActiveTab] = useState<'ayam' | 'ikan' | 'ringkasan'>('ayam');
  const [config, setConfig] = useState<SupabaseConfig>(getStoredConfig());
  const [isConnected, setIsConnected] = useState(false);
  const [isRealtimeActive, setIsRealtimeActive] = useState(false);

  const [ayamList, setAyamList] = useState<CatatanAyam[]>([]);
  const [ikanList, setIkanList] = useState<CatatanIkan[]>([]);

  // Modals state
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isSqlOpen, setIsSqlOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Channel ref for Supabase
  const channelRef = useRef<RealtimeChannel | null>(null);

  // Load data function
  const loadInitialData = useCallback(async (currentConfig: SupabaseConfig) => {
    const client = getSupabaseClient(currentConfig);

    if (client) {
      try {
        const [resAyam, resIkan] = await Promise.all([
          client
            .from('catatan_ayam')
            .select('*')
            .order('tanggal', { ascending: false })
            .order('created_at', { ascending: false }),
          client
            .from('catatan_ikan')
            .select('*')
            .order('tanggal', { ascending: false })
            .order('created_at', { ascending: false }),
        ]);

        if (resAyam.error) throw resAyam.error;
        if (resIkan.error) throw resIkan.error;

        const normalizedAyam: CatatanAyam[] = (resAyam.data || []).map((item) => ({
          ...item,
          jenis_ayam: item.jenis_ayam || 'Ayam Petelur',
        }));
        setAyamList(normalizedAyam);
        setIkanList(resIkan.data || []);
        setIsConnected(true);
        setIsRealtimeActive(true);

        // Setup Real-time Postgres Changes
        if (channelRef.current) {
          client.removeChannel(channelRef.current);
        }

        const channel = client
          .channel('schema-db-changes')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'catatan_ayam' },
            (payload) => {
              if (payload.eventType === 'INSERT') {
                const rec = payload.new as CatatanAyam;
                const normRec: CatatanAyam = {
                  ...rec,
                  jenis_ayam: rec.jenis_ayam || 'Ayam Petelur',
                };
                setAyamList((prev) => {
                  if (prev.some((x) => x.id === normRec.id)) return prev;
                  return [normRec, ...prev];
                });
                triggerToast('⚡ Catatan ayam baru diterima secara real-time!');
              } else if (payload.eventType === 'UPDATE') {
                const rec = payload.new as CatatanAyam;
                const normRec: CatatanAyam = {
                  ...rec,
                  jenis_ayam: rec.jenis_ayam || 'Ayam Petelur',
                };
                setAyamList((prev) =>
                  prev.map((x) => (x.id === normRec.id ? normRec : x))
                );
                triggerToast('⚡ Catatan ayam diperbarui secara real-time!');
              } else if (payload.eventType === 'DELETE') {
                setAyamList((prev) =>
                  prev.filter((x) => x.id !== (payload.old as { id: string }).id)
                );
                triggerToast('⚡ Catatan ayam dihapus!');
              }
            }
          )
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'catatan_ikan' },
            (payload) => {
              if (payload.eventType === 'INSERT') {
                setIkanList((prev) => {
                  if (prev.some((x) => x.id === (payload.new as CatatanIkan).id)) return prev;
                  return [payload.new as CatatanIkan, ...prev];
                });
                triggerToast('⚡ Kolam ikan baru diterima secara real-time!');
              } else if (payload.eventType === 'UPDATE') {
                setIkanList((prev) =>
                  prev.map((x) =>
                    x.id === (payload.new as CatatanIkan).id ? (payload.new as CatatanIkan) : x
                  )
                );
                triggerToast('⚡ Data kolam ikan diperbarui secara real-time!');
              } else if (payload.eventType === 'DELETE') {
                setIkanList((prev) =>
                  prev.filter((x) => x.id !== (payload.old as { id: string }).id)
                );
                triggerToast('⚡ Kolam ikan dihapus!');
              }
            }
          )
          .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
              setIsRealtimeActive(true);
            }
          });

        channelRef.current = channel;
        return;
      } catch (err) {
        console.warn('Gagal memuat dari Supabase, beralih ke penyimpanan lokal:', err);
      }
    }

    // Fallback: Local Storage
    setIsConnected(false);
    setIsRealtimeActive(false);
    setAyamList(getLocalAyam());
    setIkanList(getLocalIkan());
  }, []);

  useEffect(() => {
    loadInitialData(config);
    return () => {
      if (channelRef.current && config.url && config.anonKey) {
        const client = getSupabaseClient(config);
        if (client) client.removeChannel(channelRef.current);
      }
    };
  }, [config, loadInitialData]);

  // Handle Save Supabase Config
  const handleSaveConfig = (newConfig: SupabaseConfig) => {
    saveStoredConfig(newConfig);
    setConfig(newConfig);
    loadInitialData(newConfig);
    triggerToast(
      newConfig.url ? 'Menghubungkan ke Supabase...' : 'Beralih ke mode demo lokal.'
    );
  };

  // Add Ayam Record
  const handleAddAyam = async (record: Omit<CatatanAyam, 'id' | 'created_at'>) => {
    const client = getSupabaseClient(config);

    if (client && isConnected) {
      const { error } = await client.from('catatan_ayam').insert([record]);
      if (error) {
        alert('Gagal menyimpan ke Supabase: ' + error.message);
        throw error;
      }
      triggerToast('Catatan ayam berhasil disimpan ke Supabase!');
    } else {
      // Local demo mode
      const newItem: CatatanAyam = {
        ...record,
        id: 'ayam-' + Date.now(),
        created_at: new Date().toISOString(),
      };
      const updated = [newItem, ...ayamList];
      setAyamList(updated);
      saveLocalAyam(updated);
      triggerToast('Catatan ayam tersimpan (Mode Demo Lokal)!');
    }
  };

  // Delete Ayam Record
  const handleDeleteAyam = async (id: string) => {
    const client = getSupabaseClient(config);

    if (client && isConnected) {
      const { error } = await client.from('catatan_ayam').delete().eq('id', id);
      if (error) {
        alert('Gagal menghapus dari Supabase: ' + error.message);
        throw error;
      }
    } else {
      const updated = ayamList.filter((item) => item.id !== id);
      setAyamList(updated);
      saveLocalAyam(updated);
      triggerToast('Catatan ayam dihapus.');
    }
  };

  // Add Ikan Record
  const handleAddIkan = async (record: Omit<CatatanIkan, 'id' | 'created_at'>) => {
    const client = getSupabaseClient(config);

    if (client && isConnected) {
      const { error } = await client.from('catatan_ikan').insert([record]);
      if (error) {
        alert('Gagal menyimpan kolam ke Supabase: ' + error.message);
        throw error;
      }
      triggerToast('Data kolam ikan berhasil disimpan ke Supabase!');
    } else {
      const newItem: CatatanIkan = {
        ...record,
        id: 'ikan-' + Date.now(),
        created_at: new Date().toISOString(),
      };
      const updated = [newItem, ...ikanList];
      setIkanList(updated);
      saveLocalIkan(updated);
      triggerToast('Data kolam tersimpan (Mode Demo Lokal)!');
    }
  };

  // Delete Ikan Record
  const handleDeleteIkan = async (id: string) => {
    const client = getSupabaseClient(config);

    if (client && isConnected) {
      const { error } = await client.from('catatan_ikan').delete().eq('id', id);
      if (error) {
        alert('Gagal menghapus kolam: ' + error.message);
        throw error;
      }
    } else {
      const updated = ikanList.filter((item) => item.id !== id);
      setIkanList(updated);
      saveLocalIkan(updated);
      triggerToast('Data kolam dihapus.');
    }
  };

  // Quick Action: Mark Fish Tank as Drained & Extend Next Drain by 7 days
  const handleQuickKuras = async (id: string) => {
    const nextDate = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
    const client = getSupabaseClient(config);

    if (client && isConnected) {
      const { error } = await client
        .from('catatan_ikan')
        .update({
          jadwal_kuras: nextDate,
          status_air: 'Bersih',
          catatan: 'Air baru saja dikuras & diperbarui',
        })
        .eq('id', id);

      if (error) {
        alert('Gagal update kuras air: ' + error.message);
        return;
      }
      triggerToast('Air kolam telah dikuras & jadwal diperpanjang 7 hari!');
    } else {
      const updated = ikanList.map((item) =>
        item.id === id
          ? {
              ...item,
              jadwal_kuras: nextDate,
              status_air: 'Bersih',
              catatan: 'Air baru saja dikuras & diperbarui',
            }
          : item
      );
      setIkanList(updated);
      saveLocalIkan(updated);
      triggerToast('Air kolam telah dikuras & jadwal diperpanjang 7 hari!');
    }
  };

  // Summary Metrics
  const totalAyamPakan = ayamList.reduce((acc, c) => acc + (Number(c.pakan_kg) || 0), 0);
  const totalIkanPakan = ikanList.reduce((acc, c) => acc + (Number(c.pakan_kg) || 0), 0);
  const totalSemuaPakan = totalAyamPakan + totalIkanPakan;
  const totalSemuaTelur = ayamList.reduce((acc, c) => acc + (Number(c.jumlah_telur) || 0), 0);
  const totalSemuaIkan = ikanList.reduce((acc, c) => acc + (Number(c.jumlah_ikan) || 0), 0);
  const currentAyamPopulasi = ayamList.length > 0 ? ayamList[0].jumlah_ayam : 0;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 antialiased font-sans pb-20 selection:bg-emerald-500 selection:text-white">
      {/* TOP NAVBAR */}
      <header className="sticky top-0 z-40 bg-emerald-700 text-white shadow-md">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-2xl shadow-inner border border-white/20">
              🌾
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-lg sm:text-xl tracking-tight leading-none">
                  TernakKu
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-600 border border-emerald-400 text-emerald-100">
                  v2.0 Real-Time
                </span>
              </div>
              <p className="text-xs text-emerald-200 mt-0.5">
                Manajemen Ayam Petelur & Kolam Ikan
              </p>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2">
            {/* Status Indicator */}
            <button
              onClick={() => setIsConfigOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-800/80 hover:bg-emerald-800 border border-emerald-600 transition shadow-xs"
              title="Klik untuk konfigurasi Supabase"
            >
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                }`}
              ></span>
              <span className="hidden sm:inline">
                {isConnected ? 'Supabase Real-time' : 'Mode Demo Lokal'}
              </span>
            </button>

            {/* Export index.html button */}
            <button
              onClick={() => setIsExportOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white text-emerald-800 hover:bg-emerald-50 shadow-xs transition"
              title="Download index.html siap deploy ke GitHub Pages"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Export GitHub Pages</span>
              <span className="md:hidden">Export</span>
            </button>
          </div>
        </div>

        {/* TABS NAVIGATION */}
        <div className="max-w-5xl mx-auto px-4 flex border-t border-emerald-600/70 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('ayam')}
            className={`py-3 px-4 font-bold text-sm border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'ayam'
                ? 'border-white text-white'
                : 'border-transparent text-emerald-200 hover:text-white'
            }`}
          >
            <span>🐔</span>
            <span>Ternak Ayam</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-800/60 font-semibold text-emerald-100">
              {ayamList.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('ikan')}
            className={`py-3 px-4 font-bold text-sm border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'ikan'
                ? 'border-white text-white'
                : 'border-transparent text-emerald-200 hover:text-white'
            }`}
          >
            <span>🐟</span>
            <span>Kolam Ikan</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-800/60 font-semibold text-emerald-100">
              {ikanList.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('ringkasan')}
            className={`py-3 px-4 font-bold text-sm border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'ringkasan'
                ? 'border-white text-white'
                : 'border-transparent text-emerald-200 hover:text-white'
            }`}
          >
            <span>📊</span>
            <span>Ringkasan Usaha</span>
          </button>

          <div className="ml-auto flex items-center gap-2 py-2">
            <button
              onClick={() => setIsSqlOpen(true)}
              className="py-1.5 px-3 text-xs font-semibold text-emerald-200 hover:text-white hover:bg-emerald-800/60 rounded-lg transition flex items-center gap-1.5"
            >
              <Database className="w-3.5 h-3.5" />
              <span>SQL Schema</span>
            </button>
            <button
              onClick={() => setIsConfigOpen(true)}
              className="py-1.5 px-3 text-xs font-semibold text-emerald-200 hover:text-white hover:bg-emerald-800/60 rounded-lg transition flex items-center gap-1.5"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>API Key</span>
            </button>
          </div>
        </div>
      </header>

      {/* FLOATING REAL-TIME TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed bottom-6 right-4 left-4 md:left-auto md:right-6 md:w-96 bg-slate-900 text-white p-3.5 rounded-2xl shadow-2xl z-50 border border-slate-700 flex items-center justify-between animate-in fade-in slide-in-from-bottom-5">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            <p className="text-xs font-medium leading-relaxed">{toastMessage}</p>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white p-1 rounded transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* MAIN CONTAINER */}
      <main className="max-w-5xl mx-auto px-4 py-6">
        {/* Banner if not connected to Supabase */}
        {!isConnected && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-amber-100 rounded-xl text-amber-700 shrink-0 mt-0.5">
                <Info className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-amber-950">
                  Mode Demo Lokal Aktif (Data Tersimpan di Browser)
                </h4>
                <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                  Hubungkan URL & Anon Key Supabase Anda agar data tersimpan di Cloud dan sinkron
                  secara real-time antar handphone dan komputer tanpa perlu refresh!
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
              <button
                onClick={() => setIsSqlOpen(true)}
                className="text-xs font-semibold px-3 py-2 bg-white text-amber-800 border border-amber-300 rounded-xl hover:bg-amber-100/70 transition"
              >
                Lihat SQL
              </button>
              <button
                onClick={() => setIsConfigOpen(true)}
                className="text-xs font-bold px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl shadow-xs transition"
              >
                Hubungkan Supabase
              </button>
            </div>
          </div>
        )}

        {/* TAB 1: AYAM */}
        {activeTab === 'ayam' && (
          <AyamSection
            ayamList={ayamList}
            onAdd={handleAddAyam}
            onDelete={handleDeleteAyam}
            isRealtimeActive={isRealtimeActive}
          />
        )}

        {/* TAB 2: IKAN */}
        {activeTab === 'ikan' && (
          <IkanSection
            ikanList={ikanList}
            onAdd={handleAddIkan}
            onDelete={handleDeleteIkan}
            onQuickKuras={handleQuickKuras}
            isRealtimeActive={isRealtimeActive}
          />
        )}

        {/* TAB 3: RINGKASAN USAHA */}
        {activeTab === 'ringkasan' && (
          <div className="space-y-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-base">
                      Ringkasan Gabungan Ayam & Kolam Ikan
                    </h3>
                    <p className="text-xs text-slate-500">Estimasi aset ternak, konsumsi pakan total, dan produktivitas</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                  <p className="text-xs font-semibold text-slate-500 uppercase">Total Pakan Tercatat</p>
                  <p className="text-3xl font-black text-emerald-700 mt-1">
                    {totalSemuaPakan.toFixed(1)}{' '}
                    <span className="text-sm font-semibold text-slate-500">kg</span>
                  </p>
                  <div className="mt-2 text-xs text-slate-600 flex justify-between border-t border-slate-200/60 pt-2">
                    <span>Ayam: {totalAyamPakan.toFixed(1)} kg</span>
                    <span>Ikan: {totalIkanPakan.toFixed(1)} kg</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                  <p className="text-xs font-semibold text-slate-500 uppercase">Total Populasi Ternak</p>
                  <p className="text-3xl font-black text-slate-800 mt-1">
                    {(currentAyamPopulasi + totalSemuaIkan).toLocaleString('id-ID')}{' '}
                    <span className="text-sm font-semibold text-slate-500">ekor</span>
                  </p>
                  <div className="mt-2 text-xs text-slate-600 flex justify-between border-t border-slate-200/60 pt-2">
                    <span>Ayam: {currentAyamPopulasi}</span>
                    <span>Ikan: {totalSemuaIkan.toLocaleString('id-ID')}</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                  <p className="text-xs font-semibold text-slate-500 uppercase">Total Panen Telur</p>
                  <p className="text-3xl font-black text-amber-600 mt-1">
                    {totalSemuaTelur.toLocaleString('id-ID')}{' '}
                    <span className="text-sm font-semibold text-slate-500">butir</span>
                  </p>
                  <div className="mt-2 text-xs text-slate-600 flex justify-between border-t border-slate-200/60 pt-2">
                    <span>Dari {ayamList.length} hari pencatatan</span>
                  </div>
                </div>
              </div>
            </div>

            {/* GitHub Pages & Supabase Info Card */}
            <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white p-6 rounded-2xl shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-700 text-xs font-bold text-emerald-200 border border-emerald-500/50">
                    Siap Deploy
                  </span>
                  <h4 className="font-extrabold text-lg">Website Satu Halaman untuk GitHub Pages</h4>
                </div>
                <p className="text-xs text-emerald-100 max-w-xl leading-relaxed">
                  Semua kode HTML, CSS Tailwind CDN, JS Supabase Real-time, dan fungsi lengkap telah dikemas dalam 1 file <code>index.html</code>. Anda cukup upload ke GitHub Pages tanpa perlu build tool atau hosting berbayar.
                </p>
              </div>

              <button
                onClick={() => setIsExportOpen(true)}
                className="px-5 py-3 bg-white text-emerald-900 hover:bg-emerald-50 font-extrabold text-xs rounded-xl shadow-md transition flex items-center gap-2 shrink-0"
              >
                <Download className="w-4 h-4" />
                <span>Buka Modal Export index.html</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="max-w-5xl mx-auto px-4 mt-8 pt-4 border-t border-slate-200 text-center text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2">
        <p>🌾 <strong>TernakKu</strong> &mdash; Manajemen Ayam & Ikan Real-time (Supabase CDN)</p>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSqlOpen(true)}
            className="hover:text-slate-700 transition underline"
          >
            SQL Script
          </button>
          <span>&bull;</span>
          <button
            onClick={() => setIsExportOpen(true)}
            className="hover:text-slate-700 transition underline"
          >
            Export GitHub Pages
          </button>
        </div>
      </footer>

      {/* MODALS */}
      <ConfigModal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        config={config}
        onSave={handleSaveConfig}
        isConnected={isConnected}
      />

      <SqlGuideModal
        isOpen={isSqlOpen}
        onClose={() => setIsSqlOpen(false)}
      />

      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        config={config}
      />
    </div>
  );
}
