package booking

import (
	"context"
	"log"
)

// Service handles booking business logic.
type Service struct {
	// db will be injected
}

// NewService creates a new booking service.
func NewService() *Service {
	return &Service{}
}

// Init initializes the booking service.
func (s *Service) Init() {
	log.Println("Booking service initialized")
}

// Ping is a placeholder for future implementation.
func (s *Service) Ping(ctx context.Context) string {
	return "booking service: ok"
}
