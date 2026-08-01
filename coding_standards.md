# Coding Standards

## 1. TypeScript Only
All code must be written in strict TypeScript. No `any` types are permitted in business logic or API contracts.

## 2. Immutability
Favor immutable data structures. Update domain objects by returning new copies rather than mutating properties directly.

## 3. Functional Core, Imperative Shell
Keep the core business logic pure. Push side effects (database, network, file IO) to the outer edges of the architecture.

## 4. Error Handling
Do not throw exceptions for expected business failures (e.g., validation errors, not found). Use Result/Either types or distinct return objects to model expected errors. Only throw exceptions for truly exceptional, unrecoverable states (e.g., database connection failure).

## 5. File Structure
- `src/domain/`: Entities, Value Objects, Domain Events.
- `src/application/`: Use cases, Workflows, Services.
- `src/infrastructure/`: Database adapters, External API clients.
- `src/interfaces/`: REST endpoints, GraphQL resolvers.

## 6. Naming Conventions
- `PascalCase` for Classes, Interfaces, Types.
- `camelCase` for variables, functions, methods.
- `UPPER_SNAKE_CASE` for constants.
- Interfaces representing data transfer should be suffixed with `DTO` (e.g., `PatientDTO`).
- Interfaces representing repositories should be named `I<Entity>Repository`.
