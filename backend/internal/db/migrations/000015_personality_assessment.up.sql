-- ============================================
-- PERSONALITY ASSESSMENTS FOR CLEANERS
-- ============================================
-- IPIP-NEO based personality screening (public domain)
-- 28 questions across 7 facets, scored 4-20 per facet

CREATE TABLE personality_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cleaner_id UUID NOT NULL REFERENCES cleaners(id) ON DELETE CASCADE,

    -- Agreeableness facets (Integrity domain)
    trust_score INT NOT NULL CHECK (trust_score BETWEEN 4 AND 20),
    morality_score INT NOT NULL CHECK (morality_score BETWEEN 4 AND 20),
    altruism_score INT NOT NULL CHECK (altruism_score BETWEEN 4 AND 20),

    -- Conscientiousness facets (Work Quality domain)
    orderliness_score INT NOT NULL CHECK (orderliness_score BETWEEN 4 AND 20),
    dutifulness_score INT NOT NULL CHECK (dutifulness_score BETWEEN 4 AND 20),
    self_discipline_score INT NOT NULL CHECK (self_discipline_score BETWEEN 4 AND 20),
    cautiousness_score INT NOT NULL CHECK (cautiousness_score BETWEEN 4 AND 20),

    -- Domain aggregates
    integrity_avg DECIMAL(4,2) NOT NULL,      -- avg(trust, morality, altruism)
    work_quality_avg DECIMAL(4,2) NOT NULL,   -- avg(orderliness, dutifulness, self_discipline, cautiousness)

    -- Flagging
    has_concerns BOOLEAN NOT NULL DEFAULT FALSE,
    flagged_facets TEXT[] NOT NULL DEFAULT '{}',

    completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE(cleaner_id)
);

CREATE TABLE personality_assessment_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID NOT NULL REFERENCES personality_assessments(id) ON DELETE CASCADE,
    question_number INT NOT NULL CHECK (question_number BETWEEN 1 AND 28),
    facet_code VARCHAR(10) NOT NULL,
    is_reverse_keyed BOOLEAN NOT NULL,
    raw_response INT NOT NULL CHECK (raw_response BETWEEN 1 AND 5),
    scored_value INT NOT NULL CHECK (scored_value BETWEEN 1 AND 5),

    UNIQUE(assessment_id, question_number)
);

CREATE INDEX idx_personality_assessments_cleaner ON personality_assessments(cleaner_id);
CREATE INDEX idx_personality_assessment_answers_assessment ON personality_assessment_answers(assessment_id);
