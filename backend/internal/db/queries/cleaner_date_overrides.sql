-- name: UpsertCleanerDateOverride :one
INSERT INTO cleaner_date_overrides (cleaner_id, override_date, is_available, start_time, end_time)
VALUES ($1, $2, $3, $4, $5)
ON CONFLICT (cleaner_id, override_date)
DO UPDATE SET is_available = EXCLUDED.is_available, start_time = EXCLUDED.start_time, end_time = EXCLUDED.end_time
RETURNING *;

-- name: ListCleanerDateOverrides :many
SELECT * FROM cleaner_date_overrides
WHERE cleaner_id = $1 AND override_date >= $2 AND override_date <= $3
ORDER BY override_date;

-- name: DeleteCleanerDateOverride :exec
DELETE FROM cleaner_date_overrides WHERE cleaner_id = $1 AND override_date = $2;
