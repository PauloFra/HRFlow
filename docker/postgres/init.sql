-- HRFlow Database Initialization Script
-- This script runs when PostgreSQL container starts for the first time

-- Create database if not exists (already created by POSTGRES_DB env var)
-- Additional database setup can be added here

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- Set timezone
SET timezone = 'America/Sao_Paulo';

-- Create schemas for organization
CREATE SCHEMA IF NOT EXISTS audit;
CREATE SCHEMA IF NOT EXISTS logs;

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE hrflow_db TO hrflow_user;
GRANT ALL PRIVILEGES ON SCHEMA public TO hrflow_user;
GRANT ALL PRIVILEGES ON SCHEMA audit TO hrflow_user;
GRANT ALL PRIVILEGES ON SCHEMA logs TO hrflow_user;

-- Create audit log function for tracking changes
CREATE OR REPLACE FUNCTION audit.log_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        INSERT INTO audit.activity_logs (
            table_name,
            operation,
            old_data,
            user_id,
            timestamp
        ) VALUES (
            TG_TABLE_NAME,
            TG_OP,
            row_to_json(OLD),
            current_setting('app.user_id', true)::uuid,
            NOW()
        );
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit.activity_logs (
            table_name,
            operation,
            old_data,
            new_data,
            user_id,
            timestamp
        ) VALUES (
            TG_TABLE_NAME,
            TG_OP,
            row_to_json(OLD),
            row_to_json(NEW),
            current_setting('app.user_id', true)::uuid,
            NOW()
        );
        RETURN NEW;
    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO audit.activity_logs (
            table_name,
            operation,
            new_data,
            user_id,
            timestamp
        ) VALUES (
            TG_TABLE_NAME,
            TG_OP,
            row_to_json(NEW),
            current_setting('app.user_id', true)::uuid,
            NOW()
        );
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create audit logs table
CREATE TABLE IF NOT EXISTS audit.activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_name VARCHAR(50) NOT NULL,
    operation VARCHAR(10) NOT NULL,
    old_data JSONB,
    new_data JSONB,
    user_id UUID,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_audit_table_name ON audit.activity_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_user_id ON audit.activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit.activity_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_operation ON audit.activity_logs(operation);

-- Performance monitoring table
CREATE TABLE IF NOT EXISTS logs.performance_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    endpoint VARCHAR(255) NOT NULL,
    method VARCHAR(10) NOT NULL,
    duration_ms INTEGER NOT NULL,
    status_code INTEGER NOT NULL,
    user_id UUID,
    ip_address INET,
    user_agent TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance logs
CREATE INDEX IF NOT EXISTS idx_perf_endpoint ON logs.performance_logs(endpoint);
CREATE INDEX IF NOT EXISTS idx_perf_timestamp ON logs.performance_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_perf_user_id ON logs.performance_logs(user_id);

-- Application logs table
CREATE TABLE IF NOT EXISTS logs.app_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    level VARCHAR(10) NOT NULL,
    message TEXT NOT NULL,
    metadata JSONB,
    service VARCHAR(50) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for app logs
CREATE INDEX IF NOT EXISTS idx_app_logs_level ON logs.app_logs(level);
CREATE INDEX IF NOT EXISTS idx_app_logs_service ON logs.app_logs(service);
CREATE INDEX IF NOT EXISTS idx_app_logs_timestamp ON logs.app_logs(timestamp);

-- Clean up old logs function (keep last 90 days)
CREATE OR REPLACE FUNCTION logs.cleanup_old_logs()
RETURNS void AS $$
BEGIN
    DELETE FROM audit.activity_logs WHERE timestamp < NOW() - INTERVAL '90 days';
    DELETE FROM logs.performance_logs WHERE timestamp < NOW() - INTERVAL '90 days';
    DELETE FROM logs.app_logs WHERE timestamp < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql; 