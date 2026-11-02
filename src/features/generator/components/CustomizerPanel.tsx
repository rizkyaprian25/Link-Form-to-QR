import { Sliders, ShieldCheck, Palette, Layers, Info } from 'lucide-react';
import { KonfigurasiQR, TingkatKoreksiError } from '../../../contracts/formqr';

interface CustomizerPanelProps {
  config: KonfigurasiQR;
  onChangeConfig: (partial: Partial<KonfigurasiQR>) => void;
}

// Pilihan palet warna modul teruji untuk keterbacaan pemindaian optimal
const PALET_WARNA_PRESET = [
  { nama: 'Obsidian Hitam', hex: '#18181B' },
  { nama: 'Google Form Violet', hex: '#7248B9' },
  { nama: 'Electric Indigo', hex: '#4F46E5' },
  { nama: 'Emerald Green', hex: '#065F46' },
  { nama: 'Navy Slate', hex: '#1E293B' },
];

/**
 * Panel Kustomisasi Parameter QR
 * Memberikan kontrol matematis terhadap tingkat koreksi Reed-Solomon,
 * warna modul, margin pelindung (quiet zone), dan penyematan lambang.
 */
export function CustomizerPanel({ config, onChangeConfig }: CustomizerPanelProps) {
  const tingkatKoreksiList: { level: TingkatKoreksiError; label: string; desc: string }[] = [
    { level: 'L', label: 'L - 7%', desc: 'Koreksi rendah, densitas titik longgar' },
    { level: 'M', label: 'M - 15%', desc: 'Standar dokumen umum' },
    { level: 'Q', label: 'Q - 25%', desc: 'Daya tahan tinggi terhadap robekan/noda' },
    { level: 'H', label: 'H - 30%', desc: 'Maksimal, wajib untuk penyematan logo' },
  ];

  return (
    <div className="bg-card border border-border rounded-lg p-5 sm:p-6 space-y-5 shadow-sm">
      {/* Header Bagian */}
      <div>
        <h2 className="text-base font-semibold text-foreground tracking-tight flex items-center gap-2">
          <Sliders className="w-4 h-4 text-accent" />
          Kustomisasi Tampilan &amp; Kualitas Cetak
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          Sesuaikan tingkat ketahanan fisik, margin kanvas, dan sematan emblem identitas form.
        </p>
      </div>

      {/* 1. Toggle Sematkan Logo Google Form */}
      <div className="flex items-center justify-between p-3 rounded bg-muted/40 border border-border">
        <div className="space-y-0.5 pr-4">
          <div className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-forms inline-block"></span>
            Sematkan Lambang Resmi Google Form
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Menambahkan emblem ungu di tengah QR dengan zona aman putih (safe halo) anti-pecah.
          </p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer select-none">
          <input
            type="checkbox"
            checked={config.sematkanLogo}
            onChange={(e) => {
              const aktif = e.target.checked;
              // Jika logo aktif, secara otomatis tingkatkan error correction ke H
              onChangeConfig({
                sematkanLogo: aktif,
                tingkatKoreksi: aktif ? 'H' : config.tingkatKoreksi,
              });
            }}
            className="sr-only peer"
          />
          <div className="w-9 h-5 bg-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-accent"></div>
        </label>
      </div>

      {/* 2. Pemilihan Tingkat Koreksi Kesalahan Reed-Solomon */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-accent" />
            Tingkat Koreksi Kesalahan (Reed-Solomon)
          </label>
          {config.sematkanLogo && (
            <span className="text-[10px] text-success font-medium flex items-center gap-1">
              ✓ Terkunci di Level H (Aman untuk Logo)
            </span>
          )}
        </div>
        <div className="grid grid-cols-4 gap-1.5 p-1 bg-muted/60 border border-border rounded">
          {tingkatKoreksiList.map((item) => {
            const isPilihan = config.tingkatKoreksi === item.level;
            return (
              <button
                key={item.level}
                type="button"
                disabled={config.sematkanLogo && item.level !== 'H'}
                onClick={() => onChangeConfig({ tingkatKoreksi: item.level })}
                className={`py-1.5 px-2 text-xs font-mono font-medium rounded transition-all text-center ${
                  isPilihan
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                } ${config.sematkanLogo && item.level !== 'H' ? 'opacity-40 cursor-not-allowed' : ''}`}
                title={item.desc}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Pemilihan Warna Modul & Background */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
          <Palette className="w-3.5 h-3.5 text-accent" />
          Warna Titik Matriks QR
        </label>
        <div className="flex flex-wrap items-center gap-2">
          {PALET_WARNA_PRESET.map((p) => {
            const isDipilih = config.warnaMatriks.toLowerCase() === p.hex.toLowerCase();
            return (
              <button
                key={p.hex}
                type="button"
                onClick={() => onChangeConfig({ warnaMatriks: p.hex })}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded border text-xs transition-all ${
                  isDipilih
                    ? 'border-accent bg-accent/5 font-medium'
                    : 'border-border bg-card hover:bg-muted/40 text-muted-foreground'
                }`}
              >
                <span
                  className="w-3 h-3 rounded-full border border-black/10 shadow-xs"
                  style={{ backgroundColor: p.hex }}
                ></span>
                <span>{p.nama}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Pengaturan Quiet Zone (Margin Modul) & Target DPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 border-t border-border/60">
        <div className="space-y-1">
          <div className="flex justify-between items-center text-xs">
            <span className="text-foreground font-medium flex items-center gap-1">
              <Layers className="w-3 h-3 text-accent" />
              Quiet Zone (Margin)
            </span>
            <span className="font-mono text-muted-foreground">{config.marginModul} Modul</span>
          </div>
          <input
            type="range"
            min={1}
            max={6}
            step={1}
            value={config.marginModul}
            onChange={(e) => onChangeConfig({ marginModul: parseInt(e.target.value, 10) })}
            className="w-full accent-accent h-1.5 bg-muted rounded cursor-pointer"
          />
        </div>

        <div className="space-y-1">
          <div className="flex justify-between items-center text-xs">
            <span className="text-foreground font-medium flex items-center gap-1">
              <Info className="w-3 h-3 text-accent" />
              Kerapatan Resolusi Cetak
            </span>
            <span className="font-mono text-muted-foreground">{config.dpiTarget} DPI</span>
          </div>
          <div className="flex rounded border border-border bg-muted/40 p-0.5">
            {[
              { dpi: 150, label: '150 DPI (Layar)' },
              { dpi: 300, label: '300 DPI (Cetak)' },
            ].map((d) => (
              <button
                key={d.dpi}
                type="button"
                onClick={() => onChangeConfig({ dpiTarget: d.dpi })}
                className={`flex-1 py-1 text-[11px] font-mono rounded transition-colors ${
                  config.dpiTarget === d.dpi
                    ? 'bg-card text-foreground font-semibold shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
