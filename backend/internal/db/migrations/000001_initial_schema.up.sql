-- ============================================
-- USERS & AUTH
-- ============================================
CREATE TYPE user_role AS ENUM ('client', 'company_admin', 'cleaner', 'global_admin');
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'suspended', 'pending');

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    avatar_url TEXT,
    role user_role NOT NULL,
    status user_status NOT NULL DEFAULT 'active',
    google_id VARCHAR(255) UNIQUE,
    fcm_token TEXT,
    preferred_language VARCHAR(5) DEFAULT 'ro',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- CLIENT-SPECIFIC
-- ============================================
CREATE TABLE client_addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    label VARCHAR(100),
    street_address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    county VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20),
    floor VARCHAR(20),
    apartment VARCHAR(20),
    entry_code VARCHAR(50),
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    notes TEXT,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE client_payment_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    stripe_payment_method_id VARCHAR(255),
    card_last_four VARCHAR(4),
    card_brand VARCHAR(50),
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- COMPANIES
-- ============================================
CREATE TYPE company_status AS ENUM ('pending_review', 'approved', 'rejected', 'suspended');
CREATE TYPE company_type AS ENUM ('srl', 'pfa', 'ii');

CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_user_id UUID REFERENCES users(id),
    company_name VARCHAR(255) NOT NULL,
    cui VARCHAR(20) UNIQUE NOT NULL,
    company_type company_type NOT NULL,
    legal_representative VARCHAR(255) NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(50) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    county VARCHAR(100) NOT NULL,
    description TEXT,
    logo_url TEXT,
    status company_status NOT NULL DEFAULT 'pending_review',
    rejection_reason TEXT,
    max_service_radius_km INTEGER DEFAULT 20,
    rating_avg DECIMAL(3,2) DEFAULT 0.00,
    total_jobs_completed INTEGER DEFAULT 0,
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE company_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id),
    document_type VARCHAR(100) NOT NULL,
    file_url TEXT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- CLEANERS
-- ============================================
CREATE TYPE cleaner_status AS ENUM ('invited', 'active', 'inactive', 'suspended');

CREATE TABLE cleaners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    company_id UUID NOT NULL REFERENCES companies(id),
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(255),
    avatar_url TEXT,
    status cleaner_status NOT NULL DEFAULT 'invited',
    is_company_admin BOOLEAN DEFAULT FALSE,
    invite_token VARCHAR(255) UNIQUE,
    invite_expires_at TIMESTAMPTZ,
    rating_avg DECIMAL(3,2) DEFAULT 0.00,
    total_jobs_completed INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE cleaner_availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cleaner_id UUID NOT NULL REFERENCES cleaners(id),
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT TRUE
);

-- ============================================
-- SERVICES & PRICING
-- ============================================
CREATE TYPE service_type AS ENUM (
    'standard_cleaning',
    'deep_cleaning',
    'move_in_out_cleaning',
    'post_construction',
    'office_cleaning',
    'window_cleaning'
);

CREATE TABLE service_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_type service_type NOT NULL,
    name_ro VARCHAR(255) NOT NULL,
    name_en VARCHAR(255) NOT NULL,
    description_ro TEXT,
    description_en TEXT,
    base_price_per_hour DECIMAL(10,2) NOT NULL,
    min_hours DECIMAL(3,1) NOT NULL DEFAULT 2.0,
    icon VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE service_extras (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name_ro VARCHAR(255) NOT NULL,
    name_en VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    icon VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE
);

-- ============================================
-- BOOKINGS / JOBS
-- ============================================
CREATE TYPE booking_status AS ENUM (
    'pending',
    'assigned',
    'confirmed',
    'in_progress',
    'completed',
    'cancelled_by_client',
    'cancelled_by_company',
    'cancelled_by_admin'
);

CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reference_code VARCHAR(20) UNIQUE NOT NULL,
    client_user_id UUID NOT NULL REFERENCES users(id),
    company_id UUID REFERENCES companies(id),
    cleaner_id UUID REFERENCES cleaners(id),
    address_id UUID NOT NULL REFERENCES client_addresses(id),
    service_type service_type NOT NULL,
    scheduled_date DATE NOT NULL,
    scheduled_start_time TIME NOT NULL,
    estimated_duration_hours DECIMAL(3,1) NOT NULL,
    property_type VARCHAR(50),
    num_rooms INTEGER,
    num_bathrooms INTEGER,
    area_sqm INTEGER,
    has_pets BOOLEAN DEFAULT FALSE,
    special_instructions TEXT,
    hourly_rate DECIMAL(10,2) NOT NULL,
    estimated_total DECIMAL(10,2) NOT NULL,
    final_total DECIMAL(10,2),
    platform_commission_pct DECIMAL(5,2) DEFAULT 25.00,
    platform_commission_amount DECIMAL(10,2),
    status booking_status NOT NULL DEFAULT 'pending',
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    cancellation_reason TEXT,
    stripe_payment_intent_id VARCHAR(255),
    payment_status VARCHAR(50) DEFAULT 'pending',
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE booking_extras (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(id),
    extra_id UUID NOT NULL REFERENCES service_extras(id),
    price DECIMAL(10,2) NOT NULL,
    quantity INTEGER DEFAULT 1
);

-- ============================================
-- REVIEWS
-- ============================================
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(id) UNIQUE,
    reviewer_user_id UUID NOT NULL REFERENCES users(id),
    reviewed_user_id UUID REFERENCES users(id),
    reviewed_cleaner_id UUID REFERENCES cleaners(id),
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    review_type VARCHAR(20) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- CHAT / MESSAGING
-- ============================================
CREATE TABLE chat_rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES bookings(id),
    room_type VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE chat_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL REFERENCES chat_rooms(id),
    user_id UUID NOT NULL REFERENCES users(id),
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(room_id, user_id)
);

CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL REFERENCES chat_rooms(id),
    sender_id UUID NOT NULL REFERENCES users(id),
    content TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- NOTIFICATIONS
-- ============================================
CREATE TYPE notification_type AS ENUM (
    'booking_created', 'booking_assigned', 'booking_confirmed',
    'booking_started', 'booking_completed', 'booking_cancelled',
    'cleaner_invited', 'company_approved', 'company_rejected',
    'new_message', 'review_received', 'payment_processed'
);

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    type notification_type NOT NULL,
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    data JSONB,
    is_read BOOLEAN DEFAULT FALSE,
    is_pushed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- PLATFORM STATS
-- ============================================
CREATE TABLE platform_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id UUID,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_bookings_client ON bookings(client_user_id);
CREATE INDEX idx_bookings_company ON bookings(company_id);
CREATE INDEX idx_bookings_cleaner ON bookings(cleaner_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_date ON bookings(scheduled_date);
CREATE INDEX idx_cleaners_company ON cleaners(company_id);
CREATE INDEX idx_chat_messages_room ON chat_messages(room_id);
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX idx_platform_events_type ON platform_events(event_type, created_at);

-- ============================================
-- SEED DATA: Service Definitions
-- ============================================
INSERT INTO service_definitions (service_type, name_ro, name_en, description_ro, description_en, base_price_per_hour, min_hours, icon) VALUES
('standard_cleaning', 'Curatenie Standard', 'Standard Cleaning', 'Curatenie regulata pentru locuinta', 'Regular home cleaning', 45.00, 2.0, 'sparkles'),
('deep_cleaning', 'Curatenie Generala', 'Deep Cleaning', 'Curatenie completa si detaliata', 'Complete deep cleaning', 65.00, 3.0, 'stars'),
('move_in_out_cleaning', 'Curatenie Mutare', 'Move In/Out Cleaning', 'Curatenie pentru mutare', 'Moving cleaning service', 70.00, 4.0, 'truck'),
('post_construction', 'Dupa Constructor', 'Post Construction', 'Curatenie dupa renovari', 'Post renovation cleaning', 80.00, 4.0, 'hammer'),
('office_cleaning', 'Curatenie Birou', 'Office Cleaning', 'Curatenie pentru spatii de birou', 'Office space cleaning', 50.00, 2.0, 'building'),
('window_cleaning', 'Spalat Geamuri', 'Window Cleaning', 'Curatenie geamuri interior/exterior', 'Interior/exterior window cleaning', 55.00, 2.0, 'window');

INSERT INTO service_extras (name_ro, name_en, price, icon) VALUES
('Interior frigider', 'Fridge Interior', 30.00, 'fridge'),
('Interior cuptor', 'Oven Interior', 25.00, 'oven'),
('Calcat rufe', 'Ironing', 40.00, 'iron'),
('Curatat geamuri interioare', 'Interior Windows', 35.00, 'window'),
('Spalat vase', 'Dish Washing', 20.00, 'dishes'),
('Organizare dulap', 'Closet Organization', 45.00, 'closet');
