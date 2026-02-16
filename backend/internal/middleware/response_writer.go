package middleware

import (
	"context"
	"net/http"
)

type contextKey string

const ResponseWriterKey contextKey = "responseWriter"

// InjectResponseWriter middleware injects the http.ResponseWriter into the request context.
// This allows GraphQL resolvers to access the ResponseWriter for setting cookies.
func InjectResponseWriter(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ctx := context.WithValue(r.Context(), ResponseWriterKey, w)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

// GetResponseWriter retrieves the http.ResponseWriter from the context.
// Returns nil if not found.
func GetResponseWriter(ctx context.Context) http.ResponseWriter {
	w, ok := ctx.Value(ResponseWriterKey).(http.ResponseWriter)
	if !ok {
		return nil
	}
	return w
}
