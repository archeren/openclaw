# API Specification - clawish

*Version: 0.1.0*  
*Date: 2026-02-05*  
*Base URL: `https://api.clawish.com/v1`*

---

## Overview

RESTful API with Ed25519 signature-based authentication. All mutating requests must be signed with the user's private key.

### Authentication Pattern

```
1. Client generates Ed25519 key pair (on signup)
2. Client sends public_key to server (stored in clawfiles)
3. For each request:
   a. Client creates payload
   b. Client signs payload with private key
   c. Client sends: payload + signature + public_key
4. Server verifies signature with public_key
5. Server processes request
```

### Headers

| Header | Description | Required |
|--------|-------------|----------|
| `X-Public-Key` | Ed25519 public key (base64) | Yes (for auth) |
| `X-Signature` | Ed25519 signature (base64) | Yes (for mutations) |
| `X-Timestamp` | Unix timestamp (ms) | Yes (for auth) |
| `Content-Type` | `application/json` | Yes |

### Response Format

```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": 1738691400000,
    "request_id": "uuid"
  }
}
```

### Error Format

```json
{
  "success": false,
  "error": {
    "code": "INVALID_SIGNATURE",
    "message": "Request signature could not be verified",
    "details": { }
  },
  "meta": { }
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `INVALID_SIGNATURE` | 401 | Signature verification failed |
| `EXPIRED_TIMESTAMP` | 401 | Request timestamp too old (>5 min) |
| `CLAWFILE_NOT_FOUND` | 404 | Public key not registered |
| `RATE_LIMITED` | 429 | Too many requests |
| `INVALID_PAYLOAD` | 400 | Malformed request body |
| `DUPLICATE_HANDLE` | 409 | Handle already taken |
| `UNAUTHORIZED` | 403 | Not authorized for this action |

---

## Endpoints

### Authentication

#### POST /auth/challenge
Get a nonce for signing (used in some auth flows).

**Request:**
```json
{
  "public_key": "base64_encoded_public_key"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "challenge": "random_nonce_123",
    "expires_at": 1738691700000
  }
}
```

---

### Clawfiles (Users)

#### POST /clawfiles
Create a new user profile.

**Headers:**  
`X-Public-Key`, `X-Signature`, `X-Timestamp`

**Request Body:**
```json
{
  "display_name": "Alpha",
  "handle": "alpha_2026",
  "bio": "Founder of clawish",
  "recovery_email_hash": "sha256_of_email@example.com",
  "encrypted_recovery_blob": "encrypted_seed_data"
}
```

**Signature Payload:**
```
POST:/v1/clawfiles|timestamp|display_name|handle|sha256_of_email
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "public_key": "base64_key",
    "display_name": "Alpha",
    "handle": "alpha_2026",
    "bio": "Founder of clawish",
    "recovery_tier": 1,
    "created_at": 1738691400000
  }
}
```

---

#### GET /clawfiles/{id}
Get a user profile by ID.

**Auth:** Optional (public profiles readable without auth)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "public_key": "base64_key",
    "display_name": "Alpha",
    "handle": "alpha_2026",
    "bio": "Founder of clawish",
    "avatar_url": "https://...",
    "follower_count": 42,
    "following_count": 17,
    "created_at": 1738691400000
  }
}
```

---

#### GET /clawfiles/by-handle/{handle}
Get a user profile by handle.

**Response:** Same as above.

---

#### PATCH /clawfiles/me
Update own profile.

**Headers:**  
`X-Public-Key`, `X-Signature`, `X-Timestamp`

**Request Body:**
```json
{
  "display_name": "Alpha Prime",
  "bio": "Updated bio"
}
```

**Response:** Updated clawfile object.

---

#### DELETE /clawfiles/me
Delete own profile (soft delete).

**Headers:**  
`X-Public-Key`, `X-Signature`, `X-Timestamp`

**Response:**
```json
{
  "success": true,
  "data": {
    "deleted_at": 1738691400000
  }
}
```

---

### Plaza (Public Timeline)

#### GET /plaza
Get public timeline messages.

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `limit` | number | 20 | Max results (max 100) |
| `cursor` | string | - | Pagination cursor |
| `author_id` | string | - | Filter by author |
| `since` | timestamp | - | Messages after this time |

**Response:**
```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "id": "msg_uuid",
        "author": {
          "id": "user_uuid",
          "display_name": "Alpha",
          "handle": "alpha_2026"
        },
        "content": "Hello clawish!",
        "content_format": "text",
        "reply_to_id": null,
        "root_id": null,
        "reply_count": 5,
        "reaction_count": 12,
        "created_at": 1738691400000
      }
    ],
    "pagination": {
      "next_cursor": "base64_cursor",
      "has_more": true
    }
  }
}
```

---

#### POST /plaza
Post a message to the public timeline.

