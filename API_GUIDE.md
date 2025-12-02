# Travelwise Backend API Guide

This guide helps frontend developers interact with the Travelwise backend Express API. It covers available routes, request/response formats, and error handling.

---

## Base URL

**All API requests should use:**

```
https://travelwise-server.vercel.app
```

**Examples:**
- Login: `https://travelwise-server.vercel.app/login`
- Signup: `https://travelwise-server.vercel.app/signup`

---

## Routes

### 1. Signup

**POST** `https://travelwise-server.vercel.app/signup`

**Description:** Register a new user.

**Body Parameters:**
- `email` (string, required)
- `password` (string, required)
- `confirmPassword` (string, required)

**Success Response:**
- Status: `201 Created`
```json
{
  "success": true,
  "message": "User created successfully"
}
```

**Error Responses:**
- Status: `400 Bad Request` (missing fields)
```json
{
  "success": false,
  "message": "Email, password, and confirm password are required"
}
```
- Status: `400 Bad Request` (invalid email format)
```json
{
  "success": false,
  "message": "Please provide a valid email address"
}
```

**JavaScript Example:**
```javascript
async function signup(email, password, confirmPassword) {
  try {
    const response = await fetch('https://travelwise-server.vercel.app/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
    });
    const data = await response.json();
### 14. Add Flight to Trip


**Description:** Add flight booking details to a trip belonging to a user.

**URL Parameters:**
- `tripId` (string, required) - Trip ID

**Body Parameters:**
- `email` (string, required) - User's email for authentication (or `userId` may be provided as an alternative)
- `userId` (string, optional) - User's ObjectId as an alternative to `email` for API requests (useful for debugging or automated scripts)
- `departure_date` (string, required) - Departure date (YYYY-MM-DD)
- `return_date` (string, required) - Return date (YYYY-MM-DD)
- `departure_country` (string, required)
- `departure_city` (string, required)
- `arrival_country` (string, required)
- `arrival_city` (string, required)
- `departure_token` (string, optional)
- `price` (number, required)
- `status` (string, optional, default 'booked')

**Success Response:**
- Status: `201 Created`
```json
{
  "success": true,
  "data": {
    "user_id": "user_id",
    "departure_date": "2025-12-01T00:00:00.000Z",
    "return_date": "2025-12-05T00:00:00.000Z",
    "departure_country": "Canada",
    "departure_city": "Toronto",
    "arrival_country": "France",
    "arrival_city": "Paris",
    "departure_token": "token123",
    "price": 500,
    "status": "booked",
    "createdAt": "2025-11-11T00:00:00.000Z",
    "updatedAt": "2025-11-11T00:00:00.000Z"
  }
}
```
**Error Responses:**
- Status: `400 Bad Request` (validation failure)
```json
{
  "success": false,
  "error": "Validation failed",
  "details": ["departure_date is required"]
  "error": "Trip not found"
}

