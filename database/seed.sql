SET NAMES utf8mb4;
SET time_zone = '+07:00';

CREATE TABLE IF NOT EXISTS branches (
  id VARCHAR(15) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  address TEXT NOT NULL,
  maps_url TEXT NULL,
  maps_embed TEXT NULL,
  whatsapp VARCHAR(20) NULL,
  email VARCHAR(255) NULL,
  description LONGTEXT NULL,
  cover_image VARCHAR(255) NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  status ENUM('buka','tutup','ramai') NOT NULL DEFAULT 'buka',
  price_wash INT NOT NULL DEFAULT 10000,
  price_dry INT NOT NULL DEFAULT 10000,
  sort_order INT NOT NULL DEFAULT 0,
  created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS branch_hours (
  id VARCHAR(15) PRIMARY KEY,
  branch_id VARCHAR(15) NOT NULL,
  day ENUM('senin','selasa','rabu','kamis','jumat','sabtu','minggu') NOT NULL,
  open_time TIME NULL,
  close_time TIME NULL,
  is_closed TINYINT(1) NOT NULL DEFAULT 0,
  created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_branch_hours_branch FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE,
  UNIQUE KEY uk_branch_day (branch_id, day)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS branch_facilities (
  id VARCHAR(15) PRIMARY KEY,
  branch_id VARCHAR(15) NOT NULL,
  name VARCHAR(100) NOT NULL,
  icon VARCHAR(50) NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_branch_facilities_branch FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS branch_gallery (
  id VARCHAR(15) PRIMARY KEY,
  branch_id VARCHAR(15) NULL,
  image VARCHAR(255) NOT NULL,
  caption VARCHAR(255) NULL,
  type ENUM('interior','exterior','mesin','fasilitas','umum') NOT NULL DEFAULT 'umum',
  sort_order INT NOT NULL DEFAULT 0,
  created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_branch_gallery_branch FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS promos (
  id VARCHAR(15) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description LONGTEXT NULL,
  image VARCHAR(255) NULL,
  terms TEXT NULL,
  start_date DATETIME NOT NULL,
  end_date DATETIME NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  show_on_home TINYINT(1) NOT NULL DEFAULT 1,
  is_global TINYINT(1) NOT NULL DEFAULT 0,
  priority INT NOT NULL DEFAULT 0,
  status ENUM('draft','published','expired') NOT NULL DEFAULT 'draft',
  created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS promo_branches (
  id VARCHAR(15) PRIMARY KEY,
  promo_id VARCHAR(15) NOT NULL,
  branch_id VARCHAR(15) NOT NULL,
  created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_promo_branches_promo FOREIGN KEY (promo_id) REFERENCES promos(id) ON DELETE CASCADE,
  CONSTRAINT fk_promo_branches_branch FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE,
  UNIQUE KEY uk_promo_branch (promo_id, branch_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS jobs (
  id VARCHAR(15) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description LONGTEXT NULL,
  requirements LONGTEXT NULL,
  benefits LONGTEXT NULL,
  type ENUM('full-time','part-time','freelance','magang') NOT NULL DEFAULT 'full-time',
  branch_id VARCHAR(15) NULL,
  salary_min INT NULL,
  salary_max INT NULL,
  show_salary TINYINT(1) NOT NULL DEFAULT 0,
  is_open TINYINT(1) NOT NULL DEFAULT 1,
  whatsapp_apply VARCHAR(20) NULL,
  posted_at DATETIME NULL,
  closed_at DATETIME NULL,
  created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_jobs_branch FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS articles (
  id VARCHAR(15) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  content LONGTEXT NOT NULL,
  excerpt TEXT NULL,
  thumbnail VARCHAR(255) NULL,
  category ENUM('tips-mencuci','tips-kering','perawatan-bahan','noda','umum','berita','promo-info') NOT NULL DEFAULT 'umum',
  tags JSON NULL,
  meta_title VARCHAR(255) NULL,
  meta_desc TEXT NULL,
  author VARCHAR(100) NULL,
  read_time INT NULL,
  status ENUM('draft','published') NOT NULL DEFAULT 'draft',
  published_at DATETIME NULL,
  views INT NOT NULL DEFAULT 0,
  created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS testimonials (
  id VARCHAR(15) PRIMARY KEY,
  customer_name VARCHAR(255) NOT NULL,
  branch_id VARCHAR(15) NULL,
  rating TINYINT(1) NOT NULL,
  comment TEXT NOT NULL,
  photo VARCHAR(255) NULL,
  is_approved TINYINT(1) NOT NULL DEFAULT 0,
  source ENUM('website','google','instagram','manual') NOT NULL DEFAULT 'website',
  created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_testimonials_branch FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS faqs (
  id VARCHAR(15) PRIMARY KEY,
  question TEXT NOT NULL,
  answer LONGTEXT NOT NULL,
  category ENUM('harga','mesin','waktu','pembayaran','keamanan','barang-hilang','umum') NOT NULL DEFAULT 'umum',
  branch_id VARCHAR(15) NULL,
  sort_order INT NOT NULL DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_faqs_branch FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS page_contents (
  id VARCHAR(15) PRIMARY KEY,
  `key` VARCHAR(100) NOT NULL UNIQUE,
  `value` LONGTEXT NOT NULL,
  type ENUM('text','number','image','boolean','url','richtext','json') NOT NULL DEFAULT 'text',
  label VARCHAR(255) NULL,
  description TEXT NULL,
  `group` VARCHAR(50) NULL,
  updated DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS subscribers (
  id VARCHAR(15) PRIMARY KEY,
  phone VARCHAR(20) NOT NULL,
  branch_id VARCHAR(15) NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  source VARCHAR(50) NOT NULL DEFAULT 'website',
  created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_subscribers_branch FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL,
  UNIQUE KEY uk_subscribers_phone (phone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS spin_rewards (
  id VARCHAR(15) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT NULL,
  reward_type ENUM('voucher','diskon','hadiah','zonk') NOT NULL DEFAULT 'voucher',
  reward_value VARCHAR(255) NULL,
  probability DECIMAL(6,3) NOT NULL DEFAULT 0.000,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  stock INT NULL,
  created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS spin_plays (
  id VARCHAR(15) PRIMARY KEY,
  phone VARCHAR(20) NOT NULL,
  branch_id VARCHAR(15) NULL,
  reward_id VARCHAR(15) NULL,
  is_winner TINYINT(1) NOT NULL DEFAULT 0,
  played_at DATETIME NOT NULL,
  created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_spin_plays_branch FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL,
  CONSTRAINT fk_spin_plays_reward FOREIGN KEY (reward_id) REFERENCES spin_rewards(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS loyalty_members (
  id VARCHAR(15) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255) NULL,
  branch_id VARCHAR(15) NULL,
  points INT NOT NULL DEFAULT 0,
  level ENUM('bronze','silver','gold','platinum') NOT NULL DEFAULT 'bronze',
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_loyalty_members_branch FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL,
  UNIQUE KEY uk_loyalty_members_phone (phone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS loyalty_transactions (
  id VARCHAR(15) PRIMARY KEY,
  member_id VARCHAR(15) NOT NULL,
  branch_id VARCHAR(15) NULL,
  type ENUM('earn','redeem','adjust') NOT NULL DEFAULT 'earn',
  points INT NOT NULL,
  description TEXT NULL,
  reference_id VARCHAR(100) NULL,
  created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_loyalty_transactions_member FOREIGN KEY (member_id) REFERENCES loyalty_members(id) ON DELETE CASCADE,
  CONSTRAINT fk_loyalty_transactions_branch FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS partnerships (
  id VARCHAR(15) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  company VARCHAR(255) NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255) NULL,
  city VARCHAR(100) NULL,
  notes TEXT NULL,
  status ENUM('new','contacted','qualified','closed','rejected') NOT NULL DEFAULT 'new',
  created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS contact_messages (
  id VARCHAR(15) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NULL,
  email VARCHAR(255) NULL,
  subject VARCHAR(255) NULL,
  message TEXT NOT NULL,
  status ENUM('new','read','replied','closed') NOT NULL DEFAULT 'new',
  created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS site_settings (
  id VARCHAR(15) PRIMARY KEY,
  `key` VARCHAR(100) NOT NULL UNIQUE,
  `value` LONGTEXT NOT NULL,
  description TEXT NULL,
  created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO branches (id, name, slug, address, whatsapp, email, description, is_active, status, price_wash, price_dry, sort_order)
VALUES
('br_bohar001','MBA Laundry Bohar','mba-laundry-bohar','Jl. Bohar Raya, Sidoarjo','6281234567890','bohar@mba-laundry.com','Cabang self-service dengan area tunggu nyaman.',1,'buka',10000,10000,1),
('br_pages001','MBA Laundry Pagesangan','mba-laundry-pagesangan','Jl. Pagesangan, Surabaya','6281234567890','pagesangan@mba-laundry.com','Cabang modern dekat area kos dan kampus.',1,'buka',10000,10000,2)
ON DUPLICATE KEY UPDATE name=VALUES(name), updated=CURRENT_TIMESTAMP;

INSERT INTO page_contents (id, `key`, `value`, type, label, `group`) VALUES
('pc001','hero_title','Laundry Sendiri, Bersih Maksimal, Harga Pasti','text','Hero Title','hero'),
('pc002','hero_subtitle','Rp 10.000 cuci · Rp 10.000 kering · Cabang Siap Melayanimu','text','Hero Subtitle','hero'),
('pc003','hero_cta_primary','Pilih Cabang Terdekat','text','Hero CTA Primary','hero'),
('pc004','hero_cta_secondary','Lihat Promo Hari Ini','text','Hero CTA Secondary','hero'),
('pc005','stats_cucian','12000','number','Stat Cucian','stats'),
('pc006','stats_rating','4.9','number','Stat Rating','stats'),
('pc007','announcement_active','false','boolean','Pengumuman Aktif','announcement'),
('pc008','announcement_text','','text','Teks Pengumuman','announcement'),
('pc009','announcement_color','red','text','Warna Pengumuman','announcement'),
('pc010','footer_desc','Laundry self-service modern, mesin bersih, harga transparan.','text','Footer Description','footer'),
('pc011','footer_tagline','Bersih Itu Mudah, Cepat, dan Terjangkau','text','Footer Tagline','footer'),
('pc012','social_instagram','','url','Instagram','footer'),
('pc013','social_tiktok','','url','TikTok','footer'),
('pc014','social_facebook','','url','Facebook','footer'),
('pc015','social_youtube','','url','YouTube','footer'),
('pc016','seo_title','MBA Laundry Express - Self Service Laundry Terpercaya','text','SEO Title','seo'),
('pc017','seo_desc','MBA Laundry Express hadir dengan mesin cuci modern...','text','SEO Description','seo'),
('pc018','whatsapp_cs','6281234567890','text','WhatsApp Customer Service','contact'),
('pc019','how_to_step1_title','Pilih Mesin Kosong','text','How To Step 1 Title','howto'),
('pc020','how_to_step1_desc','Cari mesin cuci atau pengering yang tersedia','text','How To Step 1 Desc','howto'),
('pc021','how_to_step2_title','Bayar & Mulai','text','How To Step 2 Title','howto'),
('pc022','how_to_step2_desc','Scan QRIS atau masukkan koin sesuai tarif','text','How To Step 2 Desc','howto'),
('pc023','how_to_step3_title','Tunggu & Ambil','text','How To Step 3 Title','howto'),
('pc024','how_to_step3_desc','Estimasi 30–40 menit cuci, 20–30 menit kering','text','How To Step 3 Desc','howto')
ON DUPLICATE KEY UPDATE `value`=VALUES(`value`), updated=CURRENT_TIMESTAMP;

INSERT INTO site_settings (id, `key`, `value`, description) VALUES
('ss001','maintenance_mode','0','Global maintenance mode'),
('ss002','spin_enabled','1','Enable spin feature'),
('ss003','loyalty_enabled','1','Enable loyalty feature'),
('ss004','booking_enabled','0','Enable booking module'),
('ss005','max_promo_popup','1','Maximum popup per day'),
('ss006','fonnte_token','','Fonnte API token'),
('ss007','google_analytics_id','','Google analytics id'),
('ss008','meta_pixel_id','','Meta pixel id')
ON DUPLICATE KEY UPDATE `value`=VALUES(`value`), updated=CURRENT_TIMESTAMP;

