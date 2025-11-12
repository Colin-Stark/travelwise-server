---

description: "Task list template for feature implementation"
---

# Tasks: Itinerary CRUD Operations

**Input**: Design documents from `/specs/001-itinerary-crud/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are MANDATORY for all features per constitution principle I. Include unit, integration, and contract tests using Jest and Supertest.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Backend API**: `routes/`, `database/`, `test/` at repository root
- Adjust based on plan.md structure

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Create itinerary routes directory structure in routes/itinerary/index.js

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T002 Update database schema with Itinerary model in database/schema.js
- [ ] T003 Add JWT authentication middleware for itinerary routes in routes/itinerary/index.js

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

## Phase 3: User Story 1 - Create Itinerary (Priority: P1) 🎯 MVP

**Goal**: Enable users to create new itineraries with all required fields

**Independent Test**: Can be fully tested by creating an itinerary via POST /api/itineraries and verifying database storage

### Tests for User Story 1 (MANDATORY per constitution) ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T004 [P] [US1] Contract test for POST /api/itineraries in test/itinerary-contract.test.js
- [ ] T005 [P] [US1] Integration test for itinerary creation in test/itinerary-integration.test.js

### Implementation for User Story 1

- [ ] T006 [US1] Implement POST /api/itineraries endpoint in routes/itinerary/index.js
- [ ] T007 [US1] Add input validation for itinerary creation in routes/itinerary/index.js
- [ ] T008 [US1] Add error handling for create operation in routes/itinerary/index.js

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

## Phase 4: User Story 2 - View Itineraries (Priority: P2)

**Goal**: Allow users to retrieve and view their itineraries

**Independent Test**: Can be fully tested by retrieving itineraries via GET endpoints and verifying correct data return

### Tests for User Story 2 (MANDATORY per constitution) ⚠️

- [ ] T009 [P] [US2] Contract test for GET /api/itineraries in test/itinerary-contract.test.js
- [ ] T010 [P] [US2] Contract test for GET /api/itineraries/:id in test/itinerary-contract.test.js
- [ ] T011 [P] [US2] Integration test for itinerary retrieval in test/itinerary-integration.test.js

### Implementation for User Story 2

- [ ] T012 [US2] Implement GET /api/itineraries endpoint in routes/itinerary/index.js
- [ ] T013 [US2] Implement GET /api/itineraries/:id endpoint in routes/itinerary/index.js
- [ ] T014 [US2] Add authorization checks for view operations in routes/itinerary/index.js

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

## Phase 5: User Story 3 - Update Itinerary (Priority: P3)

**Goal**: Enable users to modify existing itinerary details

**Independent Test**: Can be fully tested by updating an itinerary via PUT endpoint and verifying changes persist

### Tests for User Story 3 (MANDATORY per constitution) ⚠️

- [ ] T015 [P] [US3] Contract test for PUT /api/itineraries/:id in test/itinerary-contract.test.js
- [ ] T016 [P] [US3] Integration test for itinerary update in test/itinerary-integration.test.js

### Implementation for User Story 3

- [ ] T017 [US3] Implement PUT /api/itineraries/:id endpoint in routes/itinerary/index.js
- [ ] T018 [US3] Add partial update support for itinerary fields in routes/itinerary/index.js
- [ ] T019 [US3] Add authorization checks for update operations in routes/itinerary/index.js

**Checkpoint**: At this point, User Stories 1, 2, AND 3 should all work independently

## Phase 6: User Story 4 - Delete Itinerary (Priority: P3)

**Goal**: Allow users to remove itineraries they no longer need

**Independent Test**: Can be fully tested by deleting an itinerary via DELETE endpoint and verifying removal

### Tests for User Story 4 (MANDATORY per constitution) ⚠️

- [ ] T020 [P] [US4] Contract test for DELETE /api/itineraries/:id in test/itinerary-contract.test.js
- [ ] T021 [P] [US4] Integration test for itinerary deletion in test/itinerary-integration.test.js

### Implementation for User Story 4

- [ ] T022 [US4] Implement DELETE /api/itineraries/:id endpoint in routes/itinerary/index.js
- [ ] T023 [US4] Add authorization checks for delete operations in routes/itinerary/index.js
- [ ] T024 [US4] Add confirmation/safety checks for deletion in routes/itinerary/index.js

**Checkpoint**: All user stories should now be independently functional

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T025 [P] Add comprehensive unit tests for Itinerary model in test/itinerary-unit.test.js
- [ ] T026 Update API documentation in API_GUIDE.md
- [ ] T027 Run ESLint and fix any issues in routes/itinerary/index.js
- [ ] T028 Performance optimization for itinerary queries in database/schema.js
- [ ] T029 Add logging for itinerary operations in routes/itinerary/index.js

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Phase 7)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 4 (P3)**: Can start after Foundational (Phase 2) - No dependencies on other stories

### Within Each User Story

- Tests (if included) MUST be written and FAIL before implementation
- Implementation order: Endpoints → Validation → Error handling
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- All tests for a user story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

### Within Each User Story

```bash
# Launch all tests for User Story 1 together:
Task: "Contract test for POST /api/itineraries in test/itinerary-contract.test.js"
Task: "Integration test for itinerary creation in test/itinerary-integration.test.js"

# Launch all implementation for User Story 1 together:
Task: "Implement POST /api/itineraries endpoint in routes/itinerary/index.js"
Task: "Add input validation for itinerary creation in routes/itinerary/index.js"
Task: "Add error handling for create operation in routes/itinerary/index.js"
```

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Add User Story 4 → Test independently → Deploy/Demo
6. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1
   - Developer B: User Story 2
   - Developer C: User Stories 3 & 4
3. Stories complete and integrate independently

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence