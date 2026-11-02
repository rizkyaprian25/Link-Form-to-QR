import { Printer, X, CheckCircle2 } from 'lucide-react';
import { KonfigurasiQR } from '../../../contracts/formqr';

interface PrintFlyerSheetProps {
  config: KonfigurasiQR;
  svgContent: string;
  onTutup: () => void;
}

/**
 * Lembar Siap Cetak Flyer / Kartu Meja (Print Layout Sheet)
 * Diformat khusus untuk kertas A4 / A5 dengan crop mark presisi dan instruksi pemindaian 3 langkah.
 */
export function PrintFlyerSheet({ config, svgContent, onTutup }: PrintFlyerSheetProps) {
  const handleCetak = () => {
    window.print();
  };

  const urlAktif = config.urlTervalidasi || config.urlAsli;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto no-print-overlay">
      <div className="bg-card w-full max-w-xl rounded-xl border border-border shadow-2xl overflow-hidden my-auto">
        {/* Bar Navigasi Modal (Hanya Tampil di Layar, Tersembunyi saat Dicetak) */}
        <div className="no-print flex items-center justify-between px-6 py-4 border-b border-border bg-muted/40">
          <div className="flex items-center gap-2">
            <Printer className="w-4 h-4 text-accent" />
            <span className="text-sm font-semibold text-foreground">
              Pratinjau Lembar Cetak Flyer / Kartu Meja
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCetak}
              className="inline-flex items-center gap-2 px-4 py-1.5 bg-accent text-accent-foreground text-xs font-semibold rounded hover:bg-accent-hover transition-colors shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              Cetak Sekarang
            </button>
            <button
              type="button"
              onClick={onTutup}
              className="p-1.5 text-muted-foreground hover:text-foreground rounded hover:bg-muted transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Lembar Dokumen Fisik yang Dicetak (Print-Ready Canvas) */}
        <div className="p-8 sm:p-12 bg-white text-black flex flex-col items-center text-center">
          {/* Kartu Border Lipat Presisi */}
          <div className="w-full border-2 border-dashed border-gray-300 p-8 rounded-2xl flex flex-col items-center">
            {/* Header Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-full text-xs font-semibold uppercase tracking-wider mb-3">
              <span className="w-2 h-2 rounded-full bg-purple-600"></span>
              Google Form Publik
            </div>

            {/* Judul Formulir Besar */}
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 mb-2">
              {config.labelFormulir || 'Pindai Untuk Mengisi Formulir'}
            </h1>
            <p className="text-sm text-gray-500 max-w-md mb-6">
              Arahkan kamera ponsel Anda langsung ke kode QR di bawah untuk mengakses formulir kegiatan secara instan.
            </p>

            {/* Gambar QR Code Vektor */}
            <div className="w-64 h-64 p-3 bg-white border border-gray-200 rounded-xl shadow-xs mb-6 flex items-center justify-center">
              <div
                className="w-full h-full flex items-center justify-center"
                dangerouslySetInnerHTML={{ __html: svgContent }}
              />
            </div>

            {/* Petunjuk Pemindaian 3 Langkah */}
            <div className="grid grid-cols-3 gap-3 w-full max-w-md pt-4 border-t border-gray-200 text-left text-xs mb-6">
              <div className="space-y-1">
                <span className="font-bold text-gray-800 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-600" /> 1. Buka Kamera
                </span>
                <p className="text-[11px] text-gray-500 leading-snug">Gunakan kamera bawaan ponsel atau pemindai QR.</p>
              </div>
              <div className="space-y-1">
                <span className="font-bold text-gray-800 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-600" /> 2. Arahkan Lensa
                </span>
                <p className="text-[11px] text-gray-500 leading-snug">Pastikan seluruh kotak QR berada di dalam bingkai.</p>
              </div>
              <div className="space-y-1">
                <span className="font-bold text-gray-800 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-600" /> 3. Isi Formulir
                </span>
                <p className="text-[11px] text-gray-500 leading-snug">Ketuk notifikasi yang muncul untuk membuka link.</p>
              </div>
            </div>

            {/* Tautan Alternatif untuk Masukan Manual */}
            {urlAktif && (
              <div className="text-[11px] font-mono text-gray-400 bg-gray-50 px-3 py-1.5 rounded border border-gray-200/80">
                Tautan Manual: <span className="text-gray-700 font-medium select-all">{urlAktif}</span>
              </div>
            )}
          </div>

          <div className="no-print mt-4 text-xs text-gray-400 font-mono">
            Tip: Atur skala halaman ke 100% pada dialog cetak peramban.
          </div>
        </div>
      </div>
    </div>
  );
}
