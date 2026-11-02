# FormQR Studio

> **Pengonversi Tautan Google Form Menjadi Kode QR Vektor Beresolusi Tinggi & Siap Cetak**

FormQR Studio adalah aplikasi web utilitas yang dirancang untuk mengubah tautan Google Form (`forms.gle` dan `docs.google.com/forms`) menjadi kode QR berkualitas cetak industri. Seluruh pemrosesan berjalan langsung di peramban pengguna (*100% client-side*), tanpa peladen perantara, tanpa iklan, dan tanpa biaya langganan.

---

## Masalah yang Diselesaikan

1. **Resolusi Rendah Saat Dicetak Fisik:**  
   Banyak generator online hanya mengekspor file raster 72 DPI yang pecah saat dicetak pada spanduk, banner, atau kartu meja. FormQR Studio mengekspor berkas **Vector SVG murni (skala tak terbatas)** dan **PNG 300 DPI** siap cetak.
2. **Kekeliruan Tautan Mode Edit:**  
   Pengguna awam kerap menyalin URL mode editor (`/edit`). Sistem ini mendeteksi pola tersebut dan secara otomatis menormalisasinya menjadi tautan publik responden (`/viewform`).
3. **Privasi & Kecepatan:**  
   Tautan tidak pernah dikirim ke pihak ketiga. Kode QR dirender dalam waktu kurang dari 50ms setelah URL ditempelkan.

---

## Fitur Utama

- **Deteksi Cerdas & Auto-Koreksi URL:**  
  Mengenali domain resmi Google Form dan mengalihkan link pengelola (`/edit`) ke link pengisian responden secara otomatis.
- **Proteksi Tingkat Koreksi Kesalahan (Level H 30%):**  
  Menggunakan algoritma Reed-Solomon untuk memastikan kode QR tetap terbaca oleh kamera ponsel meski disematkan logo di bagian tengah.
- **Emblem Resmi Google Form Terintegrasi:**  
  Menyematkan lambang ungu Google Form lengkap dengan zona aman (*safe halo margin*) agar tidak menutupi modul deteksi sudut QR.
- **Aksi Ekspor Lengkap:**  
  - *Vector SVG:* Format kurva murni untuk desainer grafis.
  - *High-Res PNG (2048px • 300 DPI):* Siap cetak langsung.
  - *Salin ke Clipboard:* Menyalin gambar langsung ke memori untuk dibagikan di dokumen atau chat.
  - *Mode Cetak Flyer / Kartu Meja:* Pratinjau tata letak siap cetak A4/A5 dengan petunjuk pemindaian 3 langkah.
- **Riwayat Lokal (*Local Shelf*):**  
  Menyimpan formulir yang pernah dibuat di penyimpanan lokal peramban (*localStorage/IndexedDB*) dengan penanda favorit (*pin*) dan fitur pembersihan otomatis LRU.

---

## Panduan Instalasi & Menjalankan Proyek

### Prasyarat
- **Node.js:** Versi 18 ke atas (Direkomendasikan Node.js LTS atau v20+)
- **npm:** Versi 9 ke atas

### Langkah Menjalankan di Komputer Lokal

1. **Klon Repositori:**
   ```bash
   git clone <URL_REPOSITORI>
   cd "Link Form to QR"
   ```

2. **Instal Dependensi:**
   ```bash
   npm install
   ```

3. **Jalankan Server Pengembangan:**
   ```bash
   npm run dev
   ```
   Buka peramban pada alamat `http://localhost:3000`.

4. **Uji Tipe & Kode (*Quality Gate*):**
   ```bash
   # Pemeriksaan tipe data statis
   npm run typecheck

   # Menjalankan smoke test otomatis
   npm test
   ```

5. **Build Produksi:**
   ```bash
   npm run build
   ```
   Hasil artefak siap rilis akan berada pada folder `dist/` dan dapat di-host langsung di platform statis seperti Cloudflare Pages, Vercel, Netlify, atau GitHub Pages.

---

## Struktur Direktori

```text
├── index.html                 # Dokumen HTML utama
├── package.json               # Konfigurasi dependensi dan skrip proyek
├── tailwind.config.js         # Konfigurasi token desain dan palet Swiss
├── vite.config.ts             # Pengaturan bundler Vite
├── test/
│   └── smoke.test.ts          # Pengujian smoke test kritis
└── src/
    ├── main.tsx               # Titik masuk aplikasi
    ├── App.tsx                # Komponen orkestrasi utama
    ├── contracts/             # Kontrak data SSOT dan skema validasi Zod
    ├── components/            # Komponen kerangka (AppShell, ErrorBoundary)
    ├── features/generator/    # Fitur inti generator QR
    │   ├── services/          # Layanan bisnis (urlParser, qrEngine, storageService)
    │   └── components/        # Komponen UI (InputSection, CustomizerPanel, PreviewCanvas, ExportSuite, HistoryShelf, PrintFlyerSheet)
    └── styles/                # CSS global dan stylesheet media cetak
```

---

## Lisensi

Didistribusikan di bawah lisensi MIT. Bebas digunakan untuk keperluan pribadi, komunitas, pendidikan, maupun komersial.
