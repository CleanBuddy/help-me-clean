-- name: GetCleanerByID :one
SELECT * FROM cleaners WHERE id = $1;

-- name: GetCleanerByUserID :one
SELECT * FROM cleaners WHERE user_id = $1;

-- name: GetCleanerByInviteToken :one
SELECT * FROM cleaners WHERE invite_token = $1;

-- name: ListCleanersByCompany :many
SELECT * FROM cleaners WHERE company_id = $1 ORDER BY created_at DESC;

-- name: CreateCleanerUser :one
INSERT INTO users (email, full_name, phone, role, status, created_at, updated_at)
VALUES ($1, $2, $3, 'cleaner'::user_role, $4, NOW(), NOW())
RETURNING *;

-- name: CreateCleanerProfile :one
INSERT INTO cleaners (user_id, company_id, status, is_company_admin, invite_token, invite_expires_at)
VALUES ($1, $2, $3, $4, $5, $6)
RETURNING *;

-- name: ListAllActiveCleaners :many
SELECT
    c.id,
    c.user_id,
    c.company_id,
    c.status,
    c.is_company_admin,
    c.invite_token,
    c.invite_expires_at,
    c.bio,
    c.rating_avg,
    c.total_jobs_completed,
    c.created_at,
    c.updated_at
FROM cleaners c
JOIN users u ON c.user_id = u.id
WHERE c.status = 'active'
ORDER BY u.full_name ASC;

-- name: UpdateCleanerStatus :one
UPDATE cleaners SET status = $2, updated_at = NOW() WHERE id = $1 RETURNING *;

-- name: LinkCleanerToUser :one
UPDATE cleaners SET user_id = $2, status = 'pending_review', updated_at = NOW() WHERE id = $1 RETURNING *;

-- name: ActivateCleanerStatus :one
UPDATE cleaners SET status = 'active', updated_at = NOW() WHERE id = $1 RETURNING *;

-- name: UpdateCleanerBio :one
UPDATE cleaners SET
    bio = $2,
    updated_at = NOW()
WHERE id = $1 RETURNING *;

-- name: UpdateCleanerUserPhone :exec
UPDATE users
SET phone = $2, updated_at = NOW()
WHERE id = (SELECT user_id FROM cleaners WHERE cleaners.id = $1);

-- name: GetCleanerPerformanceStats :one
SELECT
    c.id,
    u.full_name,
    c.rating_avg,
    COUNT(b.id) FILTER (WHERE b.status = 'completed')::bigint AS total_completed_jobs,
    COUNT(b.id) FILTER (WHERE b.status = 'completed' AND b.completed_at >= date_trunc('month', CURRENT_DATE))::bigint AS this_month_completed,
    COALESCE(SUM(COALESCE(b.final_total, b.estimated_total)) FILTER (WHERE b.status = 'completed'), 0)::numeric AS total_earnings,
    COALESCE(SUM(COALESCE(b.final_total, b.estimated_total)) FILTER (WHERE b.status = 'completed' AND b.completed_at >= date_trunc('month', CURRENT_DATE)), 0)::numeric AS this_month_earnings
FROM cleaners c
JOIN users u ON c.user_id = u.id
LEFT JOIN bookings b ON b.cleaner_id = c.id
WHERE c.id = $1
GROUP BY c.id, u.full_name, c.rating_avg;

-- DEPRECATED: Avatar now stored in users table (see users.sql UpdateUserAvatar)
-- -- name: UpdateCleanerAvatar :one
-- UPDATE cleaners SET avatar_url = $2, updated_at = NOW() WHERE id = $1 RETURNING *;
