-- name: CreateNotification :one
INSERT INTO notifications (user_id, type, title, body, data) VALUES ($1, $2, $3, $4, $5) RETURNING *;

-- name: ListNotificationsByUser :many
SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3;

-- name: MarkNotificationRead :exec
UPDATE notifications SET is_read = TRUE WHERE id = $1;

-- name: MarkAllNotificationsRead :exec
UPDATE notifications SET is_read = TRUE WHERE user_id = $1 AND is_read = FALSE;

-- name: CountUnreadNotifications :one
SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = FALSE;
