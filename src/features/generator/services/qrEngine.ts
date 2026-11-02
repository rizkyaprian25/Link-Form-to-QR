/**
 * FormQR Studio - Mesin Generator QR Code Reed-Solomon & SVG Compositor
 * Menghasilkan matriks QR presisi tinggi, ekspor SVG murni, dan rendering kanvas cetak 300 DPI
 * dengan penyematan lambang resmi Google Form dan proteksi zona aman (safe halo).
 */

import QRCode from 'qrcode';
import { KonfigurasiQR } from '../../../contracts/formqr';

// Warna identitas resmi Google Form
const WARNA_GOOGLE_FORM = '#7248B9';

/**
 * Menghasilkan string kode vektor SVG mandiri dari konfigurasi QR.
 * Menginjeksi lambang Google Form secara native ke dalam elemen SVG jika opsi aktif.
 */
export async function buatQrCodeSvg(config: KonfigurasiQR): Promise<string> {
  const urlTarget = config.urlTervalidasi || config.urlAsli;
  if (!urlTarget) return '';

  // 1. Generate basis SVG menggunakan library qrcode
  const rawSvg = await QRCode.toString(urlTarget, {
    type: 'svg',
    errorCorrectionLevel: config.tingkatKoreksi,
    margin: config.marginModul,
    color: {
      dark: config.warnaMatriks,
      light: config.warnaLatar,
    },
    width: 512,
  });

  // 2. Jika opsi sematkan logo dinonaktifkan, kembalikan SVG mentah
  if (!config.sematkanLogo) {
    return rawSvg;
  }

  // 3. Sisipkan logo vektor Google Form di titik tengah kanvas SVG
  const centerSize = 512 * config.rasioLogo;
  const centerPos = (512 - centerSize) / 2;
  const haloPadding = centerSize * 0.15;
  const haloSize = centerSize + haloPadding * 2;
  const haloPos = (512 - haloSize) / 2;

  // Elemen grafis vektor lambang formulir Google
  const svgLogoInjeksi = `
    <!-- Google Forms Center Emblem & Protective Halo -->
    <rect x="${haloPos.toFixed(1)}" y="${haloPos.toFixed(1)}" width="${haloSize.toFixed(1)}" height="${haloSize.toFixed(1)}" rx="${(haloSize * 0.22).toFixed(1)}" fill="${config.warnaLatar}" />
    <rect x="${centerPos.toFixed(1)}" y="${centerPos.toFixed(1)}" width="${centerSize.toFixed(1)}" height="${centerSize.toFixed(1)}" rx="${(centerSize * 0.2).toFixed(1)}" fill="${WARNA_GOOGLE_FORM}" />
    <!-- Baris Formulir Minimalis -->
    <rect x="${(centerPos + centerSize * 0.22).toFixed(1)}" y="${(centerPos + centerSize * 0.28).toFixed(1)}" width="${(centerSize * 0.56).toFixed(1)}" height="${(centerSize * 0.1).toFixed(1)}" rx="2" fill="#FFFFFF" />
    <rect x="${(centerPos + centerSize * 0.22).toFixed(1)}" y="${(centerPos + centerSize * 0.46).toFixed(1)}" width="${(centerSize * 0.56).toFixed(1)}" height="${(centerSize * 0.1).toFixed(1)}" rx="2" fill="#FFFFFF" />
    <rect x="${(centerPos + centerSize * 0.22).toFixed(1)}" y="${(centerPos + centerSize * 0.64).toFixed(1)}" width="${(centerSize * 0.36).toFixed(1)}" height="${(centerSize * 0.1).toFixed(1)}" rx="2" fill="#FFFFFF" />
  `;

  // Sisipkan sebelum tag penutup </svg>
  return rawSvg.replace('</svg>', `${svgLogoInjeksi}</svg>`);
}

/**
 * Merender matriks QR ke elemen HTMLCanvasElement dengan resolusi tinggi (High-DPI).
 */
export async function renderQrKeKanvas(
  canvas: HTMLCanvasElement,
  config: KonfigurasiQR,
  ukuranPixel: number = 1024
): Promise<void> {
  const urlTarget = config.urlTervalidasi || config.urlAsli;
  if (!urlTarget) return;

  // Atur dimensi piksel fisik kanvas
  canvas.width = ukuranPixel;
  canvas.height = ukuranPixel;

  // 1. Gambar matriks QR dasar ke kanvas
  await QRCode.toCanvas(canvas, urlTarget, {
    errorCorrectionLevel: config.tingkatKoreksi,
    margin: config.marginModul,
    color: {
      dark: config.warnaMatriks,
      light: config.warnaLatar,
    },
    width: ukuranPixel,
  });

  // 2. Gambar lambang Google Form di tengah jika opsi diaktifkan
  if (config.sematkanLogo) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const centerSize = ukuranPixel * config.rasioLogo;
    const centerPos = (ukuranPixel - centerSize) / 2;
    const haloPadding = centerSize * 0.15;
    const haloSize = centerSize + haloPadding * 2;
    const haloPos = (ukuranPixel - haloSize) / 2;

    // A. Gambar zona aman latar belakang (Safe Halo)
    ctx.fillStyle = config.warnaLatar;
    ctx.beginPath();
    ctx.roundRect(haloPos, haloPos, haloSize, haloSize, haloSize * 0.22);
    ctx.fill();

    // B. Gambar badan ikon formulir ungu
    ctx.fillStyle = WARNA_GOOGLE_FORM;
    ctx.beginPath();
    ctx.roundRect(centerPos, centerPos, centerSize, centerSize, centerSize * 0.2);
    ctx.fill();

    // C. Gambar 3 baris formulir putih
    ctx.fillStyle = '#FFFFFF';
    const barX = centerPos + centerSize * 0.22;
    const barHeight = centerSize * 0.09;
    const barRadius = barHeight * 0.4;

    // Baris 1
    ctx.beginPath();
    ctx.roundRect(barX, centerPos + centerSize * 0.28, centerSize * 0.56, barHeight, barRadius);
    ctx.fill();

    // Baris 2
    ctx.beginPath();
    ctx.roundRect(barX, centerPos + centerSize * 0.46, centerSize * 0.56, barHeight, barRadius);
    ctx.fill();

    // Baris 3
    ctx.beginPath();
    ctx.roundRect(barX, centerPos + centerSize * 0.64, centerSize * 0.38, barHeight, barRadius);
    ctx.fill();
  }
}

/**
 * Mengonversi kanvas menjadi Blob gambar PNG untuk pengunduhan atau penyalinan ke clipboard.
 */
export function kanvasKeBlob(canvas: HTMLCanvasElement): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/png');
  });
}
