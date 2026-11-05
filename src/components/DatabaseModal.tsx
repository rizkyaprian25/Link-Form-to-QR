import { Database, X, CheckCircle2, AlertCircle, Save, Shield, Lock, Eye, EyeOff, Unlink } from 'lucide-react';
import { useState } from 'react';
import { StatusDatabase } from '../features/generator/services/storageService';
import {
  ambilInfoKoneksiDisensor,
  simpanConnectionStringNeon,
} from '../features/generator/services/neonClient';

interface DatabaseModalProps {
  statusDatabase: StatusDatabase;
  onTutup: () => void;
  onCekUlang: () => void;
}

/**
 * Modal Informasi & Pengaturan Koneksi Neon Database (Protected View)
 * Menyensor kata sandi dan detail rahasia agar tidak terlihat oleh orang lain di layar.
 */
export function DatabaseModal({ statusDatabase, onTutup, onCekUlang }: DatabaseModalProps) {
  const [bukaFormUbah, setBukaFormUbah] = useState(() => statusDatabase !== 'terhubung_neon');
  const [inputUrl, setInputUrl] = useState('');
  const [lihatPassword, setLihatPassword] = useState(false);
  const [tersimpanNotif, setTersimpanNotif] = useState(false);
  const [pesanNotif, setPesanNotif] = useState('');

  const infoKoneksi = ambilInfoKoneksiDisensor();

  const handleSimpanKoneksi = () => {
    if (inputUrl.trim()) {
      simpanConnectionStringNeon(inputUrl);
      setInputUrl('');
      setBukaFormUbah(false);
      setPesanNotif('✓ Kredensial berhasil disimpan & menghubungkan...');
      setTersimpanNotif(true);
      setTimeout(() => setTersimpanNotif(false), 2500);
      onCekUlang();
    }
  };

  const handlePutuskanKoneksi = () => {
    simpanConnectionStringNeon('');
    setBukaFormUbah(true);
    setPesanNotif('✓ Koneksi database berhasil diputus. Kembali ke mode lokal.');
    setTersimpanNotif(true);
    setTimeout(() => setTersimpanNotif(false), 2500);
    onCekUlang();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-card w-full max-w-lg rounded-xl border border-border shadow-2xl overflow-hidden my-auto p-6 space-y-5">
        {/* Header Modal */}
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-accent" />
            <h3 className="text-base font-semibold text-foreground tracking-tight">
              Koneksi Neon PostgreSQL Database
            </h3>
          </div>
          <button
            type="button"
            onClick={onTutup}
            className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Status Indikator Card */}
        <div
          className={`p-4 rounded-lg border flex items-start gap-3 ${
            statusDatabase === 'terhubung_neon'
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-800 dark:text-emerald-300'
              : 'bg-amber-500/10 border-amber-500/20 text-amber-800 dark:text-amber-300'
          }`}
        >
          {statusDatabase === 'terhubung_neon' ? (
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
          )}
          <div className="text-xs space-y-1">
            <div className="font-semibold text-sm">
              {statusDatabase === 'terhubung_neon'
                ? 'Terhubung Aman ke Neon Cloud Database'
                : 'Berjalan di Mode Lokal (Offline)'}
            </div>
            <p className="leading-relaxed opacity-90">
              {statusDatabase === 'terhubung_neon'
                ? 'Seluruh riwayat kode QR tersimpan langsung di Neon PostgreSQL. Data aman, tidak akan hilang, dan dapat diakses dari perangkat lain.'
                : 'Aplikasi saat ini hanya menyimpan data di peramban ini.'}
            </p>
          </div>
        </div>

        {/* Ringkasan Keamanan Kredensial (Masked / Tersensor) */}
        {statusDatabase === 'terhubung_neon' && (
          <div className="bg-muted/40 border border-border rounded-lg p-4 space-y-2.5 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-border/60">
              <span className="font-semibold text-foreground flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Proteksi Kredensial Aktif
              </span>
              <span className="font-mono text-[10px] text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                SSL / TLS 1.3
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
              <div>
                <span className="text-muted-foreground block text-[10px]">Database:</span>
                <span className="font-semibold text-foreground">{infoKoneksi.database || '-'}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[10px]">Pengguna:</span>
                <span className="font-semibold text-foreground">{infoKoneksi.username || '-'}</span>
              </div>
              <div className="col-span-2">
                <span className="text-muted-foreground block text-[10px]">Host Endpoint:</span>
                <span className="text-foreground truncate block">{infoKoneksi.hostMasked || '-'}</span>
              </div>
              <div className="col-span-2 flex items-center justify-between bg-card border border-border p-2 rounded">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Lock className="w-3.5 h-3.5 text-accent" />
                  <span className="text-[10px]">Kata Sandi Database:</span>
                </div>
                <span className="font-mono text-muted-foreground tracking-widest">••••••••••••••••</span>
              </div>
            </div>

            <div className="pt-1 flex justify-end">
              <button
                type="button"
                onClick={handlePutuskanKoneksi}
                className="inline-flex items-center gap-1 text-[11px] text-red-600 dark:text-red-400 hover:underline"
              >
                <Unlink className="w-3 h-3" />
                <span>Putuskan / Hapus dari Browser Ini</span>
              </button>
            </div>
          </div>
        )}

        {/* Form Ganti / Tambah Connection String (Tersembunyi & Diproteksi) */}
        <div className="space-y-3 pt-1 border-t border-border/60">
          {!bukaFormUbah ? (
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground text-[11px]">
                {statusDatabase === 'terhubung_neon'
                  ? 'Ingin menghubungkan ke database Neon lain?'
                  : 'Aktifkan sinkronisasi awan Neon PostgreSQL:'}
              </span>
              <button
                type="button"
                onClick={() => setBukaFormUbah(true)}
                className="text-accent hover:underline font-semibold text-xs"
              >
                {statusDatabase === 'terhubung_neon' ? 'Ganti Connection String' : 'Hubungkan Neon DB'}
              </button>
            </div>
          ) : (
            <div className="space-y-2 p-3.5 bg-muted/60 border border-border rounded-lg text-xs animate-in fade-in-50 duration-200">
              <div className="flex items-center justify-between">
                <label htmlFor="neon-pass-input" className="font-semibold text-foreground">
                  {statusDatabase === 'terhubung_neon' ? 'Masukkan Connection String Baru:' : 'Connection String Neon Database:'}
                </label>
                {statusDatabase === 'terhubung_neon' && (
                  <button
                    type="button"
                    onClick={() => {
                      setBukaFormUbah(false);
                      setInputUrl('');
                    }}
                    className="text-muted-foreground hover:text-foreground text-[11px]"
                  >
                    Batal
                  </button>
                )}
              </div>

              <div className="relative">
                <input
                  id="neon-pass-input"
                  type={lihatPassword ? 'text' : 'password'}
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  placeholder="postgresql://user:password@host/db?sslmode=require"
                  className="w-full pl-3 pr-10 py-2 text-xs font-mono rounded border border-border bg-card text-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                  spellCheck="false"
                />
                <button
                  type="button"
                  onClick={() => setLihatPassword(!lihatPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {lihatPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>

              <p className="text-[10px] text-muted-foreground leading-relaxed">
                Kredensial disimpan lokal di peramban Anda (localStorage) dan dikirim langsung ke serverless Neon via SSL terenkripsi tanpa melalui server publik.
              </p>

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  disabled={!inputUrl.trim()}
                  onClick={handleSimpanKoneksi}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-accent text-accent-foreground rounded text-xs font-semibold hover:bg-accent-hover disabled:opacity-40 transition-colors"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Simpan &amp; Hubungkan</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Tombol Aksi */}
        <div className="flex items-center justify-between pt-2 border-t border-border/60">
          <div className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
            {tersimpanNotif ? pesanNotif : ''}
          </div>
          <button
            type="button"
            onClick={onTutup}
            className="px-5 py-2 bg-primary text-primary-foreground rounded text-xs font-medium hover:bg-primary-hover transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
