
# TravelWise Backend — Project Requirements Document (PRD)

> **Stack**: Node.js, Express, MongoDB (Atlas), JWT Auth  
> **Scope**: Backend APIs, data model, integrations, and system interactions for the TravelWise app.

---

## 1. Overview

### 1.1 Purpose
Define backend requirements, data model, interfaces, and constraints to support TravelWise features: user auth, trips & itineraries, expenses & budgets, bookings, recommendations, local businesses, and notifications.

### 1.2 Goals & Success Criteria
- **G1**: Provide secure REST APIs for all core features.
- **G2**: Average API latency < **500 ms**, p95 < **1.2 s** under 5k concurrent users.
- **G3**: 99.9% monthly uptime; automated backups & restore drills.
- **G4**: Clear ERD and relationships enabling consistent implementation & testing.

### 1.3 Stakeholders
- **Product**: PRD ownership & prioritization
- **Backend Team**: API & data implementation
- **Frontend/Mobile**: API consumers
- **QA**: Test plans & automation
- **Ops/SRE**: CI/CD, observability, scaling

### 1.4 Out of Scope (Phase 1)
- Native offline sync
- Direct bank connections; PSD2/OFX
- Multi-currency wallets with FX rates (can store currency per item)

---

## 2. Non‑Functional Requirements

- **Security**: JWT access + refresh tokens, HTTPS, Helmet, rate limiting, input validation & sanitization, RBAC-ready.
- **Privacy**: PII minimized; at-rest encryption for secrets; PHI not stored.
- **Reliability**: Automated backups (MongoDB Atlas), replica sets, restore RTO ≤ 2h, RPO ≤ 15m.
- **Performance**: Indexes for high-cardinality queries (userId, tripId, dates); caching layer optional.
- **Scalability**: Stateless Express pods; horizontal auto-scaling; pagination standards.
- **Observability**: Structured logs, request IDs, metrics (latency, error rates), traces; alerting SLOs.
- **Portability**: REST over HTTP/JSON; OpenAPI spec; Postman collection.
- **Compliance**: GDPR-aligned data deletion/export endpoints (Phase 2).

---

## 3. High-Level Architecture (PRD Diagram)

```mermaid
flowchart LR
    subgraph Client Apps
      W[Web App] --- M[Mobile App]
    end

    W & M --> GW[API Gateway / Load Balancer]

    subgraph Backend [TravelWise Backend (Node.js + Express)]
      AU[Auth & Users] 
      TR[Trips & Itineraries]
      EX[Expenses & Budgets]
      BK[Bookings Integrations]
      RE[AI & Recommendations]
      LB[Local Businesses]
      NO[Notifications]
      AD[Admin & Ops]
    end

    GW --> AU
    GW --> TR
    GW --> EX
    GW --> BK
    GW --> RE
    GW --> LB
    GW --> NO
    GW --> AD

    subgraph Data
      MG[(MongoDB Atlas)]
      FS[(Object Storage: receipts, images)]
      CQ[(Cache, optional)]
    end

    AU --- MG
    TR --- MG
    EX --- MG
    BK --- MG
    RE --- MG
    LB --- MG
    NO --- MG
    AD --- MG

    EX --- FS
    BK --- FS

    subgraph 3P [Third-Party Services]
      SK[Flight/Hotel API]
      EM[Email/SMS Push]
      GEO[Geocoding/Places]
      AI[AI API (recommendations)]
    end

    BK --> SK
    NO --> EM
    LB --> GEO
    RE --> AI
```

---

## 4. Domain Model — ERD / Class Diagram (MongoDB)

> Collections are designed for MongoDB; references use ObjectId. Arrays are embedded where practical for query patterns.

