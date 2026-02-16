package auth

import (
	"os"
	"testing"
)

func TestVerifyGoogleIDToken(t *testing.T) {
	t.Run("dev mode: valid dev token returns correct user info", func(t *testing.T) {
		// Set environment to test mode to allow dev tokens
		os.Setenv("ENVIRONMENT", "test")
		defer os.Unsetenv("ENVIRONMENT")

		info, err := VerifyGoogleIDToken("dev_user@test.com")
		if err != nil {
			t.Fatalf("VerifyGoogleIDToken returned unexpected error: %v", err)
		}

		if info.Email != "user@test.com" {
			t.Errorf("expected Email 'user@test.com', got %q", info.Email)
		}
		if info.GoogleID != "dev_user@test.com" {
			t.Errorf("expected GoogleID 'dev_user@test.com', got %q", info.GoogleID)
		}
		if info.FullName != "Dev User" {
			t.Errorf("expected FullName 'Dev User', got %q", info.FullName)
		}
		if info.AvatarURL != "" {
			t.Errorf("expected AvatarURL to be empty, got %q", info.AvatarURL)
		}
	})

	t.Run("dev mode: extracts email after dev_ prefix", func(t *testing.T) {
		// Set environment to test mode to allow dev tokens
		os.Setenv("ENVIRONMENT", "test")
		defer os.Unsetenv("ENVIRONMENT")

		tests := []struct {
			name          string
			token         string
			expectedEmail string
			expectedID    string
		}{
			{
				name:          "simple email",
				token:         "dev_hello@example.com",
				expectedEmail: "hello@example.com",
				expectedID:    "dev_hello@example.com",
			},
			{
				name:          "email with subdomain",
				token:         "dev_admin@sub.domain.com",
				expectedEmail: "admin@sub.domain.com",
				expectedID:    "dev_admin@sub.domain.com",
			},
			{
				name:          "email with plus addressing",
				token:         "dev_user+tag@example.com",
				expectedEmail: "user+tag@example.com",
				expectedID:    "dev_user+tag@example.com",
			},
			{
				name:          "minimal email",
				token:         "dev_a@b.c",
				expectedEmail: "a@b.c",
				expectedID:    "dev_a@b.c",
			},
		}

		for _, tc := range tests {
			t.Run(tc.name, func(t *testing.T) {
				info, err := VerifyGoogleIDToken(tc.token)
				if err != nil {
					t.Fatalf("VerifyGoogleIDToken returned unexpected error: %v", err)
				}

				if info.Email != tc.expectedEmail {
					t.Errorf("expected Email %q, got %q", tc.expectedEmail, info.Email)
				}
				if info.GoogleID != tc.expectedID {
					t.Errorf("expected GoogleID %q, got %q", tc.expectedID, info.GoogleID)
				}
			})
		}
	})

	t.Run("dev mode: dev_ prefix with empty remainder is still accepted", func(t *testing.T) {
		// Set environment to test mode to allow dev tokens
		os.Setenv("ENVIRONMENT", "test")
		defer os.Unsetenv("ENVIRONMENT")

		// The code checks len > 4 and prefix == "dev_", so "dev_x" (len=5) works.
		info, err := VerifyGoogleIDToken("dev_x")
		if err != nil {
			t.Fatalf("VerifyGoogleIDToken returned unexpected error: %v", err)
		}

		if info.Email != "x" {
			t.Errorf("expected Email 'x', got %q", info.Email)
		}
	})

	t.Run("token exactly 'dev_' (length 4) is not treated as dev token", func(t *testing.T) {
		// len("dev_") == 4, so the condition len > 4 is false.
		// This will attempt a real Google API call which should fail.
		_, err := VerifyGoogleIDToken("dev_")
		if err == nil {
			t.Fatal("expected error for token 'dev_', got nil")
		}
	})

	t.Run("short tokens are not treated as dev tokens", func(t *testing.T) {
		shortTokens := []string{"", "d", "de", "dev", "xyz"}
		for _, token := range shortTokens {
			t.Run(token, func(t *testing.T) {
				// These will attempt a real HTTP call to Google which will fail.
				_, err := VerifyGoogleIDToken(token)
				if err == nil {
					t.Fatalf("expected error for short token %q, got nil", token)
				}
			})
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
