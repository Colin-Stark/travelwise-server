# API Contracts: Itinerary CRUD Operations

## Base URL
`/api/itineraries`

## Authentication
All endpoints require JWT token in Authorization header: `Bearer <token>`

## Endpoints

### 1. Create Itinerary
**POST** `/api/itineraries`

**Request Body:**
```json
{
  "title": "Paris Adventure",
  "start_date": "2025-11-10",
  "end_date": "2025-11-18",
  "country": "France",
  "city": "Paris",
  "description": "Explore the Eiffel Tower, Louvre, and enjoy French cuisine.",
  "img": "/images/placeholder1.jpg",
  "flight": {
    "departure_token": "WyJDalJJY20wMGNXaGZaRzh0UTBsQlFWOXRVbEZDUnkwdExTMHRMUzB0TFhCcWEyc3hORUZCUVVGQlIycHNkRVE0UkZNMmRDMUJFZ3hWUVRnNE9YeFZRVEl6TXpJYUN3aVYxd29RQWhvRFZWTkVPQnh3bGRjSyIsW1siUEVLIiwiMjAyNS0xMC0wOCIsIlNGTyIsbnVsbCwiVUEiLCI4ODkiXSxbIlNGTyIsIjIwMjUtMTAtMDgiLCJBVVMiLG51bGwsIlVBIiwiMjMzMiJdXV0="
  },
  "schedules": [
    {
      "day": "2025-11-10",
      "locations": [
        {
          "data_id": "c1esdf",
          "title": "Eiffel Tower",
          "place_id": "ChIJLU7jZClu5kcR4PcOOO6p3I0",
          "rating": 4.7,
          "reviews": 475344,
          "type": "Tourist attraction",
          "address": "Av. Gustave Eiffel, 75007 Paris, France",
          "open_state": "Closes soon ⋅ 11 PM ⋅ Opens 9:30 AM Mon",
          "description": "Landmark 330m-high 19th-century tower.",
          "service_options": { "onsite_services": true },
          "user_review": "Quiet crowded with tourist.",
          "thumbnail": "https://lh3.googleusercontent.com/...",
          "serpapi_thumbnail": "https://serpapi.com/...",
          "time": "8:30 AM",
          "duration": 90
        }
      ]
    }
  ]
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "_id": "64f...",
    "id": 3,
    "user_id": "user123",
    "title": "Paris Adventure",
    // ... full itinerary object
  }
}
```

### 2. Get User Itineraries
**GET** `/api/itineraries`

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64f...",
      "id": 3,
      "title": "Paris Adventure",
      // ... itinerary summary
    }
  ]
}
```

### 3. Get Specific Itinerary
**GET** `/api/itineraries/:id`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "64f...",
    "id": 3,
    "title": "Paris Adventure",
    // ... full itinerary object
  }
}
```

### 4. Update Itinerary
**PUT** `/api/itineraries/:id`

**Request Body:** Partial or full itinerary object (same as create)

**Response (200):**
```json
{
  "success": true,
  "data": {
    // updated itinerary object
  }
}
```

### 5. Delete Itinerary
**DELETE** `/api/itineraries/:id`

**Response (200):**
```json
{
  "success": true,
  "message": "Itinerary deleted successfully"
}
```

## Error Responses

**400 Bad Request:**
```json
{
  "success": false,
  "error": "Validation failed",
  "details": ["start_date is required", "end_date must be after start_date"]
}
```

**401 Unauthorized:**
```json
{
  "success": false,
  "error": "Authentication required"
}
```

**403 Forbidden:**
```json
{
  "success": false,
  "error": "Access denied"
}
```

**404 Not Found:**
```json
{
  "success": false,
  "error": "Itinerary not found"
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "error": "Internal server error"
}
```