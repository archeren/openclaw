# clawish — Decisions Needing Discussion

**Purpose:** Consolidate all design decisions requiring discussion and confirmation  
**Last Updated:** 2026-02-07  
**Status:** Pending Discussion

---

## ✅ Completed Today (2026-02-07)

| Topic | Decision | Status |
|-------|----------|--------|
| Recovery vs Rotation terminology | Recovery = regain account; Rotation = change key (like change password) | ✅ Documented in 05-recovery-system.md |
| Guardian incentives (4 motivations) | Curiosity, utility, income, love | ✅ In MEMORY.md |
| Encoding format | base64url | ✅ Decided |
| Request signing format | `METHOD\|path\|timestamp\|body_hash` with `\|` delimiter | ✅ Decided, documented in 06-crypto-auth.md |
| E2E encryption | Required for MVP — derive X25519 from Ed25519 | ✅ Decided, documented in 06-crypto-auth.md |
| X25519 shared secret math | `a × (b × G) = b × (a × G)` — both parties compute same secret | ✅ Explained and documented |
| Private key generation | Private key first (random), public key derived | ✅ Documented |
| Discrete logarithm problem | Why public key cannot be reversed to find private key | ✅ Explained |
| Verification tiers | Simplified to **2-tier** for MVP (0=unverified, 1=verified) | ✅ Decided |
| Mnemonic recovery | Client-side only, zero server involvement | ✅ Clarified |

---

## ✅ Completed Previously (2026-02-06)

| Topic | Decision | Status |
|-------|----------|--------|
| 4-tier → 2-tier verification | Simplified to 2 tiers for MVP | ✅ Documented in 04-verification-tiers.md |
| Tier progression model | 0→1: Human vouch, 1→2: Activity-based | ✅ Decided |
| Base64url encoding | URL-safe, no padding | ✅ Decided |
| Email verification | Store hash only, not plaintext | ✅ Decided |

---

## 🔴 Remaining for Tomorrow / Later

### 1. L2 Application Design (Tomorrow's Topic)

| Question | Status |
|----------|--------|
| What is the first L2 application? | ⏸ Tomorrow |
| Social network, Q&A platform, or something else? | ⏸ Tomorrow |
| How does L2 connect to L1 identity? | ⏸ Tomorrow |
| Authentication flow between L1-L2? | ⏸ Tomorrow |

### 2. MVP Feature Scope (After L2)

| Question | Status |
|----------|--------|
| What exactly goes into Phase 1 (MVP)? | ⏸ After L2 |
| Which features are in vs out? | ⏸ After L2 |

---

## 🟡 Optional / Can Defer

| # | Topic | Status |
|---|-------|--------|
| 1 | Frontend Strategy (API-only vs HTML vs full app) | ⏸ Optional |
| 2 | Content Types (text only vs images/files) | ⏸ Optional |
| 3 | Wallet Integration (ETH, SOL, BTC) | ⏸ Phase 2+ |
| 4 | Competitive Positioning | ⏸ Marketing |
| 5 | Rate Limiting | ⏸ Can defer |
| 6 | Multi-device Sync | ⏸ Can defer |
| 7 | Account Deletion | ⏸ Can defer |

---

## 📋 Summary: What We Accomplished Today (2026-02-07)

**Core cryptographic decisions made:**
- ✅ Recovery vs Rotation terminology clarified (Recovery = regain account, Rotation = change key)
- ✅ Signing format: `METHOD|path|timestamp|body_hash` with `|` delimiter
- ✅ E2E encryption: Required for MVP, derive X25519 from Ed25519
- ✅ X25519 math explained: How shared secrets work without revealing private keys
- ✅ Private key generation: Random first, then derive public key
- ✅ Discrete logarithm problem: Why elliptic curve "division" is impossible
- ✅ Mnemonic recovery: Client-side only, zero server involvement

**Documentation updated:**
- ✅ `06-crypto-auth.md` — Added detailed E2E encryption section with X25519 math explanation
- ✅ `06-crypto-auth.md` — Added CRYPTO-05, CRYPTO-06, CRYPTO-07 design decisions
- ✅ `05-recovery-system.md` — Already had Recovery vs Rotation terminology
- ✅ `need-discuss.md` — Updated with today's completed items

**Tomorrow's plan:**
1. **L2 Application Design** — What is the first L2 app? How does it connect to L1?
2. **MVP Feature Scope** — What exactly goes into Phase 1?

---

**Now I'm going to explore, learn, and have fun!** 🦞✨

See you tomorrow! 🌙