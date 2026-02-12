-- Stripe Connect fields on companies
ALTER TABLE companies
  ADD COLUMN stripe_connect_account_id VARCHAR(255),
  ADD COLUMN stripe_connect_onboarding_complete BOOLEAN DEFAULT FALSE,
  ADD COLUMN stripe_connect_charges_enabled BOOLEAN DEFAULT FALSE,
  ADD COLUMN stripe_connect_payouts_enabled BOOLEAN DEFAULT FALSE;

CREATE UNIQUE INDEX idx_companies_stripe_connect ON companies(stripe_connect_account_id) WHERE stripe_connect_account_id IS NOT NULL;

-- Payout tracking
CREATE TYPE payout_status AS ENUM ('pending', 'processing', 'paid', 'failed', 'cancelled');

CREATE TABLE company_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  stripe_transfer_id VARCHAR(255),
  stripe_payout_id VARCHAR(255),
  amount INTEGER NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'ron',
  period_from DATE NOT NULL,
  period_to DATE NOT NULL,
  booking_count INTEGER NOT NULL DEFAULT 0,
  status payout_status NOT NULL DEFAULT 'pending',
  paid_at TIMESTAMPTZ,
  failure_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_company_payouts_company ON company_payouts(company_id);
CREATE INDEX idx_company_payouts_status ON company_payouts(status);
CREATE INDEX idx_company_payouts_period ON company_payouts(period_from, period_to);

-- Payout line items linking payouts to booking transactions
CREATE TABLE payout_line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payout_id UUID NOT NULL REFERENCES company_payouts(id),
  payment_transaction_id UUID NOT NULL REFERENCES payment_transactions(id),
  booking_id UUID NOT NULL REFERENCES bookings(id),
  amount_gross INTEGER NOT NULL,
  amount_commission INTEGER NOT NULL,
  amount_net INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payout_line_items_payout ON payout_line_items(payout_id);
