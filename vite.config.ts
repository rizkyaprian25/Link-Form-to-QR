import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dotenv from 'dotenv';
import {
  ambilRiwayatDariNeon,
  simpanFormulirKeNeon,
  ubahPinFormulirNeon,
  hapusFormulirDariNeon,
  bersihkanSemuaFormulirNeon,
} from './src/server/neonHandler';

// Muat variabel lingkungan dari .env ke process.env
dotenv.config();

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    react(),
    {
      name: 'neon-api-dev-middleware',
      configureServer(server) {
        server.middlewares.use('/api/forms', async (req, res, next) => {
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

          if (req.method === 'OPTIONS') {
            res.statusCode = 200;
            res.end();
            return;
          }

          try {
            // 1. GET: Ambil riwayat dari Neon DB
            if (req.method === 'GET') {
              const hasil = await ambilRiwayatDariNeon();
              res.statusCode = hasil.sukses ? 200 : 503;
              res.end(JSON.stringify(hasil));
              return;
            }

            // Helper pembaca body request
            const bacaBody = (): Promise<any> => {
              return new Promise((resolve) => {
                let data = '';
                req.on('data', (chunk) => (data += chunk));
                req.on('end', () => {
                  try {
                    resolve(data ? JSON.parse(data) : {});
                  } catch {
                    resolve({});
                  }
                });
              });
            };

            // 2. POST: Simpan formulir baru ke Neon DB
            if (req.method === 'POST') {
              const body = await bacaBody();
              const hasil = await simpanFormulirKeNeon(body);
              res.statusCode = hasil.sukses ? 200 : 500;
              res.end(JSON.stringify(hasil));
              return;
            }

            // 3. PATCH: Ubah status pin
            if (req.method === 'PATCH') {
              const body = await bacaBody();
              const hasil = await ubahPinFormulirNeon(body.id, Boolean(body.isPinned));
              res.statusCode = hasil.sukses ? 200 : 500;
              res.end(JSON.stringify(hasil));
              return;
            }

            // 4. DELETE: Hapus item atau kosongkan semua
            if (req.method === 'DELETE') {
              const urlObj = new URL(req.url || '', 'http://localhost');
              const id = urlObj.searchParams.get('id');
              const hapusSemua = urlObj.searchParams.get('hapusSemua');

              if (hapusSemua === 'true') {
                const hasil = await bersihkanSemuaFormulirNeon();
                res.statusCode = hasil.sukses ? 200 : 500;
                res.end(JSON.stringify(hasil));
                return;
              }

              if (id) {
                const hasil = await hapusFormulirDariNeon(id);
                res.statusCode = hasil.sukses ? 200 : 500;
                res.end(JSON.stringify(hasil));
                return;
              }

              res.statusCode = 400;
              res.end(JSON.stringify({ sukses: false, pesan: 'Parameter id diperlukan' }));
              return;
            }

            next();
          } catch (err: any) {
            console.error('Middleware /api/forms mengalami galat:', err);
            res.statusCode = 500;
            res.end(JSON.stringify({ sukses: false, pesan: err.message || 'Kesalahan server' }));
          }
        });
      },
    },
  ],
  server: {
    port: 3000,
    open: false,
  },
});
