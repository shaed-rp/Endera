-- Create a simple configuration_sessions table for the configurator
CREATE TABLE IF NOT EXISTS configuration_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_token VARCHAR(255) UNIQUE NOT NULL,
    user_email VARCHAR(255),
    user_name VARCHAR(255),
    user_phone VARCHAR(255),
    user_type VARCHAR(50) DEFAULT 'customer',
    current_step VARCHAR(100) DEFAULT 'chassis_selection',
    session_status VARCHAR(50) DEFAULT 'active',
    selected_chassis_id UUID,
    selected_body_id UUID,
    selected_fuel_type VARCHAR(50),
    base_price DECIMAL(12,2),
    options_price DECIMAL(12,2),
    total_price DECIMAL(12,2),
    expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '30 days',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create configuration_selections table for tracking individual selections
CREATE TABLE IF NOT EXISTS configuration_selections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES configuration_sessions(id) ON DELETE CASCADE,
    selection_type VARCHAR(50) NOT NULL,
    selected_item_id UUID,
    selected_item_code VARCHAR(100),
    quantity INTEGER DEFAULT 1,
    unit_price DECIMAL(12,2),
    total_price DECIMAL(12,2),
    is_valid BOOLEAN DEFAULT true,
    validation_messages JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_config_sessions_token ON configuration_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_config_sessions_status ON configuration_sessions(session_status);
CREATE INDEX IF NOT EXISTS idx_config_selections_session ON configuration_selections(session_id);

