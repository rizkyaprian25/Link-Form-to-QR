import {
  Link2,
  CheckCircle2,
  AlertCircle,
  ArrowRightLeft,
  ClipboardCopy,
  Sparkles,
  GraduationCap,
  Tag,
} from 'lucide-react';
import { HasilValidasiUrl, PresetTemplatForm, KATEGORI_STANDAR } from '../../../contracts/formqr';
import { PRESET_TEMPLAT } from '../../../mock/mockForms';

interface InputSectionProps {
  urlInput: string;
  onUrlChange: (url: string) => void;
  hasilValidasi: HasilValidasiUrl;
  labelForm: string;
  onLabelChange: (label: string) => void;
  tagAktif: string;
  onTagChange: (tag: string) => void;
  onPilihPreset: (preset: PresetTemplatForm) => void;
}

/**
 * Komponen Bagian Masukan Tautan & Konfigurasi Formulir
 * Menyediakan masukan URL dengan auto-normalisasi (/edit -> /viewform, forms.gle, Google Drive),
 * pemilihan kategori (Ulangan, Ujian, Kuis, Presensi, dll.), dan templat preset instan.
 */
export function InputSection({
  urlInput,
  onUrlChange,
  hasilValidasi,
  labelForm,
  onLabelChange,
  tagAktif,
  onTagChange,
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
            Konfigurasi Tautan Formulir &amp; Ujian
          </h2>
          <span className="text-[11px] font-mono text-muted-foreground">Langkah 1/2</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Tempelkan tautan Google Form atau Google Drive Anda. Sistem secara otomatis menormalisasinya menjadi format responden publik siap pindai.
        </p>
      </div>

      {/* Input Utama URL dengan Affix https:// */}
      <div className="space-y-1.5">
        <label htmlFor="url-input" className="block text-xs font-medium text-foreground">
          Alamat Tautan URL Formulir / Drive <span className="text-destructive">*</span>
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
            placeholder="forms.gle/... atau docs.google.com/forms/... atau drive.google.com/..."
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
                  Dialihkan otomatis ke: {hasilValidasi.urlBersih}
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
          placeholder="Contoh: Ulangan Harian Informatika Kelas 7 - Bab 1"
          className="w-full px-3 py-2 text-xs rounded border border-border bg-card text-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
        />
      </div>

      {/* Pemilih Kategori Formulir (Termasuk Ulangan, Ujian, Kuis, Presensi) */}
      <div className="space-y-2 pt-1 border-t border-border/60">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-accent" />
            Kategori Formulir
          </label>
          <span className="text-[10px] font-mono text-muted-foreground">
            Kategori aktif: <strong className="text-accent">{tagAktif}</strong>
          </span>
        </div>

        {/* Chips Kategori Standar */}
        <div className="flex flex-wrap gap-1.5">
          {KATEGORI_STANDAR.map((kategori) => {
            const isAktif = tagAktif.toLowerCase() === kategori.toLowerCase();
            return (
              <button
                key={kategori}
                type="button"
                onClick={() => onTagChange(kategori)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all flex items-center gap-1 ${
                  isAktif
                    ? 'bg-accent text-accent-foreground shadow-xs ring-1 ring-accent'
                    : 'bg-muted/70 hover:bg-muted text-muted-foreground hover:text-foreground border border-border'
                }`}
              >
                {kategori === 'Ulangan' && <GraduationCap className="w-3 h-3" />}
                <span>{kategori}</span>
              </button>
            );
          })}
        </div>

        {/* Input Kustom Tag Kategori jika ingin menulis sendiri */}
        <div className="pt-1">
          <input
            type="text"
            value={tagAktif}
            onChange={(e) => onTagChange(e.target.value)}
            maxLength={25}
            placeholder="Atau ketik nama kategori kustom Anda (misal: Ulangan Harian, PTS, dll.)"
            className="w-full px-3 py-1.5 text-xs rounded border border-border bg-card text-foreground focus:outline-none focus:border-accent"
          />
        </div>
      </div>

      {/* Pilihan Cepat Kategori / Preset */}
      <div className="space-y-2 pt-1 border-t border-border/60">
        <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-accent" />
          Pilihan Cepat Templat Kategori
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {PRESET_TEMPLAT.map((preset) => {
            const isAktif = tagAktif.toLowerCase() === preset.tag.toLowerCase();
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => onPilihPreset(preset)}
                className={`p-2.5 rounded border text-left transition-all ${
                  isAktif
                    ? 'border-accent bg-accent/5 text-accent shadow-xs ring-1 ring-accent/30'
                    : 'border-border bg-card hover:bg-muted/50 text-foreground'
                }`}
              >
                <div className="text-xs font-semibold leading-tight line-clamp-1 flex items-center gap-1">
                  {preset.tag === 'Ulangan' && <GraduationCap className="w-3.5 h-3.5 text-accent shrink-0" />}
                  <span>{preset.tag}</span>
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
