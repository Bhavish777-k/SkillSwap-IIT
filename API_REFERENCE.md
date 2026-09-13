# API Endpoints Reference

## Base URL
```
http://localhost:5000/api
```

## Quick Reference

### 🔐 Authentication
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | Register new user | No |
| POST | `/auth/login` | Login user | No |
| GET | `/auth/me` | Get current user | Yes |
| PUT | `/auth/updatepassword` | Update password | Yes |

### 👤 Users
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/users` | Get all users | No |
| GET | `/users/:id` | Get user by ID | No |
| GET | `/users/dashboard/stats` | Get dashboard | Yes |
| PUT | `/users/profile` | Update profile | Yes |
| DELETE | `/users/account` | Delete account | Yes |

### 🎯 Skills
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/skills` | Get all skills | No |
| GET | `/skills/categories/list` | Get categories | No |
| GET | `/skills/:id` | Get skill by ID | No |
| POST | `/skills` | Create skill | Admin |
| PUT | `/skills/:id` | Update skill | Admin |
| DELETE | `/skills/:id` | Delete skill | Admin |

### 🤝 Matches
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/matches/find` | Find matches | Yes |
| GET | `/matches/recommendations` | Get recommendations | Yes |
| POST | `/matches/request` | Send match request | Yes |
| GET | `/matches/received` | Get received requests | Yes |
| GET | `/matches/sent` | Get sent requests | Yes |
| PUT | `/matches/:id/respond` | Respond to request | Yes |
| PUT | `/matches/:id/cancel` | Cancel request | Yes |

### 📅 Sessions
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/sessions` | Create session | Yes |
| GET | `/sessions` | Get sessions | Yes |
| GET | `/sessions/:id` | Get session by ID | Yes |
| PUT | `/sessions/:id` | Update session | Yes |
| PUT | `/sessions/:id/complete` | Complete session | Yes |
| PUT | `/sessions/:id/cancel` | Cancel session | Yes |

### 💬 Chats
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/chats` | Get/create chat | Yes |
| GET | `/chats` | Get all chats | Yes |
| GET | `/chats/:id` | Get chat by ID | Yes |
| POST | `/chats/:id/messages` | Send message | Yes |
| DELETE | `/chats/:id` | Delete chat | Yes |

### ⭐ Reviews
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/reviews` | Create review | Yes |
| GET | `/reviews/user/:userId` | Get user reviews | No |
| GET | `/reviews/:id` | Get review by ID | No |
| PUT | `/reviews/:id` | Update review | Yes |
| PUT | `/reviews/:id/respond` | Respond to review | Yes |
| DELETE | `/reviews/:id` | Delete review | Yes |

### 🛡️ Admin
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/admin/stats` | Get admin stats | Admin |
| GET | `/admin/users` | Get all users | Admin |
| PUT | `/admin/users/:id/block` | Block user | Admin |
| PUT | `/admin/users/:id/unblock` | Unblock user | Admin |
| PUT | `/admin/users/:id/grant-premium` | Grant premium | Admin |
| DELETE | `/admin/users/:id` | Delete user | Admin |
| GET | `/admin/logs` | Get admin logs | Admin |

## Authentication Header

For protected endpoints, include JWT token:
```
Authorization: Bearer <your-jwt-token>
```

## Common Query Parameters

- `?page=1` - Pagination page number
- `?limit=10` - Results per page
- `?search=query` - Search filter
- `?status=pending` - Status filter
- `?category=Programming` - Category filter

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "count": 10,
  "total": 100,
  "pages": 10
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
```

## Testing with cURL

### Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@iit.ac.in",
    "password": "password123",
    "college": "IIT Delhi"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "rahul@iit.ac.in",
    "password": "password123"
  }'
```

### Get Skills
```bash
curl http://localhost:5000/api/skills
```

### Get Dashboard (requires auth)
```bash
curl http://localhost:5000/api/users/dashboard/stats \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```
