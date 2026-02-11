CREATE TABLE cleaner_date_overrides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cleaner_id UUID NOT NULL REFERENCES cleaners(id),
    override_date DATE NOT NULL,
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    start_time TIME NOT NULL DEFAULT '08:00',
    end_time TIME NOT NULL DEFAULT '17:00',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(cleaner_id, override_date)
);
