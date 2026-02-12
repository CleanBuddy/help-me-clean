-- name: ListCompanyServiceAreas :many
SELECT csa.id, csa.company_id, csa.city_area_id, csa.created_at,
       ca.name AS area_name, ca.city_id, ec.name AS city_name
FROM company_service_areas csa
JOIN city_areas ca ON ca.id = csa.city_area_id
JOIN enabled_cities ec ON ec.id = ca.city_id
WHERE csa.company_id = $1
ORDER BY ec.name, ca.name;

-- name: DeleteAllCompanyServiceAreas :exec
DELETE FROM company_service_areas WHERE company_id = $1;

-- name: InsertCompanyServiceArea :one
INSERT INTO company_service_areas (company_id, city_area_id)
VALUES ($1, $2)
RETURNING id, company_id, city_area_id, created_at;
