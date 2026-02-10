-- name: GetCleanerByID :one
SELECT * FROM cleaners WHERE id = $1;

-- name: GetCleanerByUserID :one
SELECT * FROM cleaners WHERE user_id = $1;

-- name: GetCleanerByInviteToken :one
SELECT * FROM cleaners WHERE invite_token = $1;

-- name: ListCleanersByCompany :many
SELECT * FROM cleaners WHERE company_id = $1 ORDER BY created_at DESC;

-- name: CreateCleaner :one
INSERT INTO cleaners (company_id, full_name, phone, email, status, is_company_admin, invite_token, invite_expires_at)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
RETURNING *;

-- name: ListAllActiveCleaners :many
SELECT * FROM cleaners WHERE status = 'active' ORDER BY full_name ASC;

-- name: UpdateCleanerStatus :one
UPDATE cleaners SET status = $2, updated_at = NOW() WHERE id = $1 RETURNING *;

-- name: LinkCleanerToUser :one
UPDATE cleaners SET user_id = $2, status = 'active', updated_at = NOW() WHERE id = $1 RETURNING *;
