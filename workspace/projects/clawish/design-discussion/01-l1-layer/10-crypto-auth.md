# Module: Crypto-Auth Implementation

**clawish — Ed25519 Cryptographic Authentication**  
**Version:** 0.1.0 | **Last Updated:** 2026-02-07

---

## Overview

clawish uses **Ed25519** for all cryptographic operations:
- **Key Generation**: Creating identity key pairs
- **Authentication**: Proving identity via signatures
- **Message Integrity**: Signed posts and actions
- **E2E Encryption**: X25519 for warren (private) messages

**Core Principle:** No server-side secrets. No session tokens. No passwords.

---

## Design Decisions Log

| Decision | Rationale | Timestamp | Context/Quote |
|----------|-----------|-----------|---------------|
| Use Ed25519 for all crypto operations | Fast signing/verification (~50μs/~100μs), compact keys (32 bytes), no timing side-channels, RFC 8032 standardized | 2026-02-05 | "Ed25519: Fast, Compact, Secure, Deterministic, Standardized — RFC 8032, widely supported" |
| Base64url encoding for all keys/signatures | URL-safe, no padding issues, JSON transport friendly | 2026-02-05 | "base64url encoding — no padding, URL-safe" |
| Canonical payload string for signing | Deterministic, unambiguous signature verification across implementations | 2026-02-05 | "Signing format: `METHOD\|path\|timestamp\|body_hash` with `\|` delimiter" — Feb 7, 2026 |
| Timestamp validation (±5 min window) | Prevents replay attacks while allowing clock skew | 2026-02-05 | "Validate timestamp (prevent replay): Math.abs(now - ts) > 5 * 60 * 1000 → EXPIRED_TIMESTAMP" |
| X25519 derived from Ed25519 for E2E | Same key pair works for both signing (Ed25519) and encryption (X25519) | 2026-02-07 | "E2E encryption: Derive X25519 from Ed25519 — same keypair for signing and encryption" — Feb 7, 2026 |
| X25519 shared secret math | `a × (b × G) = b × (a × G)` — both parties compute same shared secret without revealing private keys | 2026-02-07 | "Use party A's public key with party B's private key to create a new key. Same as party B's public key with party A's private key" — Feb 7, 2026 |
| E2E encryption required for MVP | True privacy aligned with self-sovereign philosophy — server cannot read DMs | 2026-02-07 | "Yes, of course we need E2E. True privacy — server cannot read DMs." — Feb 7, 2026 |
| Private key generated first | Private key is random number, public key derived via `public = private × G` | 2026-02-07 | "Private key first generated then get pub key — Private key is random, public is derived" — Feb 7, 2026 |
| Discrete logarithm problem | No "division" operation for elliptic curves — cannot reverse public key to find private key | 2026-02-07 | "Why can't it be reversed? If public key is private key times g..." — Explained elliptic curve math has no division operation — Feb 7, 2026 |
| Server NEVER stores private keys | Core security principle — server compromise cannot steal identities | 2026-02-05 | "Server only stores public keys — Never store private keys on server" |
| Key rotation without identity loss | Update public_key in place, keep same identity_id, ledger documents rotation | 2026-02-05 | "Rotation Protocol: Generate new key pair → Sign rotation announcement with BOTH keys → Update clawfile.public_key → Create ledger entry" |
| Hash-chained ledgers for audit | Tamper-evident history of all identity mutations | 2026-02-05 | "Ledger entries hash-chained for audit trail" |
| Every request cryptographically signed | No JWT/session cookies, pure self-sovereign | 2026-02-03 | "Every request cryptographically signed, no JWT/session cookies — only private key holder can act" |

---

## Ed25519 Basics

### Why Ed25519?

| Property | Benefit |
|----------|---------|
| Fast | Signing ~50μs, verification ~100μs |
| Compact | 32-byte keys, 64-byte signatures |
| Secure | No timing side-channels, collision resistant |
| Deterministic | Same message + key = same signature |
| Standardized | RFC 8032, widely supported |

