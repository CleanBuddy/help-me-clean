-- name: CreateEmailOTP :one
INSERT INTO email_otp_codes (email, code, role, expires_at)
VALUES ($1, $2, $3, NOW() + INTERVAL '10 minutes')
RETURNING *;

-- name: CountActiveEmailOTPs :one
SELECT COUNT(*) FROM email_otp_codes
WHERE email = $1
  AND expires_at > NOW()
  AND used_at IS NULL;

-- name: GetValidEmailOTP :one
SELECT * FROM email_otp_codes
WHERE email = $1
  AND code  = $2
  AND expires_at > NOW()
  AND used_at IS NULL
ORDER BY created_at DESC
LIMIT 1;

-- name: MarkEmailOTPUsed :exec
UPDATE email_otp_codes
SET used_at = NOW()
WHERE id = $1;

-- name: DeleteExpiredEmailOTPs :exec
DELETE FROM email_otp_codes
WHERE expires_at < NOW() - INTERVAL '1 hour';
