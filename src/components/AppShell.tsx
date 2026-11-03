import { ReactNode } from 'react';
import { QrCode, Database, Sparkles } from 'lucide-react';
import { StatusDatabase } from '../features/generator/services/storageService';

interface AppShellProps {
  children: ReactNode;
  totalTersimpan: number;
  statusDatabase: StatusDatabase;
  onBukaInfoDatabase?: () => void;
}

/**
 * App Shell Utama
 * Mengimplementasikan tata letak baku Swiss Modernist dengan indikator status sinkronisasi Neon DB,
 * navigasi atas yang stabil, dan footer kepatuhan privasi.
 */
export function AppShell({
  children,
  totalTersimpan,
  statusDatabase,
  onBukaInfoDatabase,
}: AppShellProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Header Utama Aplikasi */}
      <header className="sticky top-0 z-40 bg-card/95 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Judul Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary text-primary-foreground rounded flex items-center justify-center shadow-sm">
              <QrCode className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-base tracking-tight text-foreground font-sans">
                  FormQR <span className="text-accent font-medium">Studio</span>
                </span>
                <span className="text-[10px] uppercase font-mono tracking-wider px-1.5 py-0.5 bg-muted text-muted-foreground border border-border rounded">
                  v1.1.0
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground hidden sm:block">
                Google Forms to Vector QR Engine • Powered by Neon PostgreSQL
              </p>
            </div>
          </div>

          {/* Status Database & Metrik Riwayat */}
          <div className="flex items-center gap-3">
            {/* Indikator Status Database Neon */}
            <button
              type="button"
              onClick={onBukaInfoDatabase}
              title="Klik untuk melihat status koneksi Database Neon"
              className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs border transition-colors cursor-pointer ${
                statusDatabase === 'terhubung_neon'
                  ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                  : 'bg-muted/80 text-muted-foreground border-border hover:bg-muted'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span className="hidden sm:inline font-mono text-[11px] font-medium">
                {statusDatabase === 'terhubung_neon' ? 'Neon DB Aktif' : 'Mode Lokal'}
              </span>
              <span
                className={`w-2 h-2 rounded-full ${
                  statusDatabase === 'terhubung_neon'
                    ? 'bg-emerald-500 animate-pulse'
                    : 'bg-amber-500'
                }`}
              ></span>
            </button>

            <div className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground bg-card border border-border px-2.5 py-1 rounded">
              <Sparkles className="w-3.5 h-3.5 text-accent" />
              <span>{totalTersimpan} Formulir</span>
            </div>
          </div>
        </div>
      </header>

      {/* Konten Utama Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {children}
      </main>

      {/* Footer Minimalis & Jaminan Privasi */}
      <footer className="border-t border-border bg-card/50 py-6 text-center text-xs text-muted-foreground">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-accent" />
            <span>Penyimpanan Terpusat Neon Serverless Postgres • Aman &amp; Terisolasi</span>
          </div>
          <div className="font-mono text-[11px]">
            Dioptimalkan untuk Google Forms (<code className="text-accent font-semibold">forms.gle</code> &amp; <code className="text-accent font-semibold">docs.google.com/forms</code>)
          </div>
        </div>
      </footer>
    </div>
  );
}
