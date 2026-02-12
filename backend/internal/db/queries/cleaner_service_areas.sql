-- name: ListCleanerServiceAreas :many
SELECT csa.id, csa.cleaner_id, csa.city_area_id, csa.created_at,
       ca.name AS area_name, ca.city_id, ec.name AS city_name
FROM cleaner_service_areas csa
JOIN city_areas ca ON ca.id = csa.city_area_id
JOIN enabled_cities ec ON ec.id = ca.city_id
WHERE csa.cleaner_id = $1
ORDER BY ec.name, ca.name;

-- name: DeleteAllCleanerServiceAreas :exec
DELETE FROM cleaner_service_areas WHERE cleaner_id = $1;

-- name: InsertCleanerServiceArea :one
INSERT INTO cleaner_service_areas (cleaner_id, city_area_id)
VALUES ($1, $2)
RETURNING id, cleaner_id, city_area_id, created_at;
