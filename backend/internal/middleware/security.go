package middleware

import (
	"net/http"
	"os"
)

// SecurityHeaders adds essential security headers to all responses to protect
// against various attacks including XSS, clickjacking, and MIME sniffing.
func SecurityHeaders(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Prevent clickjacking by disallowing embedding in frames
		w.Header().Set("X-Frame-Options", "DENY")

		// Prevent MIME sniffing (force browser to respect Content-Type)
		w.Header().Set("X-Content-Type-Options", "nosniff")

		// Enable XSS protection in legacy browsers
		w.Header().Set("X-XSS-Protection", "1; mode=block")

		// Referrer policy - only send origin for cross-origin requests
		w.Header().Set("Referrer-Policy", "strict-origin-when-cross-origin")

		// Content Security Policy (CSP)
		// For MVP: permissive policy to avoid breaking functionality
		// Tighten after demo based on actual resource usage
		csp := "default-src 'self'; " +
			"script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com https://js.stripe.com; " +
			"style-src 'self' 'unsafe-inline'; " +
			"img-src 'self' data: https: blob:; " +
			"font-src 'self' data:; " +
			"connect-src 'self' https://oauth2.googleapis.com https://api.stripe.com wss: ws:; " +
			"frame-src https://accounts.google.com https://js.stripe.com; " +
			"object-src 'none'; " +
			"base-uri 'self';"
		w.Header().Set("Content-Security-Policy", csp)

		// HSTS (Strict-Transport-Security) - only in production
		// Tells browsers to always use HTTPS for this domain
		if os.Getenv("ENVIRONMENT") == "production" {
			w.Header().Set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload")
		}

		// Permissions Policy - restrict access to browser features
		w.Header().Set("Permissions-Policy", "geolocation=(), microphone=(), camera=(), payment=(self)")

		next.ServeHTTP(w, r)
	})
}
