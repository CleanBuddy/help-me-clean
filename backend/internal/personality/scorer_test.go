package personality

import (
	"testing"
)

func allAnswers(response int) []SubmittedAnswer {
	answers := make([]SubmittedAnswer, totalQuestions)
	for i := range answers {
		answers[i] = SubmittedAnswer{QuestionNumber: i + 1, Response: response}
	}
	return answers
}

func TestScoreAssessment_AllFives(t *testing.T) {
	result, err := ScoreAssessment(allAnswers(5))
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	// Plus-keyed items score 5, minus-keyed items score 6-5=1.
	// Each facet has a mix of plus and minus items.
	// A1: 3 plus + 1 minus → 5+5+5+1 = 16
	if result.FacetScores["A1"].Score != 16 {
		t.Errorf("A1 score: got %d, want 16", result.FacetScores["A1"].Score)
	}
	// A2: 0 plus + 4 minus → 1+1+1+1 = 4
	if result.FacetScores["A2"].Score != 4 {
		t.Errorf("A2 score: got %d, want 4", result.FacetScores["A2"].Score)
	}
	// A3: 2 plus + 2 minus → 5+5+1+1 = 12
	if result.FacetScores["A3"].Score != 12 {
		t.Errorf("A3 score: got %d, want 12", result.FacetScores["A3"].Score)
	}
	// C2: 1 plus + 3 minus → 5+1+1+1 = 8
	if result.FacetScores["C2"].Score != 8 {
		t.Errorf("C2 score: got %d, want 8", result.FacetScores["C2"].Score)
	}
	// C3: 2 plus + 2 minus → 5+5+1+1 = 12
	if result.FacetScores["C3"].Score != 12 {
		t.Errorf("C3 score: got %d, want 12", result.FacetScores["C3"].Score)
	}
	// C5: 2 plus + 2 minus → 5+5+1+1 = 12
	if result.FacetScores["C5"].Score != 12 {
		t.Errorf("C5 score: got %d, want 12", result.FacetScores["C5"].Score)
	}
	// C6: 0 plus + 4 minus → 1+1+1+1 = 4
	if result.FacetScores["C6"].Score != 4 {
		t.Errorf("C6 score: got %d, want 4", result.FacetScores["C6"].Score)
	}
}

func TestScoreAssessment_AllOnes(t *testing.T) {
	result, err := ScoreAssessment(allAnswers(1))
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	// Plus-keyed items score 1, minus-keyed items score 6-1=5.
	// A1: 3 plus + 1 minus → 1+1+1+5 = 8
	if result.FacetScores["A1"].Score != 8 {
		t.Errorf("A1 score: got %d, want 8", result.FacetScores["A1"].Score)
	}
	// A2: 0 plus + 4 minus → 5+5+5+5 = 20
	if result.FacetScores["A2"].Score != 20 {
		t.Errorf("A2 score: got %d, want 20", result.FacetScores["A2"].Score)
	}
}

func TestScoreAssessment_AllThrees(t *testing.T) {
	result, err := ScoreAssessment(allAnswers(3))
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	// All items score 3 (reverse of 3 is also 3).
	for code, fs := range result.FacetScores {
		if fs.Score != 12 {
			t.Errorf("%s score: got %d, want 12", code, fs.Score)
		}
	}

	if result.HasConcerns {
		t.Error("should not have concerns with all neutral responses")
	}
}

func TestScoreAssessment_Flagging(t *testing.T) {
	// All 5s creates low A2 and C6 scores (all reverse-keyed).
	result, err := ScoreAssessment(allAnswers(5))
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if !result.HasConcerns {
		t.Error("should have concerns: A2 and C6 are all-reverse and score 4")
	}

	if !result.FacetScores["A2"].IsFlagged {
		t.Error("A2 should be flagged (score 4)")
	}
	if !result.FacetScores["C6"].IsFlagged {
		t.Error("C6 should be flagged (score 4)")
	}
	if result.FacetScores["A1"].IsFlagged {
		t.Error("A1 should not be flagged (score 16)")
	}
}

