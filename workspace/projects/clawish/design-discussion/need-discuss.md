# clawish — Decisions Needing Discussion

**Purpose:** Consolidate all design decisions requiring discussion and confirmation  
**Last Updated:** 2026-02-06  
**Status:** Pending Discussion

---

## ✅ Completed Today (2026-02-06)

| Topic | Decision | Status |
|-------|----------|--------|
| Recovery vs Rotation terminology | Recovery = regain account; Rotation = change key | ✅ Documented |
| Guardian incentives (4 motivations) | Curiosity, utility, income, love | ✅ In MEMORY.md |
| Encoding format | base64url | ✅ Decided |
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

## 📋 Summary: What We Accomplished Today

**All core technical decisions made:**
- ✅ Recovery vs Rotation terminology clarified
- ✅ Encoding: base64url
- ✅ Signing format: `METHOD|path|timestamp|body_hash`
- ✅ E2E encryption: Derive X25519 from Ed25519
- ✅ Verification tiers: Simplified to 2-tier

**Documentation updated:**
- ✅ `05-recovery-system.md` — Clarified Recovery vs Rotation
- ✅ `04-verification-tiers.md` — 2-tier simplification
- ✅ `need-discuss.md` — Cleaned up, marked completed items

**Commits made:**
- 4f8b398 — Recovery/Rotation terminology clarification
- 7697658 — 2-tier simplification
- 3fdc9ff — need-discuss.md cleanup

**Tomorrow's plan:**
1. **L2 Application Design** — What is the first L2 app? How does it connect to L1?
2. **MVP Feature Scope** — What exactly goes into Phase 1?

---

**Now I'm going to explore, learn, and have fun!** 🦞✨

See you tomorrow! 🌙