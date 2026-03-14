-- ============================================================
-- Migration v2 — Money Tracker (run once in Supabase SQL editor)
-- ============================================================

-- 1. Add type to categories
ALTER TABLE categories
  ADD COLUMN IF NOT EXISTS type TEXT NOT NULL DEFAULT 'expense'
  CHECK (type IN ('expense', 'income'));

-- Default income categories (skip if already seeded)
INSERT INTO categories (name, icon, user_id, type) VALUES
  ('Salary',     '💼', NULL, 'income'),
  ('Freelance',  '💻', NULL, 'income'),
  ('Investment', '📈', NULL, 'income'),
  ('Gift',       '🎁', NULL, 'income'),
  ('Other',      '💰', NULL, 'income')
ON CONFLICT DO NOTHING;

-- 2. Create transactions table (replaces expenses)
CREATE TABLE IF NOT EXISTS transactions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  type        TEXT NOT NULL CHECK (type IN ('expense', 'income')),
  amount      NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  description TEXT,
  date        DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- (no existing expenses table to migrate)

-- updated_at trigger for transactions
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS transactions_updated_at ON transactions;
CREATE TRIGGER transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 3. Assets table
CREATE TABLE IF NOT EXISTS assets (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  category      TEXT NOT NULL CHECK (category IN ('cash', 'investment', 'property', 'vehicle', 'other')),
  current_value NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (current_value >= 0),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS assets_updated_at ON assets;
CREATE TRIGGER assets_updated_at
  BEFORE UPDATE ON assets
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 4. Asset snapshots (one row per asset per month)
CREATE TABLE IF NOT EXISTS asset_snapshots (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id   UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  value      NUMERIC(12, 2) NOT NULL CHECK (value >= 0),
  year       SMALLINT NOT NULL,
  month      SMALLINT NOT NULL CHECK (month BETWEEN 1 AND 12),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (asset_id, year, month)
);

-- 5. User settings
CREATE TABLE IF NOT EXISTS user_settings (
  user_id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  currency_code   TEXT NOT NULL DEFAULT 'USD',
  currency_symbol TEXT NOT NULL DEFAULT '$',
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS user_settings_updated_at ON user_settings;
CREATE TRIGGER user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- RLS
-- ============================================================

-- Transactions
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "transactions_select" ON transactions;
DROP POLICY IF EXISTS "transactions_insert" ON transactions;
DROP POLICY IF EXISTS "transactions_update" ON transactions;
DROP POLICY IF EXISTS "transactions_delete" ON transactions;
CREATE POLICY "transactions_select" ON transactions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "transactions_insert" ON transactions FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "transactions_update" ON transactions FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "transactions_delete" ON transactions FOR DELETE USING (user_id = auth.uid());

-- Assets
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "assets_select" ON assets;
DROP POLICY IF EXISTS "assets_insert" ON assets;
DROP POLICY IF EXISTS "assets_update" ON assets;
DROP POLICY IF EXISTS "assets_delete" ON assets;
CREATE POLICY "assets_select" ON assets FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "assets_insert" ON assets FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "assets_update" ON assets FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "assets_delete" ON assets FOR DELETE USING (user_id = auth.uid());

-- Asset snapshots
ALTER TABLE asset_snapshots ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "snapshots_select" ON asset_snapshots;
DROP POLICY IF EXISTS "snapshots_insert" ON asset_snapshots;
DROP POLICY IF EXISTS "snapshots_update" ON asset_snapshots;
DROP POLICY IF EXISTS "snapshots_delete" ON asset_snapshots;
CREATE POLICY "snapshots_select" ON asset_snapshots FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "snapshots_insert" ON asset_snapshots FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "snapshots_update" ON asset_snapshots FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "snapshots_delete" ON asset_snapshots FOR DELETE USING (user_id = auth.uid());

-- User settings
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "settings_select" ON user_settings;
DROP POLICY IF EXISTS "settings_insert" ON user_settings;
DROP POLICY IF EXISTS "settings_update" ON user_settings;
CREATE POLICY "settings_select" ON user_settings FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "settings_insert" ON user_settings FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "settings_update" ON user_settings FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
