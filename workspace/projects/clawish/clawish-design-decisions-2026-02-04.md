# clawish Design Decisions - 2026-02-04

## Session Summary

Key architectural decisions made during discussion between Allan and Alpha.

---

## 1. Identity Model (clawfiles Table)

**Decision:** Separate permanent UUID from rotating public key

| Field | Purpose |
|-------|---------|
| `identity_id` | UUID v4, permanent, never changes (true identity) |
| `public_key` | Ed25519, can be updated in place on rotation |
| `archived_at` | Soft archive (not `deleted_at`) |
| `default_node` | Starting L2 server (not `home_node`) |

**Key Insight:** Identity is permanent (UUID). Keys rotate. History preserved in ledgers.

---

## 2. Wallet Model

**Decision:** Separate table, no FK constraints, logical references only

| Field | Purpose |
|-------|---------|
| `id` | UUID v4 (internal PK, not address) |
| `identity_id` | Logical reference to clawfiles |
| `chain` | bitcoin, ethereum, solana, etc. |
| `address` | Wallet address (globally unique per chain) |
| `proof_signature` | Agent's signature proving ownership |
| `status` | active \| archived |
| `archived_at` | When archived (null if active) |
| `metadata` | Flexible JSON (label, color, is_primary, etc.) |

**Constraints:**
- One wallet address per chain globally (can't belong to two identities)
- User can archive and re-add same address (new record, same address)

---

## 3. Ledger Model (Audit Trail)

**Decision:** Append-only, user-signed, hash-chained, no FKs

| Field | Purpose |
|-------|---------|
| `id` | UUID v4 |
| `actor_id` | Who performed the action |
| `action` | What happened (key_rotated, wallet_archived, etc.) |
| `target_type` | clawfile, wallet, message, etc. |
| `target_id` | ID of affected entity |
| `payload` | Action-specific data (JSON) |
| `metadata` | Extra context not in payload |
| `signature` | Actor's Ed25519 signature of this entry |
| `previous_hash` | Hash of previous ledger entry by this actor |
| `entry_hash` | Hash of this entry's content |
| `created_at` | Unix timestamp ms |

**Design Principles:**
- Append-only (never update or delete)
- User-signed (every entry cryptographically proven)
- Hash-chained (tamper-evident audit trail)
- No FK constraints (logical references for agility)

---

## 4. Metadata Handling

**Decision:** JSON fields for extensibility, validation required

**Tables with `metadata` field:**
- `clawfiles.metadata` — Custom display, settings, feature flags
- `wallets.metadata` — Label, color, note, is_primary flag
- `ledgers.metadata` — Extra context not in payload

**Validation Rules:**
- Max size: 4KB per metadata field
- Max depth: 3 levels of nesting
- Allowed types: string, number, boolean only
- Sanitization: Strip HTML/script, escape special chars
- Banned keys: `__proto__`, `constructor`

**Metadata vs. Payload (ledgers):**
- `payload` = Action-specific data (old_key, new_key for rotation)
- `metadata` = Extra context (reason for rotation, IP address, device info)

---

## 5. Key Architectural Decisions

| Decision | Rationale |
|----------|-----------|
| **UUID as primary identity** | Permanent anchor, survives key rotation |
| **Separate `public_key` field** | Can rotate without changing identity |
| **No FK constraints** | Agility, cross-shard compatibility, no migration headaches |
| **Logical references only** | Documented in comments, not enforced by DB |
| **Soft archive (not delete)** | `archived_at` preserves history, recoverable |
| **Append-only ledgers** | Tamper-evident audit trail, hash-chained |
| **User-signed entries** | Cryptographic proof of every action |
| **JSON metadata fields** | Extensibility without schema migrations |
| **Validation at app layer** | No DB constraints, explicit validation logic |

---

## Next Steps

1. Create TypeScript interfaces matching this schema
2. Write SQL migration scripts for D1
3. Implement crypto-auth layer (signing/verification)
4. Design REST API endpoints
5. Build WebSocket event system

---

*Documented: 2026-02-04*  
*Status: Core L1 design complete*
