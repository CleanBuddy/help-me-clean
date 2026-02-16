package auth

import (
	"context"
	"net/http"
	"strings"
)

type contextKey string

// UserContextKey is the context key used to store authenticated user claims.
const UserContextKey contextKey = "user"

// AuthMiddleware extracts and validates JWT from httpOnly cookie or Authorization header.
// Priority: Cookie first (new secure method), then Authorization header (backward compatibility).
// The Authorization header support will be removed after 2-week migration period.
func AuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		var tokenString string
		var authAttempted bool

		// Try cookie first (new secure method - protects against XSS)
		tokenString = GetAuthCookie(r)
		if tokenString != "" {
			authAttempted = true
		}

		// Fallback to Authorization header for backward compatibility during migration
		authHeader := r.Header.Get("Authorization")
		if tokenString == "" && authHeader != "" {
			authAttempted = true
			tokenString = strings.TrimPrefix(authHeader, "Bearer ")
		}

		// No auth attempted (no cookie, no Authorization header) - allow for guest endpoints
		if !authAttempted {
			next.ServeHTTP(w, r)
			return
		}

		// Auth was attempted but token is empty or invalid
		if tokenString == "" {
			http.Error(w, "invalid token", http.StatusUnauthorized)
			return
		}

		// Validate token (works the same regardless of source)
		claims, err := ValidateToken(tokenString)
		if err != nil {
			http.Error(w, "invalid token", http.StatusUnauthorized)
			return
		}

		ctx := context.WithValue(r.Context(), UserContextKey, claims)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

// GetUserFromContext retrieves user claims from context.
func GetUserFromContext(ctx context.Context) *Claims {
	claims, ok := ctx.Value(UserContextKey).(*Claims)
	if !ok {
		return nil
	}
	return claims
}
