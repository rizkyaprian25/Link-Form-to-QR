/**
 * FormQR Studio - Skema Validasi Runtime (Zod)
 * Memverifikasi batas integritas data (boundary validation) sebelum data diproses
 * oleh modul kanvas atau disimpan ke dalam IndexedDB/localStorage.
 */

import { z } from 'zod';

// Ekspresi reguler resmi untuk mengenali format URL Google Form
export const REGEX_GOOGLE_FORM_FULL = /^https?:\/\/(?:docs\.google\.com\/forms\/d\/(?:e\/)?([a-zA-Z0-9_-]+)\/(?:viewform|formResponse|edit)(?:\?.*)?)$/i;
export const REGEX_GOOGLE_FORM_SHORT = /^https?:\/\/(?:forms\.gle\/([a-zA-Z0-9_-]+))$/i;
export const REGEX_HEX_COLOR = /^#[0-9A-Fa-f]{6}$/;

// Skema validasi masukan konfigurasi QR
export const SkemaKonfigurasiQR = z.object({
  urlAsli: z
    .string()
    .trim()
    .min(1, { message: 'Tautan formulir tidak boleh kosong' })
    .url({ message: 'Harap masukkan format tautan web yang valid (https://...)' }),
  urlTervalidasi: z
    .string()
    .trim()
    .url({ message: 'Tautan hasil validasi tidak memenuhi format URL standar' }),
  labelFormulir: z
    .string()
    .trim()
    .min(1, { message: 'Label formulir minimal 1 karakter' })
    .max(80, { message: 'Label formulir maksimal 80 karakter' })
    .default('Formulir Tanpa Judul'),
  tagKategori: z
    .string()
    .trim()
    .max(25, { message: 'Tag kategori maksimal 25 karakter' })
    .default('Umum'),
  warnaMatriks: z
    .string()
    .regex(REGEX_HEX_COLOR, { message: 'Warna modul harus berupa kode HEX 6 digit (contoh: #18181B)' })
    .default('#18181B'),
  warnaLatar: z
    .string()
    .regex(REGEX_HEX_COLOR, { message: 'Warna latar harus berupa kode HEX 6 digit (contoh: #FFFFFF)' })
    .default('#FFFFFF'),
  marginModul: z
    .number()
    .int()
    .min(1, { message: 'Quiet zone minimal 1 modul' })
    .max(8, { message: 'Quiet zone maksimal 8 modul' })
    .default(4),
  tingkatKoreksi: z.enum(['L', 'M', 'Q', 'H']).default('H'),
  gayaModul: z.enum(['sharp', 'rounded', 'dots', 'smooth']).default('sharp'),
  sematkanLogo: z.boolean().default(true),
  rasioLogo: z.number().min(0.12).max(0.24).default(0.18),
  dpiTarget: z.number().int().min(72).max(600).default(300),
});

// Skema validasi entitas riwayat lokal untuk memverifikasi data saat deserialisasi storage
export const SkemaItemRiwayat = z.object({
  id: z.string().uuid(),
  label: z.string().min(1).max(100),
  urlTervalidasi: z.string().url(),
  dibuatPada: z.string().datetime(),
  terakhirDiakses: z.string().datetime(),
  konfigurasi: SkemaKonfigurasiQR,
  jumlahUnduhan: z.number().int().nonnegative(),
  isPinned: z.boolean().optional(),
});

export const SkemaDaftarRiwayat = z.array(SkemaItemRiwayat);
