-- name: CreateCleanerDocument :one
INSERT INTO cleaner_documents (cleaner_id, document_type, file_url, file_name)
VALUES ($1, $2, $3, $4)
RETURNING *;

-- name: GetCleanerDocument :one
SELECT * FROM cleaner_documents WHERE id = $1;

-- name: ListCleanerDocuments :many
SELECT * FROM cleaner_documents WHERE cleaner_id = $1 ORDER BY uploaded_at DESC;

-- name: DeleteCleanerDocument :exec
DELETE FROM cleaner_documents WHERE id = $1;

-- name: UpdateCleanerDocumentStatus :one
UPDATE cleaner_documents
SET status = $2,
    reviewed_by = $3,
    rejection_reason = $4,
    reviewed_at = NOW()
WHERE id = $1
RETURNING *;

-- name: ListPendingCleanerDocuments :many
SELECT * FROM cleaner_documents WHERE status = 'pending' ORDER BY uploaded_at ASC;
