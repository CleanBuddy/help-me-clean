ALTER TABLE service_extras
  ADD COLUMN allow_multiple BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN unit_label     VARCHAR(50);

-- Seed correct types for existing extras
UPDATE service_extras SET allow_multiple = FALSE WHERE name_en IN ('Fridge Interior', 'Oven Interior', 'Ironing', 'Dish Washing');
UPDATE service_extras SET allow_multiple = TRUE, unit_label = 'geam' WHERE name_en = 'Interior Windows';
UPDATE service_extras SET allow_multiple = TRUE, unit_label = 'dulap' WHERE name_en = 'Closet Organization';
