# Definition of Done

A feature, sprint, or phase is considered "Done" only when all of the following criteria are met:

1. **Code Complete**: All acceptance criteria defined in the mission/ticket are fully implemented.
2. **Quality Gates Passed**: The code compiles cleanly (`pnpm run build` exits with 0). There are no TypeScript errors or linter warnings.
3. **Tests Pass**: All unit and integration tests pass successfully. Code coverage for the new feature must be >80%.
4. **Architectural Certification**: The implementation adheres to the defined Architecture Principles and Dependency Rules.
5. **Security Review**: No PHI/PII is logged. RBAC is properly enforced. Secrets are securely managed.
6. **Documentation**: Code is documented. If applicable, the API spec, ADTs, or architecture blueprints are updated.
7. **Explainability**: Any AI/ML decisions made by the feature are accompanied by traceable evidence and confidence scores.
8. **Peer Review**: The PR has been reviewed and approved by the package owner.
