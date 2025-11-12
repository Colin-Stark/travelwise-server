# Research: Itinerary CRUD Operations

## Decision: Mongoose Schema for Itinerary Model
**Rationale**: Mongoose provides schema validation, middleware, and easy integration with Express. Standard choice for MongoDB with Node.js.
**Alternatives Considered**: Native MongoDB driver (more verbose, less validation), other ODMs like Typegoose (adds TypeScript complexity not needed).

## Decision: Express Router for CRUD Endpoints
**Rationale**: Follows existing project pattern with separate route files. Express router provides clean separation of concerns.
**Alternatives Considered**: Inline routes in main app (less organized), GraphQL (overkill for CRUD).



## Decision: Jest + Supertest for Testing
**Rationale**: Project constitution requires Jest/Supertest. Provides comprehensive testing coverage.
**Alternatives Considered**: Mocha/Chai (less integrated), Cypress (e2e only).

## Decision: Input Validation with Express-Validator
**Rationale**: Provides robust validation for itinerary data, prevents invalid data entry.
**Alternatives Considered**: Manual validation (error-prone), Joi (additional dependency).

## Decision: Error Handling Middleware
**Rationale**: Consistent error responses across CRUD operations, follows REST standards.
**Alternatives Considered**: Inline error handling (duplicated code), no validation (insecure).

## Decision: MongoDB Indexing on userId
**Rationale**: Optimizes queries for user-specific itineraries, improves performance.
**Alternatives Considered**: No indexing (slower queries), compound indexes (overkill for current needs).