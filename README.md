# MBA Laundry Express Admin + Landing

Aplikasi ini adalah hasil modifikasi `MBA Admin` menjadi:

- Landing page publik `MBA Laundry Express`
- Admin panel `MBA Admin`
- Data source berbasis PocketBase + MySQL

## 1. Stack

- React 19 + Vite + TypeScript strict
- Ant Design (admin)
- Tailwind CSS (publik)
- Zustand + TanStack Query
- Framer Motion + Lottie
- PocketBase JS SDK (via proxy `/pb-api`)

## 2. Struktur Penting

- `src/pages/public/*` seluruh halaman publik
- `src/pages/admin/*` seluruh halaman admin
- `src/router/PublicRouter.tsx` route publik
- `src/router/AdminRouter.tsx` route admin
- `src/api/*` data access layer
- `src/types/database.types.ts` tipe 19 tabel
- `database/seed.sql` schema + seed default
- `deploy/etc/systemd/system/pocketbase.service`
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

Import SQL:

```bash
mysql -u root lauundry < database/seed.sql
```

Buat akun admin PocketBase (sekali saja):

```bash
./pocketbase superuser create admin@mba-laundry.com Admin12345!
```

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

### 6.4 PocketBase service

```bash
sudo cp deploy/etc/systemd/system/pocketbase.service /etc/systemd/system/pocketbase.service
sudo systemctl daemon-reload
sudo systemctl enable pocketbase
sudo systemctl start pocketbase
sudo systemctl status pocketbase
```

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
- Gunakan password kuat untuk MySQL dan PocketBase admin
- Pastikan port 3000 dan 8090 tertutup dari publik
- Route `/admin/*` tidak ditautkan dari publik



