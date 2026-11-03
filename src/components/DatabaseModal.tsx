import { Database, X, CheckCircle2, AlertCircle, Copy, Check, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { StatusDatabase } from '../features/generator/services/storageService';

interface DatabaseModalProps {
  statusDatabase: StatusDatabase;
  onTutup: () => void;
  onCekUlang: () => void;
}

/**
 * Modal Informasi & Panduan Koneksi Neon Database
 * Membantu pengguna menghubungkan string koneksi Neon PostgreSQL ke dalam proyek.
 */
export function DatabaseModal({ statusDatabase, onTutup, onCekUlang }: DatabaseModalProps) {
  const [tersalin, setTersalin] = useState(false);

  const contohEnv = `DATABASE_URL="postgresql://user:password@ep-xyz.us-east-2.aws.neon.tech/neondb?sslmode=require"`;

  const handleSalinEnv = () => {
    navigator.clipboard.writeText(contohEnv);
    setTersalin(true);
    setTimeout(() => setTersalin(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-card w-full max-w-lg rounded-xl border border-border shadow-2xl overflow-hidden my-auto p-6 space-y-5">
        {/* Header Modal */}
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-accent" />
            <h3 className="text-base font-semibold text-foreground tracking-tight">
              Status Koneksi Neon Database
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
                ? 'Terhubung ke Neon PostgreSQL'
                : 'Berjalan di Mode Lokal (Offline Cache)'}
            </div>
            <p className="leading-relaxed opacity-90">
              {statusDatabase === 'terhubung_neon'
                ? 'Seluruh riwayat formulir dan konfigurasi QR Anda disinkronkan secara aman ke database Neon PostgreSQL Anda. Data dapat diakses antar perangkat.'
                : 'Aplikasi saat ini menyimpan riwayat formulir di browser lokal. Untuk menyimpan permanen di Neon Cloud, masukkan DATABASE_URL ke berkas .env Anda.'}
            </p>
          </div>
        </div>

        {/* Panduan 3 Langkah Menghubungkan Neon */}
        <div className="space-y-3 text-xs">
          <h4 className="font-semibold text-foreground flex items-center justify-between">
            <span>Cara Menghubungkan Database Neon Anda:</span>
            <a
              href="https://console.neon.tech"
              target="_blank"
              rel="noreferrer noopener"
              className="text-accent hover:underline flex items-center gap-1 font-normal text-[11px]"
            >
              Buka Neon Console <ExternalLink className="w-3 h-3" />
            </a>
          </h4>

          <ol className="list-decimal list-inside space-y-2 text-muted-foreground leading-relaxed">
            <li>
              Buat akun atau buka proyek di <strong className="text-foreground">console.neon.tech</strong>.
            </li>
            <li>
              Salin <strong className="text-foreground">Connection String</strong> PostgreSQL Anda (pilih mode <em>Pooled connection</em> atau <em>Direct</em>).
            </li>
            <li>
              Tempelkan ke dalam file <strong className="text-foreground">.env</strong> di root proyek ini:
            </li>
          </ol>

          {/* Code Snippet Box */}
          <div className="relative bg-muted/80 border border-border rounded p-3 font-mono text-[11px] text-foreground select-all break-all">
            <code>{contohEnv}</code>
            <button
              type="button"
              onClick={handleSalinEnv}
              title="Salin contoh konfigurasi"
              className="absolute top-2 right-2 p-1 text-muted-foreground hover:text-foreground bg-card border border-border rounded transition-colors"
            >
              {tersalin ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          <p className="text-[11px] text-muted-foreground">
            Tabel <code className="text-accent font-semibold">form_qrs</code> dan indeks database akan dibuat secara otomatis saat pertama kali terhubung.
          </p>
        </div>

        {/* Footer Tombol Aksi */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/60">
          <button
            type="button"
            onClick={onCekUlang}
            className="px-4 py-2 bg-accent text-accent-foreground rounded text-xs font-semibold hover:bg-accent-hover transition-colors"
          >
            Uji Ulang Koneksi
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
  );
}
