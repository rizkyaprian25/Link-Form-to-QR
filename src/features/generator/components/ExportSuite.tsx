import React, { useState } from 'react';
import { Download, FileCode, Printer, Copy, Check, Sparkles } from 'lucide-react';
import { KonfigurasiQR } from '../../../contracts/formqr';
import { kanvasKeBlob, renderQrKeKanvas } from '../services/qrEngine';

interface ExportSuiteProps {
  config: KonfigurasiQR;
  svgContent: string;
  isReady: boolean;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  onEksporSukses: () => void;
  onBukaModeCetak: () => void;
}

/**
 * Suite Ekspor Multi-Format & Mode Cetak Langsung
 * Mendukung pengunduhan berkas Vector SVG, gambar raster PNG 300 DPI,
 * salin langsung ke papan klip, dan pencetakan lembar fisik flyer/kartu meja.
 */
export function ExportSuite({
  config,
  svgContent,
  isReady,
  canvasRef,
  onEksporSukses,
  onBukaModeCetak,
}: ExportSuiteProps) {
  const [salinStatus, setSalinStatus] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Bersihkan nama file dari karakter ilegal
  const namaFileBasis = (config.labelFormulir || 'formqr')
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '-')
    .replace(/-+/g, '-');

  // 1. Ekspor Vector SVG
  const handleDownloadSvg = () => {
    if (!svgContent || !isReady) return;

    const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${namaFileBasis}-vector.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    onEksporSukses();
  };

  // 2. Ekspor High-Res PNG (1024px / 2048px)
  const handleDownloadPng = async (resolusi: number = 2048) => {
    if (!isReady) return;
    setIsProcessing(true);

    try {
      // Buat kanvas sementara di memori untuk resolusi murni
      const offscreenCanvas = document.createElement('canvas');
      await renderQrKeKanvas(offscreenCanvas, config, resolusi);

      const blob = await kanvasKeBlob(offscreenCanvas);
      if (blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${namaFileBasis}-${resolusi}px-300dpi.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        onEksporSukses();
      }
    } catch (err) {
      console.error('Gagal mengekspor PNG:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  // 3. Salin Gambar PNG ke Clipboard
  const handleSalinGambarClipboard = async () => {
    const canvas = canvasRef.current;
    if (!canvas || !isReady) return;

    try {
      const blob = await kanvasKeBlob(canvas);
      if (blob && navigator.clipboard && window.ClipboardItem) {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob }),
        ]);
        setSalinStatus('Tersalin!');
        setTimeout(() => setSalinStatus(null), 2000);
        onEksporSukses();
      } else {
        setSalinStatus('Tidak Didukung');
        setTimeout(() => setSalinStatus(null), 2000);
      }
    } catch (err) {
      console.warn('Gagal menyalin gambar ke clipboard:', err);
      setSalinStatus('Gagal');
      setTimeout(() => setSalinStatus(null), 2000);
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-5 sm:p-6 space-y-4 shadow-sm w-full">
      <div>
        <h3 className="text-sm font-semibold text-foreground tracking-tight flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-accent" />
          Aksi Ekspor &amp; Publikasi Fisik
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Pilih format vektor untuk desainer grafis atau cetak kartu meja langsung.
        </p>
      </div>

      {/* Grid Tombol Ekspor Utama */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {/* Tombol Utama: Download Vector SVG */}
        <button
          type="button"
          disabled={!isReady || isProcessing}
          onClick={handleDownloadSvg}
          className={`col-span-1 sm:col-span-2 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground text-xs font-semibold rounded hover:bg-primary-hover active:translate-y-[1px] transition-all shadow-xs ${
            !isReady ? 'opacity-40 cursor-not-allowed' : ''
          }`}
        >
          <FileCode className="w-4 h-4" />
          <span>Download Vector SVG (Skala Tak Terbatas)</span>
        </button>

        {/* Tombol Secondary 1: Download PNG 300 DPI */}
        <button
          type="button"
          disabled={!isReady || isProcessing}
          onClick={() => handleDownloadPng(2048)}
          className={`flex items-center justify-center gap-2 px-3 py-2 bg-card border border-border text-foreground text-xs font-medium rounded hover:bg-muted/60 active:translate-y-[1px] transition-all ${
            !isReady ? 'opacity-40 cursor-not-allowed' : ''
          }`}
        >
          <Download className="w-3.5 h-3.5 text-accent" />
          <span>Download PNG (2048px • 300 DPI)</span>
        </button>

        {/* Tombol Secondary 2: Cetak Flyer / Kartu Meja */}
        <button
          type="button"
          disabled={!isReady || isProcessing}
          onClick={onBukaModeCetak}
          className={`flex items-center justify-center gap-2 px-3 py-2 bg-accent text-accent-foreground text-xs font-medium rounded hover:bg-accent-hover active:translate-y-[1px] transition-all ${
            !isReady ? 'opacity-40 cursor-not-allowed' : ''
          }`}
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Cetak Flyer / Kartu Meja</span>
        </button>
      </div>

      {/* Opsi Ekspor Tambahan: Salin Gambar ke Clipboard */}
      <div className="pt-2 border-t border-border/60 flex items-center justify-between">
        <span className="text-[11px] text-muted-foreground">
          Butuh cepat untuk presentasi atau chat?
        </span>
        <button
          type="button"
          disabled={!isReady || isProcessing}
          onClick={handleSalinGambarClipboard}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-foreground hover:bg-muted/60 rounded border border-border transition-colors disabled:opacity-40"
        >
          {salinStatus === 'Tersalin!' ? (
            <>
              <Check className="w-3.5 h-3.5 text-success" />
              <span className="text-success font-medium">Gambar Tersalin!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Salin Gambar QR</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