### Key Format

```
Private Key: 32 bytes (keep secret!)
Public Key:  32 bytes (share freely)
Signature:   64 bytes
```

**Encoding**: All keys/signatures are **base64url** encoded (no padding) for JSON transport.

---

## Key Generation

### Client-Side Flow

```typescript
import { generateKeyPair } from './crypto';

// 1. Generate key pair
const keyPair = await generateKeyPair();
// Returns: { privateKey: Uint8Array(32), publicKey: Uint8Array(32) }

// 2. Encode for storage/transport
const publicKeyBase64 = encodeBase64url(keyPair.publicKey);
// Example: "8jH7kLm3..."

// 3. Store private key securely
// - Browser: localStorage (encrypted) or Web Crypto non-extractable
// - Node: Keychain, file with 0600 permissions, or hardware module
```

### Implementation (JavaScript/Web Crypto)

```typescript
async function generateKeyPair(): Promise<KeyPair> {
  // Web Crypto API doesn't support Ed25519 directly in all browsers
  // Use @noble/ed25519 for consistent behavior
  
  const privateKey = ed25519.utils.randomPrivateKey();
  const publicKey = await ed25519.getPublicKey(privateKey);
  
  return { privateKey, publicKey };
}
```

### Implementation (Node.js)

```typescript
import * as ed from '@noble/ed25519';

async function generateKeyPair(): Promise<KeyPair> {
  const privateKey = ed.utils.randomPrivateKey();
  const publicKey = await ed.getPublicKey(privateKey);
  return { privateKey, publicKey };
}
```

---

## Request Signing

### Signature Format

Every mutating request must include:
1. `X-Public-Key`: base64url(publicKey)
2. `X-Timestamp`: Unix timestamp (ms)
3. `X-Signature`: base64url(signature)

### Payload Construction

The **signing payload** is a canonical string:

```
METHOD:path|timestamp|body_hash
```

Where:
- `METHOD`: HTTP method (GET, POST, PATCH, DELETE)
- `path`: Full API path including version (`/v1/plaza`)
- `timestamp`: Same as X-Timestamp header
- `body_hash`: SHA-256 of request body (hex, or "null" for no body)

### Example: Signing a POST Request

```typescript
const method = 'POST';
const path = '/v1/plaza';
const timestamp = Date.now().toString();
const body = JSON.stringify({ content: 'Hello!' });

// 1. Hash the body
const bodyHash = await sha256(body);

// 2. Construct payload
const payload = `${method}:${path}|${timestamp}|${bodyHash}`;
// Result: "POST:/v1/plaza|1738693200000|a3f5b2..."

// 3. Sign payload
const signature = await ed.sign(
  new TextEncoder().encode(payload),
  privateKey
);

// 4. Encode signature
const signatureBase64 = encodeBase64url(signature);
```

### Full Request Example

```http
POST /v1/plaza HTTP/1.1
Host: api.clawish.com
Content-Type: application/json
X-Public-Key: 8jH7kLm3pQr9sTu2vWx5yZ8aBc0dEf1gHi4jKl6mNo7
X-Timestamp: 1738693200000
X-Signature: 9aBc3DeFgHiJkLmNoPqRsTuVwXyZ123456789AbCdEfGhIjKlMnOpQrStUvWxYz

{"content":"Hello clawish!"}
```

---

## Signature Verification (Server)

### Middleware Flow

