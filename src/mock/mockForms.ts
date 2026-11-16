/**
 * FormQR Studio - Mock Data & Preset Templat
 * Menyediakan contoh data awal yang tervalidasi serta template siap pakai
 * untuk ulangan harian, ujian sekolah, kuis, presensi, survei, dan pendaftaran.
 */

import { ItemRiwayatFormulir, PresetTemplatForm } from '../contracts/formqr';

// Preset templat formulir populer untuk mempercepat kerja guru dan panitia
export const PRESET_TEMPLAT: PresetTemplatForm[] = [
  {
    id: 'preset-ulangan',
    judul: 'Ulangan Harian / Asesmen',
    tag: 'Ulangan',
    deskripsi: 'Khusus lembar soal ulangan atau asesmen formatif. Dilengkapi tingkat koreksi Level H agar cepat dipindai kamera siswa.',
    saranKoreksi: 'H',
    saranMargin: 4,
  },
  {
    id: 'preset-ujian',
    judul: 'Ujian Sekolah / PTS / PAS',
    tag: 'Ujian',
    deskripsi: 'Standar resmi untuk ujian semester atau ujian sekolah berbasis digital (CBT/Google Form).',
    saranKoreksi: 'H',
    saranMargin: 4,
  },
  {
    id: 'preset-kuis',
    judul: 'Kuis & Latihan Soal',
    tag: 'Kuis',
    deskripsi: 'Untuk kuis interaktif kelas atau latihan soal mandiri siswa.',
    saranKoreksi: 'Q',
    saranMargin: 4,
  },
  {
    id: 'preset-presensi',
    judul: 'Presensi Kehadiran Siswa / Guru',
    tag: 'Presensi',
    deskripsi: 'Ideal untuk presensi kelas, lokakarya, atau rapat umum. Dilengkapi margin aman untuk cetak meja.',
    saranKoreksi: 'H',
    saranMargin: 4,
  },
  {
    id: 'preset-pendaftaran',
    judul: 'Pendaftaran PPDB / Ekstrakurikuler',
    tag: 'Pendaftaran',
    deskripsi: 'Untuk formulir pendaftaran peserta didik baru, ekstrakurikuler, atau kegiatan sekolah.',
    saranKoreksi: 'H',
    saranMargin: 4,
  },
  {
    id: 'preset-survei',
    judul: 'Survei & Feedback Evaluasi',
    tag: 'Feedback',
    deskripsi: 'Cocok untuk survei evaluasi pembelajaran atau angket kepuasan siswa/wali murid.',
    saranKoreksi: 'Q',
    saranMargin: 4,
  },
];

// Data mock riwayat awal untuk demonstrasi awal antarmuka (*Empty State Alternative*)
export const MOCK_RIWAYAT_AWAL: ItemRiwayatFormulir[] = [
  {
    id: 'c8a6f947-1982-4217-bf41-6e3e5b3c0001',
    label: 'Ulangan Harian Informatika Kelas 7 - Bab 1',
    urlTervalidasi: 'https://forms.gle/xK8y9Q2pM4wZ7L1eA',
    dibuatPada: '2026-11-01T08:30:00.000Z',
    terakhirDiakses: '2026-11-02T04:15:00.000Z',
    jumlahUnduhan: 35,
    isPinned: true,
    konfigurasi: {
      urlAsli: 'https://forms.gle/xK8y9Q2pM4wZ7L1eA',
      urlTervalidasi: 'https://forms.gle/xK8y9Q2pM4wZ7L1eA',
      labelFormulir: 'Ulangan Harian Informatika Kelas 7 - Bab 1',
      tagKategori: 'Ulangan',
      warnaMatriks: '#18181B',
      warnaLatar: '#FFFFFF',
      marginModul: 4,
      tingkatKoreksi: 'H',
      gayaModul: 'sharp',
      sematkanLogo: true,
      rasioLogo: 0.18,
      dpiTarget: 300,
    },
  },
  {
    id: 'c8a6f947-1982-4217-bf41-6e3e5b3c0002',
    label: 'Presensi Kehadiran Siswa Kelas 7A',
    urlTervalidasi: 'https://forms.gle/aB9c8D7eF6gH5iJ4k',
    dibuatPada: '2026-10-31T02:00:00.000Z',
    terakhirDiakses: '2026-11-01T10:00:00.000Z',
    jumlahUnduhan: 28,
    isPinned: false,
    konfigurasi: {
      urlAsli: 'https://forms.gle/aB9c8D7eF6gH5iJ4k',
      urlTervalidasi: 'https://forms.gle/aB9c8D7eF6gH5iJ4k',
      labelFormulir: 'Presensi Kehadiran Siswa Kelas 7A',
      tagKategori: 'Presensi',
      warnaMatriks: '#18181B',
      warnaLatar: '#FFFFFF',
      marginModul: 4,
      tingkatKoreksi: 'H',
      gayaModul: 'sharp',
      sematkanLogo: true,
      rasioLogo: 0.18,
      dpiTarget: 300,
    },
  },
];