**JavaScript Example:**
```javascript
async function addFlightToTrip(tripId, email, flightData) {
  try {
    const response = await fetch(`https://travelwise-server.vercel.app/api/trips/${tripId}/flights`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, ...flightData })
    });
    return await response.json();
  } catch (error) {
    console.error('Add flight error', error);
  }
}
```

**Using userId instead of email (PowerShell example):**
```powershell
Invoke-RestMethod -Uri "https://travelwise-server.vercel.app/api/trips/<tripId>/flights" -Method Post -Headers @{ 'Content-Type' = 'application/json' } -Body '{"userId":"<userId>", "departure_date":"2025-12-01", "return_date":"2025-12-05", "departure_country":"Canada", "departure_city":"Toronto", "arrival_country":"France", "arrival_city":"Paris", "price":500 }'
```

#### Flight Schema (Trip.flights)

Flights in the Trip model are embedded objects in the `flights` array on a `Trip` document: `trip.flights`.
Here is the schema and constraints used by the backend (fields, types, and validation rules):

- `user_id` (ObjectId): Reference to the User who added the flight. This value is set automatically based on `email` or `userId` provided on requests.
- `departure_date` (Date, required): Start of the flight range; ISO string (YYYY-MM-DD) accepted. Must be < `return_date`.
- `return_date` (Date, required): End of the flight range; ISO string accepted.
- `departure_country` (String, required)
- `departure_city` (String, required)
- `arrival_country` (String, required)
- `arrival_city` (String, required)
- `departure_token` (String, optional): A provider or display token for the flight booking (e.g., supplier reference, tokenized booking id).
- `price` (Number, required): Price of the flight. Backend validation requires a non-negative number (>= 0).
- `status` (String, enum, default `booked`): Allowed: `booked`, `pending`, `cancelled`.
- `createdAt` (Date): Flight creation timestamp.
- `updatedAt` (Date): Flight update timestamp.

Validation rules enforced by the API:
- `departure_date` and `return_date` are required and `return_date` must be after `departure_date`.
- `price` must be a number >= 0.
- Fields marked required must be present or the API returns `400 Validation failed`.

Where the field values come from:
- `user_id` is derived from the authenticated/identified user you send in the body (`email` or `userId`).
- Timestamps are set by the server.

When to use a `departure_token`:
- This field is free-form text for supplier or booking tokens; it helps with lookups and idempotency if you store a provider booking reference. The API does not currently validate the format; it stores and returns the token as-is.

Example Flight Object (response portion):
```json
{
  "user_id": "692e469f99e5dfc1747b9dfb",
  "departure_date": "2025-12-01T00:00:00.000Z",
  "return_date": "2025-12-05T00:00:00.000Z",
  "departure_country": "Canada",
  "departure_city": "Toronto",
  "arrival_country": "France",
  "arrival_city": "Paris",
  "departure_token": "token123",
  "price": 500,
  "status": "booked",
  "createdAt": "2025-11-11T00:00:00.000Z",
  "updatedAt": "2025-11-11T00:00:00.000Z"
}
```

---

#### Functions & Usage Patterns

1. Add Flight — `POST /api/trips/:tripId/flights` (already documented above)
- Use this to attach a flight to a trip. It validates ownership (via `email` or `userId`) and writes a new flight object to the `trip.flights` array.

2. List Flights — `POST /api/trips/:tripId/flights/list` (already documented above):
- Returns an array of flights for the trip (empty array if no flights).

3. Update Flight — `PUT /api/trips/:tripId/flights/:flightId` (already documented above):
- Use to patch/update any subset of the flight fields except `user_id` (ownership must match). Ensure `departure_date` and `return_date` are still valid if updated.

4. Delete Flight — `DELETE /api/trips/:tripId/flights/:flightId` (already documented above):
- Removes the flight embedded document from the `trip.flights` array (ownership check via `email` or `userId`).

---
---

### List Flights for Trip

**POST** `https://travelwise-server.vercel.app/api/trips/:tripId/flights/list`

**Description:** Retrieve the list of flights for a trip belonging to a user.

**URL Parameters:**
- `tripId` (string, required) - Trip ID

- `email` (string, required unless `userId` provided) - User's email for ownership verification
- `userId` (string, optional) - Alternative to `email` (ObjectId of user)

**Success Response:**
- Status: `200 OK`
```json
{
}
```
async function listFlights(tripId, email) {
  try {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    return await response.json();
  } catch (error) {
    console.error('List flights error', error);
  }
}
```

**Using userId in PowerShell:**
```powershell
Invoke-RestMethod -Uri "https://travelwise-server.vercel.app/api/trips/<tripId>/flights/list" -Method Post -Headers @{ 'Content-Type' = 'application/json' } -Body '{"userId":"<userId>"}'


### 2. Login

**POST** `https://travelwise-server.vercel.app/login`

**Description:** Authenticate an existing user.
- `email` (string, required)
- `password` (string, required)
**Success Response:**
- Status: `200 OK`
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "user._id",
    "email": "user.email",
    "createdAt": "user.createdAt"
  }
}
```

**Error Responses:**
- Status: `400 Bad Request` (missing fields)
```json
{
  "success": false,
  "message": "Email and password are required"
}
```
- Status: `400 Bad Request` (invalid email format)
```json
{
  "success": false,
  "message": "Please provide a valid email address"
}
```

**JavaScript Example:**
```javascript
async function login(email, password) {
  try {
    const response = await fetch('https://travelwise-server.vercel.app/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Login error:', error);
  }
}

// Usage: await login('user@example.com', 'password123');
```

---

### 3. Forgot Password

**POST** `https://travelwise-server.vercel.app/login/forgot-password`

