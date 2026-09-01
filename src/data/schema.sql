-- ===========================================================================
-- One Way Nepal — MySQL schema (for Spaceship Node.js + MySQL hosting)
--
-- HOW TO RUN ON SPACESHIP:
--   1. Create a MySQL database in the Spaceship panel (name it e.g. oneway_nepal)
--   2. Open the MySQL terminal / run this file as your database user:
--        mysql -u <user> -p -h <host> <database_name> < src/data/schema.sql
--   3. Set the env vars in your Node.js app (see .env.example):
--        DATABASE_HOST / DATABASE_USER / DATABASE_PASSWORD / DATABASE_NAME
--      OR the single string:
--        DATABASE_URL="mysql://user:pass@host:3306/dbname"
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- Blogs
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS blogs (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  slug       VARCHAR(255) UNIQUE NOT NULL,
  title      VARCHAR(255) NOT NULL,
  excerpt    TEXT,
  date       DATE,
  image      VARCHAR(500) DEFAULT NULL,
  content    LONGTEXT NOT NULL,           -- markdown: ## headings, - bullets, ![img](url), [link](url)
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_blogs_date (date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- Careers / Job openings
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS careers (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  title       VARCHAR(255) NOT NULL,
  location    VARCHAR(255) DEFAULT NULL,
  type        VARCHAR(100) DEFAULT NULL,  -- Full-time / Part-time / Contract
  description TEXT,                       -- markdown: bullets, links, headings
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- Legal pages (privacy policy, terms & conditions)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS legal_pages (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  slug       VARCHAR(100) UNIQUE NOT NULL,
  title      VARCHAR(255) NOT NULL,
  content    LONGTEXT NOT NULL,           -- markdown; headings build the on-page TOC
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- Seed the two legal pages (idempotent — safe to run repeatedly)
-- ---------------------------------------------------------------------------
INSERT IGNORE INTO legal_pages (slug, title, content) VALUES
  ('privacy', 'Privacy Policy',
   '## 1. Introduction\n\nWe respect your privacy and are committed to protecting the personal data you share with us.\n\n- We only collect data needed to provide our services\n- We never sell your personal information\n- You can contact us any time to request deletion\n\n## 2. Data we collect\n\nWe may collect your name, email address and project details when you contact us.\n\n## 3. How we use your data\n\nYour data helps us respond to enquiries, deliver projects, and improve our services.'),
  ('terms', 'Terms & Conditions',
   '## 1. Agreement to terms\n\nBy using our website you agree to be bound by these terms and conditions.\n\n## 2. Our services\n\nWe provide branding, design, development and AI services as described on our website.\n\n- All projects are delivered according to a signed agreement\n- Payments are due as per the agreed schedule\n- Intellectual property transfers on final payment\n\n## 3. Limitation of liability\n\nWe are not liable for indirect damages arising from use of our services.');

-- ---------------------------------------------------------------------------
-- Site settings (key/value bag) — optional, reserved for future use
-- ---------------------------------------------------------------------------
-- ---------------------------------------------------------------------------
-- Admin users (login credentials for /admin)
-- Passwords must be stored ONLY has scrypt hashes (see scripts/create-admin.js).
-- SQL-injection proof: the application always uses parameterized queries on this table.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admin_users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  username      VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create an account (run scripts/create-admin.js, which hashes + inserts):
--   node scripts/create-admin.js admin 'your-strong-password'

-- ===========================================================================
CREATE TABLE IF NOT EXISTS site_settings (
  `key`   VARCHAR(100) PRIMARY KEY,
  `value` TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Useful queries -------------------------------------------------------------
-- Show all blogs:
--   SELECT id, slug, title, date FROM blogs ORDER BY date DESC;
-- Find a blog by slug:
--   SELECT * FROM blogs WHERE slug = 'design-that-sells';
-- Reset legal content back to the seed:
--   DELETE FROM legal_pages;  -- then re-run this file
-- Clear all careers:
--   DELETE FROM careers;