```mermaid
classDiagram
  class User {
    ObjectId _id
    string email
    string passwordHash
    string firstName
    string lastName
    Preferences preferences
    Date createdAt
    Date updatedAt
    --
    +email unique
  }

  class Preferences {
    string currency
    string language
    string timezone
    boolean marketingOptIn
  }

  class Trip {
    ObjectId _id
    ObjectId userId
    string name
    Location destination
    Date startDate
    Date endDate
    string status  // planned|active|completed|canceled
    [Tag] tags
    Date createdAt
    Date updatedAt
    --
    +index(userId, startDate)
  }

  class Location {
    string country
    string city
    double lat
    double lng
  }

  class Itinerary {
    ObjectId _id
    ObjectId tripId
    string title
    [ItineraryItem] items
    string notes
    Date createdAt
    Date updatedAt
    --
    +index(tripId)
  }

  class ItineraryItem {
    string type   // activity|transport|lodging|food|note
    string name
    Date startTime
    Date endTime
    string placeId
    string address
    double cost
    string currency
    string confirmationCode
    string notes
  }

  class Expense {
    ObjectId _id
    ObjectId tripId
    ObjectId userId
    string category // food|transport|lodging|tickets|other
    double amount
    string currency
    Date date
    string paymentMethod // cash|card|other
    string merchant
    string receiptUrl
    string notes
    Date createdAt
    --
    +index(tripId, date)
    +index(userId, date)
  }

  class Budget {
    ObjectId _id
    ObjectId tripId
    double plannedTotal
    double alertThresholdPct
    double actualTotal // derived/denormalized
    Date updatedAt
  }

  class BudgetAlert {
    ObjectId _id
    ObjectId userId
    ObjectId tripId
    string type // overspend|warning|info
    string message
    double thresholdValue
    Date createdAt
    boolean read
    --
    +index(userId, createdAt)
  }

  class Booking {
    ObjectId _id
    ObjectId tripId
    string type // flight|hotel|car|train|tour
    string provider
    double price
    string currency
    Date bookedAt
    string confirmationCode
    object details // normalized subset of API response
    string voucherUrl
    --
    +index(tripId, type)
  }

  class Business {
    ObjectId _id
    string name
    string category // restaurant|attraction|shop|service
    Location location
    double rating
    Contact contact
    [string] tags
  }

  class Contact {
    string phone
    string email
    string website
  }

  class SavedBusiness {
    ObjectId _id
    ObjectId userId
    ObjectId tripId
    ObjectId businessId
    string note
    Date createdAt
    --
    +unique(userId, tripId, businessId)
  }

  class Notification {
    ObjectId _id
    ObjectId userId
    string channel // email|sms|push|inapp
    string title
    string body
    string status // queued|sent|failed|read
    Date scheduledAt
    Date sentAt
    object meta
    --
    +index(userId, scheduledAt)
  }

  User "1" --> "many" Trip : owns
  Trip "1" --> "many" Itinerary : has
  Itinerary "1" --> "many" ItineraryItem : embeds
  Trip "1" --> "many" Expense : has
  Trip "1" --> "0..1" Budget : has
  Trip "1" --> "many" Booking : has
  User "1" --> "many" BudgetAlert : receives
  Business "1" --> "many" SavedBusiness : referenced by
  User "1" --> "many" SavedBusiness : saves
  Trip "1" --> "many" SavedBusiness : contextual to
  User "1" --> "many" Notification : receives
```

---

## 5. Relationships (Summary)

- **User → Trip**: 1:N
- **Trip → Itinerary**: 1:N
- **Itinerary → ItineraryItem**: 1:N (embedded array)
- **Trip → Expense**: 1:N
- **Trip → Budget**: 1:0..1
- **Trip → Booking**: 1:N
- **User ↔ Business (via SavedBusiness)**: M:N
- **User → BudgetAlert**: 1:N
- **User → Notification**: 1:N

> **Indexes**: userId, tripId, (tripId, date), (userId, date), (userId, startDate), text index for `Business.name,tags` (optional).

---

## 6. API Surface (Summary — REST)

> Detailed OpenAPI can be generated from these summaries.

### 6.1 Auth & Users
- `POST /api/auth/register` — email, password, profile → tokens
- `POST /api/auth/login` — credentials → tokens
- `POST /api/auth/refresh` — refresh → access
- `GET /api/users/me` — current profile
- `PATCH /api/users/me` — update names, preferences
- `DELETE /api/users/me` — close account (soft delete)

### 6.2 Trips & Itineraries
- `GET /api/trips` | `POST /api/trips` | `GET /api/trips/:id` | `PATCH /api/trips/:id` | `DELETE /api/trips/:id`
- `GET /api/trips/:id/itineraries` | `POST /api/trips/:id/itineraries`
- `PATCH /api/itineraries/:itineraryId` | `DELETE /api/itineraries/:itineraryId`

