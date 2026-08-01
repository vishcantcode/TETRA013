# Package Ownership

Every package in the HealthSense repository must have an explicitly defined owner team. Owners are responsible for the health, architectural integrity, and security of the package.

## Core Platform Team
- `@healthsense/core`
- `@healthsense/env`
- `@healthsense/logger`
- `@healthsense/utils`
- `@healthsense/validation`
- `@healthsense/types`

## Security & Auth Team
- `@healthsense/auth`
- `@healthsense/security`

## Data Engineering Team
- `@healthsense/db`
- `@healthsense/supabase`
- `@healthsense/offline-sync`

## Intelligence & Clinical Team
- `@healthsense/ai`
- `@healthsense/clinical-models`
- `@healthsense/chronic-disease`
- `@healthsense/preventive-intelligence`
- `@healthsense/medication-intelligence`
- `@healthsense/confidence`
- `@healthsense/explainability`
- `@healthsense/workflow-runtime`
- `@healthsense/patient-digital-twin`

## API & Gateway Team
- `@healthsense/api`

## Frontend / Patient Experience Team
- `@healthsense/ui`
- `@healthsense/patient-app`

Changes to a package must be reviewed by at least one member of the owning team.
