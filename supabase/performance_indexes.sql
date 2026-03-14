-- Performance optimization indexes for expense tracker
-- Run these in your Supabase SQL editor to improve query performance
-- Make sure you've run migration_v2.sql and migration_v3_transfers.sql first

-- Check if transactions table exists, if not, skip indexes
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'transactions') THEN
    
    -- Index for transactions by user_id and date (most common query pattern)
    CREATE INDEX IF NOT EXISTS idx_transactions_user_date 
    ON transactions (user_id, date DESC, created_at DESC);

    -- Index for transactions by user_id and account_id (for account filtering)
    CREATE INDEX IF NOT EXISTS idx_transactions_user_account 
    ON transactions (user_id, account_id) WHERE account_id IS NOT NULL;

    -- Index for transactions by user_id and to_account_id (for transfer filtering)
    CREATE INDEX IF NOT EXISTS idx_transactions_user_to_account 
    ON transactions (user_id, to_account_id) WHERE to_account_id IS NOT NULL;

    -- Index for transactions by user_id and category_id (for category filtering)
    CREATE INDEX IF NOT EXISTS idx_transactions_user_category 
    ON transactions (user_id, category_id) WHERE category_id IS NOT NULL;

    -- Index for transactions by user_id and type (for filtering by expense/income/transfer)
    CREATE INDEX IF NOT EXISTS idx_transactions_user_type 
    ON transactions (user_id, type, date DESC);

    -- Composite index for transaction search and filtering
    CREATE INDEX IF NOT EXISTS idx_transactions_search 
    ON transactions (user_id, type, date DESC) 
    INCLUDE (amount, description, category_id, account_id, to_account_id);

    RAISE NOTICE 'Transaction indexes created successfully';
  ELSE
    RAISE NOTICE 'Transactions table not found. Please run migration_v2.sql first.';
  END IF;
END
$$;

-- Index for assets by user_id (frequently accessed)
CREATE INDEX IF NOT EXISTS idx_assets_user 
ON assets (user_id, name);

-- Index for categories by user_id (for user-specific categories)
CREATE INDEX IF NOT EXISTS idx_categories_user 
ON categories (user_id, name) WHERE user_id IS NOT NULL;

-- Index for categories by type (for filtering expense vs income categories)
CREATE INDEX IF NOT EXISTS idx_categories_type 
ON categories (type, name);

-- Check if asset_snapshots table exists before creating index
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'asset_snapshots') THEN
    -- Index for asset snapshots (uses year, month instead of date)
    CREATE INDEX IF NOT EXISTS idx_asset_snapshots_asset_time
    ON asset_snapshots (asset_id, year DESC, month DESC);
    
    -- Index for asset snapshots by user and time
    CREATE INDEX IF NOT EXISTS idx_asset_snapshots_user_time
    ON asset_snapshots (user_id, year DESC, month DESC);
    
    RAISE NOTICE 'Asset snapshots indexes created successfully';
  ELSE
    RAISE NOTICE 'Asset snapshots table not found, skipping related indexes';
  END IF;
END
$$;

-- Analyze tables to update statistics (only if they exist)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'transactions') THEN
    ANALYZE transactions;
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'assets') THEN
    ANALYZE assets;
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'categories') THEN
    ANALYZE categories;
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'asset_snapshots') THEN
    ANALYZE asset_snapshots;
  END IF;
END
$$;

-- Display completion message
SELECT 'Performance indexes setup completed!' as status;