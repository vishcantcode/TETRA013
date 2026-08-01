-- ============================================================================
-- HealthSense OS — Patient Digital Twin Platform PostgreSQL Master Schema
-- Migration File: 001_patient_digital_twin_schema.sql
-- ============================================================================

-- Extension setup
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- 1. Patient Digital Twins Master State Table
CREATE TABLE IF NOT EXISTS patient_twins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL UNIQUE,
    version INT NOT NULL DEFAULT 1,
    status VARCHAR(32) NOT NULL DEFAULT 'initialized',
    state_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Patient Digital Twin Version History & Delta Audit Table
CREATE TABLE IF NOT EXISTS twin_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    twin_id UUID NOT NULL REFERENCES patient_twins(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL,
    version INT NOT NULL,
    delta_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    snapshot_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT idx_twin_version_patient_ver UNIQUE (patient_id, version)
);

-- 3. Patient Diagnosed Conditions Table
CREATE TABLE IF NOT EXISTS patient_conditions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL,
    icd10_code VARCHAR(32) NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(64) NOT NULL DEFAULT 'chronic',
    status VARCHAR(32) NOT NULL DEFAULT 'active',
    severity VARCHAR(32) NOT NULL DEFAULT 'moderate',
    onset_date TIMESTAMPTZ NOT NULL,
    resolved_date TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Active Pharmacological State Table
CREATE TABLE IF NOT EXISTS patient_medications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL,
    rxnorm_code VARCHAR(32) NOT NULL,
    name VARCHAR(255) NOT NULL,
    dosage VARCHAR(64) NOT NULL,
    frequency VARCHAR(64) NOT NULL DEFAULT 'daily',
    plasma_concentration_est NUMERIC(5, 2) NOT NULL DEFAULT 1.0,
    last_administered_at TIMESTAMPTZ,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Diagnostic Biomarkers Lab Table
CREATE TABLE IF NOT EXISTS biomarkers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL,
    loinc_code VARCHAR(32) NOT NULL,
    name VARCHAR(255) NOT NULL,
    value NUMERIC(12, 4) NOT NULL,
    unit VARCHAR(32) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'normal',
    reference_range VARCHAR(64),
    confidence NUMERIC(3, 2) NOT NULL DEFAULT 1.0,
    timestamp TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Vital Signs Observation Table
CREATE TABLE IF NOT EXISTS vitals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL,
    metric VARCHAR(64) NOT NULL,
    value NUMERIC(10, 2) NOT NULL,
    unit VARCHAR(32) NOT NULL,
    confidence NUMERIC(3, 2) NOT NULL DEFAULT 1.0,
    timestamp TIMESTAMPTZ NOT NULL,
    half_life_ms INT NOT NULL DEFAULT 300000,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Evaluated Clinical Outcome Risk Scores Table
CREATE TABLE IF NOT EXISTS risk_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL,
    risk_type VARCHAR(64) NOT NULL,
    score NUMERIC(5, 4) NOT NULL,
    trend VARCHAR(32) NOT NULL DEFAULT 'stable',
    confidence NUMERIC(3, 2) NOT NULL DEFAULT 1.0,
    evidence_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
    timestamp TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- INDEXES & PERFORMANCE OPTIMIZATIONS
-- ============================================================================

-- Primary & Foreign Key Indexes
CREATE INDEX IF NOT EXISTS idx_patient_twins_patient_id ON patient_twins(patient_id);
CREATE INDEX IF NOT EXISTS idx_twin_versions_patient_id ON twin_versions(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_conditions_patient_id ON patient_conditions(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_medications_patient_id ON patient_medications(patient_id);
CREATE INDEX IF NOT EXISTS idx_biomarkers_patient_id ON biomarkers(patient_id);
CREATE INDEX IF NOT EXISTS idx_vitals_patient_id ON vitals(patient_id);
CREATE INDEX IF NOT EXISTS idx_risk_scores_patient_id ON risk_scores(patient_id);

-- GIN Index on State JSON for fast sub-property queries
CREATE INDEX IF NOT EXISTS idx_patient_twins_state_json_gin ON patient_twins USING GIN (state_json);

-- Time-Series Range Query Indexes
CREATE INDEX IF NOT EXISTS idx_vitals_patient_metric_time ON vitals(patient_id, metric, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_biomarkers_patient_loinc_time ON biomarkers(patient_id, loinc_code, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_risk_scores_patient_type_time ON risk_scores(patient_id, risk_type, timestamp DESC);
