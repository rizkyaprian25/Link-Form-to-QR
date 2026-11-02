/**
 * FormQR Studio - Single Source of Truth (SSOT) Data Contracts
 * Seluruh tipe data dan antarmuka model dikunci di sini untuk menjamin konsistensi
 * antara modul parsing URL, mesin rendering QR matriks, dan penyimpanan riwayat lokal.
 */

// Tingkat koreksi kesalahan Reed-Solomon untuk algoritma QR Code
export type TingkatKoreksiError = 'L' | 'M' | 'Q' | 'H';

// Variasi bentuk modul matriks QR
export type GayaModulQR = 'sharp' | 'rounded' | 'dots' | 'smooth';

// Format ekspor yang didukung aplikasi
export type FormatEkspor = 'svg' | 'png-1024' | 'png-2048' | 'print-tent' | 'print-flyer';

// Status validasi tautan URL Google Form
export type StatusValidasiUrl = 
  | 'idle'               // Belum ada masukan URL
  | 'valid_short'        // Domain forms.gle yang valid
  | 'valid_full'         // Domain docs.google.com/forms yang valid (/viewform)
  | 'auto_corrected'     // Tautan edit (/edit) yang berhasil dialihkan otomatis ke /viewform
  | 'invalid_syntax'     // Format URL rusak / tidak memenuhi standar HTTP(S)
  | 'unsupported_domain';// URL web valid namun bukan Google Form

// Konfigurasi visual dan matematis untuk proses pembuatan QR Code
export interface KonfigurasiQR {
  urlAsli: string;
  urlTervalidasi: string;
  labelFormulir: string;
  tagKategori: string;
  warnaMatriks: string;      // Format Hex, contoh: #18181B
  warnaLatar: string;        // Format Hex, contoh: #FFFFFF
  marginModul: number;       // Quiet zone (rentang 1 sampai 6 modul)
  tingkatKoreksi: TingkatKoreksiError;
  gayaModul: GayaModulQR;
  sematkanLogo: boolean;
  rasioLogo: number;         // 0.15 hingga 0.22 dari lebar kanvas
  dpiTarget: number;         // Default: 300 DPI untuk kualitas cetak fisik
}

// Entitas riwayat formulir yang tersimpan secara lokal di peramban
export interface ItemRiwayatFormulir {
  id: string;                // Identifier unik UUID v4
  label: string;             // Judul deskriptif formulir
  urlTervalidasi: string;    // Tautan publik siap pindai
  dibuatPada: string;        // Timestamp ISO 8601 UTC
  terakhirDiakses: string;   // Timestamp ISO 8601 UTC
  konfigurasi: KonfigurasiQR;
  jumlahUnduhan: number;     // Metrik frekuensi ekspor lokal
  isPinned?: boolean;        // Penanda favorit agar tidak terhapus otomatis oleh LRU
}

// Hasil eksekusi evaluasi validator URL
export interface HasilValidasiUrl {
  status: StatusValidasiUrl;
  urlBersih: string;
  pesanHumanis: string;
  dapatDiekspor: boolean;
  formId?: string;           // ID formulir jika berhasil diekstraksi
}

// Preset templat penggunaan cepat untuk mempermudah panitia di lapangan
export interface PresetTemplatForm {
  id: string;
  judul: string;
  tag: string;
  deskripsi: string;
  saranKoreksi: TingkatKoreksiError;
  saranMargin: number;
}
