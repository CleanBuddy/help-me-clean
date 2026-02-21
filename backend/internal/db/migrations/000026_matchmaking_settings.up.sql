INSERT INTO platform_settings (key, value, value_type, description) VALUES
('matchmaking_buffer_minutes', '15', 'number', 'Minute tampon intre joburi (matchmaking)'),
('matchmaking_max_jobs_per_day', '6', 'number', 'Numar maxim joburi pe zi per curatator'),
('matchmaking_load_balance_weight', '10', 'number', 'Ponderea balansarii sarcinii (0=dezactivat, max 20)'),
('matchmaking_min_available_count', '5', 'number', 'Minim curatatori disponibili inainte de a arata indisponibili')
ON CONFLICT (key) DO NOTHING;
