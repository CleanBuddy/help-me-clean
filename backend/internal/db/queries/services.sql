-- name: ListActiveServices :many
SELECT * FROM service_definitions WHERE is_active = TRUE ORDER BY service_type;

-- name: GetServiceByType :one
SELECT * FROM service_definitions WHERE service_type = $1;

-- name: ListActiveExtras :many
SELECT * FROM service_extras WHERE is_active = TRUE ORDER BY name_en;

-- name: GetExtraByID :one
SELECT * FROM service_extras WHERE id = $1;

-- name: ListAllServices :many
SELECT * FROM service_definitions ORDER BY name_ro;

-- name: UpdateServiceDefinition :one
UPDATE service_definitions SET name_ro = $2, name_en = $3, base_price_per_hour = $4,
    min_hours = $5, is_active = $6
WHERE id = $1 RETURNING *;

-- name: ListAllExtras :many
SELECT * FROM service_extras ORDER BY name_ro;

-- name: UpdateServiceExtra :one
UPDATE service_extras SET name_ro = $2, name_en = $3, price = $4, is_active = $5
WHERE id = $1 RETURNING *;

-- name: CreateServiceDefinition :one
INSERT INTO service_definitions (service_type, name_ro, name_en, base_price_per_hour, min_hours, is_active)
VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;

-- name: CreateServiceExtra :one
INSERT INTO service_extras (name_ro, name_en, price, is_active)
VALUES ($1, $2, $3, $4) RETURNING *;
