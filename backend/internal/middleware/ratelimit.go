package middleware

import (
	"fmt"
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/ulule/limiter/v3"
	"github.com/ulule/limiter/v3/drivers/store/memory"
)

// RateLimitMiddleware creates a general rate limiter for all endpoints.
// Default: 100 requests per minute per IP address.
// Configurable via RATE_LIMIT_PER_MINUTE environment variable.
func RateLimitMiddleware() func(http.Handler) http.Handler {
	// Get rate limit from environment or use default
	limitPerMinute := int64(100)
	if envLimit := os.Getenv("RATE_LIMIT_PER_MINUTE"); envLimit != "" {
		if parsed, err := strconv.ParseInt(envLimit, 10, 64); err == nil {
			limitPerMinute = parsed
		}
	}

	rate := limiter.Rate{
		Period: 1 * time.Minute,
		Limit:  limitPerMinute,
	}

	store := memory.NewStore()
	instance := limiter.New(store, rate)

	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// Extract client IP from various headers (proxy-aware)
			ip := getClientIP(r)

			context, err := instance.Get(r.Context(), ip)
			if err != nil {
				// On error, allow the request but log it
				http.Error(w, "rate limit error", http.StatusInternalServerError)
				return
			}

			// Set rate limit headers for client visibility
			w.Header().Set("X-RateLimit-Limit", fmt.Sprintf("%d", context.Limit))
			w.Header().Set("X-RateLimit-Remaining", fmt.Sprintf("%d", context.Remaining))
			w.Header().Set("X-RateLimit-Reset", fmt.Sprintf("%d", context.Reset))

			// Check if rate limit exceeded
			if context.Reached {
				w.Header().Set("Retry-After", fmt.Sprintf("%d", int(time.Until(time.Unix(context.Reset, 0)).Seconds())))
				http.Error(w, "rate limit exceeded: too many requests", http.StatusTooManyRequests)
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}

// StrictRateLimitMiddleware creates a stricter rate limiter for sensitive endpoints.
// Default: 10 requests per minute per IP address.
// Configurable via RATE_LIMIT_STRICT_PER_MINUTE environment variable.
// Use this for authentication, payment, and other critical endpoints.
func StrictRateLimitMiddleware() func(http.Handler) http.Handler {
	// Get strict rate limit from environment or use default
	limitPerMinute := int64(10)
	if envLimit := os.Getenv("RATE_LIMIT_STRICT_PER_MINUTE"); envLimit != "" {
		if parsed, err := strconv.ParseInt(envLimit, 10, 64); err == nil {
			limitPerMinute = parsed
		}
	}

	rate := limiter.Rate{
		Period: 1 * time.Minute,
		Limit:  limitPerMinute,
	}

	store := memory.NewStore()
	instance := limiter.New(store, rate)

	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// Extract client IP
			ip := getClientIP(r)

			context, err := instance.Get(r.Context(), ip)
			if err != nil {
				http.Error(w, "rate limit error", http.StatusInternalServerError)
				return
			}

			// Set rate limit headers
			w.Header().Set("X-RateLimit-Limit", fmt.Sprintf("%d", context.Limit))
			w.Header().Set("X-RateLimit-Remaining", fmt.Sprintf("%d", context.Remaining))
			w.Header().Set("X-RateLimit-Reset", fmt.Sprintf("%d", context.Reset))

			if context.Reached {
				w.Header().Set("Retry-After", fmt.Sprintf("%d", int(time.Until(time.Unix(context.Reset, 0)).Seconds())))
				http.Error(w, "rate limit exceeded: too many requests", http.StatusTooManyRequests)
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}

// getClientIP extracts the client's IP address from various headers.
// Checks X-Forwarded-For, X-Real-IP, and falls back to RemoteAddr.
// This is important for deployments behind proxies/load balancers.
func getClientIP(r *http.Request) string {
	// Check X-Forwarded-For header (standard for proxies)
	if xff := r.Header.Get("X-Forwarded-For"); xff != "" {
		// X-Forwarded-For can contain multiple IPs, use the first one
		// Format: "client, proxy1, proxy2"
		for idx := 0; idx < len(xff); idx++ {
			if xff[idx] == ',' {
				return xff[:idx]
			}
		}
		return xff
	}

	// Check X-Real-IP header (nginx, cloudflare)
	if xri := r.Header.Get("X-Real-IP"); xri != "" {
		return xri
	}

	// Fallback to RemoteAddr
	// RemoteAddr format is "IP:port", extract just the IP
	ip := r.RemoteAddr
	for i := len(ip) - 1; i >= 0; i-- {
		if ip[i] == ':' {
			return ip[:i]
		}
	}

	return ip
}
