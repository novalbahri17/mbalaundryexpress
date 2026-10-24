# MBA Laundry Express Admin + Landing

Aplikasi ini adalah hasil modifikasi `MBA Admin` menjadi:

- Landing page publik `MBA Laundry Express`
- Admin panel `MBA Admin`
- Data source berbasis Express + MySQL (backend sendiri di `server/index.mjs`)

## 1. Stack

- React 19 + Vite + TypeScript strict
- Ant Design (admin)
- Tailwind CSS (publik)
- Zustand + TanStack Query
- Framer Motion + Lottie
- Backend sendiri: Express 5 + MySQL (`server/index.mjs`, port 3002)

## 2. Struktur Penting

- `src/pages/public/*` seluruh halaman publik
- `src/pages/admin/*` seluruh halaman admin
- `src/router/PublicRouter.tsx` route publik
- `src/router/AdminRouter.tsx` route admin
- `src/api/*` data access layer
- `src/types/database.types.ts` tipe 19 tabel
- `database/seed.sql` schema + seed default
- `server/index.mjs` API server (Express + MySQL)
- `scripts/create-mysql-tables.mjs` bikin tabel dari schema
- `scripts/mysql-schema.sql` definisi 19 tabel
- `uploads/` file gambar hasil upload (WAJIB di-backup)
- `deploy/etc/nginx/sites-available/mba-laundry`
- `ecosystem.config.js`
- `backup-mba.sh`
- `scripts/setup-ufw.sh`

## 3. Local Setup

```bash
pnpm install
cp .env.example .env
pnpm dev
```

Akses:

- Publik: `http://localhost:3000`
- Admin: `http://localhost:3000/admin/login`

## 4. Build Production

```bash
pnpm build
pnpm preview --host 127.0.0.1 --port 3000
```

## 5. Inisialisasi Database

Set konfigurasi MySQL di `.env` (`MYSQL_HOST`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_DATABASE`).

Buat 19 tabel yang dibutuhkan:

```bash
pnpm mysql:create
```

Akun admin dibuat otomatis saat API server pertama kali dijalankan, diambil dari
`API_ADMIN_EMAIL` dan `API_ADMIN_PASSWORD` di `.env`. Tidak perlu langkah manual.

## 6. Deploy Ubuntu 22.04 (Proxmox VPS)

### 6.1 Dependensi server

```bash
sudo apt update
sudo apt install -y nginx certbot python3-certbot-nginx mysql-server ufw curl tar
sudo npm i -g pm2
```

### 6.2 Deploy app

```bash
sudo mkdir -p /var/www/mba-laundry
sudo chown -R $USER:$USER /var/www/mba-laundry
# copy project ke /var/www/mba-laundry
cd /var/www/mba-laundry
pnpm install
pnpm build
```

### 6.3 PM2

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 6.4 API server (Express + MySQL)

API server dijalankan sebagai app `mba-api` di `ecosystem.config.js` (port 3002).

```bash
pm2 start ecosystem.config.js
pm2 logs mba-api
```

Kalau mau dijalankan manual tanpa PM2:

```bash
node --env-file=.env server/index.mjs
```

Cek sehat: `curl http://127.0.0.1:3002/api/health`

### 6.5 Nginx + SSL

```bash
sudo cp deploy/etc/nginx/sites-available/mba-laundry /etc/nginx/sites-available/mba-laundry
sudo ln -s /etc/nginx/sites-available/mba-laundry /etc/nginx/sites-enabled/mba-laundry
sudo nginx -t
sudo systemctl reload nginx
sudo certbot --nginx -d mba-laundry.com -d www.mba-laundry.com
```

### 6.6 UFW

```bash
sudo bash scripts/setup-ufw.sh 22
```

## 7. Cron Auto Expire Promo

Service endpoint sudah disiapkan di `scripts/cron-expire-promos.mjs` (bind `127.0.0.1`).
Jalankan sebagai proses terpisah (PM2/systemd) sebelum memasang cron.

Tambahkan endpoint backend internal (contoh):

- `GET /api/cron/expire-promos`
- Header wajib: `x-cron-secret: <CRON_SECRET>`
- Update `promos.status='expired'` jika `end_date < NOW()`

Cron tiap jam:

```bash
0 * * * * curl -sS -H "x-cron-secret: <CRON_SECRET>" http://127.0.0.1:3010/api/cron/expire-promos >/dev/null
```

## 8. Backup Harian

```bash
chmod +x backup-mba.sh
sudo mv backup-mba.sh /usr/local/bin/backup-mba.sh
```

Cron backup jam 2 pagi:

```bash
0 2 * * * /usr/local/bin/backup-mba.sh
```

## 9. Catatan Keamanan

- Jangan commit `.env`
- Gunakan password kuat untuk MySQL dan akun admin
- Pastikan port 3000, 3002, dan 3306 tertutup dari publik
- Route `/admin/*` tidak ditautkan dari publik



