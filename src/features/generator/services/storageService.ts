/**
 * FormQR Studio - Layanan Sinkronisasi Database Neon PostgreSQL & Penyimpanan Lokal
 * Menerapkan pola Dual-Engine:
 * 1. Serverless API (/api/forms) jika tersedia (Local Dev & Vercel)
 * 2. Direct Browser Neon Client jika di Static Host (GitHub Pages) tanpa server backend!
 * 3. Offline Cache LocalStorage jika internet terputus.
 */

import { ItemRiwayatFormulir, KonfigurasiQR } from '../../../contracts/formqr';
import { SkemaDaftarRiwayat } from '../../../contracts/validation';
import { MOCK_RIWAYAT_AWAL } from '../../../mock/mockForms';
import {
  ambilConnectionStringNeon,
  ambilRiwayatLangsungNeon,
  simpanFormulirLangsungNeon,
  ubahPinLangsungNeon,
  hapusItemLangsungNeon,
  bersihkanSemuaLangsungNeon,
} from './neonClient';

const KUNCI_STORAGE = 'formqr_studio_history_v1';
const BATAS_MAKSIMAL_RIWAYAT = 50;

export type StatusDatabase = 'terhubung_neon' | 'mode_lokal' | 'sedang_sinkron';

/**
 * 1. Mengambil data dari localStorage untuk rendering instan (< 5ms)
 */
export function ambilDaftarRiwayatLokal(): ItemRiwayatFormulir[] {
  try {
    const dataMentah = localStorage.getItem(KUNCI_STORAGE);
    if (!dataMentah) {
      simpanDaftarRiwayatLokal(MOCK_RIWAYAT_AWAL);
      return MOCK_RIWAYAT_AWAL;
    }

    const parsed = JSON.parse(dataMentah);
    const validasi = SkemaDaftarRiwayat.safeParse(parsed);

    return validasi.success ? validasi.data : MOCK_RIWAYAT_AWAL;
  } catch (error) {
    console.error('Gagal membaca cache lokal:', error);
    return MOCK_RIWAYAT_AWAL;
  }
}

/**
 * Menyimpan data ke localStorage
 */
export function simpanDaftarRiwayatLokal(daftar: ItemRiwayatFormulir[]): void {
  try {
    localStorage.setItem(KUNCI_STORAGE, JSON.stringify(daftar));
  } catch (error) {
    console.error('Gagal menulis ke cache lokal:', error);
  }
}

/**
 * 2. Mengambil riwayat dari Neon DB (Mendukung /api/forms & Direct Browser di GitHub Pages)
 */
export async function sinkronkanDenganNeon(): Promise<{
  data: ItemRiwayatFormulir[];
  status: StatusDatabase;
  pesan?: string;
}> {
  // A. Coba jalur /api/forms (Serverless API atau Vite Dev Middleware)
  try {
    const res = await fetch('/api/forms');
    if (res.ok) {
      const json = await res.json();
      if (json.sukses && Array.isArray(json.data)) {
        simpanDaftarRiwayatLokal(json.data);
        return { data: json.data, status: 'terhubung_neon' };
      }
    }
  } catch {
    // Abaikan jika /api/forms tidak ada (seperti di GitHub Pages)
  }

  // B. Jalur Direct Browser Client (Bekerja 100% di GitHub Pages!)
  const connStr = ambilConnectionStringNeon();
  if (connStr && connStr.startsWith('postgres')) {
    try {
      const dataNeon = await ambilRiwayatLangsungNeon();
      if (Array.isArray(dataNeon)) {
        simpanDaftarRiwayatLokal(dataNeon);
        return { data: dataNeon, status: 'terhubung_neon' };
      }
    } catch (err: any) {
      console.warn('Gagal koneksi langsung ke Neon via browser:', err);
    }
  }

  // C. Fallback ke penyimpanan lokal peramban
  return {
    data: ambilDaftarRiwayatLokal(),
    status: 'mode_lokal',
    pesan: 'Berjalan di mode penyimpanan lokal peramban',
  };
}

/**
 * 3. Menambahkan atau memperbarui formulir (Disimpan ke LocalStorage + Neon DB)
 */
