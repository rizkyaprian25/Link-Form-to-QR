/**
 * FormQR Studio - Smoke Test Otomatis (Quality Gate)
 * Menguji fungsionalitas kritis: parsing URL, auto-koreksi /edit, pertahanan keamanan, dan generasi SVG QR.
 */

import { prosesUrlGoogleForm } from '../src/features/generator/services/urlParser';
import { buatQrCodeSvg } from '../src/features/generator/services/qrEngine';
import { KonfigurasiQR } from '../src/contracts/formqr';
import { SkemaKonfigurasiQR } from '../src/contracts/validation';

async function runSmokeTests() {
  console.log('🚀 Memulai FormQR Studio Smoke Test Suite...\n');
  let lulus = 0;
  let total = 0;

  function assert(kondisi: boolean, deskripsi: string) {
    total++;
    if (kondisi) {
      console.log(`  ✓ [LULUS] ${deskripsi}`);
      lulus++;
    } else {
      console.error(`  ✗ [GAGAL] ${deskripsi}`);
      process.exitCode = 1;
    }
  }

  // --- Uji 1: Parsing Tautan forms.gle ---
  const resShort = prosesUrlGoogleForm('https://forms.gle/xK8y9Q2pM4wZ7L1eA');
  assert(resShort.status === 'valid_short', 'Mendeteksi domain forms.gle dengan status valid_short');
  assert(resShort.dapatDiekspor === true, 'Tautan forms.gle dapat diekspor');
  assert(resShort.formId === 'xK8y9Q2pM4wZ7L1eA', 'Mengekstraksi ID formulir forms.gle dengan benar');

  // --- Uji 2: Auto-Koreksi Tautan Editor (/edit -> /viewform) ---
  const resEdit = prosesUrlGoogleForm('https://docs.google.com/forms/d/e/1FAIpQLSc919293/edit');
  assert(resEdit.status === 'auto_corrected', 'Mendeteksi tautan /edit dengan status auto_corrected');
  assert(resEdit.urlBersih.endsWith('/viewform'), 'Mengonversi akhiran /edit menjadi /viewform');
  assert(resEdit.dapatDiekspor === true, 'Tautan hasil koreksi dapat diekspor');

  // --- Uji 3: Pertahanan Keamanan Injeksi Protokol (XSS & Protocol Hijacking) ---
  const resMalicious = prosesUrlGoogleForm('javascript:alert(1)');
  assert(resMalicious.status === 'invalid_syntax', 'Menolak skema javascript: sebagai invalid_syntax');
  assert(resMalicious.dapatDiekspor === false, 'Tautan berbahaya diblokir dari proses ekspor');

  // --- Uji 4: Validasi Skema Runtime Zod ---
  const configUji: KonfigurasiQR = {
    urlAsli: 'https://forms.gle/xK8y9Q2pM4wZ7L1eA',
    urlTervalidasi: 'https://forms.gle/xK8y9Q2pM4wZ7L1eA',
    labelFormulir: 'Presensi Seminar Cloud & AI',
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
  const validasiZod = SkemaKonfigurasiQR.safeParse(configUji);
  assert(validasiZod.success === true, 'Konfigurasi QR lolos validasi skema runtime Zod');

  // --- Uji 5: Generasi SVG QR Code dengan Lambang Google Form ---
  const svgOutput = (await buatQrCodeSvg(configUji)).trim();
  assert(svgOutput.startsWith('<svg') && svgOutput.endsWith('</svg>'), 'Menghasilkan dokumen vektor SVG yang valid');
  assert(svgOutput.includes('#7248B9'), 'SVG menyertakan lambang resmi warna Google Form #7248B9');
  assert(svgOutput.includes('Google Forms Center Emblem'), 'SVG menyertakan elemen zona aman (safe halo)');

  console.log(`\n🎉 Hasil Uji: ${lulus}/${total} lulus (${Math.round((lulus / total) * 100)}%).`);
}

runSmokeTests().catch((err) => {
  console.error('Error saat menjalankan smoke test:', err);
  process.exit(1);
});
