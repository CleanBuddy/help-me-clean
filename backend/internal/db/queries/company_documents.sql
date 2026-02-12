-- name: CreateCompanyDocument :one
INSERT INTO company_documents (company_id, document_type, file_url, file_name)
VALUES ($1, $2, $3, $4)
RETURNING *;

-- name: GetCompanyDocument :one
SELECT * FROM company_documents WHERE id = $1;

-- name: ListCompanyDocuments :many
SELECT * FROM company_documents WHERE company_id = $1 ORDER BY uploaded_at DESC;

-- name: DeleteCompanyDocument :exec
DELETE FROM company_documents WHERE id = $1;

-- name: UpdateCompanyDocumentStatus :one
UPDATE company_documents
SET status = $2,
    reviewed_by = $3,
    rejection_reason = $4,
    reviewed_at = NOW()
WHERE id = $1
RETURNING *;

-- name: ListPendingCompanyDocuments :many
SELECT * FROM company_documents WHERE status = 'pending' ORDER BY uploaded_at ASC;
