-- Create personality_insights table to cache AI-generated personality analysis
CREATE TABLE personality_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID NOT NULL REFERENCES personality_assessments(id) ON DELETE CASCADE,

    -- AI-generated analysis content
    summary TEXT NOT NULL,
    strengths TEXT[] NOT NULL,
    concerns TEXT[] NOT NULL,
    team_fit_analysis TEXT NOT NULL,
    recommended_action VARCHAR(50) NOT NULL, -- 'approve', 'review_carefully', 'reject'
    confidence VARCHAR(20) NOT NULL,         -- 'high', 'medium', 'low'

    -- Metadata
    ai_model VARCHAR(100) NOT NULL,          -- e.g., 'gemini-2.5-flash-lite'
    ai_provider VARCHAR(50) NOT NULL,        -- 'google'
    generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Prevent duplicate analyses for the same assessment
    UNIQUE(assessment_id)
);

-- Index for quick lookups by assessment
CREATE INDEX idx_personality_insights_assessment ON personality_insights(assessment_id);
