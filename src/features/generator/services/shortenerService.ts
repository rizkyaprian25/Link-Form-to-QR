/**
 * FormQR Studio - Layanan Pemendek Tautan (URL Shortener Engine)
 * Mengelola pembuatan kode pendek unik, validasi alias kustom,
 * pembentukan URL publik, serta resolusi target redirect (Neon DB + localStorage).
 */

import { REGEX_CUSTOM_SLUG } from '../../../contracts/validation';
import { cariUrlDariShortCodeNeon } from './neonClient';

// Kunci penyimpanan peta tautan pendek di localStorage peramban
const KUNCI_STORAGE_SHORT_LINKS = 'formqr_short_links_map';

// Karakter aman tanpa ambigu (menghindari 0, O, I, l agar tidak membingungkan saat dibaca)
const ALFABET_ACAK = '23456789abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ';

/**
 * Membuat kode pendek acak sepanjang n karakter (default 6 karakter)
 */
export function buatShortCodeAcak(panjang: number = 6): string {
  let hasil = '';
  const cryptoObj = typeof window !== 'undefined' ? window.crypto : null;

  if (cryptoObj && cryptoObj.getRandomValues) {
    const bytes = new Uint8Array(panjang);
    cryptoObj.getRandomValues(bytes);
    for (let i = 0; i < panjang; i++) {
      hasil += ALFABET_ACAK[bytes[i] % ALFABET_ACAK.length];
    }
  } else {
    for (let i = 0; i < panjang; i++) {
      hasil += ALFABET_ACAK[Math.floor(Math.random() * ALFABET_ACAK.length)];
    }
  }
  return hasil;
}

/**
 * Memvalidasi format slug alias kustom yang diinputkan pengguna
 */
export function validasiCustomSlug(slug: string): { valid: boolean; pesanError?: string } {
  const bersih = slug.trim();
  if (!bersih) {
    return { valid: false, pesanError: 'Alias tautan pendek tidak boleh kosong.' };
  }
  if (bersih.length < 3) {
    return { valid: false, pesanError: 'Alias minimal 3 karakter.' };
  }
  if (bersih.length > 30) {
    return { valid: false, pesanError: 'Alias maksimal 30 karakter.' };
  }
  if (!REGEX_CUSTOM_SLUG.test(bersih)) {
    return {
      valid: false,
      pesanError: 'Alias hanya boleh memuat huruf, angka, tanda hubung (-), dan garis bawah (_).',
    };
  }
  return { valid: true };
}

/**
 * Membangun URL tautan pendek lengkap yang siap dibagikan ke siswa
 */
export function bangunUrlPendek(kode: string): string {
  if (typeof window === 'undefined') {
    return `https://rizkyaprian25.github.io/Link-Form-to-QR/?s=${kode}`;
  }
  const asal = window.location.origin;
  const path = window.location.pathname.replace(/\/+$/, '');
  return `${asal}${path}/?s=${encodeURIComponent(kode)}`;
}

/**
 * Mengambil peta seluruh tautan pendek dari localStorage
 */
export function ambilPetaShortLinksLokal(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(KUNCI_STORAGE_SHORT_LINKS);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch (err) {
    console.error('Gagal membaca peta short link lokal:', err);
    return {};
  }
}

/**
 * Menyimpan pasangan kode pendek dan URL tujuan ke localStorage
 */
export function simpanShortLinkLokal(kode: string, urlTujuan: string): void {
  if (typeof window === 'undefined') return;
  try {
    const map = ambilPetaShortLinksLokal();
    map[kode.toLowerCase()] = urlTujuan;
    map[kode] = urlTujuan;
    localStorage.setItem(KUNCI_STORAGE_SHORT_LINKS, JSON.stringify(map));
  } catch (err) {
    console.error('Gagal menyimpan short link lokal:', err);
  }
}

/**
 * Mencari target URL tujuan berdasarkan kode pendek:
 * 1. Periksa cache instan localStorage (< 2ms)
 * 2. Jika tidak ditemukan, cari di Neon PostgreSQL Database
 */
export async function cariTargetUrl(kode: string): Promise<string | null> {
  if (!kode) return null;
  const kodeBersih = kode.trim();

  // Langkah 1: Cek cache lokal peramban
  const lokalMap = ambilPetaShortLinksLokal();
  if (lokalMap[kodeBersih]) {
    return lokalMap[kodeBersih];
  }
  if (lokalMap[kodeBersih.toLowerCase()]) {
    return lokalMap[kodeBersih.toLowerCase()];
  }

  // Langkah 2: Cari di Neon PostgreSQL Database jika ada koneksi cloud
  try {
    const dariNeon = await cariUrlDariShortCodeNeon(kodeBersih);
    if (dariNeon) {
      // Simpan ke cache lokal agar pencarian berikutnya instan
      simpanShortLinkLokal(kodeBersih, dariNeon);
      return dariNeon;
    }
  } catch (err) {
    console.warn('Gagal mencari kode di Neon DB, menggunakan fallback lokal:', err);
  }

  return null;
}
