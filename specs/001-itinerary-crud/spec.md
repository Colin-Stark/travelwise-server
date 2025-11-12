# Feature Specification: Itinerary CRUD Operations

**Feature Branch**: `001-itinerary-crud`  
**Created**: 2025-11-11  
**Status**: Draft  
**Input**: User description: "update my collection to store itenary in my mongoDB schema, it will allow Create, Read, Update and Delete operation with express routes. One user can have multiple itenary for their trip."

## Clarifications

### Session 2025-11-11

- Q: What does the 'gl' field represent? → A: Geographic locale code
- Q: What does 'data_id' in locations represent? → A: Unique location identifier
- Q: Is the 'id' field user-provided or auto-generated? → A: Auto-generated
- Q: What are the performance requirements for CRUD operations? → A: No specific performance requirements
- Q: How should concurrent updates to the same itinerary be handled? → A: None specified

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Create Itinerary (Priority: P1)

Users can create a new itinerary for their trip by providing details such as title, dates, location, description, image, flight information, and daily schedules with locations and timings.

**Why this priority**: This is the core functionality that enables users to plan their trips, which is essential for the TravelWise app.

**Independent Test**: Can be fully tested by creating an itinerary via API and verifying it's stored in the database with correct data.

**Acceptance Scenarios**:

1. **Given** user is authenticated, **When** they submit valid itinerary data, **Then** the itinerary is created and returned with a generated ID.
2. **Given** user provides invalid data (e.g., end date before start date), **When** they attempt to create, **Then** an error is returned.

---

### User Story 2 - View Itineraries (Priority: P2)

Users can retrieve and view all their itineraries or a specific itinerary by ID.

**Why this priority**: Allows users to access their trip plans, which is fundamental for trip management.

**Independent Test**: Can be fully tested by retrieving itineraries via API and verifying the returned data matches stored itineraries.

**Acceptance Scenarios**:

1. **Given** user has itineraries, **When** they request their itineraries, **Then** all their itineraries are returned.
2. **Given** user requests a specific itinerary by ID, **When** the ID exists and belongs to them, **Then** the itinerary details are returned.

---

### User Story 3 - Update Itinerary (Priority: P3)

Users can modify existing itinerary details such as title, dates, description, or schedules.

**Why this priority**: Enables users to adjust their plans as trip details change.

**Independent Test**: Can be fully tested by updating an itinerary via API and verifying the changes are persisted.

**Acceptance Scenarios**:

1. **Given** user owns an itinerary, **When** they update valid fields, **Then** the itinerary is updated successfully.
2. **Given** user tries to update another user's itinerary, **When** they attempt the update, **Then** access is denied.

---

### User Story 4 - Delete Itinerary (Priority: P3)

Users can remove itineraries they no longer need.

**Why this priority**: Allows cleanup of unwanted trip plans.

**Independent Test**: Can be fully tested by deleting an itinerary via API and verifying it's removed from the database.

**Acceptance Scenarios**:

1. **Given** user owns an itinerary, **When** they delete it, **Then** the itinerary is removed and no longer accessible.
2. **Given** user tries to delete another user's itinerary, **When** they attempt deletion, **Then** access is denied.

### Edge Cases

- **Invalid date formats**: Return 400 Bad Request with message "Invalid date format. Use YYYY-MM-DD."
- **Missing required fields**: Return 400 Bad Request with message listing missing fields (e.g., "title and start_date are required").
- **Non-existent itinerary access**: Return 404 Not Found with message "Itinerary not found."
- **Concurrent updates**: Last-write-wins (no locking); return 409 Conflict if version mismatch (add version field to schema).
- **Malformed flight data**: Validate JSON structure; return 400 Bad Request with message "Invalid flight data format."

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow authenticated users to create itineraries with all provided fields (user_id, id (auto-generated), gl, title, start_date, end_date, country, city, description, img, flight, schedules).
- **FR-002**: System MUST allow users to retrieve all their itineraries or a specific itinerary by ID.
- **FR-003**: System MUST allow users to update their own itineraries with partial or full data.
- **FR-004**: System MUST allow users to delete their own itineraries.
- **FR-005**: System MUST associate itineraries with users, allowing multiple itineraries per user.
- **FR-006**: System MUST validate input data and return appropriate error messages for invalid requests.
- **FR-007**: System MUST ensure users can only access their own itineraries (authorization).

### Key Entities *(include if feature involves data)*

- **Itinerary**: Represents a trip plan with user association, basic trip info (id (auto-generated), gl (geographic locale code), title, dates, location), description, image, flight details, and daily schedules with locations (including data_id (unique location identifier)) and timings. Each user can have multiple itineraries.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can create a complete itinerary in under 30 seconds.
- **SC-002**: 99% of itinerary CRUD operations complete successfully without errors.
- **SC-003**: Users can retrieve their itineraries instantly (<1 second response time).
- **SC-004**: System maintains data integrity with no unauthorized access to itineraries.
