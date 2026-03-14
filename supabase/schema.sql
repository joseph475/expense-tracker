-- ============================================================
-- Expense Tracker Schema
-- ============================================================

-- ============================================================
-- CATEGORIES TABLE
-- user_id NULL  → default/global category
-- user_id set   → custom category owned by that user
-- ============================================================
CREATE TABLE IF NOT EXISTS categories (
  id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name    TEXT NOT NULL,
  icon    TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- ============================================================
-- EXPENSES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS expenses (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  amount      NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  description TEXT,
  date        DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at on row change
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER expenses_updated_at
  BEFORE UPDATE ON expenses
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- SEED DATA — Default categories (user_id IS NULL)
-- ============================================================
INSERT INTO categories (name, icon, user_id) VALUES
  ('Food',          '🍔', NULL),
  ('Transport',     '🚌', NULL),
  ('Rent',          '🏠', NULL),
  ('Entertainment', '🎬', NULL),
  ('Health',        '💊', NULL);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- Categories --------------------------------------------------
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Read: default categories (user_id IS NULL) OR own custom categories
CREATE POLICY "categories_select"
  ON categories FOR SELECT
  USING (user_id IS NULL OR user_id = auth.uid());

-- Insert: only own categories
CREATE POLICY "categories_insert"
  ON categories FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Update: only own categories
CREATE POLICY "categories_update"
  ON categories FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Delete: only own categories
CREATE POLICY "categories_delete"
  ON categories FOR DELETE
  USING (user_id = auth.uid());

-- Expenses ----------------------------------------------------
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "expenses_select"
  ON expenses FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "expenses_insert"
  ON expenses FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "expenses_update"
  ON expenses FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "expenses_delete"
  ON expenses FOR DELETE
  USING (user_id = auth.uid());
