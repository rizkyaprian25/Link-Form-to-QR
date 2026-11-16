import { useState } from 'react';
import {
  Link2,
  CheckCircle2,
  AlertCircle,
  ArrowRightLeft,
  ClipboardCopy,
  Sparkles,
  Zap,
  ShieldCheck,
  FileText,
  Copy,
  Check,
  RefreshCw,
  Wand2,
} from 'lucide-react';
import { HasilValidasiUrl, ModeSumberQR, PresetTemplatForm } from '../../../contracts/formqr';
import { PRESET_TEMPLAT } from '../../../mock/mockForms';
import {
  validasiCustomSlug,
  bangunUrlPendek,
  buatShortCodeAcak,
} from '../services/shortenerService';

interface InputSectionProps {
  urlInput: string;
  onUrlChange: (url: string) => void;
  hasilValidasi: HasilValidasiUrl;
  labelForm: string;
  onLabelChange: (label: string) => void;
  tagAktif: string;
  onPilihPreset: (preset: PresetTemplatForm) => void;
  // State Pemendek Tautan
  modeSumberQR: ModeSumberQR;
  onModeSumberChange: (mode: ModeSumberQR) => void;
  kodePendek: string;
  onKodePendekChange: (kode: string) => void;
}

/**
 * Komponen Bagian Masukan Tautan & Deteksi Cerdas
 * Menyediakan kolom masukan URL, Pill Switcher Sumber QR (Link Pendek / Google Bersih / Asli),
 * generator slug acak & kustom, tombol salin instan, serta pemilih preset.
 */
