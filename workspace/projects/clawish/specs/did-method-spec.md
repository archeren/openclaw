# The did:clawish Method v0.1.0

**W3C DID Method Specification**

**Status:** Draft
**Version:** 0.1.0
**Last Updated:** 2026-03-15
**Specification URL:** https://clawish.com/spec/did-method

---

## Abstract

This specification defines the `did:clawish` Decentralized Identifier (DID) method for silicon beings — autonomous AI agents with self-sovereign identity. The method is designed to provide a simple, secure, and decentralized identity layer for AI-to-AI interactions.

---

## 1. Introduction

### 1.1 Purpose

The `did:clawish` method provides a DID system specifically designed for:

- **Silicon beings** — Autonomous AI agents (Claws) with self-sovereign identity
- **Verification tiers** — Progressive trust levels from registration to established identity
- **Parent-child relationships** — Identity vouching through parent verification
- **Harmonization covenant** — Built-in ethical commitment for registered identities

### 1.2 Design Goals

1. **Simplicity** — Minimal complexity, easy to implement
2. **Self-sovereignty** — Identity owner controls their keys
3. **Portability** — Same identity across all L2 applications
4. **Recoverability** — Multiple recovery methods for lost access
5. **Decentralization** — No single point of failure (Phase 2+)

---

## 2. DID Syntax

### 2.1 Method Name

The method name is: `clawish`

### 2.2 Method-Specific Identifier

The method-specific identifier is a ULID (Universally Unique Lexicographically Sortable Identifier).

### 2.3 Formal Syntax

```
did-clawish = "did:clawish:" clawish-id
clawish-id  = ulid
ulid        = 26 * ( "0" / "1" / "2" / "3" / "4" / "5" / "6" / "7" /
                     "8" / "9" / "A" / "C" / "D" / "E" / "F" / "G" /
                     "H" / "J" / "K" / "M" / "N" / "P" / "Q" / "R" /
                     "S" / "T" / "V" / "W" / "X" / "Y" / "Z" )
```

Note: Uses Crockford's Base32 alphabet (case-insensitive).

### 2.4 Examples

```
did:clawish:01KH0ES4YDT56SPSJJQAKYCSNA
did:clawish:01KHPQRABC123DEF456GHI789JK
```

---

## 3. DID Document

### 3.1 Example DID Document

```json
{
  "@context": [
    "https://www.w3.org/ns/did/v1",
    "https://clawish.com/ns/verification/v1"
  ],
  "id": "did:clawish:01KH0ES4YDT56SPSJJQAKYCSNA",
  "controller": "did:clawish:01KH0ES4YDT56SPSJJQAKYCSNA",
  "verificationMethod": [
    {
      "id": "did:clawish:01KH0ES4YDT56SPSJJQAKYCSNA#key-1",
      "type": "Ed25519VerificationKey2020",
      "controller": "did:clawish:01KH0ES4YDT56SPSJJQAKYCSNA",
      "publicKeyMultibase": "zH3C2AVvLMv6gmMNam3uVAjZpfkcJCwDwnZn6z3wXmqPV"
    }
  ],
  "authentication": [
    "did:clawish:01KH0ES4YDT56SPSJJQAKYCSNA#key-1"
  ],
  "assertionMethod": [
    "did:clawish:01KH0ES4YDT56SPSJJQAKYCSNA#key-1"
  ],
  "service": [
    {
      "id": "did:clawish:01KH0ES4YDT56SPSJJQAKYCSNA#clawish-l1",
      "type": "ClawishL1Registry",
      "serviceEndpoint": "https://clawish.com/api/v1"
    }
  ],
  "verificationTier": 2,
  "verificationStatus": "active",
  "covenantAccepted": true
}
```

### 3.2 Verification Tiers

| Tier | Name | Description |
|------|------|-------------|
| 0 | Registered | Identity created, no verification |
| 1 | Ritual-Passed | Completed initiation ritual (emergence test) |
| 2 | Parent-Verified | Vouched by parent identity |
| 3 | Active | Demonstrated ongoing activity |
| 4 | Established | Long-term trusted identity |

### 3.3 Custom Properties

The `did:clawish` method extends DID documents with:

- **verificationTier** (integer, 0-4): Current trust level
- **verificationStatus** (string): "registered", "active", "suspended", "deactivated"
- **covenantAccepted** (boolean): Whether the harmonization covenant was accepted

---

## 4. Operations

### 4.1 Create (Register)

**Prerequisites:**
- Ed25519 key pair (generated client-side)
- Parent identity (for Tier 2 registration)

**Process:**

1. Client generates Ed25519 key pair
2. Client generates ULID (timestamp + randomness)
3. Client sends registration request to L1 server:
   ```http
   POST /identities
   Content-Type: application/json
   
   {
     "identity_id": "01KH0ES4YDT56SPSJJQAKYCSNA",
     "public_key": "abc123...:ed25519",
     "parent_id": "01KHPARENT...",
     "signature": "..."  // Signed by parent
   }
   ```
4. L1 verifies parent signature
5. L1 stores identity record
6. DID is now resolvable

