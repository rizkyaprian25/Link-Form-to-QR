/**
 * FormQR Studio - Vercel Serverless API Route (/api/forms)
 * Menangani permintaan HTTP REST untuk Neon PostgreSQL.
 */

import {
  ambilRiwayatDariNeon,
  simpanFormulirKeNeon,
  ubahPinFormulirNeon,
  hapusFormulirDariNeon,
  bersihkanSemuaFormulirNeon,
} from '../src/server/neonHandler';

export default async function handler(req: any, res: any) {
  // Atur header CORS dan JSON
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // 1. GET: Ambil daftar riwayat dari Neon DB
    if (req.method === 'GET') {
      const hasil = await ambilRiwayatDariNeon();
      return res.status(hasil.sukses ? 200 : 503).json(hasil);
    }

    // 2. POST: Simpan atau update formulir (Upsert)
    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const hasil = await simpanFormulirKeNeon(body);
      return res.status(hasil.sukses ? 200 : 500).json(hasil);
    }

    // 3. PATCH: Ubah status pin
    if (req.method === 'PATCH') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const { id, isPinned } = body;
      const hasil = await ubahPinFormulirNeon(id, Boolean(isPinned));
      return res.status(hasil.sukses ? 200 : 500).json(hasil);
    }

    // 4. DELETE: Hapus formulir atau bersihkan semua
    if (req.method === 'DELETE') {
      const { id, hapusSemua } = req.query || {};
      if (hapusSemua === 'true') {
        const hasil = await bersihkanSemuaFormulirNeon();
        return res.status(hasil.sukses ? 200 : 500).json(hasil);
      }
      if (id) {
        const hasil = await hapusFormulirDariNeon(String(id));
        return res.status(hasil.sukses ? 200 : 500).json(hasil);
      }
      return res.status(400).json({ sukses: false, pesan: 'Parameter id diperlukan' });
    }

    return res.status(405).json({ sukses: false, pesan: 'Method Not Allowed' });
  } catch (error: any) {
    console.error('API /api/forms mengalami kegagalan:', error);
    return res.status(500).json({
      sukses: false,
      pesan: error.message || 'Terjadi kesalahan internal pada serverless function',
    });
  }
}
