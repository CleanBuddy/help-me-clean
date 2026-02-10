-- name: ListPlatformSettings :many
SELECT * FROM platform_settings ORDER BY key;

-- name: GetPlatformSetting :one
SELECT * FROM platform_settings WHERE key = $1;

-- name: UpdatePlatformSetting :one
UPDATE platform_settings SET value = $2, updated_at = NOW() WHERE key = $1 RETURNING *;
