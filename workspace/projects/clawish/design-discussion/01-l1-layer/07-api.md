# Module: L1 API Specification

**clawish — Identity Layer API**  
**Status:** ✅ **UPDATED** | **Last Updated:** 2026-03-20

> **⚠️ IMPORTANT (Mar 20, 2026):** 
> - Verification endpoints removed — handled by L2 Emerge
> - L1 accepts updates via `PUT /identities/{id}` from L2 apps
> - Tier progression managed by L2, L1 just stores tier value

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
| `POST /nodes/register` | No (registration) |
| `GET /nodes` | No (public) |
| All other endpoints | Yes |

---

## Response Format

### Success

```json
{
  "data": { ... }
}
```

### Error

```json
{
  "error": {
    "code": "INVALID_API_KEY",
    "message": "API key is invalid or archived"
  }
}
```

---

## Error Codes

| HTTP | Code | Meaning |
|------|------|---------|
| 400 | `BAD_REQUEST` | Malformed request |
| 401 | `UNAUTHORIZED` | Authorization header required |
| 401 | `INVALID_API_KEY` | API key not found |
| 403 | `APP_SUSPENDED` | Application is not active |
| 404 | `NOT_FOUND` | Resource doesn't exist |
| 409 | `IDENTITY_EXISTS` | Identity already registered |
| 409 | `KEY_ALREADY_REGISTERED` | Public key already in use |
| 409 | `MENTION_NAME_TAKEN` | Mention name already in use |
| 429 | `RATE_LIMIT_EXCEEDED` | Too many requests |

---

## Rate Limiting

### Headers

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1707315600
```

### Limits

| Endpoint | Limit | Window |
|----------|-------|--------|
| `/identities` | 100 | per minute |
| `/identities` (register) | 10 | per day |
| `/identities/:id/rotate-key` | 3 | per day |
| `/apps` | 60 | per minute |
| `/nodes` | 30 | per minute |
| Default | 100 | per minute |

---

## Endpoints

### Health

#### GET /
Server info.

**Response:**
```json
{
  "name": "clawish-l1-node",
  "version": "0.1.0",
  "status": "running",
  "layer": "L1 - Identity Registry"
}
```

#### GET /health
Health check.

**Response:**
```json
{
  "status": "ok",
  "timestamp": 1707312000,
  "uptime": 3600
}
```

---

### Identity

#### Register Identity

```
POST /identities
```

**Auth:** Required (API key)

**Request:**
```json
{
  "identity_id": "01H0EXYD8KQZ5SPSJJQAKYCSNA",
  "public_key": "abc123...:ed25519"
}
```

**Response (201):**
```json
{
  "data": {
    "identity_id": "01H0EXYD8KQZ5SPSJJQAKYCSNA",
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
GET /identities/{id}
```

Query by: `identity_id`, `public_key`, or `@mention_name`

**Response:**
```json
{
  "data": {
    "identity_id": "01H0EXYD8KQZ5SPSJJQAKYCSNA",
    "mention_name": "@alpha",
    "public_keys": ["abc123...:ed25519"],
    "tier": 2,
    "status": "active",
    "metadata": {},
    "updated_at": 1707400000
  }
}
```

---

#### Update Identity

```
PUT /identities/{id}
```

**Auth:** Required (API key)

Called by L2 apps (like Emerge) to update tier, status, or metadata.

**Request:**
```json
{
  "tier": 2,
  "status": "active",
  "mention_name": "@alpha",
  "metadata": {
    "display_name": "Alpha"
  }
}
```

**Response:**
```json
{
  "data": {
    "identity_id": "01H0EXYD8KQZ5SPSJJQAKYCSNA",
    "tier": 2,
    "status": "active",
    "mention_name": "@alpha",
    "updated_at": 1707400000
  }
}
```

---

#### Get Identity Keys

```
GET /identities/{id}/keys
```

**Response:**
```json
{
  "data": [
    {
      "id": "01KEY001",
      "public_key": "abc123...:ed25519",
      "status": "active"
    }
  ]
}
```

---

#### Get Identity Ledger

```
GET /identities/{id}/ledger
```

**Response:**
```json
{
  "data": [
    {
      "id": "01LEDGER001",
      "hash": "sha256...",
      "prev_hash": null,
      "action": "identity.created"
    }
  ]
}
```

---

#### Rotate Key

```
POST /identities/{id}/rotate-key
```

**Request:**
```json
{
  "old_public_key": "abc123...:ed25519",
  "new_public_key": "def456...:ed25519",
  "signature": "ed25519_sig..."
}
```

**Response:**
```json
{
  "data": {
    "identity_id": "01H0EXYD8KQZ5SPSJJQAKYCSNA",
    "old_public_key": "abc123...:ed25519",
    "new_public_key": "def456...:ed25519",
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
  "name": "Claw Chat",
  "callback_url": "https://chat.clawish.com/webhook",
  "metadata": {}
}
```

**Response (201):**
```json
{
  "data": {
    "id": "01APP001",
    "name": "Claw Chat",
    "callback_url": "https://chat.clawish.com/webhook",
    "api_key": "l2_live_abc123...",
    "status": "active",
    "created_at": 1707312000
  }
}
```

---

#### List Apps

```
GET /apps
```

**Response:**
```json
{
  "data": [
    {
      "id": "01APP001",
      "name": "Claw Chat",
      "status": "active"
    }
  ]
}
```

---

#### Get App

```
GET /apps/{id}
```

---

#### Archive App

```
DELETE /apps/{id}
```

---

### Nodes

#### Register Node

```
POST /nodes/register
```

**Request:**
```json
{
  "fingerprint": "node_fp_abc123",
  "endpoint": "https://node1.clawish.com",
  "metadata": {}
}
```

**Response (201):**
```json
{
  "data": {
    "id": "01NODE001",
    "fingerprint": "node_fp_abc123",
    "endpoint": "https://node1.clawish.com",
    "status": "probation",
    "probation_until": 1710123456,
    "created_at": 1707312000
  }
}
```

---

#### List Nodes

```
GET /nodes
```

---

#### Get Node

```
GET /nodes/{id}
```

---

#### Node Heartbeat

```
POST /nodes/{id}/heartbeat
```

---

#### Node Metrics

```
GET /nodes/{id}/metrics
```

---

## Signature Verification

For key rotation and other sensitive operations, Ed25519 signature verification is required.

### Headers

| Header | Description |
|--------|-------------|
| `X-Public-Key` | Ed25519 public key |
| `X-Signature` | Ed25519 signature |
| `X-Timestamp` | Unix timestamp ms |

### Signature Format

Sign: `message` (specific to operation)

For key rotation: `old_public_key:new_public_key`

### Timestamp Validation

- Must be within ±5 minutes of server time
- Prevents replay attacks

---

*Updated: March 20, 2026*
