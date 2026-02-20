-- Revert to ASCII-only spelling
UPDATE enabled_cities
SET name = 'Bucuresti', county = 'Bucuresti'
WHERE name = 'București';
