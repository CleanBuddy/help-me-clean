-- Add configurable duration calculation parameters to service_definitions.
ALTER TABLE service_definitions ADD COLUMN hours_per_room DECIMAL(4,2) NOT NULL DEFAULT 0.5;
ALTER TABLE service_definitions ADD COLUMN hours_per_bathroom DECIMAL(4,2) NOT NULL DEFAULT 0.5;
ALTER TABLE service_definitions ADD COLUMN hours_per_100_sqm DECIMAL(4,2) NOT NULL DEFAULT 1.0;
ALTER TABLE service_definitions ADD COLUMN house_multiplier DECIMAL(3,2) NOT NULL DEFAULT 1.3;
ALTER TABLE service_definitions ADD COLUMN pet_duration_minutes INTEGER NOT NULL DEFAULT 15;

-- Add duration contribution to service_extras.
ALTER TABLE service_extras ADD COLUMN duration_minutes INTEGER NOT NULL DEFAULT 0;

-- Set realistic per-service-type defaults.
UPDATE service_definitions SET hours_per_room = 0.50, hours_per_bathroom = 0.50, hours_per_100_sqm = 1.00, house_multiplier = 1.30, pet_duration_minutes = 15 WHERE service_type = 'standard_cleaning';
UPDATE service_definitions SET hours_per_room = 0.75, hours_per_bathroom = 0.75, hours_per_100_sqm = 1.50, house_multiplier = 1.30, pet_duration_minutes = 20 WHERE service_type = 'deep_cleaning';
UPDATE service_definitions SET hours_per_room = 1.00, hours_per_bathroom = 0.75, hours_per_100_sqm = 1.50, house_multiplier = 1.30, pet_duration_minutes = 15 WHERE service_type = 'move_in_out_cleaning';
UPDATE service_definitions SET hours_per_room = 1.00, hours_per_bathroom = 1.00, hours_per_100_sqm = 2.00, house_multiplier = 1.20, pet_duration_minutes = 10 WHERE service_type = 'post_construction';
UPDATE service_definitions SET hours_per_room = 0.40, hours_per_bathroom = 0.50, hours_per_100_sqm = 0.80, house_multiplier = 1.00, pet_duration_minutes = 0  WHERE service_type = 'office_cleaning';
UPDATE service_definitions SET hours_per_room = 0.30, hours_per_bathroom = 0.00, hours_per_100_sqm = 0.50, house_multiplier = 1.00, pet_duration_minutes = 0  WHERE service_type = 'window_cleaning';

-- Set duration for common extras (match by English name pattern).
UPDATE service_extras SET duration_minutes = 30 WHERE LOWER(name_en) LIKE '%fridge%';
UPDATE service_extras SET duration_minutes = 30 WHERE LOWER(name_en) LIKE '%oven%';
UPDATE service_extras SET duration_minutes = 45 WHERE LOWER(name_en) LIKE '%iron%';
UPDATE service_extras SET duration_minutes = 20 WHERE LOWER(name_en) LIKE '%window%';
UPDATE service_extras SET duration_minutes = 20 WHERE LOWER(name_en) LIKE '%dish%';
UPDATE service_extras SET duration_minutes = 30 WHERE LOWER(name_en) LIKE '%closet%' OR LOWER(name_en) LIKE '%organiz%';
