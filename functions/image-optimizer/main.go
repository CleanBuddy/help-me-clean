package imageoptimizer

import (
	"context"
	"fmt"
	"io"
	"log"
	"path/filepath"
	"strings"

	"cloud.google.com/go/storage"
	"github.com/GoogleCloudPlatform/functions-framework-go/functions"
	"github.com/cloudevents/sdk-go/v2/event"
	"github.com/h2non/bimg"
)

// StorageObjectData represents the data structure for GCS finalize events
type StorageObjectData struct {
	Bucket         string                 `json:"bucket"`
	Name           string                 `json:"name"`
	Metageneration int64                  `json:"metageneration"`
	TimeCreated    string                 `json:"timeCreated"`
	Updated        string                 `json:"updated"`
	Metadata       map[string]interface{} `json:"metadata"`
}

func init() {
	functions.CloudEvent("OptimizeImage", optimizeImage)
}

// optimizeImage is triggered on GCS object finalize events
func optimizeImage(ctx context.Context, e event.Event) error {
	var data StorageObjectData
	if err := e.DataAs(&data); err != nil {
		return fmt.Errorf("event.DataAs: %w", err)
	}

	log.Printf("Processing file: gs://%s/%s", data.Bucket, data.Name)

	// Check if file is in avatars or logos path
	if !shouldOptimize(data.Name) {
		log.Printf("Skipping non-image or non-avatar/logo file: %s", data.Name)
		return nil
	}

	// Check if already optimized
	if isAlreadyOptimized(data.Metadata) {
		log.Printf("File already optimized, skipping: %s", data.Name)
		return nil
	}

	// Initialize GCS client
	client, err := storage.NewClient(ctx)
	if err != nil {
		return fmt.Errorf("storage.NewClient: %w", err)
	}
	defer client.Close()

	bucket := client.Bucket(data.Bucket)
	obj := bucket.Object(data.Name)

	// Download image
	reader, err := obj.NewReader(ctx)
	if err != nil {
		return fmt.Errorf("obj.NewReader: %w", err)
	}
	defer reader.Close()

	imageData, err := io.ReadAll(reader)
	if err != nil {
		return fmt.Errorf("io.ReadAll: %w", err)
	}

	// Determine target dimensions and quality based on path
	width, height, quality := getOptimizationParams(data.Name)

	// Process image
	optimizedData, err := processImage(imageData, width, height, quality)
	if err != nil {
		return fmt.Errorf("processImage: %w", err)
	}

	// Upload optimized image (overwrite original)
	writer := obj.NewWriter(ctx)
	writer.ContentType = "image/webp"
	writer.CacheControl = "public, max-age=31536000" // 1 year

	// Set metadata flag to indicate optimization
	writer.Metadata = map[string]string{
		"optimized":        "true",
		"original-size":    fmt.Sprintf("%d", len(imageData)),
		"optimized-size":   fmt.Sprintf("%d", len(optimizedData)),
		"optimization-pct": fmt.Sprintf("%.1f%%", float64(len(imageData)-len(optimizedData))/float64(len(imageData))*100),
	}

	if _, err := writer.Write(optimizedData); err != nil {
		writer.Close()
		return fmt.Errorf("writer.Write: %w", err)
	}

	if err := writer.Close(); err != nil {
		return fmt.Errorf("writer.Close: %w", err)
	}

	log.Printf("Successfully optimized %s: %d bytes -> %d bytes (%.1f%% reduction)",
		data.Name,
		len(imageData),
		len(optimizedData),
		float64(len(imageData)-len(optimizedData))/float64(len(imageData))*100,
	)

	return nil
}

// shouldOptimize checks if the file should be optimized
func shouldOptimize(path string) bool {
	// Only process images in avatars or logos directories
	if !strings.Contains(path, "/avatars/") && !strings.Contains(path, "/logos/") {
		return false
	}

	// Check if file is an image
	ext := strings.ToLower(filepath.Ext(path))
	return ext == ".jpg" || ext == ".jpeg" || ext == ".png" || ext == ".webp"
}

// isAlreadyOptimized checks if the file has already been optimized
func isAlreadyOptimized(metadata map[string]interface{}) bool {
	if metadata == nil {
		return false
	}
	optimized, ok := metadata["optimized"]
	if !ok {
		return false
	}
	return optimized == "true" || optimized == true
}

// getOptimizationParams returns width, height, and quality based on file path
func getOptimizationParams(path string) (width, height, quality int) {
	if strings.Contains(path, "/avatars/") {
		// Avatars: 400x400, 85% quality
		return 400, 400, 85
	}
	if strings.Contains(path, "/logos/") {
		// Logos: 800x600, 90% quality
		return 800, 600, 90
	}
	// Default
	return 400, 400, 85
}

// processImage resizes, compresses, and converts image to WebP
func processImage(data []byte, width, height, quality int) ([]byte, error) {
	img := bimg.NewImage(data)

	// Get current image size
	size, err := img.Size()
	if err != nil {
		return nil, fmt.Errorf("img.Size: %w", err)
	}

	// Calculate new dimensions maintaining aspect ratio
	newWidth, newHeight := calculateDimensions(size.Width, size.Height, width, height)

	// Process options
	options := bimg.Options{
		Width:   newWidth,
		Height:  newHeight,
		Type:    bimg.WEBP,
		Quality: quality,
		Crop:    false,
		Embed:   false,
	}

	// Process image
	processed, err := img.Process(options)
	if err != nil {
		return nil, fmt.Errorf("img.Process: %w", err)
	}

	return processed, nil
}

// calculateDimensions calculates new dimensions maintaining aspect ratio
func calculateDimensions(currentWidth, currentHeight, maxWidth, maxHeight int) (int, int) {
	// If image is smaller than target, keep original size
	if currentWidth <= maxWidth && currentHeight <= maxHeight {
		return currentWidth, currentHeight
	}

	// Calculate aspect ratio
	aspectRatio := float64(currentWidth) / float64(currentHeight)

	var newWidth, newHeight int

	if aspectRatio > float64(maxWidth)/float64(maxHeight) {
		// Width is the limiting factor
		newWidth = maxWidth
		newHeight = int(float64(maxWidth) / aspectRatio)
	} else {
		// Height is the limiting factor
		newHeight = maxHeight
		newWidth = int(float64(maxHeight) * aspectRatio)
	}

	return newWidth, newHeight
}
