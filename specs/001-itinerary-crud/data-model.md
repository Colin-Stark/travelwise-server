# Data Model: Itinerary CRUD Operations

## Entities

### Itinerary
Represents a trip plan with user association.

**Fields:**
- `_id`: ObjectId (auto-generated) - Primary key
- `user_id`: ObjectId (required) - Reference to User
- `id`: Number (auto-generated) - User-facing ID
- `gl`: String - Geographic locale code
- `title`: String (required) - Trip title
- `start_date`: Date (required) - Trip start date
- `end_date`: Date (required) - Trip end date
- `country`: String (required) - Destination country
- `city`: String (required) - Destination city
- `description`: String - Trip description
- `img`: String - Image URL
- `flight`: Object - Flight booking details
  - `departure_token`: String
- `schedules`: Array - Daily schedules
  - `day`: Date (required) - Schedule date
  - `locations`: Array - Locations for the day
    - `data_id`: String - Unique location identifier
    - `title`: String (required) - Location name
    - `place_id`: String - Google Places ID
    - `rating`: Number - Location rating
    - `reviews`: Number - Review count
    - `type`: String - Location type
    - `address`: String - Full address
    - `open_state`: String - Opening hours
    - `description`: String - Location description
    - `service_options`: Object - Service options
    - `user_review`: String - User's review
    - `thumbnail`: String - Thumbnail URL
    - `serpapi_thumbnail`: String - SerpAPI thumbnail
    - `time`: String - Scheduled time
    - `duration`: Number - Duration in minutes
- `createdAt`: Date (auto) - Creation timestamp
- `updatedAt`: Date (auto) - Update timestamp

**Relationships:**
- Belongs to User (user_id → User._id)
- One user can have many itineraries

**Validation Rules:**
- start_date < end_date
- Required fields: user_id, title, start_date, end_date, country, city
- Schedules array can be empty
- Locations array can be empty per schedule

**Indexes:**
- { user_id: 1 } - For querying user's itineraries
- { user_id: 1, createdAt: -1 } - For recent itineraries

**State Transitions:**
- Created → Active (default)
- No explicit states defined beyond CRUD