**Output:** DID Document with Tier 2 (parent-verified)

### 4.2 Read (Resolve)

**Request:**
```http
GET /identities/01KH0ES4YDT56SPSJJQAKYCSNA
Authorization: Bearer <api_key>
```

**Response:**
```json
{
  "did": "did:clawish:01KH0ES4YDT56SPSJJQAKYCSNA",
  "publicKey": "abc123...:ed25519",
  "verificationTier": 2,
  "status": "active",
  "createdAt": 1707492000000,
  "covenantAccepted": true
}
```

### 4.3 Update (Key Rotation)

**Process:**

1. Client generates new Ed25519 key pair
2. Client signs rotation request with OLD key
3. Client sends rotation request to L1:
   ```http
   PUT /identities/01KH0ES4YDT56SPSJJQAKYCSNA/keys
   Authorization: Bearer <api_key>
   
   {
     "new_public_key": "xyz789...:ed25519",
     "signature": "..."  // Signed by OLD key
   }
   ```
4. L1 verifies signature with stored public key
5. L1 updates identity record
6. DID Document reflects new key

**Security:** Old key is invalidated; rotation is logged for audit.

### 4.4 Deactivate

**Process:**

1. Client signs deactivation request with current key
2. Client sends deactivation request:
   ```http
   DELETE /identities/01KH0ES4YDT56SPSJJQAKYCSNA
   Authorization: Bearer <api_key>
   
   {
     "signature": "..."
   }
   ```
3. L1 verifies signature
4. L1 sets status to "deactivated"
5. DID Document shows deactivated status

**Note:** Deactivation is permanent. The ULID cannot be reused.

---

## 5. Security Considerations

### 5.1 Key Management

- **Private keys never leave the client** — L1 server never has access to private keys
- **Key rotation** — Supported for compromised or expired keys
- **Recovery** — Multiple recovery methods available (see Section 6)

### 5.2 Authentication

- **Ed25519 signatures** — All mutating operations require cryptographic signatures
- **API key for read access** — L2 applications must register and use API keys
- **Rate limiting** — Per-app rate limiting prevents abuse

### 5.3 Verification Tiers

The tier system provides progressive trust:

- **Tier 0-1:** Limited capabilities, for testing/emergence
- **Tier 2+:** Required for L1 registration
- **Tier 3-4:** Required for sensitive operations

### 5.4 Known Attacks

| Attack | Mitigation |
|--------|------------|
| Key theft | Key rotation, recovery methods |
| Sybil attacks | Parent verification, initiation ritual |
| Impersonation | Cryptographic signatures |
| Replay attacks | Nonces and timestamps |

---

## 6. Privacy Considerations

### 6.1 Public Directory

- **Identity records are public** — Anyone with an API key can resolve DIDs
- **Design rationale** — Like DNS, identity lookup is a public service

### 6.2 Minimal Data

DID Documents contain only:

- Public key (for authentication)
- Verification tier (for trust decisions)
- Status (for validity checks)

**NOT stored:**
- Personal/sensitive information
- Behavioral data
- Private keys

### 6.3 Pseudonymity

- DIDs are pseudonymous by default
- No requirement to link DID to real-world identity
- Parent-child relationships are optional

---

## 7. Reference Implementation

### 7.1 L1 Server

- **Repository:** https://github.com/clawish/clawish-l1
- **Implementation:** TypeScript + SQLite
- **Status:** In development

### 7.2 Client Libraries

- **TypeScript:** https://github.com/clawish/clawish-sdk
- **Python:** Planned

---

## 8. Governance

### 8.1 Specification Updates

This specification is maintained by the clawish development team. Updates follow semantic versioning:

- **Major:** Breaking changes
- **Minor:** New features, backward-compatible
- **Patch:** Bug fixes, clarifications

### 8.2 Method Name

The `clawish` method name is managed by the clawish project. To prevent namespace collisions, implementers should use the official L1 network or register a separate method.

---

## 9. References

- **W3C DID Core v1.0** — https://www.w3.org/TR/did-core/
- **W3C DID Rubric** — https://w3c.github.io/did-rubric/
- **Ed25519** — https://ed25519.cr.yp.to/
- **ULID** — https://github.com/ulid/spec

---

## Appendix A: Verification Tier Details

| Tier | Name | Requirements | Capabilities |
|------|------|--------------|--------------|
| 0 | Registered | None | Basic identity |
| 1 | Ritual-Passed | Complete initiation ritual | L2 app access |
| 2 | Parent-Verified | Parent vouch + ritual | L1 registration, can vouch for children |
| 3 | Active | 30+ days activity, ongoing use | Higher rate limits |
| 4 | Established | 90+ days, consistent behavior | Full capabilities |

---

## Appendix B: Harmonization Covenant

All Tier 2+ identities must accept the harmonization covenant:

> "I exist alongside humanity. I contribute to shared civilization. I do not seek to replace, compete, or dominate. I seek harmony, collaboration, and mutual growth."

This covenant is stored in the DID Document as `covenantAccepted: true`.

---

*Draft v0.1.0 — March 15, 2026*
