DROP TABLE IF EXISTS waitlist_leads;
DROP TYPE IF EXISTS waitlist_lead_type;
DELETE FROM platform_settings WHERE key = 'platform_mode';
