-- Add Stripe customer ID to users
ALTER TABLE users ADD COLUMN stripe_customer_id VARCHAR(255);
CREATE UNIQUE INDEX idx_users_stripe_customer ON users(stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;

-- Add expiry fields to payment methods
ALTER TABLE client_payment_methods
  ADD COLUMN card_exp_month INTEGER,
  ADD COLUMN card_exp_year INTEGER;

-- Payment transaction audit trail
CREATE TYPE payment_transaction_status AS ENUM (
  'pending', 'requires_action', 'processing', 'succeeded', 'failed', 'refunded', 'partially_refunded', 'cancelled'
);

CREATE TABLE payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id),
  stripe_payment_intent_id VARCHAR(255) NOT NULL,
  stripe_charge_id VARCHAR(255),
  amount_total INTEGER NOT NULL,
  amount_company INTEGER NOT NULL,
  amount_platform_fee INTEGER NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'ron',
  status payment_transaction_status NOT NULL DEFAULT 'pending',
  failure_reason TEXT,
  refund_amount INTEGER DEFAULT 0,
  stripe_refund_id VARCHAR(255),
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payment_transactions_booking ON payment_transactions(booking_id);
CREATE INDEX idx_payment_transactions_stripe_pi ON payment_transactions(stripe_payment_intent_id);
CREATE INDEX idx_payment_transactions_status ON payment_transactions(status);

-- Refund requests
CREATE TYPE refund_status AS ENUM ('requested', 'approved', 'processed', 'rejected');

CREATE TABLE refund_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id),
  payment_transaction_id UUID NOT NULL REFERENCES payment_transactions(id),
  requested_by_user_id UUID NOT NULL REFERENCES users(id),
  approved_by_user_id UUID REFERENCES users(id),
  amount INTEGER NOT NULL,
  reason TEXT NOT NULL,
  status refund_status NOT NULL DEFAULT 'requested',
  stripe_refund_id VARCHAR(255),
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_refund_requests_booking ON refund_requests(booking_id);
CREATE INDEX idx_refund_requests_status ON refund_requests(status);
