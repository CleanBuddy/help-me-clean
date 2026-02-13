-- Recurring bookings: allow clients to schedule weekly/biweekly/monthly cleaning series

CREATE TYPE recurrence_type AS ENUM ('weekly', 'biweekly', 'monthly');

CREATE TABLE recurring_booking_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_user_id UUID NOT NULL REFERENCES users(id),
    company_id UUID REFERENCES companies(id),
    preferred_cleaner_id UUID REFERENCES cleaners(id),
    address_id UUID NOT NULL REFERENCES client_addresses(id),
    recurrence_type recurrence_type NOT NULL,
    day_of_week INTEGER CHECK (day_of_week BETWEEN 0 AND 6),
    preferred_time TIME NOT NULL,
    service_type service_type NOT NULL,
    property_type VARCHAR(50),
    num_rooms INTEGER,
    num_bathrooms INTEGER,
    area_sqm INTEGER,
    has_pets BOOLEAN DEFAULT FALSE,
    special_instructions TEXT,
    hourly_rate DECIMAL(10,2) NOT NULL,
    estimated_total_per_occurrence DECIMAL(10,2) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    cancelled_at TIMESTAMPTZ,
    cancellation_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE recurring_group_extras (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES recurring_booking_groups(id) ON DELETE CASCADE,
    extra_id UUID NOT NULL REFERENCES service_extras(id),
    quantity INTEGER DEFAULT 1
);

ALTER TABLE bookings ADD COLUMN recurring_group_id UUID REFERENCES recurring_booking_groups(id);
ALTER TABLE bookings ADD COLUMN occurrence_number INTEGER;

CREATE INDEX idx_recurring_groups_client ON recurring_booking_groups(client_user_id);
CREATE INDEX idx_recurring_groups_active ON recurring_booking_groups(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_bookings_recurring_group ON bookings(recurring_group_id) WHERE recurring_group_id IS NOT NULL;
