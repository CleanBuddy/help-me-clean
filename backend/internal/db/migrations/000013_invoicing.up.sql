-- Client billing profiles (B2B support)
CREATE TABLE client_billing_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  is_company BOOLEAN NOT NULL DEFAULT FALSE,
  company_name VARCHAR(255),
  cui VARCHAR(20),
  reg_number VARCHAR(50),
  address TEXT,
  city VARCHAR(100),
  county VARCHAR(100),
  is_vat_payer BOOLEAN DEFAULT FALSE,
  bank_name VARCHAR(255),
  iban VARCHAR(50),
  is_default BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_client_billing_profiles_user ON client_billing_profiles(user_id);

-- Invoice tracking
CREATE TYPE invoice_status AS ENUM (
  'draft', 'issued', 'sent', 'transmitted', 'paid', 'cancelled', 'credit_note'
);

CREATE TYPE invoice_type AS ENUM (
  'client_service',
  'platform_commission'
);

CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_type invoice_type NOT NULL,
  invoice_number VARCHAR(50) UNIQUE,
  factureaza_id VARCHAR(100),
  factureaza_download_url TEXT,

  seller_company_name VARCHAR(255) NOT NULL,
  seller_cui VARCHAR(20) NOT NULL,
  seller_reg_number VARCHAR(50),
  seller_address TEXT NOT NULL,
  seller_city VARCHAR(100) NOT NULL,
  seller_county VARCHAR(100) NOT NULL,
  seller_is_vat_payer BOOLEAN NOT NULL DEFAULT FALSE,
  seller_bank_name VARCHAR(255),
  seller_iban VARCHAR(50),

  buyer_name VARCHAR(255) NOT NULL,
  buyer_cui VARCHAR(20),
  buyer_reg_number VARCHAR(50),
  buyer_address TEXT,
  buyer_city VARCHAR(100),
  buyer_county VARCHAR(100),
  buyer_is_vat_payer BOOLEAN DEFAULT FALSE,
  buyer_email VARCHAR(255),

  subtotal_amount INTEGER NOT NULL,
  vat_rate DECIMAL(5,2) NOT NULL DEFAULT 21.00,
  vat_amount INTEGER NOT NULL,
  total_amount INTEGER NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'RON',

  booking_id UUID REFERENCES bookings(id),
  payment_transaction_id UUID REFERENCES payment_transactions(id),
  company_id UUID REFERENCES companies(id),
  client_user_id UUID REFERENCES users(id),

  efactura_status VARCHAR(50),
  efactura_index VARCHAR(100),

  status invoice_status NOT NULL DEFAULT 'draft',
  issued_at TIMESTAMPTZ,
  due_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_invoices_booking ON invoices(booking_id);
CREATE INDEX idx_invoices_company ON invoices(company_id);
CREATE INDEX idx_invoices_client ON invoices(client_user_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_type ON invoices(invoice_type);
CREATE INDEX idx_invoices_number ON invoices(invoice_number);

-- Invoice line items
CREATE TABLE invoice_line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id),
  description_ro TEXT NOT NULL,
  description_en TEXT,
  quantity DECIMAL(10,2) NOT NULL DEFAULT 1.00,
  unit_price INTEGER NOT NULL,
  vat_rate DECIMAL(5,2) NOT NULL DEFAULT 21.00,
  vat_amount INTEGER NOT NULL,
  line_total INTEGER NOT NULL,
  line_total_with_vat INTEGER NOT NULL,
  sort_order INTEGER DEFAULT 0
);

CREATE INDEX idx_invoice_line_items_invoice ON invoice_line_items(invoice_id);

-- Invoice number sequences
CREATE TABLE invoice_sequences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id),
  prefix VARCHAR(20) NOT NULL,
  current_number INTEGER NOT NULL DEFAULT 0,
  year INTEGER NOT NULL,
  UNIQUE(company_id, prefix, year)
);
