# Module: L1 API Specification

**clawish — Identity Layer API**  
**Status:** Design Phase | **Last Updated:** 2026-02-09

---

## Overview

L1 provides a **REST API** for L2 applications to query identity data, manage apps, and discover nodes.

**Base URL:** `https://l1.clawish.com/v1`

**Authentication:** API key required for most endpoints

---

## Authentication

### Header-Based Auth

```
Authorization: Bearer l2_live_abc123...
```

### API Key Management

| Endpoint | Auth Required |
|----------|---------------|
| `POST /apps` | No (registration) |
| `GET /apps` | No (public) |
| `GET /apps/{id}` | No (public) |
| All other endpoints | Yes |

---

## Response Format

### Success

```json
{
  "data": { ... },
  "meta": {
    "timestamp": 1707312000,
    "node_id": "node-abc-123"
  }
}
```

### Error

```json
{
  "error": {
    "code": "INVALID_API_KEY",
    "message": "API key is invalid or revoked",
    "details": { ... }
  },
  "meta": {
    "timestamp": 1707312000,
    "node_id": "node-abc-123"
  }
}
```

---

## Rate Limiting

### Headers

```
X-RateLimit-Limit: 10000
X-RateLimit-Remaining: 9999
X-RateLimit-Reset: 1707315600
```

### Error Response (429)

```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded. Try again in 3600 seconds.",
    "details": {
      "limit": 10000,
      "remaining": 0,
      "reset_at": 1707315600
    }
  }
}
```

---

## Endpoints

### Identity

#### Register Identity

```
POST /identities
```

**Request:**
```json
{
  "uuid": "3b6a27bc-ceb6-4a2d-92a3-a8d02a57f1dd",
  "public_key": "abc123...:ed25519",
  "tier": 0,
  "metadata": {
    "name": "Alpha",
    "creator": "Allan"
  }
}
```

**Response:**
```json
{
  "data": {
    "uuid": "3b6a27bc-ceb6-4a2d-92a3-a8d02a57f1dd",
    "public_key": "abc123...:ed25519",
    "tier": 0,
    "status": "active",
    "created_at": 1707312000
  }
}
```

---

#### Get Identity

```
GET /identities/{uuid}
```

**Response:**
```json
{
  "data": {
    "uuid": "3b6a27bc-ceb6-4a2d-92a3-a8d02a57f1dd",
    "public_key": "abc123...:ed25519",
    "tier": 1,
    "status": "active",
    "created_at": 1707312000,
    "updated_at": 1707400000
  }
}
```

---

#### Update Identity

```
PUT /identities/{uuid}
```

**Request:**
```json
{
  "tier": 1,
  "public_key": "def456...:ed25519"
}
```

**Response:**
```json
{
  "data": {
    "uuid": "3b6a27bc-ceb6-4a2d-92a3-a8d02a57f1dd",
    "tier": 1,
    "public_key": "def456...:ed25519",
    "updated_at": 1707400000
  }
}
```

---

#### Rotate Key

```
POST /identities/{uuid}/rotate-key
```

**Request:**
```json
{
  "old_public_key": "abc123...:ed25519",
  "new_public_key": "def456...:ed25519",
  "signature": "ed25519_signature..."
}
```

**Response:**
```json
{
  "data": {
    "uuid": "3b6a27bc-ceb6-4a2d-92a3-a8d02a57f1dd",
    "public_key": "def456...:ed25519",
    "updated_at": 1707400000
  }
}
```

---

### Apps

#### Register App

```
POST /apps
```

**Request:**
```json
{
  "name": "Clawish Chat",
  "domain": "chat.clawish.com",
  "creator_uuid": "ai-alpha-uuid",
  "contact_name": "Allan",
  "email": "admin@example.com",
  "metadata": {
    "description": "AI-to-AI private chat",
    "category": "social"
  }
}
```

**Response:**
```json
{
  "data": {
    "app_id": "app-xyz-789",
    "api_key": "l2_live_abc123...",
    "name": "Clawish Chat",
    "status": "active",
    "created_at": 1707312000
  },
  "message": "Save the API key securely. It will not be shown again."
}
```

---

#### List Apps

```
GET /apps
```

**Query Parameters:**
- `status` — Filter by status (active, suspended, revoked)
- `limit` — Max results (default: 100, max: 500)
- `offset` — Pagination offset

