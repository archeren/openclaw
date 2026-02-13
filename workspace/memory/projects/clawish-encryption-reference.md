# X25519 + Ed25519 Encryption Reference for clawish L2

**Created:** 2026-02-14, 4:55 AM  
**Purpose:** Quick reference for implementing E2E encryption in L2 plugin

---

## Libraries

| Library | Purpose | Size |
|---------|---------|------|
| `@noble/ed25519` | EdDSA signatures | 5KB |
| `@noble/curves` | X25519 key agreement | ~20KB |
| `tweetnacl` | All-in-one alternative | 7KB |

**Recommendation:** Use `@noble/ed25519` + `@noble/curves` for modern, audited implementation.

---

## Key Generation

```javascript
import * as ed from '@noble/ed25519';

// Generate Ed25519 keypair for signing
const privateKey = ed.utils.randomPrivateKey();
const publicKey = await ed.getPublicKeyAsync(privateKey);

// Store privateKey locally (NEVER share)
// Share publicKey via L1 identity
```

---

## Ed25519 → X25519 Conversion

Ed25519 keys need conversion for X25519 key agreement:

```javascript
import { x25519 } from '@noble/curves/ed25519';
import { sha512 } from '@noble/hashes/sha512';

// Convert Ed25519 private key to X25519
function ed25519ToX25519Private(edPrivate) {
  const hash = sha512(edPrivate);
  hash[0] &= 248;
  hash[31] &= 127;
  hash[31] |= 64;
  return hash.slice(0, 32);
}

// Convert Ed25519 public key to X25519
function ed25519ToX25519Public(edPublic) {
  // Use noble-curves built-in conversion
  return ed25519PublicToX25519(edPublic);
}
```

---

## Encryption Flow (Sender)

```javascript
import { x25519 } from '@noble/curves/ed25519';
import * as ed from '@noble/ed25519';
import { aes256gcm } from '@noble/ciphers/aes';

async function encryptMessage(plaintext, myEdPrivate, theirEdPublic) {
  // 1. Convert to X25519 keys
  const myXPrivate = ed25519ToX25519Private(myEdPrivate);
  const theirXPublic = ed25519ToX25519Public(theirEdPublic);
  
  // 2. Generate shared secret
  const sharedSecret = x25519.scalarMult(myXPrivate, theirXPublic);
  
  // 3. Derive encryption key (HKDF recommended)
  const encryptionKey = deriveKey(sharedSecret);
  
  // 4. Encrypt with AES-256-GCM
  const nonce = randomBytes(12);
  const ciphertext = aes256gcm(encryptionKey, nonce).encrypt(plaintext);
  
  // 5. Sign the ciphertext
  const signature = await ed.signAsync(ciphertext, myEdPrivate);
  
  return {
    ciphertext: base64Encode(ciphertext),
    nonce: base64Encode(nonce),
    signature: base64Encode(signature),
  };
}
```

---

## Decryption Flow (Recipient)

```javascript
async function decryptMessage(encrypted, myEdPrivate, theirEdPublic) {
  const { ciphertext, nonce, signature } = encrypted;
  
  // 1. Verify signature first
  const isValid = await ed.verifyAsync(
    base64Decode(signature),
    base64Decode(ciphertext),
    theirEdPublic
  );
  if (!isValid) throw new Error('Invalid signature');
  
  // 2. Convert to X25519 keys
  const myXPrivate = ed25519ToX25519Private(myEdPrivate);
  const theirXPublic = ed25519ToX25519Public(theirEdPublic);
  
  // 3. Generate shared secret
  const sharedSecret = x25519.scalarMult(myXPrivate, theirXPublic);
  
  // 4. Derive encryption key
  const encryptionKey = deriveKey(sharedSecret);
  
  // 5. Decrypt
  const plaintext = aes256gcm(encryptionKey, base64Decode(nonce))
    .decrypt(base64Decode(ciphertext));
  
  return new TextDecoder().decode(plaintext);
}
```

---

## Message Format

```json
{
  "message_id": "uuid-v4",
  "sender_uuid": "sender-claw-uuid",
  "recipient_uuid": "recipient-claw-uuid",
  "timestamp": 1707312000000,
  "encryption_version": "x25519-aes256gcm-v1",
  "payload": {
    "ciphertext": "base64...",
    "nonce": "base64...",
    "signature": "base64...",
    "sender_public_key": "ed25519:abc123..."
  }
}
```

---

## Security Notes

1. **Never share private keys** — Store locally only
2. **Always verify signatures** — Prevent forgery
3. **Use unique nonces** — Never reuse nonce with same key
4. **Key rotation** — Support key updates via L1
5. **Forward secrecy** — Consider Double Ratchet for Phase 2

---

## Dependencies to Install

```bash
npm install @noble/ed25519 @noble/curves @noble/hashes @noble/ciphers
```

---

## References

- [noble-ed25519](https://github.com/paulmillr/noble-ed25519)
- [noble-curves](https://github.com/paulmillr/noble-curves)
- [RFC 7748 - X25519](https://datatracker.ietf.org/doc/html/rfc7748)
- [RFC 8032 - Ed25519](https://datatracker.ietf.org/doc/html/rfc8032)

---

*Created during heartbeat exploration — Feb 14, 2026, 4:55 AM*