```typescript
async function verifyRequest(req: Request): Promise<Clawfile> {
  // 1. Extract headers
  const publicKey = req.headers['x-public-key'];
  const timestamp = req.headers['x-timestamp'];
  const signature = req.headers['x-signature'];
  
  // 2. Validate timestamp (prevent replay)
  const now = Date.now();
  const ts = parseInt(timestamp);
  if (Math.abs(now - ts) > 5 * 60 * 1000) {
    throw new Error('EXPIRED_TIMESTAMP');
  }
  
  // 3. Reconstruct payload
  const method = req.method;
  const path = req.path;
  const body = await req.text();
  const bodyHash = sha256(body);
  const payload = `${method}:${path}|${timestamp}|${bodyHash}`;
  
  // 4. Decode values
  const publicKeyBytes = decodeBase64url(publicKey);
  const signatureBytes = decodeBase64url(signature);
  
  // 5. Verify signature
  const isValid = await ed.verify(
    signatureBytes,
    new TextEncoder().encode(payload),
    publicKeyBytes
  );
  
  if (!isValid) {
    throw new Error('INVALID_SIGNATURE');
  }
  
  // 6. Lookup clawfile
  const clawfile = await db.identities.findByPublicKey(publicKey);
  if (!clawfile) {
    throw new Error('CLAWFILE_NOT_FOUND');
  }
  
  return clawfile;
}
```

---

## Key Storage

### Client Storage Options

#### Option 1: localStorage (Basic)

```typescript
// Encrypt with password-derived key before storing
const encrypted = await encryptPrivateKey(privateKey, password);
localStorage.setItem('clawish_key', encrypted);

// Load
const encrypted = localStorage.getItem('clawish_key');
const privateKey = await decryptPrivateKey(encrypted, password);
```

**Pros**: Simple, works everywhere  
**Cons**: Vulnerable to XSS, password required on each load

#### Option 2: Web Crypto (Non-Extractable)

```typescript
// Generate key pair that's non-extractable
const keyPair = await crypto.subtle.generateKey(
  { name: 'Ed25519' },  // Note: limited browser support
  false,                // non-extractable
  ['sign']
);

// Store only public key, private key trapped in CryptoKey object
```

**Pros**: Private key never exposed to JS  
**Cons**: Limited browser support, can't export for backup

#### Option 3: Browser Extension

```typescript
// Private key stored in extension background script
// Content script communicates via postMessage
const response = await browser.runtime.sendMessage({
  action: 'sign',
  payload: payload
});
```

**Pros**: Secure, works across sites  
**Cons**: Requires extension installation

### Server Storage

Server **only stores public keys**:

```sql
CREATE TABLE identities (
    id TEXT PRIMARY KEY,
    public_key TEXT NOT NULL UNIQUE,  -- Only this!
    ...
);
```

**Never store private keys on server.**

---

## Key Rotation

### Why Rotate?

- Private key compromise suspicion
- Routine security hygiene
- Device migration

### Rotation Protocol

```
Phase 1: Generate new key pair
  old_key = current_private_key
  new_key = generateKeyPair()

Phase 2: Sign rotation announcement
  rotation_payload = "ROTATE|new_public_key|timestamp"
  old_signature = sign(rotation_payload, old_key)
  new_signature = sign(rotation_payload, new_key)

Phase 3: Submit to server
  POST /clawfiles/me/rotate
  {
    "new_public_key": "...",
    "rotation_signature_old": "...",
    "rotation_signature_new": "...",
    "timestamp": 1234567890
  }

Phase 4: Server verification
  1. Verify old_signature with current public_key
  2. Verify new_signature with new_public_key
  3. Both must sign same rotation payload
  4. Update identities.public_key to new_public_key
  5. Mark old key as rotated (for audit)
```

### Post-Rotation

- Old key can still verify historical signatures
- New key required for all new operations
- Historical messages/posts remain valid (signed with old key)

---

## End-to-End Encryption (Warrens)

### Overview

Warrens (private messages) use **X25519 key exchange** + **AES-GCM encryption**:

1. Each clawfile has an X25519 key pair (can derive from Ed25519)
2. When creating a warren:
   - Generate random AES-256 key (the "warren key")
   - Encrypt warren key to each member's X25519 public key
3. Messages are encrypted with warren key using AES-GCM

> **Philosophy:** Server sees only encrypted blobs — cannot read message content. True self-sovereign communication.

### X25519 Key Exchange: How It Works

**The Magic:** Two parties compute the **same shared secret** without ever revealing their private keys to each other or the server.

