import { useState, useEffect, useRef, useTransition } from 'react';
import { AppShell } from './components/AppShell';
import { InputSection } from './features/generator/components/InputSection';
import { CustomizerPanel } from './features/generator/components/CustomizerPanel';
import { PreviewCanvas } from './features/generator/components/PreviewCanvas';
import { ExportSuite } from './features/generator/components/ExportSuite';
import { HistoryShelf } from './features/generator/components/HistoryShelf';
import { PrintFlyerSheet } from './features/generator/components/PrintFlyerSheet';
import { DatabaseModal } from './components/DatabaseModal';
import { KonfigurasiQR, ItemRiwayatFormulir, PresetTemplatForm } from './contracts/formqr';
import { prosesUrlGoogleForm } from './features/generator/services/urlParser';
import { buatQrCodeSvg } from './features/generator/services/qrEngine';
import {
  ambilDaftarRiwayatLokal,
  sinkronkanDenganNeon,
  catatFormulirBaru,
  togglePinRiwayat,
  hapusItemRiwayat,
  bersihkanSemuaRiwayat,
  StatusDatabase,
} from './features/generator/services/storageService';

// Konfigurasi default studio
const KONFIGURASI_AWAL: KonfigurasiQR = {
  urlAsli: 'https://forms.gle/xK8y9Q2pM4wZ7L1eA',
  urlTervalidasi: 'https://forms.gle/xK8y9Q2pM4wZ7L1eA',
  labelFormulir: 'Presensi Seminar AI & Cloud 2026',
  tagKategori: 'Presensi',
  warnaMatriks: '#18181B',
  warnaLatar: '#FFFFFF',
  marginModul: 4,
  tingkatKoreksi: 'H',
  gayaModul: 'sharp',
  sematkanLogo: true,
  rasioLogo: 0.18,
  dpiTarget: 300,
};

/**
 * Komponen Induk Aplikasi FormQR Studio
 * Mengatur orkestrasi partisi state (URL, Konfigurasi, Matriks SVG, dan Penyimpanan Neon DB / Lokal).
 */