export async function catatFormulirBaru(
  config: KonfigurasiQR,
  labelKustom?: string,
  tagKustom?: string
): Promise<{ daftarDiperbarui: ItemRiwayatFormulir[]; tersimpanDiNeon: boolean }> {
  const riwayatSaatIni = ambilDaftarRiwayatLokal();
  const urlTervalidasi = config.urlTervalidasi || config.urlAsli;
  const labelFinal = labelKustom || config.labelFormulir || 'Formulir Google';
  const tagFinal = tagKustom || config.tagKategori || 'Umum';

  const indeksAda = riwayatSaatIni.findIndex((item) => item.urlTervalidasi === urlTervalidasi);
  let daftarBaru: ItemRiwayatFormulir[];

  if (indeksAda !== -1) {
    const itemAda = riwayatSaatIni[indeksAda];
    const itemDiperbarui: ItemRiwayatFormulir = {
      ...itemAda,
      label: labelFinal,
      terakhirDiakses: new Date().toISOString(),
      jumlahUnduhan: itemAda.jumlahUnduhan + 1,
      konfigurasi: { ...config, labelFormulir: labelFinal, tagKategori: tagFinal },
    };

    daftarBaru = [
      itemDiperbarui,
      ...riwayatSaatIni.slice(0, indeksAda),
      ...riwayatSaatIni.slice(indeksAda + 1),
    ];
  } else {
    const itemBaru: ItemRiwayatFormulir = {
      id: crypto.randomUUID ? crypto.randomUUID() : `form-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      label: labelFinal,
      urlTervalidasi,
      dibuatPada: new Date().toISOString(),
      terakhirDiakses: new Date().toISOString(),
      jumlahUnduhan: 1,
      isPinned: false,
      konfigurasi: { ...config, labelFormulir: labelFinal, tagKategori: tagFinal },
    };

    daftarBaru = [itemBaru, ...riwayatSaatIni];
  }

  if (daftarBaru.length > BATAS_MAKSIMAL_RIWAYAT) {
    const itemDipin = daftarBaru.filter((i) => i.isPinned);
    const itemBiasa = daftarBaru.filter((i) => !i.isPinned);
    const kuotaTersisa = BATAS_MAKSIMAL_RIWAYAT - itemDipin.length;
    daftarBaru = [...itemDipin, ...itemBiasa.slice(0, kuotaTersisa)];
  }

  simpanDaftarRiwayatLokal(daftarBaru);

  // Kirim ke Neon DB: Coba /api/forms terlebih dahulu, jika gagal coba direct client
  let tersimpanDiNeon = false;
  try {
    const res = await fetch('/api/forms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...config, labelFormulir: labelFinal, tagKategori: tagFinal }),
    });
    if (res.ok) {
      const json = await res.json();
      if (json.sukses && json.data) {
        tersimpanDiNeon = true;
      }
    } else {
      throw new Error('API forms not available');
    }
  } catch {
    // Coba direct browser client (untuk GitHub Pages)
    try {
      const hasilDirect = await simpanFormulirLangsungNeon({
        ...config,
        labelFormulir: labelFinal,
        tagKategori: tagFinal,
      });
      if (hasilDirect) {
        tersimpanDiNeon = true;
      }
    } catch (errDirect) {
      console.warn('Gagal simpan langsung ke Neon via browser:', errDirect);
    }
  }

  return { daftarDiperbarui: daftarBaru, tersimpanDiNeon };
}

/**
 * 4. Mengubah status pin / favorit formulir
 */
export async function togglePinRiwayat(id: string): Promise<ItemRiwayatFormulir[]> {
  const riwayat = ambilDaftarRiwayatLokal();
  let pinBaru = false;
  const diperbarui = riwayat.map((item) => {
    if (item.id === id) {
      pinBaru = !item.isPinned;
      return { ...item, isPinned: pinBaru };
    }
    return item;
  });

  simpanDaftarRiwayatLokal(diperbarui);

  let berhasilApi = false;
  try {
    const res = await fetch('/api/forms', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, isPinned: pinBaru }),
    });
    if (res.ok) {
      berhasilApi = true;
    }
  } catch {
    // API tidak tersedia (misal di GitHub Pages)
  }

  if (!berhasilApi) {
    await ubahPinLangsungNeon(id, pinBaru);
  }

  return diperbarui;
}

/**
 * 5. Menghapus satu formulir berdasarkan ID (dari LocalStorage dan Neon DB)
 */
export async function hapusItemRiwayat(id: string): Promise<ItemRiwayatFormulir[]> {
  const riwayat = ambilDaftarRiwayatLokal();
  const itemTarget = riwayat.find((item) => item.id === id);
  const diperbarui = riwayat.filter((item) => item.id !== id);
  simpanDaftarRiwayatLokal(diperbarui);

  let berhasilApi = false;
  try {
    const res = await fetch(`/api/forms?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      berhasilApi = true;
    }
  } catch {
    // API tidak tersedia (misal di GitHub Pages)
  }

  // Jika di GitHub Pages (res.status == 404 atau API tidak aktif), eksekusi penghapusan langsung ke Neon!
  if (!berhasilApi) {
    await hapusItemLangsungNeon(id, itemTarget?.urlTervalidasi);
  }

  return diperbarui;
}

/**
 * 6. Mengosongkan seluruh riwayat (dari LocalStorage dan Neon DB)
 */
export async function bersihkanSemuaRiwayat(): Promise<ItemRiwayatFormulir[]> {
  localStorage.removeItem(KUNCI_STORAGE);

  let berhasilApi = false;
  try {
    const res = await fetch('/api/forms?hapusSemua=true', {
      method: 'DELETE',
    });
    if (res.ok) {
      berhasilApi = true;
    }
  } catch {
    // API tidak tersedia
  }

  if (!berhasilApi) {
    await bersihkanSemuaLangsungNeon();
  }

  return [];
}
