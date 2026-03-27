CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==========================================
-- ENUMS
-- ==========================================

DO $$ BEGIN
    CREATE TYPE service_order_status AS ENUM (
        'draft',
        'pending',
        'scheduled',
        'deslocamento',
        'in_progress',
        'paused',
        'in_audit',
        'completed',
        'rejected',
        'cancelled'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TYPE service_order_status ADD VALUE IF NOT EXISTS 'deslocamento';
EXCEPTION
    WHEN OTHERS THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE service_order_priority AS ENUM (
        'low',
        'medium',
        'high',
        'urgent'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE service_order_service_type AS ENUM (
        'eletrica',
        'hidraulica',
        'civil',
        'serralheria',
        'marmoraria',
        'marcenaria'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE sla_status AS ENUM (
        'within_sla',
        'warning',
        'breached'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE checklist_status AS ENUM (
        'pending',
        'in_progress',
        'completed'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ==========================================
-- 1. CORE ACCESS CONTROL
-- ==========================================

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_roles (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE ON UPDATE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, role_id)
);

-- ==========================================
-- 2. OPERATIONAL MANAGEMENT
-- ==========================================

CREATE TABLE IF NOT EXISTS teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    supervisor_id UUID REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS technicians (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    team_id UUID REFERENCES teams(id) ON DELETE SET NULL ON UPDATE CASCADE,
    specialty VARCHAR(255),
    availability_status VARCHAR(50) DEFAULT 'available',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 3. CLIENT & CONTRACT INFRASTRUCTURE
-- ==========================================

CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    document VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE ON UPDATE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('Manutenção', 'Obra')),
    contract_number VARCHAR(100),
    location VARCHAR(255),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    value DECIMAL(12, 2),
    last_adjustment_date DATE,
    next_adjustment_date DATE,
    adjustment_type VARCHAR(50),
    adjustment_percentage DECIMAL(5, 2),
    allows_corrective BOOLEAN DEFAULT true,
    has_preventive BOOLEAN DEFAULT false,
    preventive_frequency VARCHAR(50),
    sla_default INT,
    attachment_url VARCHAR(1024),
    terms TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS contract_price_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE ON UPDATE CASCADE,
    service_code VARCHAR(50) NOT NULL,
    service_name VARCHAR(255) NOT NULL,
    unit_price DECIMAL(12, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(contract_id, service_code)
);

-- ==========================================
-- 4. SERVICE ORDER LIFECYCLE
-- ==========================================

CREATE TABLE IF NOT EXISTS service_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE ON UPDATE CASCADE,
    contract_id UUID REFERENCES contracts(id) ON DELETE SET NULL ON UPDATE CASCADE,
    technician_id UUID REFERENCES technicians(id) ON DELETE SET NULL ON UPDATE CASCADE,
    status service_order_status NOT NULL DEFAULT 'pending',
    priority service_order_priority NOT NULL DEFAULT 'medium',
    service_type service_order_service_type NOT NULL DEFAULT 'civil',
    description TEXT,
    service_code VARCHAR(50),
    service_value DECIMAL(12, 2),
    
    -- Schedule & Deadlines
    scheduled_at TIMESTAMP WITH TIME ZONE,
    deadline_at TIMESTAMP WITH TIME ZONE,
    sla_status sla_status DEFAULT 'within_sla',
    
    -- Execution Time Tracking
    started_at TIMESTAMP WITH TIME ZONE,
    last_resumed_at TIMESTAMP WITH TIME ZONE,
    paused_at TIMESTAMP WITH TIME ZONE,
    finished_at TIMESTAMP WITH TIME ZONE,
    total_duration_minutes INT DEFAULT 0,
    estimated_duration_minutes INT DEFAULT 60,
    
    -- Spatial Data
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 5. RESOURCE MANAGEMENT
-- ==========================================

CREATE TABLE IF NOT EXISTS materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    unit_type VARCHAR(50),
    sku VARCHAR(100) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    material_id UUID NOT NULL REFERENCES materials(id) ON DELETE CASCADE ON UPDATE CASCADE,
    quantity INT NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    location VARCHAR(255),
    min_stock_level INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS service_order_materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_order_id UUID NOT NULL REFERENCES service_orders(id) ON DELETE CASCADE ON UPDATE CASCADE,
    material_id UUID NOT NULL REFERENCES materials(id) ON DELETE CASCADE ON UPDATE CASCADE,
    quantity_used INT NOT NULL CHECK (quantity_used > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plate VARCHAR(20) NOT NULL UNIQUE,
    model VARCHAR(255),
    brand VARCHAR(255),
    technician_id UUID REFERENCES technicians(id) ON DELETE SET NULL ON UPDATE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 6. QUALITY & COMPLIANCE
-- ==========================================

CREATE TABLE IF NOT EXISTS checklists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS checklist_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    checklist_id UUID NOT NULL REFERENCES checklists(id) ON DELETE CASCADE ON UPDATE CASCADE,
    label VARCHAR(255) NOT NULL,
    field_type VARCHAR(50) NOT NULL,
    is_required BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS service_order_checklists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_order_id UUID NOT NULL REFERENCES service_orders(id) ON DELETE CASCADE ON UPDATE CASCADE,
    checklist_id UUID NOT NULL REFERENCES checklists(id) ON DELETE CASCADE ON UPDATE CASCADE,
    status checklist_status DEFAULT 'pending',
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS checklist_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_order_checklist_id UUID NOT NULL REFERENCES service_order_checklists(id) ON DELETE CASCADE ON UPDATE CASCADE,
    checklist_item_id UUID NOT NULL REFERENCES checklist_items(id) ON DELETE CASCADE ON UPDATE CASCADE,
    response_text TEXT,
    response_boolean BOOLEAN,
    response_number DECIMAL,
    photo_url VARCHAR(1024),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_order_id UUID NOT NULL REFERENCES service_orders(id) ON DELETE CASCADE ON UPDATE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('initial', 'final')),
    storage_url VARCHAR(1024) NOT NULL,
    uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 7. TRACEABILITY
-- ==========================================

CREATE TABLE IF NOT EXISTS audits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name VARCHAR(255) NOT NULL,
    record_id UUID NOT NULL,
    action VARCHAR(50) NOT NULL,
    old_value JSONB,
    new_value JSONB,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    level VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    context JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- TRIGGERS FOR UPDATED_AT
-- ==========================================

CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN CREATE TRIGGER set_timestamp_users BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp(); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TRIGGER set_timestamp_roles BEFORE UPDATE ON roles FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp(); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TRIGGER set_timestamp_user_roles BEFORE UPDATE ON user_roles FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp(); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TRIGGER set_timestamp_teams BEFORE UPDATE ON teams FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp(); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TRIGGER set_timestamp_technicians BEFORE UPDATE ON technicians FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp(); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TRIGGER set_timestamp_clients BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp(); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TRIGGER set_timestamp_contracts BEFORE UPDATE ON contracts FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp(); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TRIGGER set_timestamp_contract_price_items BEFORE UPDATE ON contract_price_items FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp(); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TRIGGER set_timestamp_service_orders BEFORE UPDATE ON service_orders FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp(); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TRIGGER set_timestamp_materials BEFORE UPDATE ON materials FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp(); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TRIGGER set_timestamp_inventory BEFORE UPDATE ON inventory FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp(); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TRIGGER set_timestamp_service_order_materials BEFORE UPDATE ON service_order_materials FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp(); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TRIGGER set_timestamp_vehicles BEFORE UPDATE ON vehicles FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp(); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TRIGGER set_timestamp_checklists BEFORE UPDATE ON checklists FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp(); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TRIGGER set_timestamp_checklist_items BEFORE UPDATE ON checklist_items FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp(); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TRIGGER set_timestamp_service_order_checklists BEFORE UPDATE ON service_order_checklists FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp(); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TRIGGER set_timestamp_checklist_responses BEFORE UPDATE ON checklist_responses FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp(); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TRIGGER set_timestamp_photos BEFORE UPDATE ON photos FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp(); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TRIGGER set_timestamp_audits BEFORE UPDATE ON audits FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp(); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TRIGGER set_timestamp_logs BEFORE UPDATE ON logs FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp(); EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ==========================================
-- AUDIT TRIGGER FOR SERVICE ORDERS
-- ==========================================

CREATE OR REPLACE FUNCTION audit_service_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO audits (table_name, record_id, action, old_value, new_value)
    VALUES (
      'service_orders',
      NEW.id,
      'UPDATE',
      jsonb_build_object('status', OLD.status::text),
      jsonb_build_object('status', NEW.status::text)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
    CREATE TRIGGER audit_service_order_status
    AFTER UPDATE ON service_orders
    FOR EACH ROW
    EXECUTE FUNCTION audit_service_order_status_change();
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ==========================================
-- INDEXING STRATEGY
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON user_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_teams_supervisor_id ON teams(supervisor_id);
CREATE INDEX IF NOT EXISTS idx_technicians_user_id ON technicians(user_id);
CREATE INDEX IF NOT EXISTS idx_technicians_team_id ON technicians(team_id);
CREATE INDEX IF NOT EXISTS idx_contracts_client_id ON contracts(client_id);
CREATE INDEX IF NOT EXISTS idx_contract_price_items_contract_id ON contract_price_items(contract_id);
CREATE INDEX IF NOT EXISTS idx_service_orders_client_id ON service_orders(client_id);
CREATE INDEX IF NOT EXISTS idx_service_orders_contract_id ON service_orders(contract_id);
CREATE INDEX IF NOT EXISTS idx_service_orders_technician_id ON service_orders(technician_id);
CREATE INDEX IF NOT EXISTS idx_inventory_material_id ON inventory(material_id);
CREATE INDEX IF NOT EXISTS idx_so_materials_so_id ON service_order_materials(service_order_id);
CREATE INDEX IF NOT EXISTS idx_so_materials_material_id ON service_order_materials(material_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_technician_id ON vehicles(technician_id);
CREATE INDEX IF NOT EXISTS idx_checklists_created_by ON checklists(created_by);
CREATE INDEX IF NOT EXISTS idx_checklist_items_checklist_id ON checklist_items(checklist_id);
CREATE INDEX IF NOT EXISTS idx_so_checklists_so_id ON service_order_checklists(service_order_id);
CREATE INDEX IF NOT EXISTS idx_so_checklists_checklist_id ON service_order_checklists(checklist_id);
CREATE INDEX IF NOT EXISTS idx_checklist_responses_so_chk_id ON checklist_responses(service_order_checklist_id);
CREATE INDEX IF NOT EXISTS idx_photos_service_order_id ON photos(service_order_id);
CREATE INDEX IF NOT EXISTS idx_photos_uploaded_by ON photos(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_audits_user_id ON audits(user_id);

CREATE INDEX IF NOT EXISTS idx_service_orders_status ON service_orders(status);
CREATE INDEX IF NOT EXISTS idx_service_orders_priority ON service_orders(priority);
CREATE INDEX IF NOT EXISTS idx_service_orders_service_type ON service_orders(service_type);
CREATE INDEX IF NOT EXISTS idx_service_orders_sla_status ON service_orders(sla_status);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_clients_document ON clients(document);

-- ==========================================
-- OPERATIONAL EXAMPLES (SEED DATA)
-- ==========================================

INSERT INTO roles (id, name, description) VALUES ('11111111-1111-1111-1111-111111111111', 'Administrator', 'Full system access') ON CONFLICT (name) DO NOTHING;
INSERT INTO users (id, name, email, password_hash) VALUES ('22222222-2222-2222-2222-222222222222', 'Admin User', 'admin@example.com', 'hashed_pwd_123') ON CONFLICT (email) DO NOTHING;
INSERT INTO user_roles (user_id, role_id) VALUES ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111') ON CONFLICT (user_id, role_id) DO NOTHING;

INSERT INTO clients (id, name, document, email, phone, address)
VALUES ('33333333-3333-3333-3333-333333333333', 'Acme Corporation', '12.345.678/0001-90', 'contact@acme.com', '555-0199', '123 Business Avenue')
ON CONFLICT (document) DO NOTHING;

INSERT INTO contracts (id, client_id, name, type, contract_number, location, start_date, end_date, value)
VALUES ('77777777-7777-7777-7777-777777777777', '33333333-3333-3333-3333-333333333333', 'Manutenção Predial Alpha', 'Manutenção', 'CT-2023-001', 'Sede Principal', '2023-01-01', CURRENT_DATE + INTERVAL '15 days', 15000)
ON CONFLICT (id) DO NOTHING;

INSERT INTO contract_price_items (contract_id, service_code, service_name, unit_price)
VALUES 
('77777777-7777-7777-7777-777777777777', '001', 'Troca de lâmpada', 50.00),
('77777777-7777-7777-7777-777777777777', '002', 'Manutenção elétrica', 120.00)
ON CONFLICT (contract_id, service_code) DO NOTHING;

INSERT INTO technicians (id, user_id, specialty)
VALUES ('44444444-4444-4444-4444-444444444444', '22222222-2222-2222-2222-222222222222', 'General Maintenance')
ON CONFLICT (id) DO NOTHING;

INSERT INTO service_orders (id, client_id, contract_id, technician_id, status, priority, service_type, description, scheduled_at, deadline_at, sla_status, latitude, longitude, estimated_duration_minutes)
VALUES (
    '55555555-5555-5555-5555-555555555555', 
    '33333333-3333-3333-3333-333333333333', 
    '77777777-7777-7777-7777-777777777777',
    '44444444-4444-4444-4444-444444444444', 
    'pending', 
    'high', 
    'eletrica',
    'Annual HVAC maintenance and inspection.', 
    CURRENT_TIMESTAMP + INTERVAL '2 days',
    CURRENT_TIMESTAMP + INTERVAL '3 days',
    'within_sla',
    -23.5505,
    -46.6333,
    120
)
ON CONFLICT (id) DO NOTHING;