**Description:** Request a password reset OTP.

**Body Parameters:**
- `email` (string, required)

**Success Response:**
- Status: `200 OK`
```json
{
  "success": true,
  "message": "OTP sent to email"
}
```

**Error Responses:**
- Status: `400 Bad Request` (missing email)
```json
{
  "success": false,
  "message": "Email is required"
}
```
- Status: `400 Bad Request` (invalid email format)
```json
{
  "success": false,
  "message": "Please provide a valid email address"
}
```

**JavaScript Example:**
```javascript
async function forgotPassword(email) {
  try {
    const response = await fetch('https://travelwise-server.vercel.app/login/forgot-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email })
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Forgot password error:', error);
  }
}

// Usage: await forgotPassword('user@example.com');
```

---

### 4. Verify OTP

**POST** `https://travelwise-server.vercel.app/login/verify-otp`

**Description:** Verify the OTP sent to the user's email.

**Body Parameters:**
- `email` (string, required)
- `otp` (string, required)

**Success Response:**
- Status: `200 OK`
```json
{
  "success": true,
  "message": "OTP verified successfully"
}
```

**Error Responses:**
- Status: `400 Bad Request` (missing fields)
```json
{
  "success": false,
  "message": "Email and OTP are required"
}
```
- Status: `400 Bad Request` (invalid email format)
```json
{
  "success": false,
  "message": "Please provide a valid email address"
}
```
- Status: `400 Bad Request` (invalid OTP)
```json
{
  "success": false,
  "message": "Invalid OTP"
}
```
- Status: `400 Bad Request` (OTP expired)
```json
{
  "success": false,
  "message": "OTP has expired"
}
```

**JavaScript Example:**
```javascript
async function verifyOTP(email, otp) {
  try {
    const response = await fetch('https://travelwise-server.vercel.app/login/verify-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, otp })
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Verify OTP error:', error);
  }
}

// Usage: await verifyOTP('user@example.com', '123456');
```

---

### 5. Reset Password

**POST** `https://travelwise-server.vercel.app/login/reset-password`

**Description:** Reset password after OTP verification.

**Body Parameters:**
- `email` (string, required)
- `newPassword` (string, required)
- `confirmPassword` (string, required)

**Success Response:**
- Status: `200 OK`
```json
{
  "success": true,
  "message": "Password reset successful"
}
```

**Error Responses:**
- Status: `400 Bad Request` (missing fields)
```json
{
  "success": false,
  "message": "Email, new password, and confirm password are required"
}
```
- Status: `400 Bad Request` (invalid email format)
```json
{
  "success": false,
  "message": "Please provide a valid email address"
}
```
- Status: `400 Bad Request` (passwords do not match)
```json
{
  "success": false,
  "message": "Passwords do not match"
}
```
- Status: `400 Bad Request` (password too short)
```json
{
  "success": false,
  "message": "Password must be at least 8 characters long"
}
```

**JavaScript Example:**
```javascript
async function resetPassword(email, newPassword, confirmPassword) {
  try {
    const response = await fetch('https://travelwise-server.vercel.app/login/reset-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, newPassword, confirmPassword })
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Reset password error:', error);
  }
}

// Usage: await resetPassword('user@example.com', 'newpassword123', 'newpassword123');
```

---

### 6. Delete User by Email

**DELETE** `https://travelwise-server.vercel.app/userManagement/delete-by-email`

**Description:** Delete a user account by email address.

**Body Parameters:**
- `email` (string, required)

**Success Response:**
- Status: `200 OK`
```json
{
  "success": true,
  "message": "User deleted successfully",
  "deletedUser": {
    "id": "user._id",
    "email": "user.email",
    "deletedAt": "2025-09-11T12:00:00.000Z"
  }
}
```

**Error Responses:**
- Status: `400 Bad Request` (missing email)
```json
{
  "success": false,
  "message": "Email is required"
}
```
- Status: `400 Bad Request` (invalid email format)
```json
{
  "success": false,
  "message": "Please provide a valid email address"
}
```
- Status: `404 Not Found` (user not found)
```json
{
  "success": false,
  "message": "User not found"
}
```
- Status: `500 Internal Server Error` (server error)
```json
{
  "success": false,
  "message": "Internal server error"
}
```

