-- Add claim_token to companies for secure account linking after unauthenticated applications.
ALTER TABLE companies ADD COLUMN claim_token VARCHAR(64) UNIQUE;
