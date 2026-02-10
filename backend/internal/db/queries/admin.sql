-- name: GetPlatformStats :one
SELECT
    (SELECT COUNT(*) FROM users) AS total_users,
    (SELECT COUNT(*) FROM companies WHERE status = 'approved') AS active_companies,
    (SELECT COUNT(*) FROM cleaners WHERE status = 'active') AS active_cleaners,
    (SELECT COUNT(*) FROM bookings) AS total_bookings,
    (SELECT COUNT(*) FROM bookings WHERE status = 'completed') AS completed_bookings,
    (SELECT COALESCE(SUM(platform_commission_amount), 0) FROM bookings WHERE status = 'completed') AS total_revenue;

-- name: GetBookingCountByStatus :many
SELECT status, COUNT(*) AS count FROM bookings GROUP BY status;

-- name: GetRevenueByMonth :many
SELECT
    DATE_TRUNC('month', completed_at) AS month,
    SUM(final_total) AS total_revenue,
    SUM(platform_commission_amount) AS commission_revenue,
    COUNT(*) AS booking_count
FROM bookings
WHERE status = 'completed' AND completed_at IS NOT NULL
GROUP BY DATE_TRUNC('month', completed_at)
ORDER BY month DESC
LIMIT $1;

-- name: GetCompanyPerformance :many
SELECT
    c.id, c.company_name, c.rating_avg, c.total_jobs_completed,
    COUNT(b.id) AS active_bookings
FROM companies c
LEFT JOIN bookings b ON c.id = b.company_id AND b.status IN ('assigned', 'confirmed', 'in_progress')
WHERE c.status = 'approved'
GROUP BY c.id
ORDER BY c.total_jobs_completed DESC
LIMIT $1 OFFSET $2;

-- name: ListAllBookings :many
SELECT * FROM bookings ORDER BY created_at DESC LIMIT $1 OFFSET $2;

-- name: CreatePlatformEvent :exec
INSERT INTO platform_events (event_type, entity_type, entity_id, metadata) VALUES ($1, $2, $3, $4);