export function InputSection({
  urlInput,
  onUrlChange,
  hasilValidasi,
  labelForm,
  onLabelChange,
  tagAktif,
  onPilihPreset,
  modeSumberQR,
  onModeSumberChange,
  kodePendek,
  onKodePendekChange,
}: InputSectionProps) {
  const [salinSukses, setSalinSukses] = useState(false);
  const [modeKustomSlug, setModeKustomSlug] = useState(false);
  const [inputSlugKustom, setInputSlugKustom] = useState('');

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

  // Handler acak ulang short code
  const handleAcakUlangSlug = () => {
    const baru = buatShortCodeAcak(6);
    onKodePendekChange(baru);
  };

  // Validasi live slug kustom
  const validasiSlug = validasiCustomSlug(inputSlugKustom);

  const handleTerapkanSlugKustom = () => {
    if (validasiSlug.valid && inputSlugKustom.trim()) {
      onKodePendekChange(inputSlugKustom.trim());
    }
  };

  const urlPendekAktif = bangunUrlPendek(kodePendek);

  const handleSalinUrlPendek = async () => {
    try {
      await navigator.clipboard.writeText(urlPendekAktif);
      setSalinSukses(true);
      setTimeout(() => setSalinSukses(false), 2000);
    } catch (err) {
      console.error('Gagal menyalin URL pendek:', err);
    }
  };

  // Hitung efisiensi pengurangan karakter
  const panjangAsli = urlInput.length || 75;
  const panjangPendek = urlPendekAktif.length;
  const hematPersen = Math.max(0, Math.round(((panjangAsli - panjangPendek) / panjangAsli) * 100));

  return (
    <div className="bg-card border border-border rounded-lg p-5 sm:p-6 space-y-5 shadow-sm">
      {/* Header Bagian */}
      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground tracking-tight flex items-center gap-2">
            <Link2 className="w-4 h-4 text-accent" />
            Konfigurasi Tautan Formulir Ujian
          </h2>
          <span className="text-[11px] font-mono text-muted-foreground">Langkah 1/2</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Tempelkan tautan Google Form atau Drive Anda. Sistem secara otomatis menormalisasi dan menyediakan opsi pemendek tautan.
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
                  Dialihkan ke: {hasilValidasi.urlBersih}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Pill Switcher Sumber QR Code (Tautan Pendek vs Google Bersih vs Asli) */}
      <div className="space-y-3 p-4 rounded-lg bg-muted/40 border border-border">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-accent" />
            Sumber URL untuk QR Code &amp; Pemendek Tautan
          </label>
          <span className="text-[10px] font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded border border-border">
            Pilihan Target QR
          </span>
        </div>

        {/* 3-Pill Switcher Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {/* Opsi 1: Tautan Pendek */}
          <button
            type="button"
            onClick={() => onModeSumberChange('short_link')}
            className={`p-3 rounded-lg border text-left transition-all relative ${
              modeSumberQR === 'short_link'
                ? 'border-accent bg-accent/10 text-foreground ring-1 ring-accent'
                : 'border-border bg-card hover:bg-muted/70 text-muted-foreground'
            }`}
          >
            <div className="flex items-center gap-2">
              <Zap className={`w-4 h-4 ${modeSumberQR === 'short_link' ? 'text-accent' : 'text-muted-foreground'}`} />
              <span className="text-xs font-semibold text-foreground">Tautan Pendek</span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1 leading-tight">
              ?s={kodePendek} (QR sangat renggang &amp; scan kilat di kelas)
            </p>
          </button>

          {/* Opsi 2: Google Bersih */}
          <button
            type="button"
            onClick={() => onModeSumberChange('google_clean')}
            className={`p-3 rounded-lg border text-left transition-all relative ${
              modeSumberQR === 'google_clean'
                ? 'border-emerald-500 bg-emerald-500/10 text-foreground ring-1 ring-emerald-500'
                : 'border-border bg-card hover:bg-muted/70 text-muted-foreground'
            }`}
          >
            <div className="flex items-center gap-2">
              <ShieldCheck className={`w-4 h-4 ${modeSumberQR === 'google_clean' ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'}`} />
              <span className="text-xs font-semibold text-foreground">Google Bersih</span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1 leading-tight">
              docs.google.com (100% Kompatibel NETRI Exam saat ini)
            </p>
          </button>

          {/* Opsi 3: Tautan Asli */}
          <button
            type="button"
            onClick={() => onModeSumberChange('asli')}
            className={`p-3 rounded-lg border text-left transition-all relative ${
              modeSumberQR === 'asli'
                ? 'border-accent bg-accent/10 text-foreground ring-1 ring-accent'
                : 'border-border bg-card hover:bg-muted/70 text-muted-foreground'
            }`}
          >
            <div className="flex items-center gap-2">
              <FileText className={`w-4 h-4 ${modeSumberQR === 'asli' ? 'text-accent' : 'text-muted-foreground'}`} />
              <span className="text-xs font-semibold text-foreground">Tautan Mentah</span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1 leading-tight">
              Sesuai teks asli tanpa modifikasi apapun
            </p>
          </button>
        </div>

        {/* Panel Detail Tautan Pendek (Aktif ketika short_link dipilih) */}
        {modeSumberQR === 'short_link' && (
          <div className="mt-3 pt-3 border-t border-border/60 space-y-3 animate-in fade-in-50 duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-card border border-border p-2.5 rounded-lg">
              <div className="space-y-0.5 min-w-0 flex-1">
                <span className="text-[10px] text-muted-foreground block font-medium">
                  Tautan Pendek Siap Bagikan:
                </span>
                <span className="text-xs font-mono text-accent truncate block select-all">
                  {urlPendekAktif}
                </span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={handleSalinUrlPendek}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium bg-accent text-accent-foreground hover:bg-accent-hover transition-colors shadow-xs"
                >
                  {salinSukses ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{salinSukses ? 'Tersalin!' : 'Salin Link'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleAcakUlangSlug}
                  title="Acak Kode Pendek Baru"
                  className="p-1.5 rounded border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Kontrol Alias Kustom */}
            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-muted-foreground text-[11px]">
                {modeKustomSlug ? 'Kustomisasi nama slug link:' : 'Ingin menggunakan nama tautan sendiri?'}
              </span>
              <button
                type="button"
                onClick={() => setModeKustomSlug(!modeKustomSlug)}
                className="text-accent hover:underline font-semibold text-xs inline-flex items-center gap-1"
              >
                <Wand2 className="w-3 h-3" />
                <span>{modeKustomSlug ? 'Tutup Alias Kustom' : 'Buat Alias Kustom'}</span>
              </button>
            </div>

            {modeKustomSlug && (
              <div className="space-y-2 p-3 bg-card border border-border rounded-lg text-xs animate-in fade-in-50 duration-200">
                <div className="flex gap-2">
                  <div className="relative flex-1 flex rounded border border-border bg-card focus-within:border-accent">
                    <span className="inline-flex items-center px-2.5 bg-muted/60 text-muted-foreground text-xs font-mono border-r border-border select-none">
                      ?s=
                    </span>
                    <input
                      type="text"
                      value={inputSlugKustom}
                      onChange={(e) => setInputSlugKustom(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                      placeholder="contoh: ujian-ipa9"
                      className="flex-1 px-3 py-1.5 text-xs font-mono text-foreground bg-transparent focus:outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    disabled={!inputSlugKustom.trim() || !validasiSlug.valid}
                    onClick={handleTerapkanSlugKustom}
                    className="px-3 py-1.5 bg-primary text-primary-foreground rounded text-xs font-medium hover:bg-primary-hover disabled:opacity-40 transition-colors"
                  >
                    Terapkan
                  </button>
                </div>
                {!validasiSlug.valid && inputSlugKustom.length > 0 && (
                  <p className="text-[11px] text-destructive">{validasiSlug.pesanError}</p>
                )}
                <p className="text-[10px] text-muted-foreground">
                  Gunakan huruf, angka, atau tanda hubung (-). Contoh: <span className="font-mono">pts-matematika-8</span>.
                </p>
              </div>
            )}

            {/* Statistik Efisiensi */}
            <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
              <span>Efisiensi Pemendekan:</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Hemat ~{hematPersen}% karakter ({panjangPendek} vs {panjangAsli} char)
              </span>
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
