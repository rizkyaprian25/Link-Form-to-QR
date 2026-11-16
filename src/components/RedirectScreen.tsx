import { useEffect, useState } from 'react';
import { ExternalLink, Loader2, AlertCircle, ArrowLeft, QrCode } from 'lucide-react';
import { cariTargetUrl } from '../features/generator/services/shortenerService';

interface RedirectScreenProps {
  kode: string;
  onKembaliKeStudio?: () => void;
}

/**
 * Layar Pengalihan Cepat (Fast Redirector Screen)
 * Ditampilkan saat siswa atau pengguna memindai / membuka URL pendek: ?s=xyz
 * Mengalihkan secara instan ke Google Form tujuan via window.location.replace,
 * dengan tombol cadangan darurat jika peramban mencegah auto-redirect.
 */
export function RedirectScreen({ kode, onKembaliKeStudio }: RedirectScreenProps) {
  const [targetUrl, setTargetUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<'mencari' | 'mengalihkan' | 'tidak_ditemukan'>('mencari');
  const [pesanError, setPesanError] = useState<string>('');

  useEffect(() => {
    let aktif = true;

    async function prosesPengalihan() {
      if (!kode || !kode.trim()) {
        if (aktif) {
          setStatus('tidak_ditemukan');
          setPesanError('Kode tautan pendek kosong atau tidak valid.');
        }
        return;
      }

      const url = await cariTargetUrl(kode.trim());

      if (!aktif) return;

      if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
        setTargetUrl(url);
        setStatus('mengalihkan');

        // Pengalihan instan menggunakan window.location.replace (tidak meninggalkan riwayat redirect)
        try {
          window.location.replace(url);
        } catch {
          window.location.href = url;
        }
      } else {
        setStatus('tidak_ditemukan');
        setPesanError(`Tautan pendek "?s=${kode}" tidak ditemukan di database maupun cache.`);
      }
    }

    prosesPengalihan();

    return () => {
      aktif = false;
    };
  }, [kode]);

  const handleBukaManual = () => {
    if (targetUrl) {
      window.location.href = targetUrl;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-xl text-center space-y-6 animate-in fade-in-50 duration-200">
        {/* Brand Header */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-semibold">
          <QrCode className="w-3.5 h-3.5" />
          <span>FormQR Studio Redirector</span>
        </div>

        {status === 'mencari' && (
          <div className="space-y-4 py-4">
            <Loader2 className="w-10 h-10 text-accent animate-spin mx-auto" />
            <div className="space-y-1">
              <h2 className="text-base font-semibold text-foreground">
                Memeriksa Tautan Ujian...
              </h2>
              <p className="text-xs text-muted-foreground">
                Mengambil data tujuan untuk kode <span className="font-mono text-accent">?s={kode}</span>
              </p>
            </div>
          </div>
        )}

        {status === 'mengalihkan' && (
          <div className="space-y-4 py-2">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <ExternalLink className="w-6 h-6 animate-pulse" />
            </div>

            <div className="space-y-1">
              <h2 className="text-base font-semibold text-foreground">
                Mengalihkan ke Formulir Ujian...
              </h2>
              <p className="text-xs text-muted-foreground">
                Jika peramban Anda tidak berpindah secara otomatis, silakan tekan tombol di bawah ini:
              </p>
            </div>

            {targetUrl && (
              <div className="p-3 bg-muted/60 border border-border rounded-lg text-[11px] font-mono text-muted-foreground truncate select-all">
                {targetUrl}
              </div>
            )}

            <button
              type="button"
              onClick={handleBukaManual}
              className="w-full py-2.5 px-4 bg-accent text-accent-foreground rounded-lg font-semibold text-xs hover:bg-accent-hover transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <span>Buka Formulir Sekarang</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {status === 'tidak_ditemukan' && (
          <div className="space-y-4 py-2">
            <div className="w-12 h-12 rounded-full bg-destructive/10 border border-destructive/20 text-destructive flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h2 className="text-base font-semibold text-foreground">
                Tautan Tidak Ditemukan
              </h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {pesanError || 'Pastikan kode tautan pendek yang Anda masukkan atau pindai sudah benar.'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                if (onKembaliKeStudio) {
                  onKembaliKeStudio();
                } else {
                  window.location.href = window.location.pathname;
                }
              }}
              className="w-full py-2.5 px-4 border border-border bg-card hover:bg-muted text-foreground rounded-lg font-medium text-xs transition-colors flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali ke FormQR Studio</span>
            </button>
          </div>
        )}
      </div>

      <p className="text-[11px] text-muted-foreground/60 mt-6 font-mono">
        FormQR Studio • Zero-Backend Cloud Redirect
      </p>
    </div>
  );
}
