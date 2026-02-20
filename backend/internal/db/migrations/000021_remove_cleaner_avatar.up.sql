-- Remove avatar_url from cleaners table - avatar belongs in users table
-- This consolidates avatar storage to the users table as the single source of truth
-- for platform-wide consistency across all user roles (CLIENT, CLEANER, COMPANY_ADMIN, GLOBAL_ADMIN)
ALTER TABLE cleaners DROP COLUMN IF EXISTS avatar_url;
