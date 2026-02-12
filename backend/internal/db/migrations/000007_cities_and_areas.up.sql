-- Admin-managed enabled cities
CREATE TABLE enabled_cities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    county VARCHAR(100) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Predefined areas within a city (e.g. Sector 1-6 for Bucharest)
CREATE TABLE city_areas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    city_id UUID NOT NULL REFERENCES enabled_cities(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(city_id, name)
);

-- Which areas a company services
CREATE TABLE company_service_areas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    city_area_id UUID NOT NULL REFERENCES city_areas(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(company_id, city_area_id)
);

-- Which areas a cleaner is assigned to (subset of company areas)
CREATE TABLE cleaner_service_areas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cleaner_id UUID NOT NULL REFERENCES cleaners(id) ON DELETE CASCADE,
    city_area_id UUID NOT NULL REFERENCES city_areas(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(cleaner_id, city_area_id)
);

-- Indexes
CREATE INDEX idx_city_areas_city ON city_areas(city_id);
CREATE INDEX idx_company_service_areas_company ON company_service_areas(company_id);
CREATE INDEX idx_company_service_areas_area ON company_service_areas(city_area_id);
CREATE INDEX idx_cleaner_service_areas_cleaner ON cleaner_service_areas(cleaner_id);
CREATE INDEX idx_cleaner_service_areas_area ON cleaner_service_areas(city_area_id);

-- Seed: Bucharest with 6 sectors
INSERT INTO enabled_cities (name, county, is_active) VALUES ('Bucuresti', 'Bucuresti', true);

INSERT INTO city_areas (city_id, name) VALUES
    ((SELECT id FROM enabled_cities WHERE name = 'Bucuresti'), 'Sector 1'),
    ((SELECT id FROM enabled_cities WHERE name = 'Bucuresti'), 'Sector 2'),
    ((SELECT id FROM enabled_cities WHERE name = 'Bucuresti'), 'Sector 3'),
    ((SELECT id FROM enabled_cities WHERE name = 'Bucuresti'), 'Sector 4'),
    ((SELECT id FROM enabled_cities WHERE name = 'Bucuresti'), 'Sector 5'),
    ((SELECT id FROM enabled_cities WHERE name = 'Bucuresti'), 'Sector 6');
