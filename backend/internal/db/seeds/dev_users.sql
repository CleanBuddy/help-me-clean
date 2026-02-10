-- Dev seed: 11 test users for development mode.
-- Idempotent — safe to run multiple times.
-- Usage: make seed  (or  psql "$DATABASE_URL" -f internal/db/seeds/dev_users.sql)

-- 3 Clients (no booking requests)
INSERT INTO users (email, full_name, role, status, google_id, preferred_language)
VALUES
  ('maria.client@test.dev', 'Maria Popescu',    'client', 'active', 'dev_maria.client@test.dev',    'ro'),
  ('ion.client@test.dev',   'Ion Ionescu',       'client', 'active', 'dev_ion.client@test.dev',      'ro'),
  ('elena.client@test.dev', 'Elena Dumitrescu',  'client', 'active', 'dev_elena.client@test.dev',    'ro')
ON CONFLICT (email) DO NOTHING;

-- 3 Company Admins (no company — test the application flow)
INSERT INTO users (email, full_name, role, status, google_id, preferred_language)
VALUES
  ('alex.company@test.dev',     'Alexandru Firma',    'company_admin', 'active', 'dev_alex.company@test.dev',     'ro'),
  ('cristina.company@test.dev', 'Cristina Business',  'company_admin', 'active', 'dev_cristina.company@test.dev', 'ro'),
  ('mihai.company@test.dev',    'Mihai Enterprise',   'company_admin', 'active', 'dev_mihai.company@test.dev',    'ro')
ON CONFLICT (email) DO NOTHING;

-- 3 Cleaners (no cleaner profile yet — test the invitation acceptance flow)
INSERT INTO users (email, full_name, role, status, google_id, preferred_language)
VALUES
  ('ana.cleaner@test.dev',    'Ana Curatenie',    'cleaner', 'active', 'dev_ana.cleaner@test.dev',    'ro'),
  ('bogdan.cleaner@test.dev', 'Bogdan Muncitor',  'cleaner', 'active', 'dev_bogdan.cleaner@test.dev', 'ro'),
  ('diana.cleaner@test.dev',  'Diana Igienizare', 'cleaner', 'active', 'dev_diana.cleaner@test.dev',  'ro')
ON CONFLICT (email) DO NOTHING;

-- 2 Global Admins
INSERT INTO users (email, full_name, role, status, google_id, preferred_language)
VALUES
  ('admin@test.dev',  'Admin Principal', 'global_admin', 'active', 'dev_admin@test.dev',  'ro'),
  ('admin2@test.dev', 'Admin Secundar',  'global_admin', 'active', 'dev_admin2@test.dev', 'ro')
ON CONFLICT (email) DO NOTHING;
