-- ============================================================
-- Migration v3 — Add Transfer Support
-- ============================================================

-- 1. Update transactions table to support transfers
-- Add 'transfer' as a valid transaction type
ALTER TABLE transactions 
DROP CONSTRAINT IF EXISTS transactions_type_check;

ALTER TABLE transactions 
ADD CONSTRAINT transactions_type_check 
CHECK (type IN ('expense', 'income', 'transfer'));

-- 2. Make category_id nullable for transfer transactions
ALTER TABLE transactions 
ALTER COLUMN category_id DROP NOT NULL;

-- 3. Add constraint to ensure category_id is required for expense/income but not for transfers
ALTER TABLE transactions 
ADD CONSTRAINT transactions_category_required 
CHECK (
  (type IN ('expense', 'income') AND category_id IS NOT NULL) OR 
  (type = 'transfer' AND category_id IS NULL)
);

-- 4. Add account_id column to transactions table for asset tracking
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS account_id UUID REFERENCES assets(id) ON DELETE RESTRICT;

-- 5. Add to_account_id column for transfer transactions
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS to_account_id UUID REFERENCES assets(id) ON DELETE RESTRICT;

-- 6. Add constraint to ensure to_account_id is required for transfers
ALTER TABLE transactions 
ADD CONSTRAINT transactions_transfer_accounts 
CHECK (
  (type != 'transfer') OR 
  (type = 'transfer' AND account_id IS NOT NULL AND to_account_id IS NOT NULL AND account_id != to_account_id)
);