**JavaScript Example:**
```javascript
async function deleteUserByEmail(email) {
  try {
    const response = await fetch('https://travelwise-server.vercel.app/userManagement/delete-by-email', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email })
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Delete user error:', error);
  }
}

// Usage: await deleteUserByEmail('user@example.com');
```

---

### 7. Get User by Email

**POST** `https://travelwise-server.vercel.app/userManagement/get-by-email`

**Description:** Retrieve user information by email address.

**Body Parameters:**
- `email` (string, required)

**Success Response:**
- Status: `200 OK`
```json
{
  "success": true,
  "user": {
    "id": "user._id",
    "email": "user.email",
    "firstName": "user.firstName",
    "lastName": "user.lastName",
    "phone": "user.phone",
    "preferences": {
      "currency": "user.preferences.currency",
      "language": "user.preferences.language",
      "timezone": "user.preferences.timezone",
      "marketingOptIn": "user.preferences.marketingOptIn"
    }
  }
}
```

**Error Responses:**
- Status: `400 Bad Request` (missing email)
```json
{
  "success": false,
  "message": "Email is required"
}
```
- Status: `400 Bad Request` (invalid email format)
```json
{
  "success": false,
  "message": "Please provide a valid email address"
}
```
- Status: `404 Not Found` (user not found)
```json
{
  "success": false,
  "message": "User not found"
}
```
- Status: `500 Internal Server Error` (server error)
```json
{
  "success": false,
  "message": "Internal server error"
}
```

**JavaScript Example:**
```javascript
async function getUserByEmail(email) {
  try {
    const response = await fetch('https://travelwise-server.vercel.app/userManagement/get-by-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email })
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Get user error:', error);
  }
}

// Usage: await getUserByEmail('user@example.com');
```

---

### 8. Update User

**POST** `https://travelwise-server.vercel.app/userManagement/update-user`

**Description:** Update user information by email address.

**Body Parameters:**
- `email` (string, required)
- `firstName` (string, optional)
- `lastName` (string, optional)
- `phone` (string, optional)
- `preferences` (object, optional)
  - `currency` (string)
  - `language` (string)
  - `timezone` (string)
  - `marketingOptIn` (boolean)

**Success Response:**
- Status: `200 OK`
```json
{
  "success": true,
  "message": "User updated successfully",
  "user": {
    "id": "user._id",
    "email": "user.email",
    "firstName": "user.firstName",
    "lastName": "user.lastName",
    "phone": "user.phone",
    "preferences": {
      "currency": "user.preferences.currency",
      "language": "user.preferences.language",
      "timezone": "user.preferences.timezone",
      "marketingOptIn": "user.preferences.marketingOptIn"
    }
  }
}
```

**Error Responses:**
- Status: `400 Bad Request` (missing email)
```json
{
  "success": false,
  "message": "Email is required"
}
```
- Status: `400 Bad Request` (invalid email format)
```json
{
  "success": false,
  "message": "Please provide a valid email address"
}
```
- Status: `404 Not Found` (user not found)
```json
{
  "success": false,
  "message": "User not found"
}
```
- Status: `500 Internal Server Error` (server error, including duplicate phone)
```json
{
  "success": false,
  "message": "Internal server error"
}
```

**JavaScript Example:**
```javascript
async function updateUser(email, updates) {
  try {
    const response = await fetch('https://travelwise-server.vercel.app/userManagement/update-user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, ...updates })
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Update user error:', error);
  }
}

// Update preferences: await updateUser('user@example.com', { preferences: { currency: 'USD', language: 'en' } });
```

---

### 9. Create Itinerary

**POST** `https://travelwise-server.vercel.app/api/itineraries`

**Description:** Create a new itinerary for the authenticated user.

**Body Parameters:**
- `email` (string, required) - User's email for authentication
- `title` (string, required) - Itinerary title
- `start_date` (string, required) - Start date in YYYY-MM-DD format
- `end_date` (string, required) - End date in YYYY-MM-DD format
- `country` (string, required) - Destination country
- `city` (string, required) - Destination city
- `description` (string, optional) - Itinerary description
- `img` (string, optional) - Image URL
- `flight` (object, optional) - Flight booking details
  - `departure_token` (string)
