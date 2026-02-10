package review

import (
	"context"
	"log"
)

// Service handles review business logic.
type Service struct {
	// db will be injected
}

// NewService creates a new review service.
func NewService() *Service {
	return &Service{}
}

// Init initializes the review service.
func (s *Service) Init() {
	log.Println("Review service initialized")
}

// Ping is a placeholder for future implementation.
func (s *Service) Ping(ctx context.Context) string {
	return "review service: ok"
}
