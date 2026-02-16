package auth

import (
	"os"
	"testing"
)

func TestVerifyGoogleIDToken(t *testing.T) {
	t.Run("rejects dev_ prefixed tokens in all environments", func(t *testing.T) {
		environments := []string{"development", "test", "production", ""}
		tokens := []string{"dev_user@test.com", "dev_admin@example.com", "dev_"}

		for _, env := range environments {
			for _, token := range tokens {
				t.Run(env+"_"+token, func(t *testing.T) {
					if env != "" {
						os.Setenv("ENVIRONMENT", env)
						defer os.Unsetenv("ENVIRONMENT")
					}

					_, err := VerifyGoogleIDToken(token)
					if err == nil {
						t.Fatalf("expected error for dev_ token %q in environment %q, got nil", token, env)
					}
				})
			}
		}
	})

	t.Run("non-dev prefix token attempts Google verification and fails", func(t *testing.T) {
		// A clearly invalid token that does not have the dev_ prefix will
		// hit the Google tokeninfo endpoint and fail validation.
		_, err := VerifyGoogleIDToken("invalid-google-token-xyz")
		if err == nil {
			t.Fatal("expected error for invalid Google token, got nil")
		}
	})
}
