/**
 * FormQR Studio - Neon PostgreSQL Serverless Handler
 * Menghubungkan aplikasi ke database Neon PostgreSQL menggunakan kueri terparameterisasi aman (anti-SQL Injection).
 * Kompatibel dengan Vercel Serverless Functions dan Vite Dev Server Middleware.
 */

import { neon } from '@neondatabase/serverless';
import { ItemRiwayatFormulir, KonfigurasiQR } from '../contracts/formqr';

// Fungsi inisialisasi koneksi Neon DB
function ambilKlienNeon() {
  const databaseUrl = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;
  if (!databaseUrl) {
    return null;
  }
  return neon(databaseUrl);
}

// Inisialisasi skema tabel otomatis jika belum ada di database
let tabelSudahDiinisialisasi = false;
async function pastikanTabelSiap(sql: any) {
  if (tabelSudahDiinisialisasi) return;
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS form_qrs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        label VARCHAR(100) NOT NULL DEFAULT 'Formulir Google',
        url_original TEXT NOT NULL,
        url_validated TEXT NOT NULL UNIQUE,
        tag_category VARCHAR(50) DEFAULT 'Umum',
        matrix_color VARCHAR(10) DEFAULT '#18181B',
        bg_color VARCHAR(10) DEFAULT '#FFFFFF',
        margin_modules INTEGER DEFAULT 4,
        error_correction VARCHAR(5) DEFAULT 'H',
        gaya_modul VARCHAR(20) DEFAULT 'sharp',
        has_logo BOOLEAN DEFAULT TRUE,
        ratio_logo NUMERIC(4, 2) DEFAULT 0.18,
        target_dpi INTEGER DEFAULT 300,
        download_count INTEGER DEFAULT 0,
        is_pinned BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        last_accessed TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_form_qrs_created_at ON form_qrs(created_at DESC);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_form_qrs_url ON form_qrs(url_validated);`;
    tabelSudahDiinisialisasi = true;
  } catch (err) {
    console.error('Peringatan saat inisialisasi tabel Neon:', err);
  }
}

// Helper pemetaan baris PostgreSQL ke antarmuka ItemRiwayatFormulir
export function petakanBarisDb(row: any): ItemRiwayatFormulir {
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
 * 1. Mengambil seluruh riwayat formulir dari Neon DB
 */
export async function ambilRiwayatDariNeon(): Promise<{ sukses: boolean; data: ItemRiwayatFormulir[]; pesan?: string }> {
  const sql = ambilKlienNeon();
  if (!sql) {
    return { sukses: false, data: [], pesan: 'DATABASE_URL belum dikonfigurasi di file .env' };
  }

  await pastikanTabelSiap(sql);
  const rows = await sql`
    SELECT * FROM form_qrs 
    ORDER BY is_pinned DESC, created_at DESC 
    LIMIT 100;
  `;

  return {
    sukses: true,
    data: rows.map(petakanBarisDb),
  };
}

/**
 * 2. Menyimpan atau memperbarui formulir di Neon DB (Upsert)
 */
export async function simpanFormulirKeNeon(
  config: KonfigurasiQR
): Promise<{ sukses: boolean; data?: ItemRiwayatFormulir; pesan?: string }> {
  const sql = ambilKlienNeon();
  if (!sql) {
    return { sukses: false, pesan: 'DATABASE_URL belum dikonfigurasi di file .env' };
  }

  await pastikanTabelSiap(sql);

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

  return {
    sukses: true,
    data: petakanBarisDb(rows[0]),
  };
}

/**
 * 3. Mengubah status pin / favorit formulir di Neon DB
 */
export async function ubahPinFormulirNeon(
  id: string,
  isPinned: boolean
): Promise<{ sukses: boolean; pesan?: string }> {
  const sql = ambilKlienNeon();
  if (!sql) return { sukses: false, pesan: 'DATABASE_URL belum dikonfigurasi' };

  await sql`
    UPDATE form_qrs 
    SET is_pinned = ${isPinned} 
    WHERE id = ${id}::uuid;
  `;

  return { sukses: true };
}

/**
 * 4. Menghapus formulir dari Neon DB
 */
export async function hapusFormulirDariNeon(
  id: string
): Promise<{ sukses: boolean; pesan?: string }> {
  const sql = ambilKlienNeon();
  if (!sql) return { sukses: false, pesan: 'DATABASE_URL belum dikonfigurasi' };

  await sql`
    DELETE FROM form_qrs 
    WHERE id = ${id}::uuid;
  `;

  return { sukses: true };
}

/**
 * 5. Mengosongkan seluruh formulir di Neon DB
 */
export async function bersihkanSemuaFormulirNeon(): Promise<{ sukses: boolean; pesan?: string }> {
  const sql = ambilKlienNeon();
  if (!sql) return { sukses: false, pesan: 'DATABASE_URL belum dikonfigurasi' };

  await sql`TRUNCATE TABLE form_qrs;`;
  return { sukses: true };
}
