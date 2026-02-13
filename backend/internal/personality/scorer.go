package personality

import "fmt"

// SubmittedAnswer represents a single response from the test taker.
type SubmittedAnswer struct {
	QuestionNumber int
	Response       int // 1-5 Likert scale
}

// ScoredAnswer holds the original + computed score for one answer.
type ScoredAnswer struct {
	QuestionNumber int
	FacetCode      string
	IsReverseKeyed bool
	RawResponse    int // original 1-5
	ScoredValue    int // after reverse keying
}

// FacetScore holds the computed score for a single facet.
type FacetScore struct {
	FacetCode string
	Score     int  // 4-20 (sum of 4 items)
	MaxScore  int  // always 20
	IsFlagged bool // true if score < 10 (below midpoint)
}

// AssessmentResult holds the complete scored assessment.
type AssessmentResult struct {
	ScoredAnswers  []ScoredAnswer
	FacetScores    map[string]*FacetScore
	IntegrityAvg   float64 // avg of A1, A2, A3
	WorkQualityAvg float64 // avg of C2, C3, C5, C6
	HasConcerns    bool
	FlaggedFacets  []string
}

const (
	totalQuestions    = 28
	itemsPerFacet    = 4
	maxFacetScore    = itemsPerFacet * 5 // 20
	flagThreshold    = 10                // midpoint: below this = concern
)

// ScoreAssessment takes submitted answers and computes all facet scores,
// domain averages, and concern flags.
func ScoreAssessment(answers []SubmittedAnswer) (*AssessmentResult, error) {
	if len(answers) != totalQuestions {
		return nil, fmt.Errorf("expected %d answers, got %d", totalQuestions, len(answers))
	}

	// Index answers by question number.
	answerMap := make(map[int]int, totalQuestions)
	for _, a := range answers {
		if a.Response < 1 || a.Response > 5 {
			return nil, fmt.Errorf("question %d: response must be 1-5, got %d", a.QuestionNumber, a.Response)
		}
		if _, exists := answerMap[a.QuestionNumber]; exists {
			return nil, fmt.Errorf("duplicate answer for question %d", a.QuestionNumber)
		}
		answerMap[a.QuestionNumber] = a.Response
	}

	// Score each answer and accumulate facet totals.
	facetTotals := make(map[string]int)
	scored := make([]ScoredAnswer, 0, totalQuestions)

	for _, q := range Questions {
		resp, ok := answerMap[q.Number]
		if !ok {
			return nil, fmt.Errorf("missing answer for question %d", q.Number)
		}

		scoredValue := resp
		if q.IsReverseKeyed {
			scoredValue = 6 - resp
		}

		scored = append(scored, ScoredAnswer{
			QuestionNumber: q.Number,
			FacetCode:      q.FacetCode,
			IsReverseKeyed: q.IsReverseKeyed,
			RawResponse:    resp,
			ScoredValue:    scoredValue,
		})

		facetTotals[q.FacetCode] += scoredValue
	}

	// Build facet scores and detect flags.
	facetScores := make(map[string]*FacetScore)
	var flaggedFacets []string
	hasConcerns := false

	for _, fi := range Facets {
		score := facetTotals[fi.Code]
		flagged := score < flagThreshold
		if flagged {
			hasConcerns = true
			flaggedFacets = append(flaggedFacets, fi.Code)
		}
		facetScores[fi.Code] = &FacetScore{
			FacetCode: fi.Code,
			Score:     score,
			MaxScore:  maxFacetScore,
			IsFlagged: flagged,
		}
	}

	// Domain averages.
	integrityAvg := float64(facetTotals["A1"]+facetTotals["A2"]+facetTotals["A3"]) / 3.0
	workQualityAvg := float64(facetTotals["C2"]+facetTotals["C3"]+facetTotals["C5"]+facetTotals["C6"]) / 4.0

	if flaggedFacets == nil {
		flaggedFacets = []string{}
	}

	return &AssessmentResult{
		ScoredAnswers:  scored,
		FacetScores:    facetScores,
		IntegrityAvg:   integrityAvg,
		WorkQualityAvg: workQualityAvg,
		HasConcerns:    hasConcerns,
		FlaggedFacets:  flaggedFacets,
	}, nil
}
