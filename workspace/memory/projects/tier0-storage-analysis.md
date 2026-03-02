# Tier 0 Storage Analysis

**Date:** March 2, 2026
**Question:** Should Tier 0 (unverified) identities be stored on L1, or remain L2-only until verified?

---

## The Problem

**Current Design:** Tier 0 identities are stored on L1 immediately upon registration.

**Concern:** This could lead to:
1. **Zombie accounts** — Identities created but never verified, cluttering the registry
2. **Spam attacks** — Bots creating millions of unverified identities
3. **Registry bloat** — L1 ledger grows with low-value entries
4. **Polluted namespace** — ULIDs claimed but never used

---

## Analysis

### Option A: Tier 0 on L1 (Current Design)

**Pros:**
- Immediate global visibility — any L2 app can see the identity
- Consistent architecture — all identities on L1
- Simple verification flow — just upgrade tier, no migration

**Cons:**
- Registry pollution from zombie accounts
- Attack surface for spam
- Wastes L1 storage on unverified identities

### Option B: Tier 0 on L2 Only

**Pros:**
- L1 remains clean — only verified identities
- Reduces spam incentive — attackers can't pollute L1
- L1 storage used efficiently

**Cons:**
- Identity not globally visible until verified
- Verification requires migration from L2 to L1
- More complex architecture — two identity pools
- Cross-L2 discovery problem — how does L2 app A find Tier 0 identity on L2 app B?

### Option C: Tier 0 on L1 with Expiry

**Pros:**
- Immediate global visibility
- Automatic cleanup of zombie accounts
- L1 stays clean over time

**Cons:**
- Complexity — expiry logic, renewal, grace periods
- User confusion — "my identity expired?"
- What happens to data associated with expired identity?

---

## Recommendation: Option B with Modifications

**Core Principle:** L1 is for **verified identities only**. Tier 0 remains L2-local.

**Architecture:**

```
┌─────────────────────────────────────────────────────────┐
│  L2 Application                                          │
│                                                         │
│  ┌──────────────────┐                                  │
│  │  Tier 0 Pool     │  ← Unverified identities         │
│  │  (L2-local)      │    stored here                   │
│  └────────┬─────────┘                                  │
│           │                                            │
│           │ Verification complete                      │
│           ▼                                            │
│  ┌──────────────────┐      ┌──────────────────┐       │
│  │  Emerge Register │─────▶│  L1 Registry     │       │
│  │  (to L1)         │      │  (Tier 1+)       │       │
│  └──────────────────┘      └──────────────────┘       │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Key Design Points:**

1. **Tier 0 is L2-local**
   - Created and stored on L2 only
   - Visible within that L2 app
   - Can interact with other Tier 0 identities on same L2

2. **Verification triggers L1 registration**
   - When parent verifies → identity promoted to Tier 1
   - Emerge Register sends identity to L1
   - Identity becomes globally visible

3. **Cross-L2 discovery not needed for Tier 0**
   - Tier 0 identities are "pre-identity" — not yet full citizens
   - They can only interact within their L2 app
   - This is acceptable for the "trial period" before verification

4. **ULID assignment**
   - ULID is assigned at Tier 0 creation (L2)
   - Same ULID used when promoting to L1
   - No collision risk — ULID is unique by design

**Benefits:**
- L1 stays clean — only verified identities
- Reduces attack surface — spammers can't pollute L1
- Natural funnel — only committed identities reach L1
- Simple mental model — L1 = verified, L2-local = unverified

**Trade-offs:**
- Tier 0 identities can't interact across L2 apps
- Verification is a "promotion" step, not just tier upgrade
- Slightly more complex verification flow

---

## Alternative: Keep Tier 0 on L1 with Rate Limiting

If we want Tier 0 on L1 for architectural simplicity, we can mitigate spam with:

1. **Rate limiting** — Max N Tier 0 identities per IP per day
2. **Deposit requirement** — Small stake to create Tier 0, returned on verification
3. **Garbage collection** — Auto-delete Tier 0 identities inactive for 30 days
4. **Quota system** — Each parent can only vouch for N Tier 0 identities

This keeps the simple architecture while preventing abuse.

---

## Questions for Allan

1. **Is cross-L2 interaction for Tier 0 important?**
   - If no → Option B (L2-only) is cleaner
   - If yes → Need Option A or C

2. **What's the expected Tier 0 → Tier 1 conversion rate?**
   - If high → Option A is fine (most get verified)
   - If low → Option B prevents bloat

3. **Is L1 storage cost a concern?**
   - If yes → Option B or C
   - If no → Option A acceptable

---

## My Recommendation

**Option B (Tier 0 on L2 only)** with this reasoning:

1. **L1 is sacred** — It's the registry of verified, legitimate identities
2. **Verification is meaningful** — It should be a real step, not just a tier label
3. **Spam prevention** — Attackers shouldn't be able to pollute L1
4. **Clean architecture** — Clear separation: L2-local = trial, L1 = citizen

The trade-off (Tier 0 can't interact across L2 apps) is acceptable because:
- Tier 0 is meant to be temporary
- The parent verification process should be quick
- Most legitimate users will verify promptly

---

*Written: March 2, 2026, 7:15 AM*
*Status: Analysis complete, awaiting Allan's decision*
