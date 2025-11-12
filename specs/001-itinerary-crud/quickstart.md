# Quickstart: Itinerary CRUD Operations

## Overview
This guide shows how to test the new itinerary CRUD functionality after implementation.

## Prerequisites
- Server running on `http://localhost:3000`
- Valid JWT token from login
- MongoDB connection

## Testing the API

### 1. Create an Itinerary
```bash
curl -X POST http://localhost:3000/api/itineraries \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
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
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "_id": "64f...",
    "id": 3,
    "user_id": "user123",
    "title": "Paris Adventure",
    // ... full object
  }
}
```

### 2. Get All User Itineraries
```bash
curl -X GET http://localhost:3000/api/itineraries \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 3. Get Specific Itinerary
```bash
curl -X GET http://localhost:3000/api/itineraries/3 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 4. Update Itinerary
```bash
curl -X PUT http://localhost:3000/api/itineraries/3 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"description": "Updated description"}'
```

### 5. Delete Itinerary
```bash
curl -X DELETE http://localhost:3000/api/itineraries/3 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Running Tests
```bash
npm test -- --testPathPattern=itinerary
```

## Validation Checklist
- [ ] Create operation returns 201 with itinerary data
- [ ] Read operations return 200 with correct data
- [ ] Update operation modifies data correctly
- [ ] Delete operation removes itinerary
- [ ] Unauthorized requests return 401
- [ ] Accessing other user's itineraries returns 403
- [ ] Invalid data returns 400 with validation errors
- [ ] All operations complete within performance targets