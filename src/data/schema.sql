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

-- ---------------------------------------------------------------------------
-- Testimonials (client reviews shown on the homepage marquee)
-- Managed from /admin → Testimonials. Images are uploaded to /uploads
-- via the admin panel and stored as public paths (e.g. /uploads/xxx.webp).
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS testimonials (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  quote      TEXT NOT NULL,
  name       VARCHAR(150) NOT NULL,
  role       VARCHAR(150) DEFAULT NULL,
  image      VARCHAR(500) DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed the original testimonials (only if the table is empty).
INSERT INTO testimonials (quote, name, role, image)
SELECT * FROM (
  SELECT
    'Love how you can take raw footage and turn it into a professional video with AI.' AS quote,
    'Ram Sherpa' AS name,
    'Founder of' AS `role`,
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80' AS image
  UNION ALL SELECT 'It makes video editing much, much easier.', 'Kiran', 'Founder of', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=160&q=80'
  UNION ALL SELECT 'Having spent years editing video, Capsule is absolutely mindblowing.', 'Xitiz Shrestha', 'Founder of', 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=160&q=80'
  UNION ALL SELECT 'Would have saved a day in Adobe and looks better in less than half the time.', 'Raj Lama', 'Founder of', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=160&q=80'
  UNION ALL SELECT 'Capsule checks all the boxes for creating engaging videos at scale.', 'Shivam Shresthas', 'Founder of', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&q=80'
  UNION ALL SELECT 'Capsule significantly improves the time it takes to create video.', 'Bishnu Shrestha', 'Founder of', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=80'
  UNION ALL SELECT 'There is Apple and then there''s Capsule''s UX and UI. This is world-class execution.', 'Kiran Thapa', 'Founder', 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?auto=format&fit=crop&w=160&q=80'
  UNION ALL SELECT 'Great job making this tech accessible!', 'Eslin Rai', 'Founder', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=160&q=80'
) AS seed
WHERE NOT EXISTS (SELECT 1 FROM testimonials);

-- ---------------------------------------------------------------------------
-- FAQs (homepage Frequently Asked Questions)
-- Managed from /admin → FAQs.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS faqs (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  question   VARCHAR(500) NOT NULL,
  answer     TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed the original FAQs (only if the table is empty).
INSERT INTO faqs (question, answer)
SELECT * FROM (
  SELECT 'What services does One Way Nepal provide?' AS question, 'We provide complete digital solutions, including website design and development, UI/UX design, mobile app design and development, graphic design, branding, and AI-powered chatbot solutions for businesses.' AS answer
  UNION ALL SELECT 'Do you build custom websites?', 'Yes. We create modern, responsive websites tailored to your business goals, brand identity, and specific requirements.'
  UNION ALL SELECT 'Do you provide AI chatbot solutions for businesses?', 'Yes. We build AI-powered chatbots that can answer customer questions, provide business information, generate leads, assist with customer support, and automate repetitive tasks.'
  UNION ALL SELECT 'Can an AI chatbot be added to my existing website?', 'Yes. We can integrate an AI chatbot into your existing website without requiring you to rebuild the entire site.'
  UNION ALL SELECT 'Can your AI chatbots answer questions about my business?', 'Yes. Chatbots can be configured with your business information, services, products, FAQs, documents, and other relevant content so they can provide useful, business-specific responses.'
  UNION ALL SELECT 'Do you design websites as well as develop them?', 'Yes. We offer both UI/UX and website design as well as complete website development. We can take your project from initial concept and design through to a fully functional website.'
  UNION ALL SELECT 'Do you develop mobile applications?', 'Yes. We design and develop modern mobile applications based on your business or product requirements.'
  UNION ALL SELECT 'What graphic design services do you offer?', 'We provide graphic design for social media, marketing materials, promotional campaigns, business profiles, advertisements, and other digital and print materials.'
  UNION ALL SELECT 'Can you help with branding?', 'Yes. We help businesses create a consistent and professional brand identity, including logo design, colors, typography, and other visual brand assets.'
  UNION ALL SELECT 'How long does a project take?', 'The timeline depends on the project''s scope, features, and complexity. After understanding your requirements, we''ll provide an estimated timeline before starting.'
  UNION ALL SELECT 'How much do your services cost?', 'Pricing depends on the type of service, project requirements, features, and complexity. Contact us with your requirements and we''ll provide a suitable quotation.'
  UNION ALL SELECT 'Do you work with businesses outside Lalitpur?', 'Yes. We work with businesses across Nepal and can collaborate remotely with clients from other locations.'
  UNION ALL SELECT 'How can I get started with One Way Nepal?', 'Contact us with your idea or requirements. We''ll understand your needs, recommend the right digital solution, and guide you through the next steps.'
  UNION ALL SELECT 'Where is One Way Nepal located?', 'We are located at Area Chowk, Tikhedebal Marg, Lalitpur 44600, Nepal.'
  UNION ALL SELECT 'How can I contact One Way Nepal?', 'Call us at +977-9828626238 to discuss your project, request a quotation, or learn more about our digital solutions.'
) AS seed
WHERE NOT EXISTS (SELECT 1 FROM faqs);

-- ---------------------------------------------------------------------------
-- Intro stats (homepage "We are…" section counters)
-- Managed from /admin → Intro. The kicker and heading texts are stored in
-- site_settings under the keys 'intro_kicker' and 'intro_heading'.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS intro_stats (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  stat_value INT NOT NULL DEFAULT 0,
  label      VARCHAR(150) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed the original four stats (only if the table is empty).
INSERT INTO intro_stats (stat_value, label, sort_order)
SELECT * FROM (
  SELECT 100 AS stat_value, 'Digital Ideas' AS label, 0 AS sort_order
  UNION ALL SELECT 6,  'Core Services', 1
  UNION ALL SELECT 52, 'Solutions', 2
  UNION ALL SELECT 14, 'Industries', 3
) AS seed
WHERE NOT EXISTS (SELECT 1 FROM intro_stats);

-- ---------------------------------------------------------------------------
-- Services (homepage "Our Services" grid)
-- Managed from /admin → Services. Kicker/heading/"more" count live in
-- site_settings under 'services_kicker', 'services_heading', 'services_more'.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS services (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  label      VARCHAR(200) NOT NULL,
  icon       VARCHAR(60)  NOT NULL DEFAULT 'Code2',
  sort_order INT NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO services (label, icon, sort_order)
SELECT * FROM (
  SELECT 'Web Development' AS label, 'Code2' AS icon, 0 AS sort_order
  UNION ALL SELECT 'Mobile App Development', 'Smartphone', 1
  UNION ALL SELECT 'AI Solutions', 'Bot', 2
  UNION ALL SELECT 'UI/UX Design', 'PenTool', 3
  UNION ALL SELECT 'Graphic Design', 'Palette', 4
  UNION ALL SELECT 'Branding', 'Gem', 5
  UNION ALL SELECT 'Digital Analytics', 'Megaphone', 6
) AS seed
WHERE NOT EXISTS (SELECT 1 FROM services);

-- ---------------------------------------------------------------------------
-- Works (homepage "Selected work!" gallery)
-- Managed from /admin → Work. Heading/subtext live in site_settings under
-- 'work_heading' and 'work_subtext'. Tags are comma-separated.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS works (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  title      VARCHAR(200) NOT NULL,
  text       TEXT NOT NULL,
  image      VARCHAR(500) DEFAULT NULL,
  tags       VARCHAR(500) NOT NULL DEFAULT '',
  sort_order INT NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO works (title, `text`, image, tags, sort_order)
SELECT * FROM (
  SELECT 'Branding Design' AS title, 'Create distinctive brand identities with thoughtful visuals, memorable direction, and a consistent look across every touchpoint.' AS `text`, '/brand.avif' AS image, 'Branding,Strategy,Creative' AS tags, 0 AS sort_order
  UNION ALL SELECT 'Application Design', 'Design intuitive and engaging mobile experiences that combine clean interfaces, smooth interactions, and user-focused functionality.', '/app.avif', 'UI/UX,Mobile,Digital', 1
  UNION ALL SELECT 'AI-Powered Chatbots', 'Build intelligent AI chatbots that answer questions, engage customers, capture leads, automate support, and deliver personalized experiences across your website, WhatsApp, and digital platforms.', '/ai.avif', 'AI,Automation,Support', 2
  UNION ALL SELECT 'Packaging Design', 'Create eye-catching packaging that communicates your brand clearly while making your products stand out on the shelf and online.', '/pack.avif', 'Packaging,Branding,Creative', 3
  UNION ALL SELECT 'Website Design', 'Build modern, responsive websites that combine strong visual design, intuitive experiences, and clear communication for your business.', '/web2.avif', 'Web,Design,Strategy', 4
) AS seed
WHERE NOT EXISTS (SELECT 1 FROM works);

-- ---------------------------------------------------------------------------
-- Pricing (interactive package selector on /pricing)
-- Managed from /admin → Pricing. Each package has three plans
-- (ECONOMIC/BUDGET/STANDARD); plan features are stored as JSON.
-- When pricing_packages is empty the site falls back to built-in defaults.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pricing_packages (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(200) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS pricing_plans (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  package_id INT NOT NULL,
  name       VARCHAR(60) NOT NULL,
  price      VARCHAR(100) NOT NULL DEFAULT '',
  features   TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  INDEX pricing_plans_package_idx (package_id)
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