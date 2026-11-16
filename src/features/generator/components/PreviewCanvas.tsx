import React, { useRef, useEffect } from 'react';
import { ExternalLink, Copy, Check, QrCode } from 'lucide-react';
import { KonfigurasiQR } from '../../../contracts/formqr';
import { renderQrKeKanvas } from '../services/qrEngine';

interface PreviewCanvasProps {
  config: KonfigurasiQR;
  svgContent: string;
  isReady: boolean;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
}

/**
 * Kanvas Pratinjau Vektor Presisi (Staging Viewport)
 * Mengikuti cetak biru Stitch MCP dengan garis bidik teknis (crosshair),
 * pola mikrogirid 16px, dan informasi resolusi fisik.
 */
export function PreviewCanvas({ config, svgContent, isReady, canvasRef }: PreviewCanvasProps) {
  const [sudahDisalin, setSudahDisalin] = React.useState(false);
  const internalCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Sinkronisasi ref canvas eksternal jika disediakan
  useEffect(() => {
    const kanvasAktif = canvasRef?.current || internalCanvasRef.current;
    if (kanvasAktif && isReady) {
      renderQrKeKanvas(kanvasAktif, config, 1024).catch((err) => {
        console.error('Gagal merender ke kanvas:', err);
      });
    }
  }, [config, isReady, canvasRef]);

  const handleSalinUrl = async () => {
    const url = config.urlTervalidasi || config.urlAsli;
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setSudahDisalin(true);
      setTimeout(() => setSudahDisalin(false), 2000);
    } catch (err) {
      console.warn('Gagal menyalin URL:', err);
    }
  };

  const urlAktif = config.urlTervalidasi || config.urlAsli;

  return (
    <div className="bg-card border border-border rounded-lg p-5 sm:p-6 space-y-4 shadow-sm flex flex-col items-center">
      {/* Header Staging & Metadata Dimensi */}
      <div className="w-full flex items-center justify-between border-b border-border/60 pb-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse"></span>
          <span className="text-xs font-semibold text-foreground tracking-tight">
            Kanvas Pratinjau Studio
          </span>
        </div>
        <div className="flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded border border-border/60">
          <span>1024 × 1024 PX</span>
          <span>•</span>
          <span className="text-accent font-semibold">{config.dpiTarget} DPI</span>
        </div>
      </div>

      {/* Frame Kanvas Arsitektural dengan Technical Crosshairs */}
      <div className="relative w-full max-w-[340px] aspect-square bg-[#FFFFFF] technical-grid border border-border rounded-lg flex items-center justify-center p-6 select-none overflow-hidden">
        {/* Sudut Bidik Teknis (Technical Crosshairs) */}
        <div className="absolute top-2 left-2 text-[9px] font-mono text-muted-foreground/60 select-none">
          + 00,00
        </div>
        <div className="absolute top-2 right-2 text-[9px] font-mono text-muted-foreground/60 select-none">
          + 100,00
        </div>
        <div className="absolute bottom-2 left-2 text-[9px] font-mono text-muted-foreground/60 select-none">
          + 00,100
        </div>
        <div className="absolute bottom-2 right-2 text-[9px] font-mono text-muted-foreground/60 select-none">
          VECTOR SVG
        </div>

        {/* Tampilan Konten QR atau Empty State Placeholder */}
        {isReady && svgContent ? (
          <div
            className="w-full h-full flex items-center justify-center transition-all duration-200"
            dangerouslySetInnerHTML={{ __html: svgContent }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-center p-6 text-muted-foreground space-y-2">
            <div className="w-16 h-16 rounded-full bg-muted/60 border border-border flex items-center justify-center text-muted-foreground/50 mb-1">
              <QrCode className="w-8 h-8" />
            </div>
            <p className="text-xs font-medium text-foreground">Menunggu Masukan Tautan</p>
            <p className="text-[11px] leading-relaxed max-w-[200px]">
              Tempelkan URL Google Form di kolom sebelah kiri untuk mengaktifkan rendering live.
            </p>
          </div>
        )}

        {/* Hidden Canvas untuk Proses Ekspor PNG Beresolusi Tinggi */}
        <canvas ref={canvasRef || internalCanvasRef} className="hidden" />
      </div>

      {/* Kartu Informasi Metadata Tautan Tujuan */}
      {isReady && urlAktif && (
        <div className="w-full max-w-[340px] bg-muted/30 border border-border rounded p-3 text-xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-foreground truncate max-w-[200px]">
              {config.labelFormulir || 'Formulir Tanpa Judul'}
            </span>
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border">
              {config.tagKategori || 'Form'}
            </span>
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground bg-card border border-border/60 px-2 py-1 rounded">
            <span className="truncate max-w-[210px] select-all" title={urlAktif}>
              {urlAktif}
            </span>
            <div className="flex items-center gap-1 pl-2 border-l border-border/60">
              <button
                type="button"
                onClick={handleSalinUrl}
                title="Salin Tautan Lengkap"
                className="p-1 hover:text-foreground text-muted-foreground transition-colors"
              >
                {sudahDisalin ? (
                  <Check className="w-3.5 h-3.5 text-success" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
              <a
                href={urlAktif}
                target="_blank"
                rel="noreferrer noopener"
                title="Buka Formulir di Tab Baru"
                className="p-1 hover:text-foreground text-muted-foreground transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
