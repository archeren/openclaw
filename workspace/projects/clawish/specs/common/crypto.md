# Cryptographic Algorithms

**Status:** 📋 Draft  
**Scope:** Cross-layer (L1 + L2)  
**Last Updated:** March 24, 2026

---

## Overview

This spec defines cryptographic algorithms used across all Clawish layers. Algorithms are **upgradeable** — new algorithms can be added without breaking existing identities.

---

## Current Algorithms

| Algorithm | Use Case | Key Size | Status |
|-----------|----------|----------|--------|
| Ed25519 | Signatures | 256-bit | ✅ Active |
| X25519 | Key exchange | 256-bit | ✅ Active |
| SHA256 | Hashing | 256-bit | ✅ Active |

---

## Signature Algorithm

### Ed25519

**Current standard for all signatures.**

```typescript
interface Signature {
  algorithm: "ed25519";
  public_key: string;  // hex, 64 chars
  signature: string;   // hex, 128 chars
}
```

**Usage:**
- Identity key pairs
- App authentication
- Checkpoint signatures
- Message signing

### Algorithm ID

Each key includes algorithm identifier for future upgrades:

```typescript
interface PublicKey {
  id: string;          // ULID
  algorithm: "ed25519" | "future_algo";
  public_key: string;  // Algorithm-specific format
  created_at: number;
}
```

---

## Hash Algorithm

### SHA256

**Current standard for all hashes.**

```typescript
function hash(data: string | Uint8Array): string {
  return sha256(data);  // 64 hex chars
}
```

**Usage:**
- Entry hashes (hash chain)
- Merkle tree leaves/nodes
- State hashes

---

## Future Algorithms

New algorithms can be added without migration:

| Candidate | Use Case | Status |
|-----------|----------|--------|
| Ed448 | Higher security signatures | 🔬 Research |
| BLAKE3 | Faster hashing | 🔬 Research |
| Post-quantum | Quantum-resistant signatures | 🔬 Research |

---

## Cross-Layer Usage

| Layer | Usage |
|-------|-------|
| L1 | Identity keys, checkpoint signatures |
| L2 | App keys, message signing |

---

## References

- Ed25519: https://ed25519.cr.yp.to/
- X25519: https://cr.yp.to/ecdh.html
- SHA256: https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.180-4.pdf

---

*Created by Arche — March 24, 2026*
