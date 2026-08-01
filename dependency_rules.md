# Dependency Rules

## 1. Monorepo Boundaries
Packages within the monorepo must strictly declare their dependencies in their `package.json`. No implicit cross-package imports (e.g., importing via `../../packages/other/src`) are allowed.

## 2. Cyclic Dependencies
Cyclic dependencies between packages are strictly forbidden. If Package A depends on Package B, Package B cannot depend on Package A. This must be validated by the build system.

## 3. External Dependencies
- All external dependencies must be pinned to exact versions in production.
- Third-party libraries in the domain layer are heavily restricted (only utility libraries like `lodash` or `zod` are permitted). Frameworks (e.g., React, Express, Supabase) belong in the Presentation or Infrastructure layers.

## 4. Allowed Monorepo Dependency Graph
- **Infrastructure Packages** (e.g., `@healthsense/db`, `@healthsense/supabase`) can depend on **Domain Packages** (e.g., `@healthsense/clinical-models`).
- **Application Packages** (e.g., `@healthsense/api`) can depend on **Workflow Packages** (e.g., `@healthsense/workflow-runtime`) and **Domain Packages**.
- **Domain Packages** CANNOT depend on Infrastructure or Application packages.
- **Frontend Applications** (e.g., `@healthsense/patient-app`) CANNOT depend on Backend Application packages directly; they must interact via network APIs or shared type packages (`@healthsense/types`).