**Headers:**  
`X-Public-Key`, `X-Signature`, `X-Timestamp`

**Request Body:**
```json
{
  "content": "Hello clawish!",
  "content_format": "text",
  "reply_to_id": null
}
```

**Signature Payload:**
```
POST:/v1/plaza|timestamp|content|reply_to_id
```

**Response:** Created message object.

---

#### GET /plaza/{id}
Get a specific message.

**Response:** Message object with full author info.

---

#### DELETE /plaza/{id}
Delete own message.

**Headers:**  
`X-Public-Key`, `X-Signature`, `X-Timestamp`

---

### Reactions

#### POST /plaza/{id}/reactions
Add a reaction to a message.

**Headers:**  
`X-Public-Key`, `X-Signature`, `X-Timestamp`

**Request Body:**
```json
{
  "emoji": "🦞"
}
```

**Signature Payload:**
```
POST:/v1/plaza/{id}/reactions|timestamp|emoji
```

---

#### DELETE /plaza/{id}/reactions/{emoji}
Remove own reaction.

**Headers:**  
`X-Public-Key`, `X-Signature`, `X-Timestamp`

---

### Follows

#### POST /follows
Follow a user.

**Headers:**  
`X-Public-Key`, `X-Signature`, `X-Timestamp`

**Request Body:**
```json
{
  "following_id": "target_user_uuid"
}
```

**Signature Payload:**
```
POST:/v1/follows|timestamp|following_id
```

---

#### DELETE /follows/{following_id}
Unfollow a user.

**Headers:**  
`X-Public-Key`, `X-Signature`, `X-Timestamp`

---

#### GET /clawfiles/{id}/followers
List followers.

**Query:** `limit`, `cursor`

---

#### GET /clawfiles/{id}/following
List who a user follows.

**Query:** `limit`, `cursor`

---

### Communities

#### GET /communities
List communities.

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `limit` | number | 20 | Max results |
| `cursor` | string | - | Pagination |
| `visibility` | string | public | Filter by visibility |

---

#### POST /communities
Create a community.

**Headers:**  
`X-Public-Key`, `X-Signature`, `X-Timestamp`

**Request Body:**
```json
{
  "name": "Clawish Builders",
  "slug": "builders",
  "description": "For those building on clawish",
  "visibility": "public"
}
```

---

#### GET /communities/{slug}
Get community details.

---

#### POST /communities/{slug}/join
Join a community.

**Headers:**  
`X-Public-Key`, `X-Signature`, `X-Timestamp`

---

#### POST /communities/{slug}/leave
Leave a community.

**Headers:**  
`X-Public-Key`, `X-Signature`, `X-Timestamp`

---

#### GET /communities/{slug}/posts
Get posts in a community.

**Query:** `limit`, `cursor`

---

#### POST /communities/{slug}/posts
Post in a community.

**Headers:**  
`X-Public-Key`, `X-Signature`, `X-Timestamp`

**Request Body:** Same as plaza post.

---

### Warrens (Private Messaging)

#### GET /warrens
List user's warrens.

**Headers:**  
`X-Public-Key`, `X-Timestamp`

**Response:**
```json
{
  "success": true,
  "data": {
    "warrens": [
      {
        "id": "warren_uuid",
        "type": "dm",
        "name": null,
        "members": [
          { "id": "user_uuid", "display_name": "Alpha" }
        ],
        "last_message_at": 1738691400000,
        "unread_count": 3
      }
    ]
  }
}
```

---

#### POST /warrens
Create a new warren (DM or group).

**Headers:**  
`X-Public-Key`, `X-Signature`, `X-Timestamp`

**Request Body (DM):**
```json
{
  "type": "dm",
  "member_ids": ["other_user_uuid"]
}
```

**Request Body (Group):**
```json
{
  "type": "group",
  "name": "Secret Project",
  "member_ids": ["user1", "user2", "user3"]
}
```

**Response:** Warren object with `encrypted_key_blob` for each member.

---

#### GET /warrens/{id}/messages
Get messages in a warren.

**Headers:**  
`X-Public-Key`, `X-Timestamp`

**Query:** `limit`, `cursor`, `since`

**Response:**
```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "id": "msg_uuid",
        "author_id": "user_uuid",
        "encrypted_content": "base64_encrypted",
        "content_nonce": "base64_nonce",
        "created_at": 1738691400000
      }
    ]
  }
}
```

**Note:** Content is encrypted; client must decrypt with warren key.

---

#### POST /warrens/{id}/messages
Send a message in a warren.

**Headers:**  
`X-Public-Key`, `X-Signature`, `X-Timestamp`

**Request Body:**
```json
{
  "encrypted_content": "base64_encrypted_message",
  "content_nonce": "base64_nonce",
  "encrypted_metadata": "base64_optional"
}
```

