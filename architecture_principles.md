# Architecture Principles

## 1. Domain-Driven Core
The core domain is the source of truth. All business logic, clinical rules, and health intelligence must reside in the domain layer. The domain layer must have NO external infrastructure dependencies.
- **Rich Domain Models**: Domain entities (like `PatientTwin`) must be implemented as true Aggregate Root classes that encapsulate state and behavior. Anemic domain models (data-only interfaces manipulated by external services) are strictly forbidden.

## 2. Unidirectional Dependency Rule
Dependencies must point inward toward the domain layer. 
- Presentation -> Application -> Domain -> Infrastructure is strictly forbidden.
- Presentation -> Application -> Domain <- Infrastructure is strictly enforced via Dependency Inversion.

## 3. Explainability by Design
No decision can be made by the system without an explainable trail. Every recommendation, risk score, and diagnosis must include confidence scores and evidence trace links.

## 4. Single Source of Truth for State
The Patient Digital Twin is the only source of truth for patient state. Workflows do not maintain their own independent long-term state; they read from and write snapshots to the Twin.

## 5. API First
All backend capabilities must be exposed via well-defined, versioned APIs. The frontend application is a thin client that does not duplicate backend logic.

## 6. Deterministic Intelligence
AI components must be reproducible. All prompts, context assemblies, and temperature settings must be logged and version-controlled.

## 7. Security in Depth
Authentication and Authorization are enforced at the API gateway, the Application Layer, and the Domain Layer. Data is validated at the edge using Zod.
