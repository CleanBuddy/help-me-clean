package company

import (
	"context"
	"log"
)

// Service handles company business logic.
type Service struct {
	// db will be injected
}

// NewService creates a new company service.
func NewService() *Service {
	return &Service{}
}

// Init initializes the company service.
func (s *Service) Init() {
	log.Println("Company service initialized")
}

// Ping is a placeholder for future implementation.
func (s *Service) Ping(ctx context.Context) string {
	return "company service: ok"
}
