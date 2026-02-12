-- ============================================
-- DOCUMENT REVIEW COLUMNS ON company_documents
-- ============================================
ALTER TABLE company_documents
    ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'pending',
    ADD COLUMN reviewed_at TIMESTAMPTZ,
    ADD COLUMN reviewed_by UUID REFERENCES users(id),
    ADD COLUMN rejection_reason TEXT;

-- ============================================
-- CLEANER DOCUMENTS
-- ============================================
CREATE TABLE cleaner_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cleaner_id UUID NOT NULL REFERENCES cleaners(id) ON DELETE CASCADE,
    document_type VARCHAR(100) NOT NULL,
    file_url TEXT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ,
    reviewed_by UUID REFERENCES users(id),
    rejection_reason TEXT
);

CREATE INDEX idx_cleaner_documents_cleaner ON cleaner_documents(cleaner_id);

-- ============================================
-- ADD pending_review TO cleaner_status ENUM
-- ============================================
ALTER TYPE cleaner_status ADD VALUE IF NOT EXISTS 'pending_review' AFTER 'invited';