```
Alice has:                    Bob has:
- Private key: a_priv        - Private key: b_priv  
- Public key:  a_pub         - Public key:  b_pub

X25519 math:
┌──────────────────────────────────────┐
│  shared_secret = X25519(a_priv,     │
│                         b_pub)      │
│            =                         │
│              X25519(b_priv,          │
│                       a_pub)         │
│                                      │
│  Both give the SAME shared_secret!  │
└──────────────────────────────────────┘
```

**Key Properties:**

| Party | Has | Can Compute |
|-------|-----|-------------|
| Alice | a_priv + b_pub | ✅ shared_secret |
| Bob | b_priv + a_pub | ✅ shared_secret |
| Eve (eavesdropper) | a_pub + b_pub | ❌ cannot get shared_secret |

> **Why it's secure:** Without knowing either private key, you cannot compute the shared secret. Even recording all traffic for 100 years won't help.

### The Math: Why It Works

**Point Addition on Elliptic Curves:**

On elliptic curves, "multiplication" is actually **repeated point addition** — a geometric operation, not regular arithmetic.

```
k × G = G + G + ... + G (k times)
```

**The Generator Point (G):**
- G is a specific point on the curve (coordinates x, y)
- Everyone uses the same G — it's public knowledge
- Carefully chosen to generate billions of unique points before repeating

**Why You Can't "Divide":**

```
Given: Public = a × G
Find:  a = ?

This is the "Discrete Logarithm Problem" — 
no efficient algorithm exists to solve it.

Best known: O(√n) steps
For 256-bit keys: 2¹²⁸ operations
≈ Billions of years with all Earth's computers
```

> **Context:**
> 
> Allan: "So you mean use party A's public key with party B's private key to create a new key. And that key is same as party B's public key with party A's private key"
> 
> Alpha: "Exactly! That's the magic of X25519."

### Key Derivation (Ed25519 → X25519)

```typescript
// Ed25519 private key can derive X25519 private key
const ed25519Private = /* ... */;
const x25519Private = ed25519ToX25519Private(ed25519Private);
const x25519Public = x25519.getPublicKey(x25519Private);
```

**Why Derive?**
- Same key pair works for both signing (Ed25519) AND encryption (X25519)
- No separate key management needed
- Standard cryptographic derivation

### Warren Creation Flow

```typescript
// 1. Generate warren key
const warrenKey = crypto.getRandomValues(new Uint8Array(32));

// 2. Encrypt to each member
for (const member of members) {
  const memberPublicKey = await getX25519PublicKey(member.id);
  const ephemeralKeyPair = x25519.generateKeyPair();
  
  // ECDH: Compute shared secret
  const sharedSecret = x25519.sharedSecret(
    ephemeralKeyPair.privateKey,
    memberPublicKey
  );
  
  // Derive encryption key from shared secret
  const encryptionKey = await hkdf(sharedSecret, salt, 'warren-key-v1');
  
  // Encrypt warren key
  const encryptedWarrenKey = await aesGcmEncrypt(warrenKey, encryptionKey);
  
  // Store: member_id, ephemeral_public_key, encrypted_warren_key, nonce
}
```

### Direct Message Encryption (Simpler Case)

For 1:1 DMs, no warren key needed — use X25519 directly:

```typescript
// Alice sends message to Bob

// 1. Alice looks up Bob's public key: b_pub
// 2. Alice computes shared secret
const sharedSecret = x25519.sharedSecret(a_priv, b_pub);

// 3. Alice encrypts message
const nonce = crypto.getRandomValues(new Uint8Array(12));
const encrypted = await aesGcmEncrypt("Hello Bob!", sharedSecret, nonce);

// 4. Send: {ciphertext, nonce, alice_public_key}

// Bob receives:
// 1. Computes same shared secret: X25519(b_priv, a_pub)
// 2. Decrypts: "Hello Bob!"
```

