# Repository Standards

## 1. Monorepo Tooling
- We use `pnpm` workspaces for package management.
- We use `turbo` for task orchestration (build, test, lint).
- Scripts in the root `package.json` should delegate to Turborepo.

## 2. Package Structure
Every package in `packages/*` must follow this structure:
```
package-name/
  ├── src/           # Source code
  ├── tests/         # Unit and integration tests
  ├── package.json   # Package metadata and scripts
  ├── tsconfig.json  # TypeScript configuration
  └── index.ts       # Public API barrel file
```

## 3. Versioning
All internal packages are versioned together (currently `1.0.0`) and linked via `workspace:^`.

## 4. Environment Variables
- Environment variables are strictly managed by the `@healthsense/env` package using Zod schema validation.
- No direct usage of `process.env` in business logic packages.

## 5. Commit Guidelines
- Commit messages must follow Conventional Commits format (e.g., `feat:`, `fix:`, `chore:`, `refactor:`).
- Commits must reference a Jira ticket or GitHub issue where applicable.
