# Code Review Checklist

Before approving any pull request, reviewers must verify the following:

## 1. Architecture & Boundaries
- [ ] Does this change respect the unidirectional dependency rule?
- [ ] Are new package dependencies explicitly declared and justified?
- [ ] Is business logic kept strictly within the domain/application layers?

## 2. API & Contracts
- [ ] Are all public API endpoints using the standardized response envelope?
- [ ] Is input validation applied at the boundary using Zod (or equivalent)?
- [ ] Are correlation IDs maintained across asynchronous calls?

## 3. Digital Twin Integrity
- [ ] If mutating patient state, is the action recorded as an explicit event/snapshot?
- [ ] Is the deterministic versioning strategy maintained?

## 4. Security
- [ ] Does this change involve sensitive data (PHI/PII)? If so, is it encrypted/masked appropriately?
- [ ] Are authentication/authorization checks correctly enforced?

## 5. Testing
- [ ] Does this PR include unit tests for all new business logic?
- [ ] Do integration tests exist for new API endpoints?
- [ ] Does the CI pipeline pass successfully (`pnpm run test` and `pnpm run build`)?

## 6. Observability
- [ ] Are adequate logs present for critical execution paths (without logging PHI)?
- [ ] Are error boundaries handling exceptions gracefully?