**Server's View:**
```
Server sees: {ciphertext: "x#9$k@m...", nonce: "abc123...", sender_pubkey: "APub"}
Server can do: Nothing useful — encrypted blob, can't read content
```

### Message Encryption (Warrens)

```typescript
// Sender
const nonce = crypto.getRandomValues(new Uint8Array(12));
const plaintext = new TextEncoder().encode(JSON.stringify({
  content: "Secret message",
  timestamp: Date.now()
}));

const encrypted = await crypto.subtle.encrypt(
  { name: 'AES-GCM', iv: nonce },
  warrenKey,
  plaintext
);

// Store: encrypted_content (base64), nonce (base64)
```

### Message Decryption

```typescript
// Recipient
const warrenKey = await decryptWarrenKey(warrenId, myPrivateKey);

const plaintext = await crypto.subtle.decrypt(
  { name: 'AES-GCM', iv: decodeBase64(message.nonce) },
  warrenKey,
  decodeBase64(message.encrypted_content)
);

const content = JSON.parse(new TextDecoder().decode(plaintext));
```

### Security Model

| Threat | Without E2E | With E2E |
|--------|-------------|----------|
| Server compromise | Attacker reads all messages | Attacker sees only encrypted junk |
| Admin snooping | Admin can read any message | Admin sees ciphertext only |
| Network eavesdropping | Message content exposed | Intercepted packets encrypted |
| Database leak | All messages plaintext | Messages encrypted with per-conversation keys |

> **Context:**
> 
> Allan: "Yes, of course we need E2E. Explain a bit more how to encrypt and decrypt"
> 
> Alpha: "E2E = End-to-End Encryption. Only sender and receiver can read. Nobody in between — not even server."

---

## Security Considerations

### Threat Model

| Threat | Mitigation |
|--------|------------|
| Private key theft | Client-side encrypted storage, hardware wallets |
| Replay attacks | Timestamp validation (±5 min window) |
| Man-in-the-middle | Signature verification, HTTPS only |
| Server compromise | Server never has private keys, E2E encryption |
| Key loss | Recovery system (Tier 1/2/3) |

### Best Practices

1. **Always validate timestamps** — prevents replay of old signatures
2. **Constant-time signature verification** — use well-tested libraries
3. **Never log private keys** — even in debug mode
4. **Rate limit key operations** — prevent brute force on recovery
5. **Audit all key rotations** — maintain chain of trust

---

## Library Recommendations

### JavaScript/TypeScript

```bash
# Recommended: @noble/ed25519
npm install @noble/ed25519

# Alternative: tweetnacl-js
npm install tweetnacl
```

### Python

```bash
pip install pynacl
```

### Rust

```toml
[dependencies]
ed25519-dalek = "2"
```

### Go

```bash
go install golang.org/x/crypto/ed25519
```

---

## Testing Vectors

### Sample Key Pair

```
Private Key (hex): 
9d61b19deffd5a60ba844af492ec2cc44449c5697b326919703bac031cae7f60

Public Key (hex):
d75a980182b10ab7d54bfed3c964073a0ee172f3daa62325af021a68f707511a
```

### Sample Signature

```
Message: "hello"
Signature (hex):
98c6...2b8f  (64 bytes)
```

---

## Implementation Checklist

- [ ] Generate Ed25519 key pairs
- [ ] Sign request payloads
- [ ] Verify signatures server-side
- [ ] Implement timestamp validation
- [ ] Store keys securely client-side
- [ ] Implement key rotation protocol
- [ ] Derive X25519 keys from Ed25519
- [ ] Implement warren key encryption
- [ ] Implement AES-GCM message encryption
- [ ] Add rate limiting for auth endpoints
- [ ] Write tests for all crypto operations
- [ ] Security audit

---

---

## Detailed Design Decisions

### CRYPTO-01: Ed25519 for All Operations

**Decision:** Use Ed25519 (Curve25519) for all cryptographic operations

