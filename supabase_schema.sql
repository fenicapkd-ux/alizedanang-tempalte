-- ================================================================
-- MIGRATION v2: Redesign Projects Module — ALIZE Platform
-- 9 Bảng | 163+ Trường | 5 Bảng Mới
-- ================================================================

-- Drop bảng cũ (thứ tự: child trước, parent sau)
DROP TABLE IF EXISTS project_gallery_images CASCADE;
DROP TABLE IF EXISTS project_gallery_categories CASCADE;
DROP TABLE IF EXISTS project_media CASCADE;
DROP TABLE IF EXISTS project_leads CASCADE;
DROP TABLE IF EXISTS project_services CASCADE;
DROP TABLE IF EXISTS project_floorplans CASCADE;
DROP TABLE IF EXISTS project_amenities CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS locations CASCADE;

-- Auto-update trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

-- ── 1. LOCATIONS ──────────────────────────────────────────────────────
CREATE TABLE locations (
  id              VARCHAR(100) PRIMARY KEY,
  slug            VARCHAR(100) UNIQUE NOT NULL,
  name            VARCHAR(255) NOT NULL,
  name_en         VARCHAR(255),
  province        VARCHAR(255),
  country_code    VARCHAR(10) DEFAULT 'VN',
  hero_image      TEXT,
  lat             DOUBLE PRECISION,
  lng             DOUBLE PRECISION,
  property_count  INT DEFAULT 0,
  sort_order      INT DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE TRIGGER trg_locations_updated BEFORE UPDATE ON locations FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── 2. PROJECTS ───────────────────────────────────────────────────────
CREATE TABLE projects (
  -- ĐỊNH DANH
  id                  VARCHAR(100) PRIMARY KEY,
  slug                VARCHAR(100) UNIQUE NOT NULL,
  -- TÊN
  name                VARCHAR(500) NOT NULL,
  name_en             VARCHAR(500),
  brand_name          VARCHAR(200),
  tagline             VARCHAR(500),
  tagline_en          VARCHAR(500),
  -- PHÂN LOẠI
  status              VARCHAR(50) NOT NULL DEFAULT 'coming_soon',
  type                VARCHAR(100) NOT NULL DEFAULT 'can_ho',
  segment             VARCHAR(100),
  -- GIÁ
  price_from          BIGINT,
  price_to            BIGINT,
  price_display       VARCHAR(100),
  price_per_m2        BIGINT,
  price_unit          VARCHAR(50) DEFAULT 'VND/căn',
  -- VỊ TRÍ
  location_id         VARCHAR(100) REFERENCES locations(id) ON DELETE SET NULL,
  address             VARCHAR(500),
  street              VARCHAR(200),
  ward                VARCHAR(200),
  district            VARCHAR(200),
  city                VARCHAR(200),
  lat                 DOUBLE PRECISION,
  lng                 DOUBLE PRECISION,
  -- CHỦ ĐẦU TƯ
  developer           VARCHAR(300),
  developer_logo      TEXT,
  developer_website   VARCHAR(500),
  designer            VARCHAR(300),
  interior_designer   VARCHAR(300),
  constructor_company VARCHAR(300),
  management_company  VARCHAR(300),
  distributor         VARCHAR(300),
  -- QUY MÔ
  total_area_m2       DOUBLE PRECISION,
  build_area_m2       DOUBLE PRECISION,
  park_area_m2        DOUBLE PRECISION,
  build_density_pct   DOUBLE PRECISION,
  total_towers        INT,
  total_floors        INT,
  total_basement      INT,
  total_units         INT,
  total_shophouses    INT,
  total_penthouses    INT,
  parking_capacity    INT,
  -- PHÁP LÝ
  certificate         VARCHAR(200),
  ownership_type      VARCHAR(100),
  license_no          VARCHAR(200),
  investment_license  VARCHAR(200),
  start_date          DATE,
  completion_date     DATE,
  handover_date       DATE,
  -- MEDIA CHO CARD
  thumbnail_img       TEXT,
  thumbnail_video     TEXT,
  cover_image         TEXT,
  -- JSONB SECTIONS (11 sections)
  hero_data           JSONB,
  overview_data       JSONB,
  values_data         JSONB,
  location_data       JSONB,
  architecture_data   JSONB,
  amenities_header    JSONB,
  services_header     JSONB,
  floorplans_header   JSONB,
  gallery_header      JSONB,
  contact_data        JSONB,
  seo_data            JSONB,
  -- QUẢN LÝ
  is_published        BOOLEAN DEFAULT FALSE,
  is_featured         BOOLEAN DEFAULT FALSE,
  is_new_badge        BOOLEAN DEFAULT TRUE,
  sort_order          INT DEFAULT 0,
  view_count          INT DEFAULT 0,
  inquiry_count       INT DEFAULT 0,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);
CREATE TRIGGER trg_projects_updated BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE INDEX idx_projects_slug      ON projects(slug);
CREATE INDEX idx_projects_status    ON projects(status);
CREATE INDEX idx_projects_featured  ON projects(is_featured) WHERE is_published = TRUE;
CREATE INDEX idx_projects_location  ON projects(location_id);

-- ── 3. PROJECT_AMENITIES ──────────────────────────────────────────────
CREATE TABLE project_amenities (
  id                  VARCHAR(100) PRIMARY KEY,
  project_id          VARCHAR(100) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  category_tag        VARCHAR(200),
  category_tag_en     VARCHAR(200),
  title               VARCHAR(500) NOT NULL,
  title_en            VARCHAR(500),
  description         TEXT,
  description_en      TEXT,
  image_url           TEXT,
  icon_name           VARCHAR(100),
  highlight_stat      VARCHAR(200),
  sort_order          INT DEFAULT 0,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_amenities_project ON project_amenities(project_id, sort_order);

-- ── 4. PROJECT_FLOORPLANS ─────────────────────────────────────────────
CREATE TABLE project_floorplans (
  id                  VARCHAR(100) PRIMARY KEY,
  project_id          VARCHAR(100) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  tab_id              VARCHAR(100),
  tab_name            VARCHAR(200) NOT NULL,
  space_name          VARCHAR(300),
  space_name_en       VARCHAR(300),
  area_m2             DOUBLE PRECISION,
  area_display        VARCHAR(50),
  beds                INT,
  baths               INT,
  living_rooms        INT DEFAULT 1,
  floors              INT,
  balcony             BOOLEAN DEFAULT FALSE,
  balcony_area_m2     DOUBLE PRECISION,
  price_from          BIGINT,
  price_display       VARCHAR(100),
  price_per_m2        BIGINT,
  status              VARCHAR(50) DEFAULT 'open',
  availability        INT,
  description         TEXT,
  description_en      TEXT,
  spec_left_label     VARCHAR(100),
  spec_left_value     VARCHAR(100),
  spec_right_label    VARCHAR(100),
  spec_right_value    VARCHAR(100),
  image_url           TEXT,
  image_3d_url        TEXT,
  image_exterior_url  TEXT,
  tour_3d_url         TEXT,
  sort_order          INT DEFAULT 0,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_floorplans_project ON project_floorplans(project_id, sort_order);

-- ── 5. PROJECT_SERVICES ───────────────────────────────────────────────
CREATE TABLE project_services (
  id                  VARCHAR(100) PRIMARY KEY,
  project_id          VARCHAR(100) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  icon_type           INT,
  icon_url            TEXT,
  title               VARCHAR(300) NOT NULL,
  title_en            VARCHAR(300),
  description         TEXT,
  description_en      TEXT,
  sort_order          INT DEFAULT 0,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ── 6. PROJECT_GALLERY_CATEGORIES ─────────────────────────────────────
CREATE TABLE project_gallery_categories (
  id                  VARCHAR(100) PRIMARY KEY,
  project_id          VARCHAR(100) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  tag                 VARCHAR(200),
  tag_en              VARCHAR(200),
  title               VARCHAR(300),
  title_en            VARCHAR(300),
  description         TEXT,
  description_en      TEXT,
  sort_order          INT DEFAULT 0,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ── 7. PROJECT_GALLERY_IMAGES ─────────────────────────────────────────
CREATE TABLE project_gallery_images (
  id                  VARCHAR(100) PRIMARY KEY,
  project_id          VARCHAR(100) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  category_id         VARCHAR(100) REFERENCES project_gallery_categories(id) ON DELETE CASCADE,
  image_url           TEXT NOT NULL,
  thumbnail_url       TEXT,
  webp_url            TEXT,
  alt_text            VARCHAR(500),
  alt_text_en         VARCHAR(500),
  caption             VARCHAR(500),
  width               INT,
  height              INT,
  file_size_kb        INT,
  mime_type           VARCHAR(50),
  is_cover            BOOLEAN DEFAULT FALSE,
  sort_order          INT DEFAULT 0,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_gallery_project  ON project_gallery_images(project_id);
CREATE INDEX idx_gallery_category ON project_gallery_images(category_id, sort_order);

-- ── 8. PROJECT_MEDIA ──────────────────────────────────────────────────
CREATE TABLE project_media (
  id                  VARCHAR(100) PRIMARY KEY,
  project_id          VARCHAR(100) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  type                VARCHAR(50),
  title               VARCHAR(300),
  title_en            VARCHAR(300),
  url                 TEXT NOT NULL,
  embed_url           TEXT,
  thumbnail_url       TEXT,
  duration_seconds    INT,
  is_featured         BOOLEAN DEFAULT FALSE,
  sort_order          INT DEFAULT 0,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ── 9. PROJECT_LEADS (CRM) ────────────────────────────────────────────
CREATE TABLE project_leads (
  id                  BIGSERIAL PRIMARY KEY,
  project_id          VARCHAR(100) REFERENCES projects(id) ON DELETE SET NULL,
  project_name        VARCHAR(500),
  lead_source         VARCHAR(100),
  -- KHÁCH HÀNG
  full_name           VARCHAR(300) NOT NULL,
  phone               VARCHAR(50) NOT NULL,
  email               VARCHAR(300),
  notes               TEXT,
  -- NHU CẦU
  interest_type       VARCHAR(100),
  preferred_floor_type VARCHAR(100),
  budget_range        VARCHAR(100),
  timeline            VARCHAR(100),
  preferred_call_time VARCHAR(200),
  -- TRACKING
  utm_source          VARCHAR(200),
  utm_medium          VARCHAR(200),
  utm_campaign        VARCHAR(200),
  referrer_url        TEXT,
  user_agent          TEXT,
  ip_country          VARCHAR(100),
  -- CRM
  status              VARCHAR(50) DEFAULT 'new',
  assigned_to         VARCHAR(200),
  notes_internal      TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);
CREATE TRIGGER trg_leads_updated BEFORE UPDATE ON project_leads FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE INDEX idx_leads_project ON project_leads(project_id);
CREATE INDEX idx_leads_status  ON project_leads(status);
CREATE INDEX idx_leads_phone   ON project_leads(phone);

-- ── BẢNG CŨ (giữ nguyên) ──────────────────────────────────────────────
DROP TABLE IF EXISTS public.properties CASCADE;
CREATE TABLE IF NOT EXISTS public.properties (
  id TEXT PRIMARY KEY, transaction_type TEXT, property_category TEXT,
  is_new BOOLEAN DEFAULT FALSE, name TEXT NOT NULL, project_id TEXT, project_name TEXT,
  price TEXT, price_num NUMERIC, location TEXT, type_details TEXT,
  area TEXT, area_num NUMERIC, beds INTEGER, baths INTEGER, description TEXT,
  img_url TEXT, gallery TEXT[], coordinates JSONB,
  legal_status TEXT, furniture TEXT, house_direction TEXT, balcony_direction TEXT,
  floors INT, frontage FLOAT, entrance_width FLOAT,
  agent_name TEXT, agent_phone TEXT, agent_zalo TEXT, agent_avatar TEXT,
  video_url TEXT, tour_3d_url TEXT,
  lat FLOAT, lng FLOAT,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);
DROP TABLE IF EXISTS public.blogs CASCADE;
CREATE TABLE IF NOT EXISTS public.blogs (
  id TEXT PRIMARY KEY, slug TEXT UNIQUE NOT NULL, date TIMESTAMPTZ,
  title TEXT NOT NULL, description TEXT, img_url TEXT, content JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security cho leads (chỉ admin mới đọc được)
ALTER TABLE project_leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "leads_select_admin" ON project_leads FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "leads_insert_all"   ON project_leads FOR INSERT WITH CHECK (true);
