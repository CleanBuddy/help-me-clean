package personality

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"time"
)

// Service handles AI-powered personality analysis using Google Gemini
type Service struct {
	apiKey     string
	baseURL    string
	httpClient *http.Client
	enabled    bool
}

// InsightRequest contains personality assessment data for analysis
type InsightRequest struct {
	FacetScores    map[string]int
	IntegrityAvg   float64
	WorkQualityAvg float64
	FlaggedFacets  []string
}

// PersonalityInsights represents AI-generated personality analysis
type PersonalityInsights struct {
	Summary           string   `json:"summary"`
	Strengths         []string `json:"strengths"`
	Concerns          []string `json:"concerns"`
	TeamFitAnalysis   string   `json:"teamFitAnalysis"`
	RecommendedAction string   `json:"recommendedAction"`
	Confidence        string   `json:"confidence"`
}

// geminiRequest represents the Google Gemini API request structure
type geminiRequest struct {
	Contents         []geminiContent         `json:"contents"`
	GenerationConfig geminiGenerationConfig  `json:"generationConfig"`
}

type geminiContent struct {
	Parts []geminiPart `json:"parts"`
}

type geminiPart struct {
	Text string `json:"text"`
}

type geminiGenerationConfig struct {
	Temperature     float64 `json:"temperature"`
	ResponseMIMEType string `json:"responseMimeType"`
}

// geminiResponse represents the Google Gemini API response structure
type geminiResponse struct {
	Candidates []struct {
		Content struct {
			Parts []struct {
				Text string `json:"text"`
			} `json:"parts"`
		} `json:"content"`
	} `json:"candidates"`
}

// NewService creates a new personality insights service
func NewService() *Service {
	apiKey := os.Getenv("LLM_GEMINI_API_KEY")
	return &Service{
		apiKey:     apiKey,
		baseURL:    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent",
		httpClient: &http.Client{Timeout: 30 * time.Second},
		enabled:    apiKey != "",
	}
}

// GenerateInsights uses Google Gemini to analyze personality assessment and generate insights
func (s *Service) GenerateInsights(ctx context.Context, req InsightRequest) (*PersonalityInsights, error) {
	if !s.enabled {
		return nil, fmt.Errorf("AI insights disabled: LLM_GEMINI_API_KEY not set")
	}

	// Build Romanian analysis prompt
	prompt := buildAnalysisPrompt(req.FacetScores, req.IntegrityAvg, req.WorkQualityAvg, req.FlaggedFacets)

	// Call Gemini API
	responseText, err := s.callGemini(ctx, prompt)
	if err != nil {
		return nil, fmt.Errorf("failed to call Gemini API: %w", err)
	}

	// Parse JSON response
	var insights PersonalityInsights
	if err := json.Unmarshal([]byte(responseText), &insights); err != nil {
		return nil, fmt.Errorf("failed to parse AI response as JSON: %w. Response: %s", err, responseText)
	}

	// Validate required fields
	if insights.Summary == "" || insights.RecommendedAction == "" || insights.Confidence == "" {
		return nil, fmt.Errorf("AI response missing required fields: %+v", insights)
	}

	return &insights, nil
}

// callGemini makes an HTTP request to Google Gemini API
func (s *Service) callGemini(ctx context.Context, prompt string) (string, error) {
	// Construct request body
	reqBody := geminiRequest{
		Contents: []geminiContent{
			{
				Parts: []geminiPart{
					{Text: prompt},
				},
			},
		},
		GenerationConfig: geminiGenerationConfig{
			Temperature:      0.7,
			ResponseMIMEType: "application/json",
		},
	}

	jsonData, err := json.Marshal(reqBody)
	if err != nil {
		return "", fmt.Errorf("failed to marshal request: %w", err)
	}

	// Create HTTP request
	url := fmt.Sprintf("%s?key=%s", s.baseURL, s.apiKey)
	httpReq, err := http.NewRequestWithContext(ctx, "POST", url, bytes.NewBuffer(jsonData))
	if err != nil {
		return "", fmt.Errorf("failed to create HTTP request: %w", err)
	}

	httpReq.Header.Set("Content-Type", "application/json")

	// Make request
	resp, err := s.httpClient.Do(httpReq)
	if err != nil {
		return "", fmt.Errorf("HTTP request failed: %w", err)
	}
	defer resp.Body.Close()

	// Read response body
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", fmt.Errorf("failed to read response body: %w", err)
	}

	// Check HTTP status
	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("Gemini API error (status %d): %s", resp.StatusCode, string(body))
	}

	// Parse Gemini response
	var geminiResp geminiResponse
	if err := json.Unmarshal(body, &geminiResp); err != nil {
		return "", fmt.Errorf("failed to unmarshal Gemini response: %w. Body: %s", err, string(body))
	}

	// Extract text from response
	if len(geminiResp.Candidates) == 0 || len(geminiResp.Candidates[0].Content.Parts) == 0 {
		return "", fmt.Errorf("no content in Gemini response: %s", string(body))
	}

	return geminiResp.Candidates[0].Content.Parts[0].Text, nil
}