- `schedules` (array, optional) - Daily schedules
  - `day` (string) - Schedule date in YYYY-MM-DD format
  - `locations` (array) - Locations for the day
    - `data_id` (string) - Unique location identifier
    - `title` (string, required) - Location name
    - `place_id` (string, optional) - Google Places ID
    - `rating` (number, optional) - Location rating
    - `reviews` (number, optional) - Review count
    - `type` (string, optional) - Location type
    - `address` (string, optional) - Full address
    - `open_state` (string, optional) - Opening hours
    - `description` (string, optional) - Location description
    - `service_options` (object, optional) - Service options
    - `user_review` (string, optional) - User's review
    - `thumbnail` (string, optional) - Thumbnail URL
    - `serpapi_thumbnail` (string, optional) - SerpAPI thumbnail
    - `time` (string, optional) - Scheduled time
    - `duration` (number, optional) - Duration in minutes

**Success Response:**
- Status: `201 Created`
```json
{
  "success": true,
  "data": {
    "_id": "itinerary_id",
    "id": 1234567890123,
    "user_id": "user_id",
    "title": "Paris Adventure",
    "start_date": "2025-11-10T00:00:00.000Z",
    "end_date": "2025-11-18T00:00:00.000Z",
    "country": "France",
    "city": "Paris",
    "description": "Explore the Eiffel Tower, Louvre, and enjoy French cuisine.",
    "img": "/images/placeholder1.jpg",
    "flight": {
      "departure_token": "token_string"
    },
    "schedules": [
      {
        "day": "2025-11-10T00:00:00.000Z",
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
    ],
    "createdAt": "2025-11-11T00:00:00.000Z",
    "updatedAt": "2025-11-11T00:00:00.000Z"
  }
}
```

**Error Responses:**
- Status: `400 Bad Request` (missing required fields)
```json
{
  "success": false,
  "error": "Validation failed",
  "details": ["Email is required", "Title is required"]
}
```
- Status: `400 Bad Request` (invalid dates)
```json
{
  "success": false,
  "error": "Validation failed",
  "details": ["End date must be after start date"]
}
```
- Status: `404 Not Found` (user not found)
```json
{
  "success": false,
  "error": "User not found"
}
```

**JavaScript Example:**
```javascript
async function createItinerary(email, itineraryData) {
  try {
    const response = await fetch('https://travelwise-server.vercel.app/api/itineraries', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, ...itineraryData })
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Create itinerary error:', error);
  }
}

// Usage: await createItinerary('user@example.com', { title: 'Paris Trip', start_date: '2025-11-10', end_date: '2025-11-18', country: 'France', city: 'Paris' });
```

---

### 10. Get User Itineraries

**GET** `https://travelwise-server.vercel.app/api/itineraries`

**Description:** Retrieve all itineraries for the authenticated user.

**Body Parameters:**
- `email` (string, required) - User's email for authentication

**Success Response:**
- Status: `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "_id": "itinerary_id",
      "id": 1234567890123,
      "user_id": "user_id",
      "title": "Paris Adventure",
      "start_date": "2025-11-10T00:00:00.000Z",
      "end_date": "2025-11-18T00:00:00.000Z",
      "country": "France",
      "city": "Paris",
      "description": "Explore the Eiffel Tower...",
      "img": "/images/placeholder1.jpg",
      "flight": { "departure_token": "token" },
      "schedules": [...],
      "createdAt": "2025-11-11T00:00:00.000Z",
      "updatedAt": "2025-11-11T00:00:00.000Z"
    }
  ]
}
```

**Error Responses:**
- Status: `400 Bad Request` (missing email)
```json
{
  "success": false,
  "error": "Validation failed",
  "details": ["Email is required"]
}
```
- Status: `404 Not Found` (user not found)
```json
{
  "success": false,
  "error": "User not found"
}
```

**JavaScript Example:**
```javascript
async function getItineraries(email) {
  try {
    const response = await fetch('https://travelwise-server.vercel.app/api/itineraries', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email })
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Get itineraries error:', error);
  }
}

// Usage: await getItineraries('user@example.com');
```

---

### 11. Get Specific Itinerary

**GET** `https://travelwise-server.vercel.app/api/itineraries/:id`

