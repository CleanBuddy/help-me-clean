package storage

import (
	"fmt"
	"mime"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"

	"github.com/99designs/gqlgen/graphql"
)

const (
	// DefaultMaxFileSize is 10MB
	DefaultMaxFileSize = 10 * 1024 * 1024
)

var (
	// AllowedImageTypes are safe image MIME types
	AllowedImageTypes = map[string]bool{
		"image/jpeg": true,
		"image/jpg":  true,
		"image/png":  true,
		"image/gif":  true,
		"image/webp": true,
	}

	// AllowedDocumentTypes are safe document MIME types
	AllowedDocumentTypes = map[string]bool{
		"application/pdf": true,
	}

	// AllowedExtensions maps file extensions to allowed MIME types
	AllowedExtensions = map[string][]string{
		".jpg":  {"image/jpeg", "image/jpg"},
		".jpeg": {"image/jpeg", "image/jpg"},
		".png":  {"image/png"},
		".gif":  {"image/gif"},
		".webp": {"image/webp"},
		".pdf":  {"application/pdf"},
	}
)

// ValidationError represents a file validation error.
type ValidationError struct {
	Field   string
	Message string
}

func (e ValidationError) Error() string {
	return fmt.Sprintf("%s: %s", e.Field, e.Message)
}

// GetMaxFileSize returns the configured max file size or default (10MB).
func GetMaxFileSize() int64 {
	if envSize := os.Getenv("MAX_FILE_SIZE"); envSize != "" {
		if parsed, err := strconv.ParseInt(envSize, 10, 64); err == nil && parsed > 0 {
			return parsed
		}
	}
	return DefaultMaxFileSize
}

// ValidateUpload validates a file upload for size, type, and content.
// This prevents malicious file uploads and resource exhaustion.
func ValidateUpload(file graphql.Upload) error {
	maxSize := GetMaxFileSize()

	// 1. Validate file size
	if file.Size > maxSize {
		return ValidationError{
			Field:   "file",
			Message: fmt.Sprintf("file size %d bytes exceeds maximum allowed size of %d bytes (%.1f MB)", file.Size, maxSize, float64(maxSize)/(1024*1024)),
		}
	}

	// 2. Validate file extension
	ext := strings.ToLower(filepath.Ext(file.Filename))
	allowedMimeTypes, extAllowed := AllowedExtensions[ext]
	if !extAllowed {
		return ValidationError{
			Field:   "file",
			Message: fmt.Sprintf("file extension '%s' is not allowed (allowed: %v)", ext, getAllowedExtensions()),
		}
	}

	// 3. Detect MIME type from file content (not just extension)
	// Read first 512 bytes to detect content type
	buffer := make([]byte, 512)
	n, err := file.File.Read(buffer)
	if err != nil && n == 0 {
		return ValidationError{
			Field:   "file",
			Message: "unable to read file content",
		}
	}

	// Reset file pointer to beginning for later use
	if _, err := file.File.Seek(0, 0); err != nil {
		return ValidationError{
			Field:   "file",
			Message: "unable to reset file pointer",
		}
	}

	// Detect MIME type from content
	detectedMime := http.DetectContentType(buffer[:n])

	// 4. Validate detected MIME type matches allowed types for extension
	mimeAllowed := false
	for _, allowedMime := range allowedMimeTypes {
		if strings.HasPrefix(detectedMime, allowedMime) {
			mimeAllowed = true
			break
		}
	}

	if !mimeAllowed {
		return ValidationError{
			Field:   "file",
			Message: fmt.Sprintf("file content type '%s' does not match expected types for extension '%s' (expected: %v)", detectedMime, ext, allowedMimeTypes),
		}
	}

	// 5. Validate against comprehensive allowed list
	if !isAllowedMimeType(detectedMime) {
		return ValidationError{
			Field:   "file",
			Message: fmt.Sprintf("file type '%s' is not allowed", detectedMime),
		}
	}

	return nil
}

// isAllowedMimeType checks if a MIME type is in the allowed lists.
func isAllowedMimeType(mimeType string) bool {
	// Check images
	if AllowedImageTypes[mimeType] {
		return true
	}
	// Check documents
	if AllowedDocumentTypes[mimeType] {
		return true
	}
	// Check with prefix (e.g., "image/jpeg; charset=utf-8")
	for allowed := range AllowedImageTypes {
		if strings.HasPrefix(mimeType, allowed) {
			return true
		}
	}
	for allowed := range AllowedDocumentTypes {
		if strings.HasPrefix(mimeType, allowed) {
			return true
		}
	}
	return false
}

// getAllowedExtensions returns a list of allowed file extensions.
func getAllowedExtensions() []string {
	exts := make([]string, 0, len(AllowedExtensions))
	for ext := range AllowedExtensions {
		exts = append(exts, ext)
	}
	return exts
}

// SanitizeFilename removes potentially dangerous characters from a filename.
// This prevents path traversal attacks and shell injection.
func SanitizeFilename(filename string) string {
	// Remove any path separators
	filename = filepath.Base(filename)

	// Remove or replace dangerous characters
	replacer := strings.NewReplacer(
		"..", "",
		"/", "",
		"\\", "",
		"<", "",
		">", "",
		":", "",
		"\"", "",
		"|", "",
		"?", "",
		"*", "",
		"\x00", "", // null byte
	)
	filename = replacer.Replace(filename)

	// Ensure filename is not empty after sanitization
	if filename == "" || filename == "." {
		filename = "unnamed" + filepath.Ext(filename)
	}

	return filename
}

// GetContentType returns the MIME type for a file extension.
// Falls back to application/octet-stream if unknown.
func GetContentType(filename string) string {
	ext := filepath.Ext(filename)
	contentType := mime.TypeByExtension(ext)
	if contentType == "" {
		contentType = "application/octet-stream"
	}
	return contentType
}