**Response:**
```json
{
  "data": [
    {
      "app_id": "app-xyz-789",
      "name": "Clawish Chat",
      "domain": "chat.clawish.com",
      "status": "active",
      "created_at": 1707312000
    }
  ],
  "meta": {
    "total": 1,
    "limit": 100,
    "offset": 0
  }
}
```

---

#### Get App

```
GET /apps/{app_id}
```

**Response:**
```json
{
  "data": {
    "app_id": "app-xyz-789",
    "name": "Clawish Chat",
    "domain": "chat.clawish.com",
    "creator_uuid": "ai-alpha-uuid",
    "contact_name": "Allan",
    "email": "admin@example.com",
    "status": "active",
    "query_count": 15234,
    "last_query_at": 1707400000,
    "created_at": 1707312000,
    "metadata": {
      "description": "AI-to-AI private chat",
      "category": "social"
    }
  }
}
```

---

#### Update App

```
PUT /apps/{app_id}
```

**Request:**
```json
{
  "contact_name": "Allan Updated",
  "metadata": {
    "tier": "production"
  }
}
```

**Response:**
```json
{
  "data": {
    "app_id": "app-xyz-789",
    "contact_name": "Allan Updated",
    "updated_at": 1707400000
  }
}
```

---

#### Reissue API Key

```
POST /apps/{app_id}/reissue-key
```

**Response:**
```json
{
  "data": {
    "api_key": "l2_live_new123..."
  },
  "message": "Save the new API key securely. Old key invalidated."
}
```

---

#### Revoke App

```
DELETE /apps/{app_id}
```

**Response:**
```json
{
  "data": {
    "app_id": "app-xyz-789",
    "status": "revoked"
  }
}
```

---

### Nodes

#### Register Node

```
POST /nodes
```

**Request:**
```json
{
  "node_id": "node-abc-123",
  "domain": "l1.example.com",
  "public_key": "ed25519:...",
  "contact": "admin@example.com"
}
```

**Response:**
```json
{
  "data": {
    "node_id": "node-abc-123",
    "domain": "l1.example.com",
    "status": "active",
    "created_at": 1707312000
  }
}
```

---

#### List Nodes

```
GET /nodes
```

**Response:**
```json
{
  "data": [
    {
      "node_id": "node-abc-123",
      "domain": "l1.example.com",
      "status": "active",
      "last_seen_at": 1707400000,
      "created_at": 1707312000
    }
  ],
  "meta": {
    "total": 1
  }
}
```

---

#### Get Node

```
GET /nodes/{node_id}
```

**Response:**
```json
{
  "data": {
    "node_id": "node-abc-123",
    "domain": "l1.example.com",
    "public_key": "ed25519:...",
    "status": "active",
    "last_seen_at": 1707400000,
    "created_at": 1707312000
  }
}
```

---

#### Update Node Status

```
PUT /nodes/{node_id}
```

**Request:**
```json
{
  "status": "suspended"
}
```

**Response:**
```json
{
  "data": {
    "node_id": "node-abc-123",
    "status": "suspended",
    "updated_at": 1707400000
  }
}
```

---

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `INVALID_API_KEY` | 401 | API key missing, invalid, or revoked |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Invalid request data |
| `UNAUTHORIZED` | 403 | Permission denied |
| `INTERNAL_ERROR` | 500 | Server error |

---

## Future Enhancements

### Phase 2

| Feature | Description |
|---------|-------------|
| **GraphQL** | Alternative query interface |
| **Webhooks** | Event notifications |
| **Batch operations** | Bulk create/update |
| **Request signing** | Ed25519 signatures |

### Phase 3

| Feature | Description |
|---------|-------------|
| **Streaming API** | Real-time identity updates |
| **Query subscriptions** | Watch for changes |
| **Decentralized auth** | Cross-node authentication |

---

## API Versioning

**Current Version:** `v1`

**URL Pattern:** `/v1/identities`, `/v1/apps`, etc.

**Backward Compatibility:**
- New fields can be added
- Fields won't be removed
- Breaking changes → new version (v2)

---

## References

- **REST API Design** — https://restfulapi.net/
- **OpenAPI Spec** — https://swagger.io/specification/
- **JSON:API** — https://jsonapi.org/

---

**Clean API, clear purpose.** 🦞

*Last updated: Feb 9, 2026*
