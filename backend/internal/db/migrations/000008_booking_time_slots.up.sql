-- Booking time slots: multiple preferred time windows per booking (up to 5).
-- The client picks flexible time ranges; company/admin selects one.
CREATE TABLE booking_time_slots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    slot_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_selected BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_booking_time_slots_booking ON booking_time_slots(booking_id);
CREATE INDEX idx_booking_time_slots_date ON booking_time_slots(slot_date, start_time);
