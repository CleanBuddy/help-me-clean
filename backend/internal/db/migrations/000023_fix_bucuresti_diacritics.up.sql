-- Update city name to use proper Romanian diacritics
UPDATE enabled_cities
SET name = 'București', county = 'București'
WHERE name = 'Bucuresti';
