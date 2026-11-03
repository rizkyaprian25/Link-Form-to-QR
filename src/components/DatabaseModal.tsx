import { Database, X, CheckCircle2, AlertCircle, Save, Check } from 'lucide-react';
import { useState } from 'react';
import { StatusDatabase } from '../features/generator/services/storageService';
import {
  ambilConnectionStringNeon,
  simpanConnectionStringNeon,
} from '../features/generator/services/neonClient';

interface DatabaseModalProps {
  statusDatabase: StatusDatabase;
  onTutup: () => void;
  onCekUlang: () => void;
}

/**
 * Modal Informasi & Pengaturan Koneksi Neon Database
 * Memungkinkan pengguna menghubungkan database Neon langsung dari browser (tanpa perlu Vercel atau backend).
 */
export function DatabaseModal({ statusDatabase, onTutup, onCekUlang }: DatabaseModalProps) {
  const [inputUrl, setInputUrl] = useState(() => ambilConnectionStringNeon());
  const [tersimpanNotif, setTersimpanNotif] = useState(false);

  const handleSimpanKoneksi = () => {
    simpanConnectionStringNeon(inputUrl);
    setTersimpanNotif(true);
    setTimeout(() => setTersimpanNotif(false), 2000);
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
              Koneksi Neon Database (Bisa Tanpa Vercel)
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
                ? 'Terhubung ke Neon PostgreSQL Cloud'
                : 'Berjalan di Mode Lokal (Offline)'}
            </div>
            <p className="leading-relaxed opacity-90">
              {statusDatabase === 'terhubung_neon'
                ? 'Seluruh riwayat kode QR tersimpan langsung di database Neon PostgreSQL Anda. Data dapat diakses kapan saja dan tidak akan hilang.'
                : 'Aplikasi saat ini hanya menyimpan data di peramban ini. Masukkan connection string Neon Anda di bawah untuk mengaktifkan sinkronisasi cloud.'}
            </p>
          </div>
        </div>

        {/* Input String Koneksi Neon Langsung */}
        <div className="space-y-2">
          <label htmlFor="neon-url-input" className="block text-xs font-semibold text-foreground">
            Connection String Neon Database Anda:
          </label>
          <div className="space-y-1.5">
            <input
              id="neon-url-input"
              type="text"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="postgresql://username:password@ep-xyz.us-east-2.aws.neon.tech/neondb?sslmode=require"
              className="w-full px-3 py-2 text-xs font-mono rounded border border-border bg-card text-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
              spellCheck="false"
            />
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Koneksi ini berjalan langsung dari peramban Anda ke serverless Neon via protokol HTTP aman (*Zero-Backend Direct Client*), sehingga <strong>bisa berjalan di GitHub Pages tanpa Vercel</strong>!
            </p>
          </div>
        </div>

        {/* Footer Tombol Aksi */}
        <div className="flex items-center justify-between pt-3 border-t border-border/60">
          <div className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
            {tersimpanNotif ? '✓ Pengaturan Disimpan & Menguji...' : ''}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSimpanKoneksi}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-accent text-accent-foreground rounded text-xs font-semibold hover:bg-accent-hover transition-colors shadow-xs"
            >
              {tersimpanNotif ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
              <span>Simpan &amp; Hubungkan</span>
            </button>
            <button
              type="button"
              onClick={onTutup}
              className="px-4 py-2 border border-border text-foreground rounded text-xs font-medium hover:bg-muted transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
