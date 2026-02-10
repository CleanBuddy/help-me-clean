-- name: ListPaymentMethodsByUser :many
SELECT * FROM client_payment_methods WHERE user_id = $1 ORDER BY is_default DESC, created_at DESC;

-- name: CreatePaymentMethod :one
INSERT INTO client_payment_methods (user_id, stripe_payment_method_id, card_last_four, card_brand, is_default)
VALUES ($1, $2, $3, $4, $5)
RETURNING *;

-- name: DeletePaymentMethod :exec
DELETE FROM client_payment_methods WHERE id = $1;

-- name: SetDefaultPaymentMethod :exec
UPDATE client_payment_methods SET is_default = (id = $2) WHERE user_id = $1;

-- name: UpdateBookingPayment :one
UPDATE bookings SET stripe_payment_intent_id = $2, payment_status = $3, updated_at = NOW()
WHERE id = $1 RETURNING *;

-- name: MarkBookingPaid :one
UPDATE bookings SET payment_status = 'paid', paid_at = NOW(), updated_at = NOW()
WHERE id = $1 RETURNING *;
