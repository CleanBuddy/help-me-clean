package resolver

import (
	"crypto/rand"
	"fmt"
	"math/big"
	"strings"
)

// generateOTPCode returns a cryptographically random 6-digit numeric string (zero-padded).
func generateOTPCode() (string, error) {
	max := big.NewInt(1_000_000) // [0, 999999]
	n, err := rand.Int(rand.Reader, max)
	if err != nil {
		return "", fmt.Errorf("crypto/rand failure: %w", err)
	}
	return fmt.Sprintf("%06d", n.Int64()), nil
}

// emailPrefix returns everything before the '@' in an email address.
// Used as a fallback full_name when creating new users via OTP.
func emailPrefix(email string) string {
	if idx := strings.Index(email, "@"); idx > 0 {
		return email[:idx]
	}
	return email
}
