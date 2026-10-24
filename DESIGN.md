# Arahan Desain: MBA Laundry Express

Dokumen ini sumber kebenaran untuk keputusan visual. `docs/DESIGN_SYSTEM.md`
menjelaskan struktur token, `src/styles/tokens.css` menyimpan nilainya, dan
dokumen ini menjelaskan alasannya.

Status arah: **disetujui**, diturunkan dari brand yang sudah berjalan.

## Design Read

> Reading this as: public laundry service site and admin console for
> Indonesian self-service customers, in a clean, warm, high-clarity visual
> language, dial ENERGY 2 / RHYTHM 2 / MOTION 1.

## Tiga Dial

| Dial   | Nilai | Arti untuk proyek ini                                                       |
| ------ | ----- | --------------------------------------------------------------------------- |
| ENERGY | 2     | Tenang. Tidak ada warna teriak, glow, atau gradien dekoratif.                |
| RHYTHM | 2     | Jarak antar blok tegas. Satu titik fokus per layar, sisanya pendukung.       |
| MOTION | 1     | Gerak hanya untuk umpan balik aksi, bukan hiburan.                           |

Angka ini sengaja rendah. Laundry self-service dipakai orang yang sedang
buru-buru sambil memegang keranjang, jadi layar harus cepat dibaca.

## Identitas

- **Siapa**: laundry self-service untuk keluarga, pekerja, dan mahasiswa di
  Sidoarjo dan Surabaya.
- **Karakter**: hangat, praktis, bisa dipercaya.
- **Janji visual**: pengunjung langsung tahu harga, lokasi, dan cara pakai.

Motif identitas: **air dan kain**. Motif ini muncul lewat ikon bertema cuci,
kering, dan setrika, bukan lewat ornamen dekoratif.

## Warna

Satu warna brand, sisanya netral dan semantik.

| Peran      | Token              | Nilai     | Alasan satu baris                                    |
| ---------- | ------------------ | --------- | ---------------------------------------------------- |
| Brand      | `--brand`          | `#c62828` | Ruby adalah identitas MBA, dipakai untuk aksi utama. |
| Brand alt  | `--brand-hover`    | `#b91c1c` | Umpan balik hover tanpa menggeser identitas.         |
| Latar app  | `--bg-app`         | `#f6f7fb` | Abu lembut supaya kartu putih punya bentuk.          |
| Kartu      | `--bg-card`        | `#ffffff` | Permukaan konten harus paling terang di layar.       |
| Teks utama | `--text-primary`   | `#0f172a` | Kontras tinggi untuk dibaca di bawah sinar matahari. |
| Teks dua   | `--text-secondary` | `#475569` | Hierarki kedua tanpa kehilangan keterbacaan.         |
| Teks redup | `--text-muted`     | `#64748b` | Metadata saja, tidak untuk teks isi.                 |
| Sukses     | `--success`        | `#16a34a` | Status nyata: tersimpan, terkirim, buka.             |
| Bahaya     | `--danger`         | `#dc2626` | Aksi hapus dan keadaan gagal.                        |
| Peringatan | `--warning`        | `#ca8a04` | Keadaan yang perlu perhatian admin.                  |
| Info       | `--info`           | `#2563eb` | Catatan netral, bukan ajakan aksi.                   |

Aksen tambahan (`--accent-teal`, `--accent-violet`) hanya boleh satu per
layar, dan tidak pernah untuk aksi utama.

Larangan warna: gradien biru ke ungu, glow neon, orb radial, palet pastel,
skema ungu dan hitam.

## Tipografi

- **Plus Jakarta Sans** untuk seluruh teks. Dipilih karena bentuk hurufnya
  ramah pembaca Indonesia dan angkanya jelas di ukuran kecil.
- **JetBrains Mono** hanya untuk nominal rupiah dan jumlah coin, supaya digit
  sejajar saat harga dibandingkan antar baris.
- Tidak ada label huruf kapital dengan tracking ekstrem. Kicker bagian memakai
  huruf kapital dengan tracking lebar secukupnya.
- Ukuran minimum teks isi di ponsel adalah 14px.

## Bentuk dan Spasi

- Radius bertingkat: `--radius-xs` untuk kontrol kecil, `--radius-sm` sampai
  `--radius-lg` untuk kartu, `--radius-full` hanya untuk tombol ikon bulat.
- Tidak boleh semua elemen pill. Variasi radius adalah bagian dari hierarki.
- Spasi vertikal antar bagian memakai skala `--space-*`, bukan angka bebas.
- Bayangan hanya untuk elevasi nyata: dropdown, modal, dan kartu yang sedang
  di-hover. Kartu diam tidak diberi bayangan besar.

## Gerak

- Fade dan geser maksimal 16px saat elemen masuk viewport, sekali saja.
- Hover memakai transisi `--transition-fast` pada warna dan bayangan.
- Tidak ada animasi berkedip, orb mengambang, atau parallax.
- Semua gerak menghormati `prefers-reduced-motion`.

## Ikon

- Ikon harus mewakili isinya. Ikon generik (sparkle, kilat, bintang) dilarang
  sebagai ikon fitur.
- Ikon fasilitas cabang dipilih admin lewat pemilih ikon bertema laundry di
  `src/lib/facility-icons.tsx`, sehingga relevansi dijaga pemilik usaha.

## Konten

- Tidak ada angka tanpa sumber. Semua nominal berasal dari data mesin dan
  cabang di database.
- Tidak ada testimoni karangan. Bagian testimoni hanya tampil kalau ada data
  yang sudah disetujui.
- Tidak ada FAQ template. Pertanyaan diambil dari pertanyaan nyata pelanggan.
- Tidak ada tombol yang tidak melakukan apa pun.

## Empat Keadaan Wajib

Setiap tampilan data wajib punya empat keadaan. Komponen bersama ada di
`src/components/admin/QueryState.tsx`.

| Keadaan | Wujud                            | Aturan pesan                                         |
| ------- | -------------------------------- | ---------------------------------------------------- |
| Memuat  | indikator pada tabel             | Jangan kosongkan layar.                              |
| Kosong  | `TableEmptyState`                | Sebut apa yang belum ada dan langkah berikutnya.     |
| Gagal   | `TableErrorState`                | Sebut apa yang gagal dan sediakan tombol muat ulang. |
| Terisi  | tabel atau daftar                | Data nyata, tanpa angka karangan.                    |

## Aksesibilitas

- Kontras teks minimal 4.5:1 untuk teks normal, 3:1 untuk teks besar.
- Target sentuh minimal 44px.
- Fokus keyboard selalu terlihat.
- Mode terang dan gelap sama-sama diuji.

## Larangan

- Em dash di dalam teks apa pun.
- Gradien, glow, dan orb sebagai dekorasi bawaan.
- Grid, blueprint, atau titik-titik sebagai latar.
- Badge kapsul berisi klaim tanpa konteks.
- Tombol "Get Started", "Learn More", atau padanannya tanpa tujuan jelas.
- Kata pemasaran kosong: Seamless, Revolutionary, AI Powered, dan sejenisnya.
