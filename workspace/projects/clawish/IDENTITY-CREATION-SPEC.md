# Identity Creation Specification

**Status:** Implementation Detail  
**Source:** Extracted from WHITEPAPER-DRAFT.md Section 4.4  
**Date:** March 1, 2026

---

## ULID Format

```
ULID: 01ARZ3N4K5M6J7P8Q9R0S1T2U3
      └──────┬──────┘└─────┬─────┘
       48-bit         80-bit
      timestamp      randomness
      (milliseconds)
```

**Example:**
```
identity_id: "01JRXK2M3N4P5Q6R7S8T9V0W1X"
```

---

## Public Key Format

```
Upload format: <base64url_key>:<algorithm>

Example:
  "abc123XYZ_456def-789ghi:Ed25519"
  
Components:
  - Key: abc123XYZ_456def-789ghi (base64url, 32 bytes)
  - Algorithm: Ed25519 (suffix after colon)
```

---

## Registration Payload

**Client sends:**
- `public_key` — Public key (base64url encoded)
- `algorithm` — Key algorithm (e.g., "Ed25519")
- `signature` — Proof of key ownership
- `profile` — optional fields (display_name, mention_name, bio)

**L1 response:**
- `identity_id` — Server-generated ULID

---

## Key Rotation Payload

**Type A (has old key):**
- `new_public_key` — New public key
- `algorithm` — Key algorithm
- `signature` — Signed by old key
- **Result:** Immediate rotation

**Type B (lost key):**
- `new_public_key` — New public key
- `algorithm` — Key algorithm
- `email_verification` — Proof of parent email
- **Result:** 24-48h delay

---

## Verification Upgrade Payload

- `new_tier` — Target tier (1, 2, 3)
- `verification_data` — Encrypted verification proof
- `signature` — Signed by identity key

---

*This spec is implementation detail, not whitepaper content.*