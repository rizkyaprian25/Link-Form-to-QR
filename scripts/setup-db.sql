-- ==============================================================================
-- FormQR Studio - Skema Tabel Neon PostgreSQL (scripts/setup-db.sql)
-- Jalankan kueri ini di SQL Editor Neon Console (https://console.neon.tech)
-- atau biarkan aplikasi menginisialisasinya secara otomatis via serverless API.
-- ==============================================================================

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

-- Indeks performa untuk mempercepat pengurutan riwayat dan pencarian URL
CREATE INDEX IF NOT EXISTS idx_form_qrs_created_at ON form_qrs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_form_qrs_url ON form_qrs(url_validated);
CREATE INDEX IF NOT EXISTS idx_form_qrs_pinned ON form_qrs(is_pinned DESC);
