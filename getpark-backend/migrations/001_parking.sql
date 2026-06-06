-- GetPark AI - Supabase Migration
-- Supabase SQL Editor'da bu dosyayı çalıştır

-- UUID extension (Supabase'de varsayılan olarak açık)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =========================================================
-- parking_spots: Park noktalarının konumu ve güncel skoru
-- =========================================================
CREATE TABLE IF NOT EXISTS parking_spots (
    id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    latitude        DOUBLE PRECISION NOT NULL,
    longitude       DOUBLE PRECISION NOT NULL,
    urban_index     INTEGER NOT NULL DEFAULT 0 CHECK (urban_index BETWEEN 0 AND 100),
    organization_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Coğrafi sorgu için index
CREATE INDEX IF NOT EXISTS idx_parking_spots_coords ON parking_spots (latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_parking_spots_org ON parking_spots (organization_id);
CREATE INDEX IF NOT EXISTS idx_parking_spots_index ON parking_spots (urban_index DESC);

-- =========================================================
-- parking_analyses: Tekil analiz sonuçları (KVKK uyumlu)
-- =========================================================
CREATE TABLE IF NOT EXISTS parking_analyses (
    id                  TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    spot_id             TEXT NOT NULL REFERENCES parking_spots(id) ON DELETE CASCADE,
    empty_spaces        INTEGER NOT NULL DEFAULT 0,
    occupied_spaces     INTEGER NOT NULL DEFAULT 0,
    has_disabled        BOOLEAN NOT NULL DEFAULT false,
    disabled_blocked    BOOLEAN NOT NULL DEFAULT false,
    sidewalk_blocked    BOOLEAN NOT NULL DEFAULT false,
    accessibility_score INTEGER NOT NULL DEFAULT 0,
    confidence          DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    image_url           TEXT NOT NULL DEFAULT '',
    delete_after        TIMESTAMPTZ NOT NULL,    -- KVKK: ham görüntü 24 saat sonra silinir
    source              TEXT NOT NULL CHECK (source IN ('user_photo', 'streetview')),
    kvkk_blur_applied   BOOLEAN NOT NULL DEFAULT true,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_parking_analyses_spot ON parking_analyses (spot_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_parking_analyses_delete ON parking_analyses (delete_after) WHERE image_url != '';

-- =========================================================
-- KVKK: Otomatik görüntü silme fonksiyonu
-- pg_cron ile her saat çalıştırılabilir:
--   SELECT cron.schedule('kvkk-cleanup', '0 * * * *', 'SELECT kvkk_cleanup_images()');
-- =========================================================
CREATE OR REPLACE FUNCTION kvkk_cleanup_images()
RETURNS INTEGER AS $$
DECLARE
    affected INTEGER;
BEGIN
    UPDATE parking_analyses
    SET image_url = ''
    WHERE delete_after < NOW() AND image_url != '';
    GET DIAGNOSTICS affected = ROW_COUNT;
    RETURN affected;
END;
$$ LANGUAGE plpgsql;

-- =========================================================
-- Demo data (hackathon gösterimi için İstanbul noktaları)
-- =========================================================
INSERT INTO parking_spots (id, latitude, longitude, urban_index) VALUES
    ('demo-spot-1', 41.0082,  28.9784, 82),   -- Sultanahmet (düşük risk)
    ('demo-spot-2', 41.0136,  28.9550, 45),   -- Beyazıt (orta risk)
    ('demo-spot-3', 41.0370,  28.9850, 28),   -- Şişli (yüksek risk)
    ('demo-spot-4', 41.0480,  29.0080, 67),   -- Beşiktaş
    ('demo-spot-5', 41.0212,  29.0102, 55)    -- Kadıköy
ON CONFLICT (id) DO NOTHING;