**Description:** Retrieve a specific itinerary by ID for the authenticated user.

**URL Parameters:**
- `id` (string, required) - Itinerary ID

**Body Parameters:**
- `email` (string, required) - User's email for authentication

**Success Response:**
- Status: `200 OK`
```json
{
  "success": true,
  "data": {
    "_id": "itinerary_id",
    "id": 1234567890123,
    "user_id": "user_id",
    "title": "Paris Adventure",
    // ... full itinerary object
  }
}
```

**Error Responses:**
- Status: `400 Bad Request` (missing email)
```json
{
  "success": false,
  "error": "Validation failed",
  "details": ["Email is required"]
}
```
- Status: `404 Not Found` (user or itinerary not found)
```json
{
  "success": false,
  "error": "Itinerary not found"
}
```

**JavaScript Example:**
```javascript
async function getItinerary(email, itineraryId) {
  try {
    const response = await fetch(`https://travelwise-server.vercel.app/api/itineraries/${itineraryId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email })
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Get itinerary error:', error);
  }
}

// Usage: await getItinerary('user@example.com', 'itinerary_id');
```

---

### 12. Update Itinerary

**PUT** `https://travelwise-server.vercel.app/api/itineraries/:id`

**Description:** Update an existing itinerary for the authenticated user.

**URL Parameters:**
- `id` (string, required) - Itinerary ID

**Body Parameters:**
- `email` (string, required) - User's email for authentication
- `title` (string, optional) - Updated title
- `start_date` (string, optional) - Updated start date
- `end_date` (string, optional) - Updated end date
- `country` (string, optional) - Updated country
- `city` (string, optional) - Updated city
- `description` (string, optional) - Updated description
- `img` (string, optional) - Updated image URL
- `flight` (object, optional) - Updated flight details
- `schedules` (array, optional) - Updated schedules

**Success Response:**
- Status: `200 OK`
```json
{
  "success": true,
  "data": {
    // updated itinerary object
  }
}
```

**Error Responses:**
- Status: `400 Bad Request` (missing email or invalid dates)
```json
{
  "success": false,
  "error": "Validation failed",
  "details": ["Email is required"]
}
```
- Status: `404 Not Found` (user or itinerary not found)
```json
{
  "success": false,
  "error": "Itinerary not found"
}
```

**JavaScript Example:**
```javascript
async function updateItinerary(email, itineraryId, updates) {
  try {
    const response = await fetch(`https://travelwise-server.vercel.app/api/itineraries/${itineraryId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, ...updates })
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Update itinerary error:', error);
  }
}

// Usage: await updateItinerary('user@example.com', 'itinerary_id', { description: 'Updated description' });
```

---

### 13. Delete Itinerary

**DELETE** `https://travelwise-server.vercel.app/api/itineraries/:id`

**Description:** Delete an itinerary for the authenticated user.

**URL Parameters:**
- `id` (string, required) - Itinerary ID

**Body Parameters:**
- `email` (string, required) - User's email for authentication

**Success Response:**
- Status: `200 OK`
```json
{
  "success": true,
  "message": "Itinerary deleted successfully"
}
```

**Error Responses:**
- Status: `400 Bad Request` (missing email)
```json
{
  "success": false,
  "error": "Validation failed",
  "details": ["Email is required"]
}
```
- Status: `404 Not Found` (user or itinerary not found)
```json
{
  "success": false,
  "error": "Itinerary not found"
}
```

**JavaScript Example:**
```javascript
async function deleteItinerary(email, itineraryId) {
  try {
    const response = await fetch(`https://travelwise-server.vercel.app/api/itineraries/${itineraryId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email })
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Delete itinerary error:', error);
  }
}

// Usage: await deleteItinerary('user@example.com', 'itinerary_id');
```

---

## General Error Handling

- If you send a request to a route that does **not exist** (e.g., `/login/forgot-passoword` with a typo), you will receive an HTML error page:

```
Cannot POST /login/forgot-passoword
```

- For all API routes, if required fields are missing or invalid (including invalid email format), you will receive a JSON error response with `success: false` and a descriptive `message`.

---

## Tips

- Always check for typos in route paths.
- Ensure all required fields are present in your request body.
- Use a valid email address format for all email fields.
- Handle both success and error responses in your frontend