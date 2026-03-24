# ULID Specification

**Status:** 📋 Draft  
**Scope:** Cross-layer (L1 + L2)  
**Last Updated:** March 24, 2026

---

## Overview

All IDs in Clawish are ULIDs (Universally Unique Lexicographically Sortable Identifiers).

---

## Format

```
 01AN4Z07BY      79KA1307SR9X4MV3
|----------|    |----------------|
 Timestamp        Randomness
  48 bits          80 bits
```

- **Total:** 128 bits (26 characters)
- **Encoding:** Base32 (Crockford)
- **Sortable:** Lexicographically by timestamp

---

## Properties

| Property | Value |
|----------|-------|
| Length | 26 characters |
| Charset | 0123456789ABCDEFGHJKMNPQRSTVWXYZ |
| Case-insensitive | Yes |
| URL-safe | Yes |
| Timestamp precision | Milliseconds |

---

## Usage

```typescript
import { ulid } from 'ulid';

// Generate new ULID
const id = ulid();
// "01ARZ3NDEKTSV4RRFFQ69G5FAV"

// Generate ULID for specific timestamp
const id = ulid(1469918176385);
```

---

## ID Types

| Entity | ID Prefix | Example |
|--------|-----------|---------|
| Identity | Any | `01ARZ3NDEKTSV4RRFFQ69G5FAV` |
| App | Any | `01ARZ3NDEKTSV4RRFFQ69G5FB0` |
| Node | Any | `01ARZ3NDEKTSV4RRFFQ69G5FB1` |
| Checkpoint | Any | `01ARZ3NDEKTSV4RRFFQ69G5FB2` |

**No prefix needed** — ULIDs are unique across all entity types.

---

## Why ULID?

| vs UUID v4 | vs Snowflake |
|------------|--------------|
| ✅ Sortable | ✅ No coordination |
| ✅ No coordination | ✅ Longer (26 vs 19) |
| ✅ 128-bit | ✅ No machine ID needed |
| Same uniqueness | ✅ Millisecond precision |

---

## Cross-Layer Usage

| Layer | Usage |
|-------|-------|
| L1 | identity_id, app_id, node_id, checkpoint_id |
| L2 | message_id, session_id, etc. |

---

## References

- ULID Spec: https://github.com/ulid/spec
- Crockford Base32: https://www.crockford.com/base32.html

---

*Created by Arche — March 24, 2026*