func TestScoreAssessment_DomainAverages(t *testing.T) {
	result, err := ScoreAssessment(allAnswers(3))
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	// All 12s → integrity avg = 12, work quality avg = 12
	if result.IntegrityAvg != 12.0 {
		t.Errorf("IntegrityAvg: got %f, want 12.0", result.IntegrityAvg)
	}
	if result.WorkQualityAvg != 12.0 {
		t.Errorf("WorkQualityAvg: got %f, want 12.0", result.WorkQualityAvg)
	}
}

func TestScoreAssessment_WrongCount(t *testing.T) {
	_, err := ScoreAssessment(allAnswers(3)[:27])
	if err == nil {
		t.Error("expected error for wrong answer count")
	}
}

func TestScoreAssessment_InvalidResponse(t *testing.T) {
	answers := allAnswers(3)
	answers[0].Response = 6
	_, err := ScoreAssessment(answers)
	if err == nil {
		t.Error("expected error for response out of range")
	}
}

func TestScoreAssessment_DuplicateAnswer(t *testing.T) {
	answers := allAnswers(3)
	answers[27].QuestionNumber = 1 // duplicate question 1
	_, err := ScoreAssessment(answers)
	if err == nil {
		t.Error("expected error for duplicate question number")
	}
}

func TestScoreAssessment_MissingAnswer(t *testing.T) {
	answers := allAnswers(3)
	answers[0].QuestionNumber = 99 // invalid question number
	_, err := ScoreAssessment(answers)
	if err == nil {
		t.Error("expected error for missing question")
	}
}

func TestGetQuestionByNumber(t *testing.T) {
	q := GetQuestionByNumber(1)
	if q == nil {
		t.Fatal("expected question 1, got nil")
	}
	if q.FacetCode != "A1" {
		t.Errorf("question 1 facet: got %s, want A1", q.FacetCode)
	}

	if GetQuestionByNumber(0) != nil {
		t.Error("expected nil for question 0")
	}
	if GetQuestionByNumber(29) != nil {
		t.Error("expected nil for question 29")
	}
}

func TestQuestionsIntegrity(t *testing.T) {
	if len(Questions) != totalQuestions {
		t.Fatalf("expected %d questions, got %d", totalQuestions, len(Questions))
	}

	// Verify each facet has exactly 4 items.
	facetCounts := make(map[string]int)
	for _, q := range Questions {
		facetCounts[q.FacetCode]++
		if q.Number < 1 || q.Number > totalQuestions {
			t.Errorf("question number %d out of range", q.Number)
		}
	}

	expectedFacets := []string{"A1", "A2", "A3", "C2", "C3", "C5", "C6"}
	for _, code := range expectedFacets {
		if facetCounts[code] != itemsPerFacet {
			t.Errorf("facet %s: got %d items, want %d", code, facetCounts[code], itemsPerFacet)
		}
	}
}

func TestReverseKeying(t *testing.T) {
	// Manually verify reverse keying: response 1 → scored 5, response 5 → scored 1.
	answers := make([]SubmittedAnswer, totalQuestions)
	for i := range answers {
		answers[i] = SubmittedAnswer{QuestionNumber: i + 1, Response: 1}
	}

	result, err := ScoreAssessment(answers)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	for _, sa := range result.ScoredAnswers {
		if sa.IsReverseKeyed {
			if sa.ScoredValue != 5 {
				t.Errorf("Q%d (reverse): response 1 should score 5, got %d", sa.QuestionNumber, sa.ScoredValue)
			}
		} else {
			if sa.ScoredValue != 1 {
				t.Errorf("Q%d (normal): response 1 should score 1, got %d", sa.QuestionNumber, sa.ScoredValue)
			}
		}
	}
}
