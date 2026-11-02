import { ReactNode } from 'react';
import { QrCode, ShieldCheck, Sparkles } from 'lucide-react';

interface AppShellProps {
  children: ReactNode;
  totalTersimpan: number;
}

/**
 * App Shell Utama
 * Mengimplementasikan tata letak baku Swiss Modernist dengan hairline 1px divider,
 * navigasi atas yang stabil, dan footer kepatuhan privasi (100% Client-side).
 */
export function AppShell({ children, totalTersimpan }: AppShellProps) {
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
                  v1.0.0
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground hidden sm:block">
                Google Forms to Vector QR Engine
              </p>
            </div>
          </div>

          {/* Status Engine & Metrik Riwayat */}
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-muted/70 border border-border rounded text-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
              </span>
              <span className="font-mono text-[11px] text-foreground font-medium">
                Engine v2.4 Ready
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground bg-card border border-border px-2.5 py-1 rounded">
              <Sparkles className="w-3.5 h-3.5 text-accent" />
              <span>{totalTersimpan} Formulir Tersimpan</span>
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
            <ShieldCheck className="w-4 h-4 text-success" />
            <span>100% Client-Side Engine • Tautan Anda Tidak Pernah Dikirim ke Server Luar</span>
          </div>
          <div className="font-mono text-[11px]">
            Dioptimalkan untuk Google Forms (<code className="text-accent font-semibold">forms.gle</code> &amp; <code className="text-accent font-semibold">docs.google.com/forms</code>)
          </div>
        </div>
      </footer>
    </div>
  );
}
