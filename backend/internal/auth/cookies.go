package auth

import (
	"net/http"
	"os"
	"strconv"
)

const (
	// AuthCookieName is the name of the httpOnly cookie storing the JWT token
	AuthCookieName = "helpmeclean_token"
)

// SetAuthCookie sets a secure httpOnly cookie with the JWT token.
// This protects against XSS attacks as the token cannot be accessed via JavaScript.
func SetAuthCookie(w http.ResponseWriter, token string) {
	isProduction := os.Getenv("ENVIRONMENT") == "production"

	// Get token expiry from environment (default 24 hours = 86400 seconds)
	maxAge := 86400
	if expiryEnv := os.Getenv("JWT_EXPIRY"); expiryEnv != "" {
		// JWT_EXPIRY is in format like "24h", convert to seconds
		// For simplicity, if it ends with 'h', parse the number and multiply by 3600
		if len(expiryEnv) > 1 && expiryEnv[len(expiryEnv)-1] == 'h' {
			if hours, err := strconv.Atoi(expiryEnv[:len(expiryEnv)-1]); err == nil {
				maxAge = hours * 3600
			}
		}
	}

	cookie := &http.Cookie{
		Name:     AuthCookieName,
		Value:    token,
		Path:     "/",
		HttpOnly: true,                 // ✅ Prevents XSS attacks - JavaScript cannot access this cookie
		Secure:   isProduction,         // ✅ HTTPS only in production
		SameSite: http.SameSiteLaxMode, // ✅ CSRF protection - cookie not sent in cross-site POST requests
		MaxAge:   maxAge,
	}

	// Set domain for cross-subdomain access in production (e.g., .helpmeclean.ro)
	if isProduction {
		if domain := os.Getenv("COOKIE_DOMAIN"); domain != "" {
			cookie.Domain = domain
		}
	}

	http.SetCookie(w, cookie)
}

// ClearAuthCookie removes the authentication cookie (for logout).
func ClearAuthCookie(w http.ResponseWriter) {
	isProduction := os.Getenv("ENVIRONMENT") == "production"

	cookie := &http.Cookie{
		Name:     AuthCookieName,
		Value:    "",
		Path:     "/",
		HttpOnly: true,
		Secure:   isProduction,
		SameSite: http.SameSiteLaxMode,
		MaxAge:   -1, // ✅ Delete immediately
	}

	// Match domain from SetAuthCookie for proper deletion
	if isProduction {
		if domain := os.Getenv("COOKIE_DOMAIN"); domain != "" {
			cookie.Domain = domain
		}
	}

	http.SetCookie(w, cookie)
}

// GetAuthCookie extracts the JWT token from the httpOnly cookie.
func GetAuthCookie(r *http.Request) string {
	cookie, err := r.Cookie(AuthCookieName)
	if err != nil {
		return ""
	}
	return cookie.Value
}
