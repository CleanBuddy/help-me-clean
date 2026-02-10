package cleaner

import (
	"context"
	"log"
)

// Service handles cleaner business logic.
type Service struct {
	// db will be injected
}

// NewService creates a new cleaner service.
func NewService() *Service {
	return &Service{}
}

// Init initializes the cleaner service.
func (s *Service) Init() {
	log.Println("Cleaner service initialized")
}

// Ping is a placeholder for future implementation.
func (s *Service) Ping(ctx context.Context) string {
	return "cleaner service: ok"
}
