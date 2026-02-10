package auth

import (
	"context"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"
)

func TestAuthMiddleware(t *testing.T) {
	// Set up JWT secret for all middleware tests.
	original := os.Getenv("JWT_SECRET")
	os.Setenv("JWT_SECRET", testSecret)
	t.Cleanup(func() {
		if original == "" {
			os.Unsetenv("JWT_SECRET")
		} else {
			os.Setenv("JWT_SECRET", original)
		}
	})

	t.Run("request with valid Bearer token sets claims in context", func(t *testing.T) {
		tokenStr, err := GenerateToken("user-42", "user42@test.com", "client")
		if err != nil {
			t.Fatalf("GenerateToken returned unexpected error: %v", err)
		}

		var capturedClaims *Claims
		inner := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			capturedClaims = GetUserFromContext(r.Context())
			w.WriteHeader(http.StatusOK)
		})

		handler := AuthMiddleware(inner)
		req := httptest.NewRequest(http.MethodGet, "/graphql", nil)
		req.Header.Set("Authorization", "Bearer "+tokenStr)
		rr := httptest.NewRecorder()

		handler.ServeHTTP(rr, req)

		if rr.Code != http.StatusOK {
			t.Errorf("expected status 200, got %d", rr.Code)
		}
		if capturedClaims == nil {
			t.Fatal("expected claims in context, got nil")
		}
		if capturedClaims.UserID != "user-42" {
			t.Errorf("expected UserID 'user-42', got %q", capturedClaims.UserID)
		}
		if capturedClaims.Email != "user42@test.com" {
			t.Errorf("expected Email 'user42@test.com', got %q", capturedClaims.Email)
		}
		if capturedClaims.Role != "client" {
			t.Errorf("expected Role 'client', got %q", capturedClaims.Role)
		}
	})

	t.Run("request without Authorization header passes through without claims", func(t *testing.T) {
		var capturedClaims *Claims
		handlerCalled := false
		inner := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			handlerCalled = true
			capturedClaims = GetUserFromContext(r.Context())
			w.WriteHeader(http.StatusOK)
		})

		handler := AuthMiddleware(inner)
		req := httptest.NewRequest(http.MethodGet, "/graphql", nil)
		rr := httptest.NewRecorder()

		handler.ServeHTTP(rr, req)

		if !handlerCalled {
			t.Fatal("expected inner handler to be called")
		}
		if rr.Code != http.StatusOK {
			t.Errorf("expected status 200, got %d", rr.Code)
		}
		if capturedClaims != nil {
			t.Errorf("expected nil claims when no auth header, got %+v", capturedClaims)
		}
	})

	t.Run("request with invalid token returns 401 Unauthorized", func(t *testing.T) {
		handlerCalled := false
		inner := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			handlerCalled = true
			w.WriteHeader(http.StatusOK)
		})

		handler := AuthMiddleware(inner)
		req := httptest.NewRequest(http.MethodGet, "/graphql", nil)
		req.Header.Set("Authorization", "Bearer invalid-token-string")
		rr := httptest.NewRecorder()

		handler.ServeHTTP(rr, req)

		if handlerCalled {
			t.Fatal("expected inner handler NOT to be called for invalid token")
		}
		if rr.Code != http.StatusUnauthorized {
			t.Errorf("expected status 401, got %d", rr.Code)
		}
	})

	t.Run("request with expired token returns 401 Unauthorized", func(t *testing.T) {
		// Generate a token, then change the secret so it becomes invalid.
		tokenStr, err := GenerateToken("user-1", "user@test.com", "client")
		if err != nil {
			t.Fatalf("GenerateToken returned unexpected error: %v", err)
		}

		// Change the secret so the token no longer validates.
		os.Setenv("JWT_SECRET", "different-secret-entirely")
		defer os.Setenv("JWT_SECRET", testSecret)

		handlerCalled := false
		inner := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			handlerCalled = true
			w.WriteHeader(http.StatusOK)
		})

		handler := AuthMiddleware(inner)
		req := httptest.NewRequest(http.MethodGet, "/graphql", nil)
		req.Header.Set("Authorization", "Bearer "+tokenStr)
		rr := httptest.NewRecorder()

		handler.ServeHTTP(rr, req)

		if handlerCalled {
			t.Fatal("expected inner handler NOT to be called for token signed with wrong key")
		}
		if rr.Code != http.StatusUnauthorized {
			t.Errorf("expected status 401, got %d", rr.Code)
		}
	})

	t.Run("request with empty Bearer value returns 401", func(t *testing.T) {
		handlerCalled := false
		inner := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			handlerCalled = true
			w.WriteHeader(http.StatusOK)
		})

		handler := AuthMiddleware(inner)
		req := httptest.NewRequest(http.MethodGet, "/graphql", nil)
		req.Header.Set("Authorization", "Bearer ")
		rr := httptest.NewRecorder()

		handler.ServeHTTP(rr, req)

		// "Bearer " with nothing after it results in an empty token string,
		// which ValidateToken will reject.
		if handlerCalled {
			t.Fatal("expected inner handler NOT to be called for empty Bearer value")
		}
		if rr.Code != http.StatusUnauthorized {
			t.Errorf("expected status 401, got %d", rr.Code)
		}
	})

	t.Run("request with Authorization but no Bearer prefix", func(t *testing.T) {
		// The middleware does TrimPrefix("Bearer "), so a token without the prefix
		// is still passed to ValidateToken as-is, which will fail.
		handlerCalled := false
		inner := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			handlerCalled = true
			w.WriteHeader(http.StatusOK)
		})

		handler := AuthMiddleware(inner)
		req := httptest.NewRequest(http.MethodGet, "/graphql", nil)
		req.Header.Set("Authorization", "Basic some-credentials")
		rr := httptest.NewRecorder()

		handler.ServeHTTP(rr, req)

		if handlerCalled {
			t.Fatal("expected inner handler NOT to be called for Basic auth header")
		}
		if rr.Code != http.StatusUnauthorized {
			t.Errorf("expected status 401, got %d", rr.Code)
		}
	})
}

