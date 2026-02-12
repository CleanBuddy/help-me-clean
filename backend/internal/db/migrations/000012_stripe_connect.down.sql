-- Reverse payout_line_items
DROP INDEX IF EXISTS idx_payout_line_items_payout;
DROP TABLE IF EXISTS payout_line_items;

-- Reverse company_payouts
DROP INDEX IF EXISTS idx_company_payouts_period;
DROP INDEX IF EXISTS idx_company_payouts_status;
DROP INDEX IF EXISTS idx_company_payouts_company;
DROP TABLE IF EXISTS company_payouts;
DROP TYPE IF EXISTS payout_status;

-- Reverse Stripe Connect fields on companies
DROP INDEX IF EXISTS idx_companies_stripe_connect;
ALTER TABLE companies
  DROP COLUMN IF EXISTS stripe_connect_payouts_enabled,
  DROP COLUMN IF EXISTS stripe_connect_charges_enabled,
  DROP COLUMN IF EXISTS stripe_connect_onboarding_complete,
  DROP COLUMN IF EXISTS stripe_connect_account_id;
