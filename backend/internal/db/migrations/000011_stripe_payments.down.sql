-- Reverse refund_requests
DROP INDEX IF EXISTS idx_refund_requests_status;
DROP INDEX IF EXISTS idx_refund_requests_booking;
DROP TABLE IF EXISTS refund_requests;
DROP TYPE IF EXISTS refund_status;

-- Reverse payment_transactions
DROP INDEX IF EXISTS idx_payment_transactions_status;
DROP INDEX IF EXISTS idx_payment_transactions_stripe_pi;
DROP INDEX IF EXISTS idx_payment_transactions_booking;
DROP TABLE IF EXISTS payment_transactions;
DROP TYPE IF EXISTS payment_transaction_status;

-- Reverse expiry fields on client_payment_methods
ALTER TABLE client_payment_methods
  DROP COLUMN IF EXISTS card_exp_year,
  DROP COLUMN IF EXISTS card_exp_month;

-- Reverse Stripe customer ID on users
DROP INDEX IF EXISTS idx_users_stripe_customer;
ALTER TABLE users DROP COLUMN IF EXISTS stripe_customer_id;
