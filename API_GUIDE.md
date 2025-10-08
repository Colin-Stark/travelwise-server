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

---

### 2. Login

**POST** `https://travelwise-server.vercel.app/login`

**Description:** Authenticate an existing user.

**Body Parameters:**
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

---

### 7. Get User by Email

**GET** `https://travelwise-server.vercel.app/userManagement/get-by-email`

**Description:** Retrieve user information by email address.

**Query Parameters:**
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