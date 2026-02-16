-- name: GetPlatformLegalEntity :one
-- GetPlatformLegalEntity returns the single platform legal entity configuration.
SELECT * FROM platform_legal_entity
WHERE singleton_guard = true
LIMIT 1;

-- name: UpdatePlatformLegalEntity :one
-- UpdatePlatformLegalEntity updates the platform legal entity details.
UPDATE platform_legal_entity
SET
    company_name = $1,
    cui = $2,
    reg_number = $3,
    address = $4,
    city = $5,
    county = $6,
    is_vat_payer = $7,
    bank_name = $8,
    iban = $9,
    updated_at = NOW()
WHERE singleton_guard = true
RETURNING *;

-- name: UpsertPlatformLegalEntity :one
-- UpsertPlatformLegalEntity creates or updates the platform legal entity.
INSERT INTO platform_legal_entity (
    company_name,
    cui,
    reg_number,
    address,
    city,
    county,
    is_vat_payer,
    bank_name,
    iban
) VALUES (
    $1, $2, $3, $4, $5, $6, $7, $8, $9
)
ON CONFLICT (singleton_guard)
DO UPDATE SET
    company_name = EXCLUDED.company_name,
    cui = EXCLUDED.cui,
    reg_number = EXCLUDED.reg_number,
    address = EXCLUDED.address,
    city = EXCLUDED.city,
    county = EXCLUDED.county,
    is_vat_payer = EXCLUDED.is_vat_payer,
    bank_name = EXCLUDED.bank_name,
    iban = EXCLUDED.iban,
    updated_at = NOW()
RETURNING *;
