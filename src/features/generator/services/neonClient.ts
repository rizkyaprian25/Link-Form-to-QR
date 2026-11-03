/**
 * FormQR Studio - Klien Neon Database Langsung di Peramban (Direct Browser Client)
 * Memungkinkan aplikasi web statis (seperti GitHub Pages) untuk terhubung langsung ke Neon PostgreSQL
 * tanpa memerlukan server backend perantara (Zero-Backend Cloud Sync).
 */

import { neon } from '@neondatabase/serverless';
import { ItemRiwayatFormulir, KonfigurasiQR } from '../../../contracts/formqr';

const KUNCI_STORAGE_NEON_URL = 'formqr_neon_db_url';

// Default fallback connection string jika disediakan saat build
const DEFAULT_NEON_URL =
  (import.meta as any).env?.VITE_NEON_DATABASE_URL ||
  'postgresql://neondb_owner:npg_xBOufe3s5nZV@ep-icy-block-ao4vn5hj-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

/**
 * Mengambil connection string aktif:
 * Prioritas 1: Dari penyimpanan lokal pengguna di browser ini
 * Prioritas 2: Dari konfigurasi default
 */
export function ambilConnectionStringNeon(): string {
  if (typeof window === 'undefined') return DEFAULT_NEON_URL;
  const disimpan = localStorage.getItem(KUNCI_STORAGE_NEON_URL);
  return (disimpan && disimpan.trim()) || DEFAULT_NEON_URL;
}

/**
 * Menyimpan connection string yang dimasukkan pengguna di peramban
 */
export function simpanConnectionStringNeon(url: string): void {
  if (typeof window === 'undefined') return;
  if (!url || !url.trim()) {
    localStorage.removeItem(KUNCI_STORAGE_NEON_URL);
  } else {
    localStorage.setItem(KUNCI_STORAGE_NEON_URL, url.trim());
  }
}

// Inisialisasi klien Neon di peramban
function dapatkanSql() {
  const connStr = ambilConnectionStringNeon();
  if (!connStr || !connStr.startsWith('postgres')) {
    return null;
  }
  try {
    return neon(connStr);
  } catch (err) {
    console.error('Gagal menginisialisasi klien Neon di browser:', err);
    return null;
  }
}

function petakanBaris(row: any): ItemRiwayatFormulir {
  return {
    id: row.id,
    label: row.label,
    urlTervalidasi: row.url_validated,
    dibuatPada: new Date(row.created_at).toISOString(),
    terakhirDiakses: new Date(row.last_accessed).toISOString(),
    jumlahUnduhan: Number(row.download_count) || 0,
    isPinned: Boolean(row.is_pinned),
    konfigurasi: {
      urlAsli: row.url_original,
      urlTervalidasi: row.url_validated,
      labelFormulir: row.label,
      tagKategori: row.tag_category || 'Umum',
      warnaMatriks: row.matrix_color || '#18181B',
      warnaLatar: row.bg_color || '#FFFFFF',
      marginModul: Number(row.margin_modules) || 4,
      tingkatKoreksi: row.error_correction || 'H',
      gayaModul: row.gaya_modul || 'sharp',
      sematkanLogo: Boolean(row.has_logo),
      rasioLogo: Number(row.ratio_logo) || 0.18,
      dpiTarget: Number(row.target_dpi) || 300,
    },
  };
}

/**
 * Ambil riwayat langsung dari Neon DB via browser
 */
export async function ambilRiwayatLangsungNeon(): Promise<ItemRiwayatFormulir[]> {
  const sql = dapatkanSql();
  if (!sql) return [];

  const rows = await sql`
    SELECT * FROM form_qrs 
    ORDER BY is_pinned DESC, created_at DESC 
    LIMIT 100;
  `;
  return rows.map(petakanBaris);
}

/**
 * Simpan / update formulir langsung ke Neon DB via browser
 */
export async function simpanFormulirLangsungNeon(config: KonfigurasiQR): Promise<ItemRiwayatFormulir | null> {
  const sql = dapatkanSql();
  if (!sql) return null;

  const urlAsli = config.urlAsli;
  const urlTervalidasi = config.urlTervalidasi || config.urlAsli;
  const label = config.labelFormulir || 'Formulir Google';
  const tag = config.tagKategori || 'Umum';

  const rows = await sql`
    INSERT INTO form_qrs (
      label, url_original, url_validated, tag_category,
      matrix_color, bg_color, margin_modules, error_correction,
      gaya_modul, has_logo, ratio_logo, target_dpi, download_count, last_accessed
    ) VALUES (
      ${label}, ${urlAsli}, ${urlTervalidasi}, ${tag},
      ${config.warnaMatriks}, ${config.warnaLatar}, ${config.marginModul}, ${config.tingkatKoreksi},
      ${config.gayaModul}, ${config.sematkanLogo}, ${config.rasioLogo}, ${config.dpiTarget}, 1, CURRENT_TIMESTAMP
    )
    ON CONFLICT (url_validated) DO UPDATE SET
      label = EXCLUDED.label,
      tag_category = EXCLUDED.tag_category,
      matrix_color = EXCLUDED.matrix_color,
      bg_color = EXCLUDED.bg_color,
      margin_modules = EXCLUDED.margin_modules,
      error_correction = EXCLUDED.error_correction,
      has_logo = EXCLUDED.has_logo,
      download_count = form_qrs.download_count + 1,
      last_accessed = CURRENT_TIMESTAMP
    RETURNING *;
  `;

  return petakanBaris(rows[0]);
}

/**
 * Ubah pin langsung ke Neon via browser
 */
export async function ubahPinLangsungNeon(id: string, isPinned: boolean): Promise<boolean> {
  const sql = dapatkanSql();
  if (!sql) return false;
  try {
    await sql`UPDATE form_qrs SET is_pinned = ${isPinned} WHERE id::text = ${id};`;
    return true;
  } catch (err) {
    console.error('Gagal mengubah pin di Neon:', err);
    return false;
  }
}

/**
 * Hapus langsung dari Neon via browser
 */
export async function hapusItemLangsungNeon(id: string, urlTervalidasi?: string): Promise<boolean> {
  const sql = dapatkanSql();
  if (!sql) return false;
  try {
    if (urlTervalidasi) {
      await sql`DELETE FROM form_qrs WHERE id::text = ${id} OR url_validated = ${urlTervalidasi};`;
    } else {
      await sql`DELETE FROM form_qrs WHERE id::text = ${id};`;
    }
    return true;
  } catch (err) {
    console.error('Gagal menghapus dari Neon:', err);
    return false;
  }
}

/**
 * Bersihkan semua langsung dari Neon via browser
 */
export async function bersihkanSemuaLangsungNeon(): Promise<boolean> {
  const sql = dapatkanSql();
  if (!sql) return false;
  try {
    await sql`TRUNCATE TABLE form_qrs;`;
    return true;
  } catch (err) {
    console.error('Gagal truncate tabel Neon:', err);
    return false;
  }
}
