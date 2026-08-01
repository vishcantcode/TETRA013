-- ============================================================================
-- HealthSense OS — Patient Digital Twin TimescaleDB Telemetry Migration
-- Migration File: 002_timescaledb_telemetry_hypertables.sql
-- ============================================================================

-- Enable TimescaleDB Extension if available
CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;

-- 1. High-Volume Physiological Vital Telemetry Table
CREATE TABLE IF NOT EXISTS vitals_telemetry (
    timestamp TIMESTAMPTZ NOT NULL,
    patient_id UUID NOT NULL,
    metric VARCHAR(64) NOT NULL,
    value NUMERIC(10, 2) NOT NULL,
    unit VARCHAR(32) NOT NULL,
    confidence NUMERIC(3, 2) NOT NULL DEFAULT 1.0,
    half_life_ms INT NOT NULL DEFAULT 300000,
    device_id VARCHAR(128),
    PRIMARY KEY (timestamp, patient_id, metric)
);

-- 2. Longitudinal Biomarker Lab Telemetry Table
CREATE TABLE IF NOT EXISTS biomarkers_telemetry (
    timestamp TIMESTAMPTZ NOT NULL,
    patient_id UUID NOT NULL,
    loinc_code VARCHAR(32) NOT NULL,
    name VARCHAR(255) NOT NULL,
    value NUMERIC(12, 4) NOT NULL,
    unit VARCHAR(32) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'normal',
    reference_range VARCHAR(64),
    confidence NUMERIC(3, 2) NOT NULL DEFAULT 1.0,
    PRIMARY KEY (timestamp, patient_id, loinc_code)
);

-- 3. Clinical Outcome Risk Scores History Table
CREATE TABLE IF NOT EXISTS risk_scores_telemetry (
    timestamp TIMESTAMPTZ NOT NULL,
    patient_id UUID NOT NULL,
    risk_type VARCHAR(64) NOT NULL,
    score NUMERIC(5, 4) NOT NULL,
    trend VARCHAR(32) NOT NULL DEFAULT 'stable',
    confidence NUMERIC(3, 2) NOT NULL DEFAULT 1.0,
    evidence_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
    PRIMARY KEY (timestamp, patient_id, risk_type)
);

-- 4. Patient Event Timeline Table
CREATE TABLE IF NOT EXISTS patient_event_timeline (
    timestamp TIMESTAMPTZ NOT NULL,
    patient_id UUID NOT NULL,
    event_id UUID NOT NULL DEFAULT gen_random_uuid(),
    event_type VARCHAR(64) NOT NULL,
    source VARCHAR(64) NOT NULL,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    PRIMARY KEY (timestamp, patient_id, event_id)
);

-- Convert to TimescaleDB Hypertables (7-day chunking)
SELECT create_hypertable('vitals_telemetry', 'timestamp', if_not_exists => TRUE, chunk_time_interval => INTERVAL '7 days');
SELECT create_hypertable('biomarkers_telemetry', 'timestamp', if_not_exists => TRUE, chunk_time_interval => INTERVAL '7 days');
SELECT create_hypertable('risk_scores_telemetry', 'timestamp', if_not_exists => TRUE, chunk_time_interval => INTERVAL '7 days');
SELECT create_hypertable('patient_event_timeline', 'timestamp', if_not_exists => TRUE, chunk_time_interval => INTERVAL '7 days');

-- Time-Series Indexes
CREATE INDEX IF NOT EXISTS idx_vitals_telemetry_patient_time ON vitals_telemetry (patient_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_biomarkers_telemetry_patient_time ON biomarkers_telemetry (patient_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_risk_scores_telemetry_patient_time ON risk_scores_telemetry (patient_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_patient_event_timeline_patient_time ON patient_event_timeline (patient_id, timestamp DESC);