### 6.3 Expenses & Budgets
- `GET /api/trips/:id/expenses` | `POST /api/trips/:id/expenses`
- `PATCH /api/expenses/:expenseId` | `DELETE /api/expenses/:expenseId`
- `GET /api/trips/:id/budget` | `PUT /api/trips/:id/budget`
- `GET /api/trips/:id/expenses/summary?groupBy=category|date`

### 6.4 Bookings & Integrations
- `POST /api/trips/:id/bookings/search` — proxy search
- `POST /api/trips/:id/bookings` — save booking
- `GET /api/trips/:id/bookings` | `DELETE /api/bookings/:bookingId`

### 6.5 Local Businesses & Saved Lists
- `GET /api/businesses/search?q=&near=`
- `POST /api/trips/:id/saved-businesses`
- `GET /api/trips/:id/saved-businesses`
- `DELETE /api/saved-businesses/:id`

### 6.6 Notifications
- `POST /api/notifications` (admin/system)
- `GET /api/notifications` (user inbox)
- `PATCH /api/notifications/:id` (mark read)

---

## 7. Data Dictionary (Key Collections)

### 7.1 User
| Field | Type | Notes |
|---|---|---|
| _id | ObjectId | PK |
| email | string | unique, lowercased |
| passwordHash | string | bcrypt |
| firstName, lastName | string |  |
| preferences | object | currency, language, timezone |
| createdAt, updatedAt | Date | ISO8601 |

### 7.2 Trip
| Field | Type | Notes |
|---|---|---|
| _id | ObjectId | PK |
| userId | ObjectId | FK → User |
| name | string |  |
| destination | object | country, city, lat, lng |
| startDate, endDate | Date |  |
| status | string | planned/active/completed/canceled |

### 7.3 Expense
| Field | Type | Notes |
|---|---|---|
| _id | ObjectId | PK |
| tripId | ObjectId | FK → Trip |
| userId | ObjectId | FK → User |
| category | string | food/transport/lodging/tickets/other |
| amount | number |  |
| currency | string | ISO 4217 |
| date | Date |  |
| receiptUrl | string | S3/GCS |
| notes | string |  |

(Other collections follow the ERD above.)

---

## 8. Key Flows (Sequence)

### 8.1 Register & Create First Trip
```mermaid
sequenceDiagram
  participant U as User
  participant A as Auth API
  participant T as Trips API
  participant DB as MongoDB

  U->>A: POST /auth/register
  A->>DB: insert User
  DB-->>A: _id
  A-->>U: tokens

  U->>T: POST /trips (Authorization: Bearer)
  T->>DB: insert Trip (userId)
  DB-->>T: _id
  T-->>U: Trip created
```

### 8.2 Add Expense & Trigger Budget Alert
```mermaid
sequenceDiagram
  participant U as User
  participant E as Expenses API
  participant B as Budget Service
  participant N as Notifications
  participant DB as MongoDB

  U->>E: POST /trips/:id/expenses
  E->>DB: insert Expense
  E->>B: checkBudget(tripId)
  B->>DB: read Budget, sum Expenses
  B-->>E: thresholdExceeded
  E->>N: enqueue Notification
  N->>DB: insert Notification
  N-->>U: push/email/sms
```

---

## 9. Risks & Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| 3rd-party API rate limits | Medium | Caching, retries with backoff, quota monitoring |
| Token theft / auth bypass | High | Short-lived access tokens, refresh rotation, IP/device checks |
| Query hotspots on tripId | Medium | Compound indexes, pagination, projections |
| Cost spikes on storage | Medium | Lifecycle policies for receipts, compression |
| Data loss | High | Atlas backups, restore drills, multi-region replicas |

---

## 10. Milestones & Acceptance

- **M1**: Auth & Users complete; Postman tests pass (sign-in, refresh).  
- **M2**: Trips & Itineraries CRUD completed with indexes.  
- **M3**: Expenses & Budget with summaries and alerts.  
- **M4**: Bookings search proxy & save; receipts storage.  
- **M5**: Local Businesses search + saved lists.  
- **M6**: Notifications pipeline with scheduled sends.  
- **Final**: Load test, security review, CI/CD, runbook, and SLO dashboards.

---

## 11. Appendix

- OpenAPI 3.1 spec to be generated from controllers (future deliverable).  
- Postman collection shared with QA.  
- Environment matrix: `dev`, `staging`, `prod` with separate DBs.
