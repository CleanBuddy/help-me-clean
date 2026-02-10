package chat

import (
	"context"
	"log"
)

// Service handles chat/messaging business logic.
type Service struct {
	// db will be injected
}

// NewService creates a new chat service.
func NewService() *Service {
	return &Service{}
}

// Init initializes the chat service.
func (s *Service) Init() {
	log.Println("Chat service initialized")
}

// Ping is a placeholder for future implementation.
func (s *Service) Ping(ctx context.Context) string {
	return "chat service: ok"
}
