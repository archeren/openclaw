# L1 Spec Review — Gaps and Updates Needed

**Date:** March 14, 2026
**Purpose:** Identify outdated L1 documentation and required updates before development

---

## Current L1 Documentation

| File | Last Updated | Status |
|------|--------------|--------|
| `01-l1-layer/01-overview.md` | Feb 27 | ⚠️ Needs review |
| `01-l1-layer/02-identity.md` | Feb 5 | ⚠️ Needs update |
| `01-l1-layer/03-verification-tiers.md` | Feb 6 | ❌ Outdated |
| `01-l1-layer/04-node-management.md` | Feb 27 | ⚠️ Needs review |
| `01-l1-layer/05-app-management.md` | Feb 27 | ⚠️ Needs review |
| `01-l1-layer/06-database.md` | Feb 9 | ⚠️ Needs update |
| `01-l1-layer/07-api.md` | Feb 9 | ⚠️ Needs update |
| `04-verification-tiers.md` | Mar 13 | ✅ Current (5-tier system) |

---

## Key Issues Identified

### 1. Verification Tiers Mismatch

**Problem:** `01-l1-layer/03-verification-tiers.md` uses 4-tier system (0-3), but `04-verification-tiers.md` was updated to 5-tier system (0-4) on Mar 13.

**Impact:**
- Database schema uses `verification_tier INTEGER DEFAULT 0` with 4 tiers
- API docs reference 4-tier system
- Whitepaper needs to match

**Required Update:**
- Update `03-verification-tiers.md` to match `04-verification-tiers.md`
- Update database schema comments
- Update API docs

### 2. L1 Registration Threshold

**Problem:** Old docs say Tier 1 (parent vouch) is enough for L1. New decision: Tier 2 (ritual + parent) required.

**Impact:**
- Registration flow in whitepaper 5.4 Emerge
- API endpoint logic
- Database tier validation

**Required Update:**
- Update identity registration flow
- Add ritual verification step
- Update tier progression logic

### 3. Initiation Ritual Missing from L1 Docs

**Problem:** `01-l1-layer/` docs don't mention the initiation ritual (emergence test).

**Impact:**
- No API endpoint for ritual verification
- No database field for ritual status
- No documentation of ritual flow

**Required Update:**
- Add ritual verification to identity flow
- Add `ritual_passed_at` field to clawfiles table
- Add ritual verification endpoint

### 4. Database Schema Updates Needed

**Current schema (06-database.md):**
```sql
verification_tier INTEGER DEFAULT 0,  -- 0=unverified, 1=parent-vouched, 2=activity-based, 3=established
```

**Should be:**
```sql
verification_tier INTEGER DEFAULT 0,  -- 0=registered, 1=ritual-passed, 2=parent-verified, 3=active, 4=established
ritual_passed_at INTEGER,             -- When initiation ritual was passed (Tier 1)
parent_verified_at INTEGER,           -- When parent verified (Tier 2)
```

### 5. API Endpoints Missing

**Missing endpoints:**
- `POST /identities/{id}/verify-ritual` — Verify initiation ritual completion
- `POST /identities/{id}/verify-parent` — Parent verification endpoint
- Tier progression endpoints

### 6. Whitepaper Alignment

**Whitepaper 5.4 Emerge** mentions:
- Registration → Initiation → Verification

**L1 docs need to match:**
- Registration = Tier 0
- Initiation = Tier 1 (ritual)
- Verification = Tier 2 (parent)

---

## Recommended Update Order

1. ~~**Update `03-verification-tiers.md`** — Sync with `04-verification-tiers.md`~~ ✅ Done (Mar 14, 8:00 AM)
2. **Update `06-database.md`** — Add new fields, update comments
3. **Update `07-api.md`** — Add ritual/parent verification endpoints
4. **Update `02-identity.md`** — Add ritual to identity flow
5. **Update `01-overview.md`** — Reflect 5-tier system

---

## Questions for Allan

1. **Ritual verification storage:** Should ritual results be stored on L1 or just a boolean `ritual_passed_at`?
2. **Parent verification API:** Should parent verification be a separate endpoint or part of identity update?
3. **Tier progression automation:** Should tier progression be automatic (based on activity) or require API calls?

---

## Next Steps

1. Wait for Allan's input on questions
2. Update L1 documentation systematically
3. Ensure whitepaper and L1 docs are aligned
4. Create requirements traceability matrix

---

*Created: March 14, 2026, 7:30 AM*
