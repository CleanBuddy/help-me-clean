-- ============================================
-- DROP CLEANER DOCUMENTS TABLE
-- ============================================
DROP TABLE IF EXISTS cleaner_documents;

-- ============================================
-- REMOVE REVIEW COLUMNS FROM company_documents
-- ============================================
ALTER TABLE company_documents
    DROP COLUMN IF EXISTS rejection_reason,
    DROP COLUMN IF EXISTS reviewed_by,
    DROP COLUMN IF EXISTS reviewed_at,
    DROP COLUMN IF EXISTS status;

-- ============================================
-- NOTE: Cannot remove 'pending_review' from cleaner_status enum.
-- PostgreSQL does not support removing individual values from an
-- existing enum type. To fully revert, you would need to:
--   1. Create a new enum without 'pending_review'
--   2. Migrate all columns using the old enum to the new one
--   3. Drop the old enum and rename the new one
-- This is intentionally left as a no-op for safety.
-- ============================================