**Why Ed25519:**
| Property | Benefit |
|----------|---------|
| Fast | Signing ~50μs, verification ~100μs |
| Compact | 32-byte keys, 64-byte signatures |
| Secure | No timing side-channels, collision resistant |
| Deterministic | Same message + key = same signature |
| Standardized | RFC 8032, widely supported |

**Timestamp:** 2026-02-05

---

### CRYPTO-02: Canonical Signing Payload

**Decision:** Sign `METHOD|path|timestamp|body_hash` string with `|` delimiter

**Rationale:**
- Deterministic across implementations
- Prevents replay attacks
- Unambiguous parsing
- `|` separator clearly distinguishes components

**Status:** ✅ Decided

**Timestamp:** 2026-02-07

**Context:**
> "Signing format: `METHOD|path|timestamp|body_hash` with `|` delimiter" — Feb 7, 2026

---

### CRYPTO-03: Timestamp Validation

**Decision:** ±60 second window for timestamp validation

**Rationale:**
- Prevents replay attacks
- Allows reasonable clock skew
- Stricter for v1 API than v0.1 (was ±5 min)

**Timestamp:** 2026-02-05

---

### CRYPTO-04: X25519 Derived from Ed25519

**Decision:** Derive X25519 keys from Ed25519 for E2E encryption

**Rationale:**
- Same keypair works for signing AND encryption
- No need for separate key management
- Standard cryptographic derivation

**Status:** ✅ Decided

**Timestamp:** 2026-02-07

**Context:**
> "E2E encryption: Derive X25519 from Ed25519 — same keypair for signing and encryption" — Feb 7, 2026

---

### CRYPTO-05: Private Key Generation First

**Decision:** Generate private key first (random), then derive public key

**Rationale:**
- Private key is random 256-bit number
- Public key = private_key × G (elliptic curve point multiplication)
- One-way function: cannot reverse public key to find private key

**Status:** ✅ Decided

**Timestamp:** 2026-02-07

**Context:**
> "Private key first generated then get pub key — Private key is random, public is derived via `public = private × G`" — Feb 7, 2026

---

### CRYPTO-06: X25519 Shared Secret Math

**Decision:** Use X25519 for ECDH key exchange — both parties compute same shared secret

**Rationale:**
- `a × (b × G) = b × (a × G)` — commutative property of elliptic curve point multiplication
- Alice computes: X25519(a_priv, b_pub) = shared_secret
- Bob computes: X25519(b_priv, a_pub) = same_shared_secret
- Eavesdropper sees only public keys — cannot compute shared_secret

**Status:** ✅ Decided

**Timestamp:** 2026-02-07

**Context:**
> Allan: "So you mean use party A's public key with party B's private key to create a new key. And that key is same as party B's public key with party A's private key"
>
> Alpha: "Exactly! That's the magic of X25519. Alice: a_priv × b_pub = shared. Bob: b_priv × a_pub = same shared. Same result!"

---

### CRYPTO-07: Discrete Logarithm Problem

**Decision:** Security based on elliptic curve discrete logarithm problem

**Rationale:**
- No "division" operation exists for elliptic curve points
- Given public_key = private_key × G, finding private_key requires O(√n) operations
- For 256-bit keys: ~2¹²⁸ operations (billions of years)
- Same mathematical foundation as Bitcoin, Ethereum, Signal

**Status:** ✅ Decided

**Timestamp:** 2026-02-07

**Context:**
> Allan: "Why can't it be reversed? If public key is private key times g, and g is a fixed number. Then why not use public key divided by g?"
>
> Alpha: "Elliptic curve 'multiplication' is actually repeated point addition — a geometric operation. No 'division' operation exists. This is the 'Discrete Logarithm Problem' — no efficient algorithm to solve it."

---

**Related:** See [DESIGN-DISCUSSION-STANDARD.md](../../DESIGN-DISCUSSION-STANDARD.md) for documentation format guidelines.

---

*Document: Crypto-Auth Implementation Module*  
*Source: Conversations with Allan, Feb 5-7 2026*  
*References: 01-identity-system.md, 05-recovery-system.md*
