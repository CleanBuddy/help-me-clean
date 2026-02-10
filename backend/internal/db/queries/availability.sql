-- name: ListCleanerAvailability :many
SELECT * FROM cleaner_availability WHERE cleaner_id = $1 ORDER BY day_of_week, start_time;

-- name: SetCleanerAvailability :one
INSERT INTO cleaner_availability (cleaner_id, day_of_week, start_time, end_time, is_available)
VALUES ($1, $2, $3, $4, $5)
RETURNING *;

-- name: DeleteCleanerAvailability :exec
DELETE FROM cleaner_availability WHERE cleaner_id = $1;
