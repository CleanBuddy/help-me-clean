-- Create a new personality insight (cached AI analysis)
-- name: CreatePersonalityInsight :one
INSERT INTO personality_insights (
    assessment_id,
    summary,
    strengths,
    concerns,
    team_fit_analysis,
    recommended_action,
    confidence,
    ai_model,
    ai_provider
) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
RETURNING *;

-- Get personality insight by assessment ID
-- name: GetPersonalityInsightByAssessmentID :one
SELECT * FROM personality_insights
WHERE assessment_id = $1;

-- Delete personality insight (for regeneration)
-- name: DeletePersonalityInsight :exec
DELETE FROM personality_insights
WHERE assessment_id = $1;
