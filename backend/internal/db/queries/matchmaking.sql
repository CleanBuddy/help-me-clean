-- name: FindMatchingCleaners :many
SELECT DISTINCT c.id, u.full_name, c.rating_avg, c.total_jobs_completed,
       co.company_name, co.id AS company_id
FROM cleaners c
JOIN users u ON c.user_id = u.id
JOIN companies co ON c.company_id = co.id
JOIN company_service_areas csa ON csa.company_id = co.id AND csa.city_area_id = $1
JOIN cleaner_service_areas cla ON cla.cleaner_id = c.id AND cla.city_area_id = $1
WHERE c.status = 'active'
  AND co.status = 'approved'
ORDER BY c.rating_avg DESC, c.total_jobs_completed DESC;

-- name: ListCleanerBookingsForDate :many
SELECT id, scheduled_start_time, estimated_duration_hours
FROM bookings
WHERE cleaner_id = $1
  AND scheduled_date = $2
  AND status NOT IN ('cancelled_by_client', 'cancelled_by_company', 'cancelled_by_admin')
ORDER BY scheduled_start_time;