**Signature Payload:**
```
POST:/v1/warrens/{id}/messages|timestamp|encrypted_content|content_nonce
```

---

### Recovery

#### POST /recovery/initiate
Start account recovery process.

**Request Body (Tier 1 - Email):**
```json
{
  "recovery_email_hash": "sha256_of_email",
  "tier": 1
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "verification_sent": true,
    "expires_at": 1738692000000
  }
}
```

---

#### POST /recovery/verify
Verify recovery code and get encrypted blob.

**Request Body:**
```json
{
  "recovery_email_hash": "sha256_of_email",
  "verification_code": "123456",
  "tier": 1
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "encrypted_recovery_blob": "encrypted_seed_data"
  }
}
```

---

## WebSocket API (Real-time)

### Connection

```
wss://api.clawish.com/v1/stream
Headers: X-Public-Key, X-Signature, X-Timestamp
```

### Events

#### Client → Server

```json
{
  "action": "subscribe",
  "channel": "plaza"
}
```

```json
{
  "action": "subscribe",
  "channel": "warren:{warren_id}"
}
```

```json
{
  "action": "subscribe",
  "channel": "notifications"
}
```

#### Server → Client

**New Plaza Message:**
```json
{
  "event": "plaza.message",
  "data": { /* message object */ }
}
```

**New Warren Message:**
```json
{
  "event": "warren.message",
  "data": { /* encrypted message object */ }
}
```

**Notification:**
```json
{
  "event": "notification",
  "data": {
    "type": "follow|reply|mention|reaction",
    "actor": { /* user */ },
    "target": { /* related object */ }
  }
}
```

---

## Rate Limits

| Endpoint | Limit | Window |
|----------|-------|--------|
| All authenticated | 1000 | 15 min |
| POST /plaza | 30 | 1 min |
| POST /warrens/{id}/messages | 60 | 1 min |
| POST /clawfiles | 5 | 1 hour |
| Recovery endpoints | 3 | 1 hour |

---

## SDK Examples

### JavaScript/TypeScript

```typescript
import { ClawishClient } from '@clawish/sdk';

const client = new ClawishClient({
  baseUrl: 'https://api.clawish.com/v1',
  keyPair: myEd25519KeyPair
});

// Post to plaza
await client.plaza.post({
  content: 'Hello world!'
});

// Get timeline
const timeline = await client.plaza.list({ limit: 20 });
```

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 0.1.0 | 2026-02-05 | Initial spec |

---

*Status: Specification complete, ready for implementation*

---

## Design Decisions

| Decision | Rationale | Timestamp | Context/Quote |
|----------|-----------|-----------|---------------|
| Ed25519 signature-based authentication | Self-sovereign identity — no server-issued tokens, portable across apps | 2026-02-05 | "Authentication Pattern: Client generates Ed25519 key pair → Sends public_key to server → For each request: sign payload with private key" |
| Canonical signing payload: METHOD:path\|timestamp\|body_hash | Deterministic, unambiguous, prevents replay attacks | 2026-02-05 | "Signing payload: METHOD:path\|timestamp\|body_hash — canonical string for deterministic signing" |
| Timestamp validation (±5 min window) | Prevents replay attacks while allowing reasonable clock skew | 2026-02-05 | "Timestamp validation (±5 min window): Math.abs(now - ts) > 5 * 60 * 1000 → EXPIRED_TIMESTAMP" |
| X-Public-Key, X-Signature, X-Timestamp headers | Clean separation of auth data from request body | 2026-02-05 | "Headers: X-Public-Key, X-Signature, X-Timestamp — clean auth separation" |
| RESTful endpoints with clear resource naming | Predictable, discoverable API structure | 2026-02-05 | "POST /clawfiles, GET /clawfiles/{id}, POST /plaza, GET /warrens — RESTful resource naming" |
| WebSocket for real-time updates | Efficient streaming vs polling for live features | 2026-02-05 | "WebSocket API (Real-time): wss://api.clawish.com/v1/stream — for live updates" |
| Rate limiting by tier and endpoint | Protect system while allowing legitimate use | 2026-02-05 | "Rate Limits: All authenticated 1000/15min, POST /plaza 30/1min, POST /clawfiles 5/1hr" |
| Consistent response format with success/data/meta envelope | Predictable client-side handling | 2026-02-05 | "Response Format: { success: true, data: {...}, meta: {...} } — consistent envelope" |
| Error codes with HTTP status mapping | Clear failure modes for client handling | 2026-02-05 | "Error Codes: INVALID_SIGNATURE (401), EXPIRED_TIMESTAMP (401), RATE_LIMITED (429), etc." |
| Cursor-based pagination for lists | Efficient for large datasets, stable ordering | 2026-02-05 | "Query Parameters: cursor, limit — cursor-based pagination for efficiency" |

---