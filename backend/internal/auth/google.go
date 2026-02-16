package auth

import (
	"encoding/json"
	"fmt"
	"net/http"
)

// GoogleUserInfo holds user data extracted from a Google ID token.
type GoogleUserInfo struct {
	GoogleID  string
	Email     string
	FullName  string
	AvatarURL string
}

// VerifyGoogleIDToken validates a Google ID token and returns user info.
func VerifyGoogleIDToken(idToken string) (*GoogleUserInfo, error) {
	resp, err := http.Get("https://oauth2.googleapis.com/tokeninfo?id_token=" + idToken)
	if err != nil {
		return nil, fmt.Errorf("failed to verify token: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("invalid Google ID token")
	}

	var payload struct {
		Sub     string `json:"sub"`
		Email   string `json:"email"`
		Name    string `json:"name"`
		Picture string `json:"picture"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&payload); err != nil {
		return nil, fmt.Errorf("failed to decode token info: %w", err)
	}

	return &GoogleUserInfo{
		GoogleID:  payload.Sub,
		Email:     payload.Email,
		FullName:  payload.Name,
		AvatarURL: payload.Picture,
	}, nil
}
