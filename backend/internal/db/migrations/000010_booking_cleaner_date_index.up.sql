CREATE INDEX IF NOT EXISTS idx_bookings_cleaner_date_active
ON bookings (cleaner_id, scheduled_date)
WHERE status NOT IN ('cancelled_by_client', 'cancelled_by_company', 'cancelled_by_admin');
