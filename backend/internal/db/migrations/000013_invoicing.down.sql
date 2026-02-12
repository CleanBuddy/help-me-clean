-- Reverse invoice_sequences
DROP TABLE IF EXISTS invoice_sequences;

-- Reverse invoice_line_items
DROP INDEX IF EXISTS idx_invoice_line_items_invoice;
DROP TABLE IF EXISTS invoice_line_items;

-- Reverse invoices
DROP INDEX IF EXISTS idx_invoices_number;
DROP INDEX IF EXISTS idx_invoices_type;
DROP INDEX IF EXISTS idx_invoices_status;
DROP INDEX IF EXISTS idx_invoices_client;
DROP INDEX IF EXISTS idx_invoices_company;
DROP INDEX IF EXISTS idx_invoices_booking;
DROP TABLE IF EXISTS invoices;
DROP TYPE IF EXISTS invoice_type;
DROP TYPE IF EXISTS invoice_status;

-- Reverse client_billing_profiles
DROP INDEX IF EXISTS idx_client_billing_profiles_user;
DROP TABLE IF EXISTS client_billing_profiles;
