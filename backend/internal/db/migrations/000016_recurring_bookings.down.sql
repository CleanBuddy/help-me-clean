DROP INDEX IF EXISTS idx_bookings_recurring_group;
DROP INDEX IF EXISTS idx_recurring_groups_active;
DROP INDEX IF EXISTS idx_recurring_groups_client;

ALTER TABLE bookings DROP COLUMN IF EXISTS occurrence_number;
ALTER TABLE bookings DROP COLUMN IF EXISTS recurring_group_id;

DROP TABLE IF EXISTS recurring_group_extras;
DROP TABLE IF EXISTS recurring_booking_groups;

DROP TYPE IF EXISTS recurrence_type;
