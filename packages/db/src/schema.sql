-- Initial Database Schema (SQLite Compatible)
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY DEFAULT (gen_random_uuid()),
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('patient', 'admin', 'clinician')),
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    deleted_at TEXT DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS patient_profiles (
    id TEXT PRIMARY KEY DEFAULT (gen_random_uuid()),
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    date_of_birth TEXT NOT NULL,
    gender TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS patient_twins (
    id TEXT PRIMARY KEY DEFAULT (gen_random_uuid()),
    patient_id TEXT REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    version INT NOT NULL DEFAULT 1,
    state TEXT NOT NULL DEFAULT '{}',
    clinical_history TEXT NOT NULL DEFAULT '[]',
    snapshots TEXT NOT NULL DEFAULT '[]',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_log (
    id TEXT PRIMARY KEY DEFAULT (gen_random_uuid()),
    user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id TEXT NOT NULL,
    metadata TEXT DEFAULT '{}',
    ip_address TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS medical_records (
    id TEXT PRIMARY KEY DEFAULT (gen_random_uuid()),
    patient_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    record_type TEXT NOT NULL,
    title TEXT NOT NULL,
    data TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS care_plans (
    id TEXT PRIMARY KEY DEFAULT (gen_random_uuid()),
    patient_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    status TEXT NOT NULL,
    goals TEXT NOT NULL DEFAULT '[]',
    conditions TEXT NOT NULL DEFAULT '[]',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS medications (
    id TEXT PRIMARY KEY DEFAULT (gen_random_uuid()),
    patient_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    dosage TEXT NOT NULL,
    frequency TEXT NOT NULL,
    active BOOLEAN DEFAULT 1,
    prescribed_date TEXT,
    data TEXT DEFAULT '{}',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS health_assessments (
    id TEXT PRIMARY KEY DEFAULT (gen_random_uuid()),
    patient_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    assessment_type TEXT NOT NULL,
    result TEXT NOT NULL DEFAULT '{}',
    decision TEXT NOT NULL DEFAULT '{}',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS triage_sessions (
    id TEXT PRIMARY KEY DEFAULT (gen_random_uuid()),
    data TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS knowledge_snapshots (
    id TEXT PRIMARY KEY,
    data TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS knowledge_concepts (
    id TEXT PRIMARY KEY,
    snapshot_id TEXT REFERENCES knowledge_snapshots(id) ON DELETE CASCADE,
    data TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS knowledge_edges (
    source_id TEXT NOT NULL,
    target_id TEXT NOT NULL,
    snapshot_id TEXT REFERENCES knowledge_snapshots(id) ON DELETE CASCADE,
    data TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(source_id, target_id, snapshot_id)
);

CREATE TABLE IF NOT EXISTS patient_invitations (
    id TEXT PRIMARY KEY DEFAULT (gen_random_uuid()),
    clinician_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    patient_email TEXT NOT NULL,
    invite_code TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired')),
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS analytics_events (
    id TEXT PRIMARY KEY DEFAULT (gen_random_uuid()),
    event_name TEXT NOT NULL,
    category TEXT NOT NULL,
    user_role TEXT,
    anonymized_session_id TEXT,
    payload TEXT DEFAULT '{}',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS huse_state_transitions (
    id TEXT PRIMARY KEY DEFAULT (gen_random_uuid()),
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    from_state TEXT NOT NULL,
    to_state TEXT NOT NULL,
    actor_id TEXT,
    correlation_id TEXT,
    execution_id TEXT,
    reason TEXT,
    metadata TEXT DEFAULT '{}',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for commonly queried columns and foreign keys
CREATE INDEX IF NOT EXISTS idx_patient_profiles_user_id ON patient_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_patient_twins_patient_id ON patient_twins(patient_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_resource ON audit_log(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_patient_id ON medical_records(patient_id);
CREATE INDEX IF NOT EXISTS idx_care_plans_patient_id ON care_plans(patient_id);
CREATE INDEX IF NOT EXISTS idx_medications_patient_id ON medications(patient_id);
CREATE INDEX IF NOT EXISTS idx_health_assessments_patient_id ON health_assessments(patient_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_concepts_snapshot_id ON knowledge_concepts(snapshot_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_edges_snapshot_id ON knowledge_edges(snapshot_id);
CREATE INDEX IF NOT EXISTS idx_patient_invitations_clinician ON patient_invitations(clinician_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_name ON analytics_events(event_name);
CREATE INDEX IF NOT EXISTS idx_huse_state_entity ON huse_state_transitions(entity_type, entity_id);
