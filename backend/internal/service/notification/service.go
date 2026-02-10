package notification

import (
	"context"
	"log"
)

// Service handles push notification and in-app notification logic.
type Service struct {
	// db will be injected
}

// NewService creates a new notification service.
func NewService() *Service {
	return &Service{}
}

// Init initializes the notification service.
func (s *Service) Init() {
	log.Println("Notification service initialized")
}

// Ping is a placeholder for future implementation.
func (s *Service) Ping(ctx context.Context) string {
	return "notification service: ok"
}
