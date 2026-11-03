import { useState } from 'react';
import { History, Pin, Trash2, ArrowUpRight, Search, FileSpreadsheet } from 'lucide-react';
import { ItemRiwayatFormulir } from '../../../contracts/formqr';

interface HistoryShelfProps {
  daftarRiwayat: ItemRiwayatFormulir[];
  onPilihRiwayat: (item: ItemRiwayatFormulir) => void;
  onTogglePin: (id: string) => void;
  onHapusItem: (id: string) => void;
  onBersihkanSemua: () => void;
}

/**
 * Rak Bawah Riwayat Formulir (Local Storage Shelf)
 * Menampilkan katalog formulir yang pernah dibuat di browser pengguna,
 * dengan filter kategori, pencarian cepat, aksi muat ulang, dan penanda pin favorit.
 */
export function HistoryShelf({
  daftarRiwayat,
  onPilihRiwayat,
  onTogglePin,
  onHapusItem,
  onBersihkanSemua,
}: HistoryShelfProps) {
  const [filterAktif, setFilterAktif] = useState<string>('Semua');
  const [kataKunci, setKataKunci] = useState<string>('');

  // Saring daftar berdasarkan filter kategori dan kata kunci
  const riwayatTersaring = daftarRiwayat.filter((item) => {
    const cocokKategori =
      filterAktif === 'Semua'
        ? true
        : filterAktif === 'Favorit'
        ? item.isPinned
        : item.konfigurasi.tagKategori?.toLowerCase() === filterAktif.toLowerCase();

    const cocokKataKunci =
      item.label.toLowerCase().includes(kataKunci.toLowerCase()) ||
      item.urlTervalidasi.toLowerCase().includes(kataKunci.toLowerCase());

    return cocokKategori && cocokKataKunci;
  });

  // Format tanggal ke Bahasa Indonesia ramah pengguna
  const formatTanggal = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return 'Baru saja';
    }
  };

  const kategoriTabs = ['Semua', 'Favorit', 'Presensi', 'Feedback', 'Pendaftaran'];

  return (
    <div className="bg-card border border-border rounded-lg p-5 sm:p-6 space-y-4 shadow-sm w-full mt-6">
      {/* Header Rak Riwayat */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-4">
        <div>
          <h2 className="text-base font-semibold text-foreground tracking-tight flex items-center gap-2">
            <History className="w-4 h-4 text-accent" />
            Riwayat Formulir yang Dibuat
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Tersimpan aman di peramban lokal. Anda dapat memuat ulang konfigurasi atau mencetak kembali sewaktu-waktu.
          </p>
        </div>

        {daftarRiwayat.length > 0 && (
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Apakah Anda yakin ingin mengosongkan seluruh riwayat lokal?')) {
                onBersihkanSemua();
              }
            }}
            className="text-[11px] text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1 self-start sm:self-auto"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Bersihkan Riwayat</span>
          </button>
        )}
      </div>

      {/* Kontrol Saringan & Pencarian */}
      {daftarRiwayat.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {kategoriTabs.map((tab) => {
              const isAktif = filterAktif === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setFilterAktif(tab)}
                  className={`px-3 py-1 text-xs rounded font-medium transition-all ${
                    isAktif
                      ? 'bg-primary text-primary-foreground shadow-xs'
                      : 'bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>

          {/* Search Bar Mini */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Cari formulir..."
              value={kataKunci}
              onChange={(e) => setKataKunci(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded border border-border bg-card text-foreground focus:outline-none focus:border-accent"
            />
          </div>
        </div>
      )}

      {/* Grid Kartu Riwayat */}
      {riwayatTersaring.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
          {riwayatTersaring.map((item) => (
            <div
              key={item.id}
              className={`p-3.5 rounded border transition-all flex flex-col justify-between space-y-3 bg-card hover:border-accent/40 hover:shadow-xs ${
                item.isPinned ? 'border-accent/30 bg-accent/[0.02]' : 'border-border'
              }`}
            >
              <div className="space-y-1.5">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-semibold text-foreground line-clamp-1 leading-snug">
                    {item.label}
                  </span>
                  <button
                    type="button"
                    onClick={() => onTogglePin(item.id)}
                    title={item.isPinned ? 'Lepas Sematan' : 'Sematkan ke Favorit'}
                    className={`p-1 rounded transition-colors ${
                      item.isPinned
                        ? 'text-accent hover:bg-accent/10'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Pin className={`w-3.5 h-3.5 ${item.isPinned ? 'fill-accent' : ''}`} />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border">
                    {item.konfigurasi.tagKategori || 'Form'}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    {formatTanggal(item.dibuatPada)}
                  </span>
                </div>

                <div className="text-[11px] font-mono text-muted-foreground truncate bg-muted/40 px-2 py-0.5 rounded border border-border/40">
                  {item.urlTervalidasi}
                </div>
              </div>

              {/* Aksi Bar Bawah Kartu */}
              <div className="flex items-center justify-between pt-2 border-t border-border/60 text-xs">
                <button
                  type="button"
                  onClick={() => onPilihRiwayat(item)}
                  className="inline-flex items-center gap-1 font-medium text-accent hover:text-accent-hover transition-colors"
                >
                  <span>Muat ke Studio</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`Hapus "${item.label}" dari riwayat dan database Neon?`)) {
                      onHapusItem(item.id);
                    }
                  }}
                  title="Hapus dari Riwayat"
                  className="p-1 text-muted-foreground hover:text-destructive transition-colors rounded"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State Riwayat */
        <div className="py-8 text-center text-muted-foreground space-y-2 border border-dashed border-border rounded-lg bg-muted/20">
          <FileSpreadsheet className="w-8 h-8 mx-auto text-muted-foreground/40" />
          <p className="text-xs font-medium text-foreground">
            {kataKunci || filterAktif !== 'Semua'
              ? 'Tidak ada formulir yang sesuai dengan saringan.'
              : 'Belum ada riwayat formulir.'}
          </p>
          <p className="text-[11px] max-w-xs mx-auto">
            Formulir yang Anda generate akan otomatis diarsipkan di sini untuk memudahkan pencetakan ulang di masa mendatang.
          </p>
        </div>
      )}
    </div>
  );
}
