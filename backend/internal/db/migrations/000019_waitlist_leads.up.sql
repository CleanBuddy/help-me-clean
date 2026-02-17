CREATE TYPE waitlist_lead_type AS ENUM ('client', 'company');

CREATE TABLE waitlist_leads (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_type    waitlist_lead_type NOT NULL,
    name         TEXT NOT NULL,
    email        TEXT NOT NULL,
    phone        TEXT,
    city         TEXT,
    company_name TEXT,
    message      TEXT,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX waitlist_leads_email_idx   ON waitlist_leads(email);
CREATE INDEX waitlist_leads_type_idx    ON waitlist_leads(lead_type);
CREATE INDEX waitlist_leads_created_idx ON waitlist_leads(created_at DESC);

INSERT INTO platform_settings (key, value, value_type, description)
VALUES ('platform_mode', 'pre_release', 'string', 'Modul platformei: pre_release sau live')
ON CONFLICT (key) DO NOTHING;