export function App() {
  const [urlInput, setUrlInput] = useState<string>(KONFIGURASI_AWAL.urlAsli);
  const [config, setConfig] = useState<KonfigurasiQR>(KONFIGURASI_AWAL);
  const [svgContent, setSvgContent] = useState<string>('');
  const [daftarRiwayat, setDaftarRiwayat] = useState<ItemRiwayatFormulir[]>([]);
  const [statusDatabase, setStatusDatabase] = useState<StatusDatabase>('sedang_sinkron');
  const [modeCetakTerbuka, setModeCetakTerbuka] = useState<boolean>(false);
  const [infoDatabaseTerbuka, setInfoDatabaseTerbuka] = useState<boolean>(false);
  const [, startTransition] = useTransition();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // 1. Evaluasi & normalisasi URL saat masukan berubah
  const hasilValidasi = prosesUrlGoogleForm(urlInput);

  // 2. Muat data awal dari cache lokal lalu sinkronkan dengan Neon DB
  useEffect(() => {
    // Tampilkan cache lokal seketika (< 5ms)
    const lokal = ambilDaftarRiwayatLokal();
    setDaftarRiwayat(lokal);

    // Sinkronisasi dengan database Neon secara asinkron
    sinkronkanDenganNeon().then((res) => {
      setDaftarRiwayat(res.data);
      setStatusDatabase(res.status);
    });
  }, []);

  // 3. Sinkronisasi URL hasil normalisasi ke konfigurasi aktif
  useEffect(() => {
    if (hasilValidasi.dapatDiekspor) {
      setConfig((prev) => ({
        ...prev,
        urlAsli: urlInput,
        urlTervalidasi: hasilValidasi.urlBersih,
      }));
    }
  }, [urlInput, hasilValidasi.dapatDiekspor, hasilValidasi.urlBersih]);

  // 4. Render ulang matriks SVG secara reaktif saat konfigurasi berubah
  useEffect(() => {
    if (hasilValidasi.dapatDiekspor) {
      buatQrCodeSvg(config)
        .then((svg) => {
          startTransition(() => {
            setSvgContent(svg);
          });
        })
        .catch((err) => {
          console.error('Gagal membuat SVG QR Code:', err);
        });
    } else {
      setSvgContent('');
    }
  }, [config, hasilValidasi.dapatDiekspor]);

  // Handler perubahan konfigurasi parsial
  const handleChangeConfig = (partial: Partial<KonfigurasiQR>) => {
    setConfig((prev) => ({ ...prev, ...partial }));
  };

  // Handler pemilihan preset templat
  const handlePilihPreset = (preset: PresetTemplatForm) => {
    setConfig((prev) => ({
      ...prev,
      labelFormulir: preset.judul,
      tagKategori: preset.tag,
      tingkatKoreksi: prev.sematkanLogo ? 'H' : preset.saranKoreksi,
      marginModul: preset.saranMargin,
    }));
  };

  // Handler pemuatan riwayat ke editor studio
  const handlePilihRiwayat = (item: ItemRiwayatFormulir) => {
    setUrlInput(item.urlTervalidasi);
    setConfig(item.konfigurasi);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handler pencatatan saat ekspor sukses (Simpan ke Neon DB & LocalStorage)
  const handleEksporSukses = async () => {
    const hasil = await catatFormulirBaru(config);
    setDaftarRiwayat(hasil.daftarDiperbarui);
    if (hasil.tersimpanDiNeon) {
      setStatusDatabase('terhubung_neon');
    }
  };

  // Handler periksa ulang koneksi Neon DB
  const handleCekUlangDatabase = async () => {
    setStatusDatabase('sedang_sinkron');
    const res = await sinkronkanDenganNeon();
    setDaftarRiwayat(res.data);
    setStatusDatabase(res.status);
  };

  return (
    <AppShell
      totalTersimpan={daftarRiwayat.length}
      statusDatabase={statusDatabase}
      onBukaInfoDatabase={() => setInfoDatabaseTerbuka(true)}
    >
      {/* Workspace Asimetris 2-Kolom (Gaya Swiss Studio) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Kolom Kiri: Generator Console & Customizer */}
        <div className="lg:col-span-7 space-y-6">
          <InputSection
            urlInput={urlInput}
            onUrlChange={setUrlInput}
            hasilValidasi={hasilValidasi}
            labelForm={config.labelFormulir}
            onLabelChange={(val) => handleChangeConfig({ labelFormulir: val })}
            tagAktif={config.tagKategori}
            onPilihPreset={handlePilihPreset}
          />

          <CustomizerPanel config={config} onChangeConfig={handleChangeConfig} />
        </div>

        {/* Kolom Kanan: Proofing Staging Canvas & Export Suite */}
        <div className="lg:col-span-5 space-y-6 sticky top-20">
          <PreviewCanvas
            config={config}
            svgContent={svgContent}
            isReady={hasilValidasi.dapatDiekspor}
            canvasRef={canvasRef}
          />

          <ExportSuite
            config={config}
            svgContent={svgContent}
            isReady={hasilValidasi.dapatDiekspor}
            canvasRef={canvasRef}
            onEksporSukses={handleEksporSukses}
            onBukaModeCetak={() => setModeCetakTerbuka(true)}
          />
        </div>
      </div>

      {/* Rak Bawah: Riwayat Formulir Tersimpan */}
      <HistoryShelf
        daftarRiwayat={daftarRiwayat}
        onPilihRiwayat={handlePilihRiwayat}
        onTogglePin={async (id) => {
          const res = await togglePinRiwayat(id);
          setDaftarRiwayat(res);
        }}
        onHapusItem={async (id) => {
          const res = await hapusItemRiwayat(id);
          setDaftarRiwayat(res);
        }}
        onBersihkanSemua={async () => {
          const res = await bersihkanSemuaRiwayat();
          setDaftarRiwayat(res);
        }}
      />

      {/* Modal Lembar Cetak Flyer Meja */}
      {modeCetakTerbuka && (
        <PrintFlyerSheet
          config={config}
          svgContent={svgContent}
          onTutup={() => setModeCetakTerbuka(false)}
        />
      )}

      {/* Modal Informasi Status Neon Database */}
      {infoDatabaseTerbuka && (
        <DatabaseModal
          statusDatabase={statusDatabase}
          onTutup={() => setInfoDatabaseTerbuka(false)}
          onCekUlang={handleCekUlangDatabase}
        />
      )}
    </AppShell>
  );
}
export default App;
