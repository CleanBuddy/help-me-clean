-- Restore avatar_url column for rollback
ALTER TABLE cleaners ADD COLUMN avatar_url TEXT;
