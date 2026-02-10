-- name: CreateReview :one
INSERT INTO reviews (booking_id, reviewer_user_id, reviewed_user_id, reviewed_cleaner_id, rating, comment, review_type)
VALUES ($1, $2, $3, $4, $5, $6, $7)
RETURNING *;

-- name: GetReviewByBookingID :one
SELECT * FROM reviews WHERE booking_id = $1;

-- name: ListReviewsByCleanerID :many
SELECT * FROM reviews WHERE reviewed_cleaner_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3;

-- name: GetAverageCleanerRating :one
SELECT COALESCE(AVG(rating), 0)::DECIMAL(3,2) AS avg_rating FROM reviews WHERE reviewed_cleaner_id = $1;

-- name: ListAllReviews :many
SELECT * FROM reviews ORDER BY created_at DESC LIMIT $1 OFFSET $2;

-- name: DeleteReview :exec
DELETE FROM reviews WHERE id = $1;

-- name: CountAllReviews :one
SELECT COUNT(*) FROM reviews;
