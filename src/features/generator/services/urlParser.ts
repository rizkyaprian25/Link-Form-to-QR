/**
 * FormQR Studio - Mesin Parser & Normalisasi URL Google Form
 * Memeriksa, membersihkan, dan mengonversi tautan Google Form menjadi tautan responden siap pakai (/viewform).
 */

import { HasilValidasiUrl } from '../../../contracts/formqr';
import { REGEX_GOOGLE_FORM_FULL, REGEX_GOOGLE_FORM_SHORT } from '../../../contracts/validation';

/**
 * Memvalidasi dan menormalisasi URL yang diinputkan pengguna.
 * Jika pengguna menempelkan link edit (/edit), sistem secara otomatis mengonversinya ke /viewform.
 */
export function prosesUrlGoogleForm(rawUrl: string): HasilValidasiUrl {
  const urlTrim = rawUrl.trim();

  // 1. Kondisi masukan kosong
  if (!urlTrim) {
    return {
      status: 'idle',
      urlBersih: '',
      pesanHumanis: 'Silakan tempelkan tautan Google Form Anda untuk memulai pembuatan QR Code.',
      dapatDiekspor: false,
    };
  }

  // 2. Cegah protokol berbahaya (Pertahanan Standar Keamanan Injeksi & XSS)
  if (!/^https?:\/\//i.test(urlTrim)) {
    return {
      status: 'invalid_syntax',
      urlBersih: '',
      pesanHumanis: 'Tautan harus diawali dengan protokol aman (https://). Protokol lain tidak diizinkan.',
      dapatDiekspor: false,
    };
  }

  try {
    const parsed = new URL(urlTrim);

    // 3. Evaluasi domain pendek forms.gle
    if (parsed.hostname.toLowerCase() === 'forms.gle') {
      const matchShort = urlTrim.match(REGEX_GOOGLE_FORM_SHORT);
      if (matchShort) {
        return {
          status: 'valid_short',
          urlBersih: urlTrim,
          pesanHumanis: '✓ Tautan forms.gle resmi terverifikasi dan siap dipindai.',
          dapatDiekspor: true,
          formId: matchShort[1],
        };
      }
    }

    // 4. Evaluasi domain lengkap docs.google.com/forms
    if (parsed.hostname.toLowerCase() === 'docs.google.com' && parsed.pathname.startsWith('/forms/')) {
      // Deteksi jika link berada dalam mode edit (/edit)
      if (/\/edit(\?.*)?$/i.test(parsed.pathname + parsed.search)) {
        // Otomatis normalisasi /edit menjadi /viewform
        const pathNormal = parsed.pathname.replace(/\/edit$/i, '/viewform');
        const urlNormal = `${parsed.protocol}//${parsed.host}${pathNormal}${parsed.search}`;

        return {
          status: 'auto_corrected',
          urlBersih: urlNormal,
          pesanHumanis: 'Tautan dialihkan otomatis dari mode edit pengelola ke mode pengisian publik (/viewform).',
          dapatDiekspor: true,
        };
      }

      const matchFull = urlTrim.match(REGEX_GOOGLE_FORM_FULL);
      if (matchFull) {
        return {
          status: 'valid_full',
          urlBersih: urlTrim,
          pesanHumanis: '✓ Tautan Google Form publik resmi terverifikasi.',
          dapatDiekspor: true,
          formId: matchFull[2],
        };
      }
    }

    // 5. Tautan umum (valid secara sintaks web, tetapi bukan domain resmi Google Form)
    return {
      status: 'unsupported_domain',
      urlBersih: urlTrim,
      pesanHumanis: 'Tautan valid, namun bukan domain resmi Google Form. QR tetap dapat dibuat untuk kebutuhan khusus Anda.',
      dapatDiekspor: true,
    };
  } catch {
    return {
      status: 'invalid_syntax',
      urlBersih: '',
      pesanHumanis: 'Format tautan rusak atau tidak dapat diuraikan. Periksa kembali karakter URL Anda.',
      dapatDiekspor: false,
    };
  }
}
