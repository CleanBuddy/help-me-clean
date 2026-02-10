-- name: CreateCompanyDocument :one
INSERT INTO company_documents (company_id, document_type, file_url, file_name)
VALUES ($1, $2, $3, $4)
RETURNING *;

-- name: ListCompanyDocuments :many
SELECT * FROM company_documents WHERE company_id = $1 ORDER BY uploaded_at DESC;

-- name: DeleteCompanyDocument :exec
DELETE FROM company_documents WHERE id = $1;
