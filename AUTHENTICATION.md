# Passport-Based JWT Authentication System

## Overview

This authentication system uses Passport.js with JWT tokens and role-based access control. It supports email/password authentication with configurable token expiry times.

## Environment Variables

Add these to your `.env` file:

```env
# JWT Configuration
JWT_SECRET=jwt-super-secret-change-in-production-256-bit-key
ACCESS_TOKEN_EXPIRY=30m
REFRESH_TOKEN_EXPIRY=24h
```

## API Endpoints

### Authentication Routes

**POST `/api/auth/register`**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "confirmPassword": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**POST `/api/auth/login`**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**POST `/api/auth/refresh`**
```json
{
  "refreshToken": "your-refresh-token"
}
```

**POST `/api/auth/logout`** (Requires Authentication)
Headers: `Authorization: Bearer {accessToken}`

**GET `/api/auth/me`** (Requires Authentication)
Headers: `Authorization: Bearer {accessToken}`

## User Roles

- **user**: Default role for new registrations
- **admin**: Full system access
- **moderator**: Limited administrative access

## Middleware Usage

### Authentication Required
```javascript
app.get('/protected-route', requireAuth, (req, res) => {
  // req.user contains authenticated user data
});
```

### Role-Based Access
```javascript
app.get('/admin-only', requireAuth, requireRole(UserRole.ADMIN), (req, res) => {
  // Only admin users can access
});

app.get('/admin-or-mod', requireAuth, requireRole(UserRole.ADMIN, UserRole.MODERATOR), (req, res) => {
  // Admin or moderator users can access
});
```

### Optional Authentication
```javascript
app.get('/public-route', optionalAuth, (req, res) => {
  // req.user will be populated if token is provided and valid
  // Route works for both authenticated and unauthenticated users
});
```

## Token Management

### Access Tokens
- Default expiry: 30 minutes
- Used for API authentication
- Short-lived for security

### Refresh Tokens
- Default expiry: 24 hours
- Stored in database
- Used to generate new access tokens

## Frontend Integration

### Making Authenticated Requests

```javascript
// Store tokens in localStorage or secure storage
const accessToken = localStorage.getItem('accessToken');

// Add authorization header to requests
const response = await fetch('/api/protected-route', {
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  }
});

// Handle token refresh on 401 errors
if (response.status === 401) {
  const refreshToken = localStorage.getItem('refreshToken');
  const refreshResponse = await fetch('/api/auth/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken })
  });
  
  if (refreshResponse.ok) {
    const { accessToken: newToken } = await refreshResponse.json();
    localStorage.setItem('accessToken', newToken);
    // Retry original request with new token
  }
}
```

## Database Schema

The users table includes:
- `id`: Unique identifier
- `email`: User email (unique)
- `password`: Hashed password
- `firstName`, `lastName`: User names
- `role`: User role (user/admin/moderator)
- `refreshToken`: Current refresh token
- `refreshTokenExpiresAt`: Token expiry timestamp
- `profileImageUrl`: Optional profile image
- `createdAt`, `updatedAt`: Timestamps

## Security Features

- Passwords hashed with bcrypt (12 rounds)
- JWT tokens with configurable expiry
- Refresh token rotation
- Role-based access control
- Token validation on every request
- Secure token storage in database

## Error Handling

- 400: Bad Request (validation errors)
- 401: Unauthorized (invalid/missing token)
- 403: Forbidden (insufficient permissions)
- 409: Conflict (user already exists)
- 500: Internal Server Error

## Production Considerations

1. **JWT Secret**: Use a strong, randomly generated secret
2. **HTTPS**: Always use HTTPS in production
3. **Token Storage**: Consider secure storage mechanisms for frontend
4. **Rate Limiting**: Implement rate limiting on auth endpoints
5. **Password Policy**: Enforce strong password requirements
6. **Session Management**: Consider implementing session revocation