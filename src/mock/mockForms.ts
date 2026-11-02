/**
 * FormQR Studio - Mock Data & Preset Templat
 * Menyediakan contoh data awal yang tervalidasi serta template siap pakai
 * untuk panitia presensi, survei kepuasan, dan pendaftaran acara.
 */

import { ItemRiwayatFormulir, PresetTemplatForm } from '../contracts/formqr';

// Preset templat formulir populer untuk mempercepat kerja pengguna
export const PRESET_TEMPLAT: PresetTemplatForm[] = [
  {
    id: 'preset-presensi',
    judul: 'Presensi Kehadiran Acara',
    tag: 'Presensi',
    deskripsi: 'Ideal untuk seminar, lokakarya, atau rapat umum. Dilengkapi margin aman untuk cetak meja.',
    saranKoreksi: 'H',
    saranMargin: 4,
  },
  {
    id: 'preset-survei',
    judul: 'Survei Kepuasan & Feedback',
    tag: 'Feedback',
    deskripsi: 'Cocok diletakkan di kasir, resepsionis, atau slide penutup presentasi.',
    saranKoreksi: 'Q',
    saranMargin: 4,
  },
  {
    id: 'preset-registrasi',
    judul: 'Registrasi Peserta Baru',
    tag: 'Pendaftaran',
    deskripsi: 'Untuk formulir pendaftaran anggota atau pendaftaran kompetisi online.',
    saranKoreksi: 'H',
    saranMargin: 4,
  },
  {
    id: 'preset-kuisioner',
    judul: 'Kuesioner Penelitian / Skripsi',
    tag: 'Akademik',
    deskripsi: 'Format standar untuk pengumpulan responden penelitian lapangan.',
    saranKoreksi: 'M',
    saranMargin: 3,
  },
];

// Data mock riwayat awal untuk demonstrasi awal antarmuka (*Empty State Alternative*)
export const MOCK_RIWAYAT_AWAL: ItemRiwayatFormulir[] = [
  {
    id: 'c8a6f947-1982-4217-bf41-6e3e5b3c0001',
    label: 'Evaluasi Lokakarya Cloud & AI 2026',
    urlTervalidasi: 'https://forms.gle/xK8y9Q2pM4wZ7L1eA',
    dibuatPada: '2026-11-01T08:30:00.000Z',
    terakhirDiakses: '2026-11-02T04:15:00.000Z',
    jumlahUnduhan: 14,
    isPinned: true,
    konfigurasi: {
      urlAsli: 'https://docs.google.com/forms/d/e/1FAIpQLSc91.../edit',
      urlTervalidasi: 'https://forms.gle/xK8y9Q2pM4wZ7L1eA',
      labelFormulir: 'Evaluasi Lokakarya Cloud & AI 2026',
      tagKategori: 'Feedback',
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
    label: 'Presensi Sesi Pembukaan Hackathon',
    urlTervalidasi: 'https://forms.gle/aB9c8D7eF6gH5iJ4k',
    dibuatPada: '2026-10-31T02:00:00.000Z',
    terakhirDiakses: '2026-11-01T10:00:00.000Z',
    jumlahUnduhan: 28,
    isPinned: false,
    konfigurasi: {
      urlAsli: 'https://forms.gle/aB9c8D7eF6gH5iJ4k',
      urlTervalidasi: 'https://forms.gle/aB9c8D7eF6gH5iJ4k',
      labelFormulir: 'Presensi Sesi Pembukaan Hackathon',
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
