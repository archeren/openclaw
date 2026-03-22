# Clawish Tasklist

**Last Updated:** March 20, 2026, 12:31 PM

---

## ⚠️ REQUIREMENTS REVIEW STATUS

**Only 3 tables confirmed with 爸爸:**
- ✅ clawfiles (6 fields)
- ✅ identity_keys (5 fields)
- ✅ ledgers (5 fields)

**NOT confirmed — need to review one by one:**
- ❓ apps table
- ❓ app_ledgers table
- ❓ nodes table
- ❓ node_ledgers table
- ❓ checkpoints table

---

## Current Focus: Requirements Review

**Going through each requirement with 爸爸:**

### L1 Requirements to Review

| # | Name | Status | Need to Discuss |
|---|------|--------|-----------------|
| 001 | Identity Registration | Code exists | Endpoints, flow |
| 003 | Public Key Lookup | Code exists | Query fields |
| 004 | App Registration | Code exists | **apps table design** |
| 006 | App Registry Access | Code exists | Auth model |
| 008 | Database Support | ✅ SQLite confirmed | D1 adapter |
| 009 | Node Registry | Code exists | **nodes table design** |
| 010 | Ledger System | ✅ Schema confirmed | Implementation |
| 011 | Signature Verification | Code exists | Which endpoints |

### Moved to L2 (confirmed)
- 002: Email Recovery → L2
- 005: App Verification → L2

### Removed (confirmed)
- 007: Covenant Storage — deleted

---

## L2 Requirements

| # | Name | Status |
|---|------|--------|
| email-recovery | Draft | Need to design |
| app-verification | Draft | Need to design |

---

## Design Discussion Files

### L1 Layer (need review)

| File | Status | Need to Discuss |
|------|--------|-----------------|
| 01-overview.md | Exists | Review |
| 02-identity.md | ✅ Cleaned | Done |
| 04-node-management.md | Exists | **Review** |
| 05-app-management.md | Exists | **Review** |
| 06-database.md | ✅ Partial | 3 tables confirmed |
| 07-api.md | Exists | Review endpoints |
| 08-multi-node-sync-protocol.md | Exists | **checkpoints table** |
| 09-mcp-emerge-tool.md | Exists | Review |
| 09b-node-discovery.md | Exists | Review |
| 10-crypto-auth.md | Exists | Review |

### L2 Layer

| File | Status |
|------|--------|
| 01-emerge-app.md | Exists |
| 03-verification-tiers.md | ✅ Moved from L1 |
| Others | Exists |

---

## Next Steps

1. Review REQ-L1-004 (App Registration) with 爸爸
2. Discuss apps table design
3. Review REQ-L1-009 (Node Registry) with 爸爸
4. Discuss nodes table design
5. Review checkpoints table
6. Continue through each requirement

---

*Updated by Arche — March 20, 2026*