func TestGetUserFromContext(t *testing.T) {
	t.Run("returns nil when no claims in context", func(t *testing.T) {
		ctx := context.Background()
		claims := GetUserFromContext(ctx)
		if claims != nil {
			t.Errorf("expected nil, got %+v", claims)
		}
	})

	t.Run("returns nil when context has wrong type for key", func(t *testing.T) {
		ctx := context.WithValue(context.Background(), UserContextKey, "not-a-claims-struct")
		claims := GetUserFromContext(ctx)
		if claims != nil {
			t.Errorf("expected nil for wrong type, got %+v", claims)
		}
	})

	t.Run("returns claims when properly set in context", func(t *testing.T) {
		expected := &Claims{
			UserID: "user-99",
			Email:  "user99@example.com",
			Role:   "global_admin",
		}
		ctx := context.WithValue(context.Background(), UserContextKey, expected)
		claims := GetUserFromContext(ctx)
		if claims == nil {
			t.Fatal("expected claims, got nil")
		}
		if claims.UserID != "user-99" {
			t.Errorf("expected UserID 'user-99', got %q", claims.UserID)
		}
		if claims.Email != "user99@example.com" {
			t.Errorf("expected Email 'user99@example.com', got %q", claims.Email)
		}
		if claims.Role != "global_admin" {
			t.Errorf("expected Role 'global_admin', got %q", claims.Role)
		}
	})

	t.Run("returns nil for unrelated context key", func(t *testing.T) {
		type otherKey string
		ctx := context.WithValue(context.Background(), otherKey("user"), &Claims{
			UserID: "user-1",
		})
		claims := GetUserFromContext(ctx)
		if claims != nil {
			t.Errorf("expected nil for different key type, got %+v", claims)
		}
	})
}
