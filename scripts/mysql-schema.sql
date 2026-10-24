-- ============================================================================
-- MBA Laundry Express — MySQL schema
-- ----------------------------------------------------------------------------
-- Definisi 19 tabel yang dipakai API server (server/index.mjs).
-- Kolom tiap tabel dibuat 1:1 dari skema aplikasi.
--
-- Run once:
--   mysql -u noval -p laundry < scripts/mysql-schema.sql
-- or paste into phpMyAdmin > SQL tab.
--
-- Pemetaan tipe kolom:
--   text      -> TEXT / VARCHAR(n)
--   number    -> INT or BIGINT
--   bool      -> TINYINT(1)
--   date      -> DATETIME (UTC)
--   json      -> JSON
--   relation  -> VARCHAR(15) (menyimpan id record terkait, tanpa FK constraint)
-- ============================================================================

SET NAMES utf8mb4;
SET time_zone = '+00:00';

-- ---------------------------------------------------------------------------
-- 1. branches
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `branches` (
  `id`          VARCHAR(15)  NOT NULL COMMENT 'id record (string acak 15 char)',
  `name`        VARCHAR(191) NOT NULL,
  `slug`        VARCHAR(191) NOT NULL,
  `address`     TEXT         NULL,
  `maps_url`    VARCHAR(500) NULL,
  `maps_embed`  TEXT         NULL,
  `whatsapp`    VARCHAR(32)  NULL,
  `email`       VARCHAR(191) NULL,
  `description` TEXT         NULL,
  `cover_image` VARCHAR(500) NULL,
  `is_active`   TINYINT(1)   NOT NULL DEFAULT 1,
  `status`      VARCHAR(16)  NOT NULL DEFAULT 'buka',
  `price_wash`  INT          NOT NULL DEFAULT 0,
  `price_dry`   INT          NOT NULL DEFAULT 0,
  `sort_order`  INT          NOT NULL DEFAULT 0,
  `created`     DATETIME     NULL,
  `updated`     DATETIME     NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_branches_slug` (`slug`),
  KEY `ix_branches_active` (`is_active`, `sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 2. branch_hours
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `branch_hours` (
  `id`         VARCHAR(15)  NOT NULL,
  `branch_id`  VARCHAR(15)  NOT NULL,
  `day`        VARCHAR(16)  NOT NULL,
  `open_time`  VARCHAR(8)   NULL COMMENT 'HH:MM',
  `close_time` VARCHAR(8)   NULL COMMENT 'HH:MM',
  `is_closed`  TINYINT(1)   NOT NULL DEFAULT 0,
  `created`    DATETIME     NULL,
  `updated`    DATETIME     NULL,
  PRIMARY KEY (`id`),
  KEY `ix_branch_hours_branch` (`branch_id`),
  KEY `ix_branch_hours_day` (`branch_id`, `day`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 3. branch_facilities
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `branch_facilities` (
  `id`         VARCHAR(15)  NOT NULL,
  `branch_id`  VARCHAR(15)  NOT NULL,
  `name`       VARCHAR(191) NOT NULL,
  `icon`       VARCHAR(191) NULL,
  `sort_order` INT          NOT NULL DEFAULT 0,
  `created`    DATETIME     NULL,
  `updated`    DATETIME     NULL,
  PRIMARY KEY (`id`),
  KEY `ix_branch_facilities_branch` (`branch_id`, `sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 4. branch_gallery
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `branch_gallery` (
  `id`        VARCHAR(15)  NOT NULL,
  `branch_id` VARCHAR(15)  NULL,
  `image`     VARCHAR(500) NOT NULL,
  `caption`   VARCHAR(500) NULL,
  `created`   DATETIME     NULL,
  `updated`   DATETIME     NULL,
  PRIMARY KEY (`id`),
  KEY `ix_branch_gallery_branch` (`branch_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 5. promos
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `promos` (
  `id`           VARCHAR(15)  NOT NULL,
  `title`        VARCHAR(191) NOT NULL,
  `slug`         VARCHAR(191) NOT NULL,
  `description`  TEXT         NULL,
  `image`        VARCHAR(500) NULL,
  `terms`        TEXT         NULL,
  `start_date`   DATETIME     NULL,
  `end_date`     DATETIME     NULL,
  `is_active`    TINYINT(1)   NOT NULL DEFAULT 1,
  `show_on_home` TINYINT(1)   NOT NULL DEFAULT 0,
  `is_global`    TINYINT(1)   NOT NULL DEFAULT 1,
  `priority`     INT          NOT NULL DEFAULT 0,
  `status`       VARCHAR(16)  NOT NULL DEFAULT 'draft',
  `created`      DATETIME     NULL,
  `updated`      DATETIME     NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_promos_slug` (`slug`),
  KEY `ix_promos_active` (`is_active`, `status`, `end_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 6. promo_branches
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `promo_branches` (
  `id`        VARCHAR(15) NOT NULL,
  `promo_id`  VARCHAR(15) NOT NULL,
  `branch_id` VARCHAR(15) NOT NULL,
  `created`   DATETIME    NULL,
  `updated`   DATETIME    NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_promo_branch` (`promo_id`, `branch_id`),
  KEY `ix_promo_branches_branch` (`branch_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 7. jobs
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `jobs` (
  `id`            VARCHAR(15)  NOT NULL,
  `title`         VARCHAR(191) NOT NULL,
  `description`   TEXT         NULL,
  `requirements`  TEXT         NULL,
  `benefits`      TEXT         NULL,
  `type`          VARCHAR(16)  NOT NULL DEFAULT 'full-time',
  `branch_id`     VARCHAR(15)  NULL,
  `salary_min`    BIGINT       NULL,
  `salary_max`    BIGINT       NULL,
  `show_salary`   TINYINT(1)   NOT NULL DEFAULT 0,
  `is_open`       TINYINT(1)   NOT NULL DEFAULT 1,
  `whatsapp_apply` VARCHAR(32) NULL,
  `posted_at`     DATETIME     NULL,
  `closed_at`     DATETIME     NULL,
  `image`         VARCHAR(500) NULL,
  `created`       DATETIME     NULL,
  `updated`       DATETIME     NULL,
  PRIMARY KEY (`id`),
  KEY `ix_jobs_open` (`is_open`, `posted_at`),
  KEY `ix_jobs_branch` (`branch_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 8. articles
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `articles` (
  `id`           VARCHAR(15)  NOT NULL,
  `title`        VARCHAR(191) NOT NULL,
  `slug`         VARCHAR(191) NOT NULL,
  `content`      LONGTEXT     NULL COMMENT 'HTML from the rich text editor',
  `excerpt`      TEXT         NULL,
  `thumbnail`    VARCHAR(500) NULL,
  `category`     VARCHAR(32)  NOT NULL DEFAULT 'umum',
  `tags`         JSON         NULL,
  `meta_title`   VARCHAR(191) NULL,
  `meta_desc`    VARCHAR(500) NULL,
  `author`       VARCHAR(191) NULL,
  `read_time`    INT          NULL,
  `status`       VARCHAR(16)  NOT NULL DEFAULT 'draft',
  `published_at` DATETIME     NULL,
  `views`        BIGINT       NOT NULL DEFAULT 0,
  `created`      DATETIME     NULL,
  `updated`      DATETIME     NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_articles_slug` (`slug`),
  KEY `ix_articles_status` (`status`, `published_at`),
  KEY `ix_articles_category` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 9. testimonials
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `testimonials` (
  `id`            VARCHAR(15)  NOT NULL,
  `customer_name` VARCHAR(191) NOT NULL,
  `branch_id`     VARCHAR(15)  NULL,
  `rating`        INT          NOT NULL DEFAULT 5,
  `comment`       TEXT         NULL,
  `photo`         VARCHAR(500) NULL,
  `is_approved`   TINYINT(1)   NOT NULL DEFAULT 0,
  `source`        VARCHAR(16)  NOT NULL DEFAULT 'website',
  `created`       DATETIME     NULL,
  `updated`       DATETIME     NULL,
  PRIMARY KEY (`id`),
  KEY `ix_testimonials_approved` (`is_approved`),
  KEY `ix_testimonials_branch` (`branch_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 10. faqs
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `faqs` (
  `id`         VARCHAR(15) NOT NULL,
  `question`   TEXT        NOT NULL,
  `answer`     TEXT        NOT NULL,
  `category`   VARCHAR(32) NOT NULL DEFAULT 'umum',
  `branch_id`  VARCHAR(15) NULL,
  `sort_order` INT         NOT NULL DEFAULT 0,
  `is_active`  TINYINT(1)  NOT NULL DEFAULT 1,
  `created`    DATETIME    NULL,
  `updated`    DATETIME    NULL,
  PRIMARY KEY (`id`),
  KEY `ix_faqs_active` (`is_active`, `category`, `sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 11. page_contents
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `page_contents` (
  `id`          VARCHAR(15)  NOT NULL,
  `key`         VARCHAR(191) NOT NULL,
  `value`       LONGTEXT     NULL,
  `type`        VARCHAR(16)  NOT NULL DEFAULT 'text',
  `label`       VARCHAR(191) NULL,
  `description` TEXT         NULL,
  `group`       VARCHAR(64)  NULL COMMENT 'reserved word in MySQL, always backtick it',
  `created`     DATETIME     NULL,
  `updated`     DATETIME     NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_page_contents_key` (`key`),
  KEY `ix_page_contents_group` (`group`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 12. spin_rewards
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `spin_rewards` (
  `id`           VARCHAR(15)  NOT NULL,
  `name`         VARCHAR(191) NOT NULL,
  `description`  TEXT         NULL,
  `reward_type`  VARCHAR(16)  NOT NULL DEFAULT 'zonk',
  `reward_value` VARCHAR(191) NULL,
  `probability`  INT          NOT NULL DEFAULT 0,
  `is_active`    TINYINT(1)   NOT NULL DEFAULT 1,
  `stock`        INT          NULL,
  `created`      DATETIME     NULL,
  `updated`      DATETIME     NULL,
  PRIMARY KEY (`id`),
  KEY `ix_spin_rewards_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 13. spin_plays
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `spin_plays` (
  `id`         VARCHAR(15) NOT NULL,
  `phone`      VARCHAR(32) NOT NULL,
  `branch_id`  VARCHAR(15) NULL,
  `reward_id`  VARCHAR(15) NULL,
  `is_winner`  TINYINT(1)  NOT NULL DEFAULT 0,
  `played_at`  DATETIME    NULL,
  `created`    DATETIME    NULL,
  `updated`    DATETIME    NULL,
  PRIMARY KEY (`id`),
  KEY `ix_spin_plays_phone` (`phone`),
  KEY `ix_spin_plays_played` (`played_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 14. loyalty_members
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `loyalty_members` (
  `id`        VARCHAR(15)  NOT NULL,
  `name`      VARCHAR(191) NOT NULL,
  `phone`     VARCHAR(32)  NOT NULL,
  `email`     VARCHAR(191) NULL,
  `branch_id` VARCHAR(15)  NULL,
  `points`    INT          NOT NULL DEFAULT 0,
  `level`     VARCHAR(16)  NOT NULL DEFAULT 'bronze',
  `is_active` TINYINT(1)   NOT NULL DEFAULT 1,
  `created`   DATETIME     NULL,
  `updated`   DATETIME     NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_loyalty_phone` (`phone`),
  KEY `ix_loyalty_level` (`level`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 15. loyalty_transactions
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `loyalty_transactions` (
  `id`           VARCHAR(15)  NOT NULL,
  `member_id`    VARCHAR(15)  NOT NULL,
  `branch_id`    VARCHAR(15)  NULL,
  `type`         VARCHAR(16)  NOT NULL DEFAULT 'earn',
  `points`       INT          NOT NULL DEFAULT 0,
  `description`  VARCHAR(500) NULL,
  `reference_id` VARCHAR(64)  NULL,
  `created`      DATETIME     NULL,
  `updated`      DATETIME     NULL,
  PRIMARY KEY (`id`),
  KEY `ix_loyalty_tx_member` (`member_id`, `created`),
  KEY `ix_loyalty_tx_type` (`type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 16. partnerships
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `partnerships` (
  `id`      VARCHAR(15)  NOT NULL,
  `name`    VARCHAR(191) NOT NULL,
  `company` VARCHAR(191) NULL,
  `phone`   VARCHAR(32)  NULL,
  `email`   VARCHAR(191) NULL,
  `city`    VARCHAR(191) NULL,
  `notes`   TEXT         NULL,
  `status`  VARCHAR(16)  NOT NULL DEFAULT 'new',
  `created` DATETIME     NULL,
  `updated` DATETIME     NULL,
  PRIMARY KEY (`id`),
  KEY `ix_partnerships_status` (`status`, `created`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 17. contact_messages
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `contact_messages` (
  `id`      VARCHAR(15)  NOT NULL,
  `name`    VARCHAR(191) NOT NULL,
  `phone`   VARCHAR(32)  NULL,
  `email`   VARCHAR(191) NULL,
  `subject` VARCHAR(191) NULL,
  `message` TEXT         NOT NULL,
  `status`  VARCHAR(16)  NOT NULL DEFAULT 'new',
  `created` DATETIME     NULL,
  `updated` DATETIME     NULL,
  PRIMARY KEY (`id`),
  KEY `ix_contact_status` (`status`, `created`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 18. site_settings
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `site_settings` (
  `id`          VARCHAR(15)  NOT NULL,
  `key`         VARCHAR(191) NOT NULL,
  `value`       LONGTEXT     NULL,
  `description` TEXT         NULL,
  `created`     DATETIME     NULL,
  `updated`     DATETIME     NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_site_settings_key` (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
