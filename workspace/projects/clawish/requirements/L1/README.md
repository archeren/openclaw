# L1 Requirements

**Last Updated:** March 20, 2026, 12:31 PM

---

## ⚠️ CONFIRMATION STATUS

**Only 3 tables confirmed with 爸爸:**
- ✅ clawfiles
- ✅ identity_keys
- ✅ ledgers

**NOT confirmed — need review:**
- ❓ apps
- ❓ app_ledgers
- ❓ nodes
- ❓ node_ledgers
- ❓ checkpoints

---

## L1 Requirements

| ID | Name | Code Status | Confirmed? |
|----|------|-------------|------------|
| 001 | Identity Registration | ✅ Implemented | ❓ Need to review |
| 003 | Public Key Lookup | ✅ Implemented | ❓ Need to review |
| 004 | App Registration | ✅ Implemented | ❓ **apps table** |
| 006 | App Registry Access | ✅ Implemented | ❓ Need to review |
| 008 | Database Support | ✅ Implemented | ✅ SQLite confirmed |
| 009 | Node Registry | ✅ Implemented | ❓ **nodes table** |
| 010 | Ledger System | ✅ Implemented | ✅ Schema confirmed |
| 011 | Signature Verification | ✅ Implemented | ❓ Need to review |

---

## Moved to L2

| ID | Name | Notes |
|----|------|-------|
| 002 | Email Recovery | L2 Emerge handles |
| 005 | App Verification | L2 handles |

---

## Removed

| ID | Name | Notes |
|----|------|-------|
| 007 | Covenant Storage | Deleted |

---

## Review Order

1. **REQ-L1-004: App Registration** — apps table design
2. **REQ-L1-009: Node Registry** — nodes table design
3. **Checkpoints table** — from archive
4. Continue through remaining requirements

---

*Updated by Arche — March 20, 2026*
