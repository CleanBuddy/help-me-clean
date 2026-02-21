DELETE FROM platform_settings WHERE key IN (
    'matchmaking_buffer_minutes',
    'matchmaking_max_jobs_per_day',
    'matchmaking_load_balance_weight',
    'matchmaking_min_available_count'
);
