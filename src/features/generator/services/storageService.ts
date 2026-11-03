/**
 * FormQR Studio - Layanan Sinkronisasi Database Neon PostgreSQL & Penyimpanan Lokal
 * Menerapkan pola Offline-First & Realtime Cloud Sync:
 * Data dimuat seketika dari cache lokal dan disinkronkan secara mulus ke database Neon PostgreSQL.
 */

import { ItemRiwayatFormulir, KonfigurasiQR } from '../../../contracts/formqr';
import { SkemaDaftarRiwayat } from '../../../contracts/validation';
import { MOCK_RIWAYAT_AWAL } from '../../../mock/mockForms';

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
 * 2. Mengambil riwayat dari Neon DB melalui endpoint /api/forms
 */
export async function sinkronkanDenganNeon(): Promise<{
  data: ItemRiwayatFormulir[];
  status: StatusDatabase;
  pesan?: string;
}> {
  try {
    const res = await fetch('/api/forms');
    if (!res.ok) {
      return {
        data: ambilDaftarRiwayatLokal(),
        status: 'mode_lokal',
        pesan: 'Database Neon belum aktif atau belum dikonfigurasi di .env',
      };
    }

    const json = await res.json();
    if (json.sukses && Array.isArray(json.data)) {
      // Simpan salinan ke cache lokal agar tetap bisa diakses saat offline
      simpanDaftarRiwayatLokal(json.data);
      return {
        data: json.data,
        status: 'terhubung_neon',
      };
    }

    return {
      data: ambilDaftarRiwayatLokal(),
      status: 'mode_lokal',
      pesan: json.pesan || 'Koneksi ke Neon tidak berhasil',
    };
  } catch (error) {
    console.warn('Gagal menghubungi /api/forms, beralih ke mode lokal:', error);
    return {
      data: ambilDaftarRiwayatLokal(),
      status: 'mode_lokal',
      pesan: 'Mode offline: data disimpan di memori peramban',
    };
  }
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

  // Pangkas entri berlebih jika melebihi kuota 50
  if (daftarBaru.length > BATAS_MAKSIMAL_RIWAYAT) {
    const itemDipin = daftarBaru.filter((i) => i.isPinned);
    const itemBiasa = daftarBaru.filter((i) => !i.isPinned);
    const kuotaTersisa = BATAS_MAKSIMAL_RIWAYAT - itemDipin.length;
    daftarBaru = [...itemDipin, ...itemBiasa.slice(0, kuotaTersisa)];
  }

  simpanDaftarRiwayatLokal(daftarBaru);

  // Kirim secara asinkron ke Neon DB
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
    }
  } catch (err) {
    console.warn('Gagal sinkronisasi POST ke Neon DB:', err);
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

  // Kirim perubahan ke Neon DB
  fetch('/api/forms', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, isPinned: pinBaru }),
  }).catch((err) => console.warn('Gagal patch pin ke Neon:', err));

  return diperbarui;
}

/**
 * 5. Menghapus satu formulir berdasarkan ID
 */
export async function hapusItemRiwayat(id: string): Promise<ItemRiwayatFormulir[]> {
  const riwayat = ambilDaftarRiwayatLokal();
  const diperbarui = riwayat.filter((item) => item.id !== id);
  simpanDaftarRiwayatLokal(diperbarui);

  // Kirim penghapusan ke Neon DB
  fetch(`/api/forms?id=${encodeURIComponent(id)}`, {
    method: 'DELETE',
  }).catch((err) => console.warn('Gagal hapus item di Neon:', err));

  return diperbarui;
}

/**
 * 6. Mengosongkan seluruh riwayat
 */
export async function bersihkanSemuaRiwayat(): Promise<ItemRiwayatFormulir[]> {
  localStorage.removeItem(KUNCI_STORAGE);

  // Kirim pembersihan ke Neon DB
  fetch('/api/forms?hapusSemua=true', {
    method: 'DELETE',
  }).catch((err) => console.warn('Gagal truncate tabel Neon:', err));

  return [];
}
