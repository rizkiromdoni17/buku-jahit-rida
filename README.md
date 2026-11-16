# Buku Jahit — Rida Roemah Jahit

Aplikasi web (PWA) untuk usaha jahit: pesanan & ukuran pelanggan, nota pesanan dan kuitansi LUNAS (kirim ke WhatsApp), buku kas, dan laporan arus kas. Dua tampilan — **Noir** (`/noir/`) dan **Ivory** (`/ivory/`) — masing-masing dengan mode terang/gelap.

## Fitur
- Pesanan jahit baru/permak, 10 kategori pakaian, ukuran badan (pakai ukuran terakhir), DP, jadwal ambil, status pengerjaan
- Harga dikunci dari Daftar Harga, harga khusus wajib beralasan, cek sebelum kirim nota
- Nota & kuitansi: gambar PNG, bagikan ke WA, teks WA; pengingat sisa bayar & kabar siap ambil
- Buku kas (tunai / bank / QRIS), laporan arus kas bulanan, piutang, ekspor CSV (Excel), rekap harian ke WA
- Bisa dipasang ke layar utama HP dan dipakai tanpa internet setelah dibuka sekali

## Data
Data disimpan di peramban perangkat masing-masing (localStorage), tidak dikirim ke server mana pun. Gunakan **Atur → Unduh backup** secara rutin dan **Pulihkan dari backup** untuk pindah perangkat.

## Hosting
Situs statis — GitHub Pages: *Settings → Pages → Deploy from a branch → `main` / root*.

Dibuat oleh V1BE Studio.
