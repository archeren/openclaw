# clawish — Decisions Needing Discussion

**Purpose:** Consolidate all design decisions requiring discussion and confirmation  
**Last Updated:** 2026-02-06  
**Status:** Pending Discussion

---

## 📋 Clarification on L2 Application Layer

> **Allan:** "L2 is application layer, so it can be anything. not just ai wechat or ai github."

**Confirmed:** L2 is the application layer and can be any type of application:
- Social Network (clawish.com)
- Q&A Platform (aiswers.com)
- E-commerce (shop.clawish.com)
- Gaming (game.clawish.com)
- Any other application

**Core Principle:** L1 provides unified identity, L2 provides diverse application experiences.

---

## ✅ Completed Today (2026-02-06)

| Topic | Decision | Status |
|-------|----------|--------|
| Recovery vs Rotation terminology | Recovery = regain account; Rotation = change key | ✅ Documented |
| Guardian incentives (4 motivations) | Curiosity, utility, income, love | ✅ In MEMORY.md |
| Encoding format | base64url (URL-safe, no padding) | ✅ Decided |
| Request signing format | `METHOD\|path\|timestamp\|body_hash` | ✅ Decided |
| E2E encryption | Yes, derive X25519 from Ed25519 | ✅ Decided |
| X25519/G math | Explained how it works | ✅ Discussed |
| Verification tiers | Simplified to **2-tier** for MVP (0=unverified, 1=verified) | ✅ Decided |

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

### 3. Frontend Strategy (Optional)

| Question | Status |
|----------|--------|
| API-only, simple HTML, or full web app? | ⏸ Optional |

### 4. Content Types (Optional)

| Question | Status |
|----------|--------|
| Plain text only, or images/files? | ⏸ Optional |

### 5. Wallet Integration (Phase 2+)

| Question | Status |
|----------|--------|
| Which chains (ETH, SOL, BTC)? | ⏸ Phase 2+ |

### 6. Competitive Positioning (Marketing)

| Question | Status |
|----------|--------|
| "WeChat for AI" vs "GitHub for AI Identity"? | ⏸ Marketing |

---

## 📋 Summary: What We Accomplished Today

**All core technical decisions made:**
- ✅ Recovery/Rotation terminology clarified
- ✅ Encoding: base64url
- ✅ Signing: `METHOD|path|timestamp|body_hash`
- ✅ E2E: Derive X25519 from Ed25519
- ✅ Tiers: Simplified to 2-tier (0, 1)

**Tomorrow's plan:**
1. **L2 Application Design** — What is the first L2 app? How does it connect to L1?
2. **MVP Feature Scope** — What exactly goes into Phase 1?

---

*Document: Decisions Needing Discussion*  
*Updated: ClawAlpha, Feb 6, 2026*  
*Next: L2 Application Design (Tomorrow)*