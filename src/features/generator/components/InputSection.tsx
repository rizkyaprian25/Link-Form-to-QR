import { Link2, CheckCircle2, AlertCircle, ArrowRightLeft, ClipboardCopy, Sparkles } from 'lucide-react';
import { HasilValidasiUrl, PresetTemplatForm } from '../../../contracts/formqr';
import { PRESET_TEMPLAT } from '../../../mock/mockForms';

interface InputSectionProps {
  urlInput: string;
  onUrlChange: (url: string) => void;
  hasilValidasi: HasilValidasiUrl;
  labelForm: string;
  onLabelChange: (label: string) => void;
  tagAktif: string;
  onPilihPreset: (preset: PresetTemplatForm) => void;
}

/**
 * Komponen Bagian Masukan Tautan & Deteksi Cerdas
 * Menyediakan kolom masukan URL dengan pengenalan otomatis format Google Form,
 * tombol tempel instan dari clipboard, dan pemilih preset kegiatan.
 */
export function InputSection({
  urlInput,
  onUrlChange,
  hasilValidasi,
  labelForm,
  onLabelChange,
  tagAktif,
  onPilihPreset,
}: InputSectionProps) {
  // Fungsi tempel teks instan dari clipboard peramban
  const handlePasteClipboard = async () => {
    try {
      const teks = await navigator.clipboard.readText();
      if (teks) {
        onUrlChange(teks);
      }
    } catch {
      console.warn('Izin clipboard tidak diberikan oleh pengguna.');
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-5 sm:p-6 space-y-5 shadow-sm">
      {/* Header Bagian */}
      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground tracking-tight flex items-center gap-2">
            <Link2 className="w-4 h-4 text-accent" />
            Konfigurasi Tautan Google Form
          </h2>
          <span className="text-[11px] font-mono text-muted-foreground">Langkah 1/2</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Tempelkan tautan formulir Anda. Sistem secara otomatis mendeteksi dan menormalisasi tautan publik.
        </p>
      </div>

      {/* Input Utama URL dengan Affix https:// */}
      <div className="space-y-1.5">
        <label htmlFor="url-input" className="block text-xs font-medium text-foreground">
          Alamat Tautan URL Formulir <span className="text-destructive">*</span>
        </label>
        <div className="relative flex rounded border border-border bg-card focus-within:border-accent focus-within:ring-1 focus-within:ring-accent transition-all">
          <div className="inline-flex items-center px-3 border-r border-border bg-muted/60 text-muted-foreground text-xs font-mono select-none">
            https://
          </div>
          <input
            id="url-input"
            type="text"
            value={urlInput.replace(/^https?:\/\//i, '')}
            onChange={(e) => {
              const val = e.target.value;
              onUrlChange(val ? `https://${val.replace(/^https?:\/\//i, '')}` : '');
            }}
            placeholder="forms.gle/xK8y9Q2pM4wZ7L1eA atau docs.google.com/forms/..."
            className="flex-1 px-3 py-2 text-xs font-mono text-foreground bg-transparent focus:outline-none placeholder:text-muted-foreground/60"
            autoComplete="off"
            spellCheck="false"
          />
          <button
            type="button"
            onClick={handlePasteClipboard}
            title="Tempel dari Clipboard"
            className="px-3 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors flex items-center gap-1.5 border-l border-border select-none"
          >
            <ClipboardCopy className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Tempel</span>
          </button>
        </div>

        {/* Indikator Status Validasi Real-Time */}
        {hasilValidasi.status !== 'idle' && (
          <div
            className={`flex items-start gap-2 p-2.5 rounded text-xs transition-all ${
              hasilValidasi.status === 'valid_short' || hasilValidasi.status === 'valid_full'
                ? 'bg-success/10 text-success border border-success/20'
                : hasilValidasi.status === 'auto_corrected'
                ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20'
                : hasilValidasi.status === 'unsupported_domain'
                ? 'bg-accent/10 text-accent border border-accent/20'
                : 'bg-destructive/10 text-destructive border border-destructive/20'
            }`}
          >
            {hasilValidasi.status === 'valid_short' || hasilValidasi.status === 'valid_full' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            ) : hasilValidasi.status === 'auto_corrected' ? (
              <ArrowRightLeft className="w-4 h-4 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            )}
            <div className="flex-1 leading-snug">
              <span className="font-medium">{hasilValidasi.pesanHumanis}</span>
              {hasilValidasi.status === 'auto_corrected' && (
                <div className="font-mono text-[10px] opacity-80 mt-1 break-all">
                  Dialihkan ke: {hasilValidasi.urlBersih}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Input Label Judul Formulir */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center">
          <label htmlFor="label-input" className="block text-xs font-medium text-foreground">
            Label / Judul Kegiatan untuk Lembar Cetak
          </label>
          <span className="text-[10px] text-muted-foreground font-mono">
            {labelForm.length}/80 karakter
          </span>
        </div>
        <input
          id="label-input"
          type="text"
          value={labelForm}
          onChange={(e) => onLabelChange(e.target.value)}
          maxLength={80}
          placeholder="Contoh: Presensi Kehadiran Kuliah Umum 2026"
          className="w-full px-3 py-2 text-xs rounded border border-border bg-card text-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
        />
      </div>

      {/* Pilihan Cepat Kategori / Preset */}
      <div className="space-y-2 pt-1 border-t border-border/60">
        <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-accent" />
          Pilihan Cepat Templat Kategori
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {PRESET_TEMPLAT.map((preset) => {
            const isAktif = tagAktif === preset.tag;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => onPilihPreset(preset)}
                className={`p-2.5 rounded border text-left transition-all ${
                  isAktif
                    ? 'border-accent bg-accent/5 text-accent shadow-xs'
                    : 'border-border bg-card hover:bg-muted/50 text-foreground'
                }`}
              >
                <div className="text-xs font-semibold leading-tight line-clamp-1">
                  {preset.tag}
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">
                  {preset.judul}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
