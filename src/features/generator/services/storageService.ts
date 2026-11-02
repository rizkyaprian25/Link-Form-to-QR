/**
 * FormQR Studio - Layanan Penyimpanan Lokal (Local Storage & LRU Retention)
 * Menyimpan data riwayat formulir di browser pengguna secara persisten tanpa mengirimkan data ke cloud.
 */

import { ItemRiwayatFormulir, KonfigurasiQR } from '../../../contracts/formqr';
import { SkemaDaftarRiwayat } from '../../../contracts/validation';
import { MOCK_RIWAYAT_AWAL } from '../../../mock/mockForms';

const KUNCI_STORAGE = 'formqr_studio_history_v1';
const BATAS_MAKSIMAL_RIWAYAT = 50;

/**
 * Mengambil daftar riwayat formulir dari localStorage.
 * Jika penyimpanan masih kosong, inisialisasi dengan data templat awal.
 */
export function ambilDaftarRiwayat(): ItemRiwayatFormulir[] {
  try {
    const dataMentah = localStorage.getItem(KUNCI_STORAGE);
    if (!dataMentah) {
      // Inisialisasi awal dengan mock data edukatif
      simpanDaftarRiwayat(MOCK_RIWAYAT_AWAL);
      return MOCK_RIWAYAT_AWAL;
    }

    const parsed = JSON.parse(dataMentah);
    const validasi = SkemaDaftarRiwayat.safeParse(parsed);

    if (validasi.success) {
      return validasi.data;
    } else {
      console.warn('Format data penyimpanan lokal tidak valid, mengembalikan fallback.');
      return MOCK_RIWAYAT_AWAL;
    }
  } catch (error) {
    console.error('Gagal membaca localStorage:', error);
    return MOCK_RIWAYAT_AWAL;
  }
}

/**
 * Menyimpan daftar riwayat ke localStorage.
 */
export function simpanDaftarRiwayat(daftar: ItemRiwayatFormulir[]): void {
  try {
    localStorage.setItem(KUNCI_STORAGE, JSON.stringify(daftar));
  } catch (error) {
    console.error('Gagal menulis ke localStorage:', error);
  }
}

/**
 * Menambahkan atau memperbarui entitas formulir ke dalam riwayat.
 * Menerapkan algoritma pembersihan LRU (Least Recently Used) saat melebihi batas 50 item.
 */
export function catatFormulirBaru(
  config: KonfigurasiQR,
  labelKustom?: string,
  tagKustom?: string
): ItemRiwayatFormulir[] {
  const riwayatSaatIni = ambilDaftarRiwayat();
  const urlTervalidasi = config.urlTervalidasi || config.urlAsli;
  const labelFinal = labelKustom || config.labelFormulir || 'Formulir Google';
  const tagFinal = tagKustom || config.tagKategori || 'Umum';

  // Periksa apakah URL ini sudah pernah dibuat sebelumnya
  const indeksAda = riwayatSaatIni.findIndex((item) => item.urlTervalidasi === urlTervalidasi);

  let daftarBaru: ItemRiwayatFormulir[];

  if (indeksAda !== -1) {
    // Perbarui entri yang sudah ada dan pindahkan ke posisi teratas
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
    // Buat entitas baru
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

  // Pangkas entri berlebih jika melewati batas maksimal (jangan hapus yang di-pin)
  if (daftarBaru.length > BATAS_MAKSIMAL_RIWAYAT) {
    const itemDipin = daftarBaru.filter((i) => i.isPinned);
    const itemBiasa = daftarBaru.filter((i) => !i.isPinned);
    const kuotaTersisa = BATAS_MAKSIMAL_RIWAYAT - itemDipin.length;
    daftarBaru = [...itemDipin, ...itemBiasa.slice(0, kuotaTersisa)];
  }

  simpanDaftarRiwayat(daftarBaru);
  return daftarBaru;
}

/**
 * Mengubah status pin / bintang pada entri riwayat.
 */
export function togglePinRiwayat(id: string): ItemRiwayatFormulir[] {
  const riwayat = ambilDaftarRiwayat();
  const diperbarui = riwayat.map((item) =>
    item.id === id ? { ...item, isPinned: !item.isPinned } : item
  );
  simpanDaftarRiwayat(diperbarui);
  return diperbarui;
}

/**
 * Menghapus satu entri riwayat berdasarkan ID.
 */
export function hapusItemRiwayat(id: string): ItemRiwayatFormulir[] {
  const riwayat = ambilDaftarRiwayat();
  const diperbarui = riwayat.filter((item) => item.id !== id);
  simpanDaftarRiwayat(diperbarui);
  return diperbarui;
}

/**
 * Mengosongkan seluruh riwayat lokal.
 */
export function bersihkanSemuaRiwayat(): ItemRiwayatFormulir[] {
  localStorage.removeItem(KUNCI_STORAGE);
  return [];
}
