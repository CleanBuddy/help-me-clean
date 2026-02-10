package storage

import (
	"context"
	"fmt"
	"io"
	"log"
	"os"
	"path/filepath"
)

// Storage handles file uploads.
type Storage struct {
	basePath string
}

// NewLocalStorage creates a local filesystem storage.
func NewLocalStorage(basePath string) *Storage {
	if err := os.MkdirAll(basePath, 0755); err != nil {
		log.Fatalf("Failed to create storage directory: %v", err)
	}
	return &Storage{basePath: basePath}
}

// Upload saves a file to local storage.
func (s *Storage) Upload(ctx context.Context, filename string, reader io.Reader) (string, error) {
	path := filepath.Join(s.basePath, filename)
	file, err := os.Create(path)
	if err != nil {
		return "", fmt.Errorf("failed to create file: %w", err)
	}
	defer file.Close()

	if _, err := io.Copy(file, reader); err != nil {
		return "", fmt.Errorf("failed to write file: %w", err)
	}

	return path, nil
}
