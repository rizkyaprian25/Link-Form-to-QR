/**
 * FormQR Studio - Smoke Test Otomatis (Quality Gate)
 * Menguji fungsionalitas kritis: parsing URL, auto-koreksi /edit, pembersih parameter Google,
 * mesin shortener (slug acak & kustom), pertahanan keamanan, dan generasi SVG QR.
 */

import { prosesUrlGoogleForm, bersihkanParameterGoogle } from '../src/features/generator/services/urlParser';
import { buatQrCodeSvg } from '../src/features/generator/services/qrEngine';
import {
  buatShortCodeAcak,
  validasiCustomSlug,
  bangunUrlPendek,
} from '../src/features/generator/services/shortenerService';
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

  // --- Uji 3: Pembersih Parameter Sampah Google Form & Google Drive (Kompatibilitas NETRI Exam) ---
  const formWithTracking = 'https://forms.gle/xK8y9Q2pM4wZ7L1eA?usp=sf_link';
  const cleanForm = bersihkanParameterGoogle(formWithTracking);
  assert(cleanForm === 'https://forms.gle/xK8y9Q2pM4wZ7L1eA', 'Membersihkan parameter ?usp=sf_link dari forms.gle');

  const driveSharing = 'https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvB/view?usp=sharing';
  const cleanDrive = bersihkanParameterGoogle(driveSharing);
  assert(cleanDrive === 'https://drive.google.com/open?id=1BxiMVs0XRA5nFMdKvB', 'Mengonversi file Google Drive sharing menjadi format kanonikal open?id=');

  // --- Uji 4: Mesin Pemendek Tautan (Shortener Engine) ---
  const kodeAcak = buatShortCodeAcak(6);
  assert(kodeAcak.length === 6, 'Menghasilkan short code acak tepat 6 karakter');
  assert(/^[a-zA-Z0-9]+$/.test(kodeAcak), 'Short code acak hanya memuat karakter alphanumeric yang aman');

  const valSlugOk = validasiCustomSlug('ujian-ipa9');
  assert(valSlugOk.valid === true, 'Menerima slug kustom yang valid (ujian-ipa9)');

  const valSlugPendek = validasiCustomSlug('ab');
  assert(valSlugPendek.valid === false, 'Menolak slug kustom yang terlalu pendek (< 3 karakter)');

  const valSlugSpasi = validasiCustomSlug('ujian ipa');
  assert(valSlugSpasi.valid === false, 'Menolak slug kustom dengan karakter terlarang (spasi)');

  const urlPendek = bangunUrlPendek('k7x2p9');
  assert(urlPendek.includes('?s=k7x2p9'), 'Membangun tautan pendek dengan parameter query ?s=k7x2p9');

  // --- Uji 5: Pertahanan Keamanan Injeksi Protokol (XSS & Protocol Hijacking) ---
  const resMalicious = prosesUrlGoogleForm('javascript:alert(1)');
  assert(resMalicious.status === 'invalid_syntax', 'Menolak skema javascript: sebagai invalid_syntax');
  assert(resMalicious.dapatDiekspor === false, 'Tautan berbahaya diblokir dari proses ekspor');

  // --- Uji 6: Validasi Skema Runtime Zod dengan Field Shortener Baru ---
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
    modeSumberQR: 'short_link',
    kodePendek: 'ai2026',
  };
  const validasiZod = SkemaKonfigurasiQR.safeParse(configUji);
  assert(validasiZod.success === true, 'Konfigurasi QR lolos validasi skema runtime Zod dengan field shortener');

  // --- Uji 7: Generasi SVG QR Code dengan Lambang Google Form ---
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
