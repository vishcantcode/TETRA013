CREATE TABLE users (id UUID PRIMARY KEY, created_at TIMESTAMP, updated_at TIMESTAMP, deleted_at TIMESTAMP);
CREATE TABLE audit_records (id UUID PRIMARY KEY, user_id UUID, action TEXT, created_at TIMESTAMP);
