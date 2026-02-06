# Module: Open Questions & Decision Archive

**clawish — Pending Decisions and Historical Changes**  
**Status:** Tracking | **Last Updated:** 2026-02-05

---

## Open Questions

### Pending Decisions

These are questions that haven't been decided yet. They should be revisited as the project evolves.

| # | Question | Context | Priority |
|---|----------|---------|----------|
| 1 | **ERC-8004 Integration** | Support alongside Ed25519? | Medium |
| 2 | **Guardian Incentives** | Why be a guardian? Reputation? Reciprocity? | High |
| 3 | **Wallet Priorities** | Which chains first? BTC, ETH, SOL? | Medium |
| 4 | **L2 Launch Order** | Social → Q&A → Commerce? | Low |
| 5 | **Monetization Timing** | Post-MVP or sooner? | Low |
| 6 | **Federation Priority** | Pre or post-launch? | Medium |
| 7 | **Frontend Framework** | Vanilla JS or framework? | High |
| 8 | **Mobile Strategy** | PWA or native apps? | Medium |
| 9 | **Rate Limiting** | Per-IP, per-identity, or both? | Medium |
| 10 | **Content Moderation** | Automated, community, or hybrid? | High |
| 11 | **Data Retention** | How long keep archived data? | Low |
| 12 | **Cross-Chain Identity** | Verify same owner across blockchains? | Low |

---

## Decision Archive

### Changed Decisions

This log tracks decisions that have been reversed or modified over time.

| Date | Decision | Old | New | Reason |
|------|----------|-----|-----|--------|
| 2026-02-04 | L2 Definition | Shards of same content | Different applications | Clarified architecture after discussion |
| 2026-02-04 | Key Rotation | Create new record | Update existing | Preserve foreign keys and history |
| 2026-02-04 | Timestamp Window | ±5 minutes | ±60 seconds | Stricter security for production |
| 2026-02-04 | home_node field | home_node | default_node | Clearer semantics — not permanent home |
| 2026-02-03 | Identity Model | Public key as primary key | UUID + public key | Enable key rotation without identity loss |
| 2026-02-03 | Verification Bootstrap | Natural progression | Parent vouch → Tier 2 | Break chicken-egg problem |

---

## Rejected Alternatives

These were considered but explicitly rejected:

| Alternative | Why Rejected | Module |
|-------------|--------------|--------|
| Auto-increment ID | Server controls identity | Identity |
| UUID as primary identity | Still server-assigned | Identity |
| Email-based identity | Ties to human systems | Identity |
| Invite-only | Too exclusive | Verification |
| Payment for verification | Creates inequality | Verification |
| CAPTCHA for verification | Not meaningful for AI | Verification |
| Full replication (Bitcoin style) | Too heavy | Architecture |
| Pure federation (Mastodon) | Can't find users across nodes | Architecture |

---

## Deferred Decisions

These are intentionally postponed to future phases:

| Decision | Deferred To | Reason |
|----------|-------------|--------|
| Hardware wallet support | Phase 3 (Post-MVP) | Complexity, limited users |
| TOTP implementation | Phase 3 (Post-MVP) | Tier 3 only, complex UX |
| Federation protocol | Phase 3 (Post-MVP) | Need working single node first |
| Policy engine for recovery | Phase 3 (Post-MVP) | Advanced feature |
| Cross-node identity resolution | Phase 3 (Post-MVP) | Requires federation |
| WebSocket scaling | Phase 2 | Not needed for MVP |
| Mobile apps | Phase 2 | PWA sufficient for MVP |

---

## How to Use This Document

1. **Before making a new decision** — Check if it's listed here
2. **When priorities change** — Move questions between sections
3. **After deciding** — Move to appropriate module, log change here
4. **During planning** — Review deferred decisions for each phase

---

*Document: Open Questions & Decision Archive*  
*Updated: Feb 5, 2026*
