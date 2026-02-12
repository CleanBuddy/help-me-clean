package storage

import (
	"context"
	"fmt"
	"io"
	"log"
	"os"
	"path/filepath"

	"github.com/google/uuid"
)

// Storage handles file uploads to the local filesystem.
type Storage struct {
	basePath string
	baseURL  string
}

// NewLocalStorage creates a local filesystem storage rooted at basePath.
// baseURL is the public URL prefix used when returning file URLs
// (e.g. "http://localhost:8080/uploads").
func NewLocalStorage(basePath, baseURL string) *Storage {
	if err := os.MkdirAll(basePath, 0755); err != nil {
		log.Fatalf("Failed to create storage directory: %v", err)
	}
	return &Storage{basePath: basePath, baseURL: baseURL}
}

// Upload saves a file to local storage under basePath/subdir with a UUID-prefixed
// filename to avoid collisions. It returns the full public URL of the stored file.
func (s *Storage) Upload(ctx context.Context, subdir, filename string, reader io.Reader) (string, error) {
	dir := filepath.Join(s.basePath, subdir)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return "", fmt.Errorf("failed to create subdirectory: %w", err)
	}

	uuidFilename := uuid.New().String() + "_" + filename
	path := filepath.Join(dir, uuidFilename)

	file, err := os.Create(path)
	if err != nil {
		return "", fmt.Errorf("failed to create file: %w", err)
	}
	defer file.Close()

	if _, err := io.Copy(file, reader); err != nil {
		return "", fmt.Errorf("failed to write file: %w", err)
	}

	url := s.baseURL + "/" + subdir + "/" + uuidFilename
	return url, nil
}

// Delete removes a file from local storage. relativePath is the portion after
// the baseURL (e.g. "companies/uuid123/abc_photo.jpg").
func (s *Storage) Delete(ctx context.Context, relativePath string) error {
	path := filepath.Join(s.basePath, relativePath)

	if err := os.Remove(path); err != nil {
		return fmt.Errorf("failed to delete file: %w", err)
	}
	return nil
}
