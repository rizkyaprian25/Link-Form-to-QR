/**
 * FormQR Studio - Mesin Parser & Normalisasi URL Google Form
 * Memeriksa, membersihkan, dan mengonversi tautan Google Form menjadi tautan responden siap pakai (/viewform).
 */

import { HasilValidasiUrl } from '../../../contracts/formqr';
import { REGEX_GOOGLE_FORM_FULL, REGEX_GOOGLE_FORM_SHORT } from '../../../contracts/validation';

/**
 * Membersihkan parameter tracking sampah Google (seperti ?usp=sf_link, ?usp=sharing, ?usp=drivesdk)
 * dan mengonversi link Google Drive/Form ke format paling kanonikal dan ringkas.
 */
export function bersihkanParameterGoogle(rawUrl: string): string {
  const urlTrim = rawUrl.trim();
  if (!urlTrim) return '';

  try {
    const parsed = new URL(urlTrim);
    const host = parsed.hostname.toLowerCase();

    // 1. Google Forms forms.gle (hapus seluruh query params)
    if (host === 'forms.gle') {
      return `${parsed.protocol}//${parsed.host}${parsed.pathname.replace(/\/+$/, '')}`;
    }

    // 2. Google Forms docs.google.com
    if (host === 'docs.google.com' && parsed.pathname.includes('/forms/')) {
      let pathClean = parsed.pathname.replace(/\/+$/, '');
      if (pathClean.endsWith('/edit')) {
        pathClean = pathClean.replace(/\/edit$/i, '/viewform');
      }
      return `${parsed.protocol}//${parsed.host}${pathClean}`;
    }

    // 3. Google Drive (drive.google.com)
    if (host === 'drive.google.com') {
      // Pola /file/d/FILE_ID/... -> konversi ke open?id=FILE_ID
      const fileMatch = parsed.pathname.match(/\/file\/d\/([a-zA-Z0-9_-]+)/i);
      if (fileMatch) {
        return `https://drive.google.com/open?id=${fileMatch[1]}`;
      }
      // Jika sudah open?id=... hapus parameter selain id
      const idParam = parsed.searchParams.get('id');
      if (idParam) {
        return `https://drive.google.com/open?id=${idParam}`;
      }
    }

    // 4. URL Umum: Bersihkan parameter analitik umum
    const paramsHapus = ['usp', 'fbclid', 'gclid', 'utm_source', 'utm_medium', 'utm_campaign', 'ref'];
    paramsHapus.forEach((param) => parsed.searchParams.delete(param));
    
    const queryBersih = parsed.searchParams.toString();
    return `${parsed.protocol}//${parsed.host}${parsed.pathname}${queryBersih ? `?${queryBersih}` : ''}${parsed.hash}`;
  } catch {
    return urlTrim;
  }
}

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
      pesanHumanis: 'Silakan tempelkan tautan Google Form atau Drive Anda untuk memulai pembuatan QR Code.',
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
    const host = parsed.hostname.toLowerCase();

    // 3. Evaluasi domain pendek forms.gle
    if (host === 'forms.gle') {
      const matchShort = urlTrim.match(REGEX_GOOGLE_FORM_SHORT);
      if (matchShort) {
        return {
          status: 'valid_short',
          urlBersih: bersihkanParameterGoogle(urlTrim),
          pesanHumanis: '✓ Tautan forms.gle resmi terverifikasi dan siap dipindai.',
          dapatDiekspor: true,
          formId: matchShort[1],
        };
      }
    }

    // 4. Evaluasi domain lengkap docs.google.com/forms
    if (host === 'docs.google.com' && parsed.pathname.startsWith('/forms/')) {
      const urlNormal = bersihkanParameterGoogle(urlTrim);
      const isEdit = /\/edit(\?.*)?$/i.test(parsed.pathname + parsed.search);
      const matchFull = urlTrim.match(REGEX_GOOGLE_FORM_FULL);

      return {
        status: isEdit ? 'auto_corrected' : 'valid_full',
        urlBersih: urlNormal,
        pesanHumanis: isEdit
          ? 'Tautan dialihkan otomatis dari mode edit pengelola ke mode pengisian publik (/viewform).'
          : '✓ Tautan Google Form publik resmi terverifikasi.',
        dapatDiekspor: true,
        formId: matchFull ? matchFull[1] : undefined,
      };
    }

    // 5. Evaluasi Google Drive (drive.google.com)
    if (host === 'drive.google.com') {
      const urlDriveBersih = bersihkanParameterGoogle(urlTrim);
      return {
        status: 'valid_full',
        urlBersih: urlDriveBersih,
        pesanHumanis: '✓ Tautan Google Drive resmi terverifikasi dalam format kanonikal ringkas.',
        dapatDiekspor: true,
      };
    }

    // 6. Tautan umum (valid secara sintaks web, tetapi bukan domain resmi Google Form/Drive)
    return {
      status: 'unsupported_domain',
      urlBersih: bersihkanParameterGoogle(urlTrim),
      pesanHumanis: 'Tautan valid, namun bukan domain resmi Google Form/Drive. QR tetap dapat dibuat untuk kebutuhan khusus Anda.',
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
