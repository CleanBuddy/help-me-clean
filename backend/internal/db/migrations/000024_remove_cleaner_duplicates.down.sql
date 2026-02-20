-- Rollback migration 000024

-- Remove unique constraint
ALTER TABLE cleaners DROP CONSTRAINT IF EXISTS cleaners_user_id_unique;

-- Re-add dropped columns
ALTER TABLE cleaners ADD COLUMN full_name VARCHAR(255);
ALTER TABLE cleaners ADD COLUMN email VARCHAR(255);
ALTER TABLE cleaners ADD COLUMN phone VARCHAR(50);

-- Populate from users table
UPDATE cleaners c
SET
    full_name = u.full_name,
    email = u.email,
    phone = u.phone
FROM users u
WHERE c.user_id = u.id;

-- Make full_name NOT NULL (it was required before)
UPDATE cleaners SET full_name = 'Unknown' WHERE full_name IS NULL;
ALTER TABLE cleaners ALTER COLUMN full_name SET NOT NULL;

-- Make user_id nullable again
ALTER TABLE cleaners ALTER COLUMN user_id DROP NOT NULL;
