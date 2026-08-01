# Engineering Quality Gates

All merges to the main branch must pass the following automated and manual quality gates:

## 1. Build & Compilation
- `pnpm run build` exits with code 0.
- No TypeScript compiler errors (`tsc --noEmit` succeeds).
- No circular dependencies detected in the package graph.

## 2. Static Analysis & Linting
- `eslint` reports zero errors.
- Prettier formatting is applied and verified.

## 3. Testing
- Unit and integration tests pass (`pnpm run test`).
- Test coverage must not decrease.

## 4. Architectural Checks
- Domain layer packages must not import Application or Infrastructure layer packages.
- All new API routes must be wrapped with the standard `withObservability` middleware.

## 5. Peer Review
- 1+ approvals from code owners.
- Security approval required if the change modifies `@healthsense/auth` or `@healthsense/security`.
