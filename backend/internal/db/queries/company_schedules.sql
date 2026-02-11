-- name: ListCompanyWorkSchedule :many
SELECT * FROM company_work_schedules WHERE company_id = $1 ORDER BY day_of_week;

-- name: UpsertCompanyWorkScheduleDay :one
INSERT INTO company_work_schedules (company_id, day_of_week, start_time, end_time, is_work_day)
VALUES ($1, $2, $3, $4, $5)
ON CONFLICT (company_id, day_of_week)
DO UPDATE SET start_time = EXCLUDED.start_time, end_time = EXCLUDED.end_time, is_work_day = EXCLUDED.is_work_day
RETURNING *;

-- name: DeleteCompanyWorkSchedule :exec
DELETE FROM company_work_schedules WHERE company_id = $1;
