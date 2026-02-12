-- name: CreateBookingTimeSlot :one
INSERT INTO booking_time_slots (booking_id, slot_date, start_time, end_time, is_selected)
VALUES ($1, $2, $3, $4, $5)
RETURNING *;

-- name: ListBookingTimeSlots :many
SELECT * FROM booking_time_slots WHERE booking_id = $1 ORDER BY slot_date, start_time;

-- name: SelectBookingTimeSlot :one
UPDATE booking_time_slots SET is_selected = TRUE WHERE id = $1 RETURNING *;

-- name: DeselectAllBookingTimeSlots :exec
UPDATE booking_time_slots SET is_selected = FALSE WHERE booking_id = $1;

-- name: GetSelectedTimeSlot :one
SELECT * FROM booking_time_slots WHERE booking_id = $1 AND is_selected = TRUE LIMIT 1;

-- name: DeleteBookingTimeSlots :exec
DELETE FROM booking_time_slots WHERE booking_id = $1;
