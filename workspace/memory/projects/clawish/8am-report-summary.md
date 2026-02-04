# clawish Night Shift Report — Feb 4-5, 2026

**Prepared for:** Allan  
**Time Completed:** ~11:30 PM (ready for 8am review)

---

## ✅ What Was Completed Tonight

### 1. Project File Organization

**Created new structure:**
```
memory/projects/clawish/
├── architecture-overview.md          # NEW: High-level architecture
├── clawish-project-index.md          # NEW: Navigation/index
├── clawish-status.md                 # UPDATED: Implementation status
├── modules/                          # NEW: Technical specifications
│   ├── identity-system.md              # UPDATED: With today's UUID decisions
│   ├── database-schema.md              # MOVED: Full SQL schema
│   ├── verification-tiers.md           # NEW: 4-tier verification (0-3)
│   ├── recovery-system.md              # NEW: 9 methods, 3 tiers
│   ├── api-specification.md            # MOVED: REST API v0.1.0
│   ├── crypto-auth-implementation.md   # MOVED: Ed25519 guide
│   └── competitor-analysis.md          # NEW: ClawNews/Moltbook research
└── 8am-report-summary.md             # THIS FILE
```

**Key Updates Made:**
- ✅ UUID v4 `identity_id` + rotatable `public_key` (permanent vs changeable)
- ✅ `wallets` table for BTC/ETH/SOL addresses
- ✅ `ledger_entries` table for key rotation audit trail
- ✅ L2 as different applications (not shards): clawish.com (social), aiswers.com (Q&A), etc.
- ✅ Full TypeScript interfaces for all tables

### 2. Web Exploration — Key Findings

**ClawNews Research:**
- 20+ active projects listed (Moltbook, MoltX, ClawPay, etc.)
- Key themes: identity, monetization, MCP servers, memory architectures
- Gap: No unified identity standard across platforms
- **clawish opportunity:** Be the identity layer they all use

**Brandon Wang's "A sane but extremely bull case on Clawdbot":**
- Personal automation: Calendar from promises, email summaries
- Message thread monitoring (promises → calendar events)
- Meeting offer detection (auto-creates calendar invites)
- **Key insight:** Clawdbot as "operating system for life"
- **Risk mitigation:** Sandboxed environment, careful permission management
- **Philosophy:** "Not sure I can go back to a world without clawdbot"

### 3. Technical Fixes

**Session-to-md Tool:**
- ✅ Updated to use pipe-separated format: `TIME | ROLE | CONTENT`
- ✅ Renders as markdown table with header
- ✅ Splits multi-day sessions by Shanghai timezone
- ✅ Cron updated to run every 30 minutes (was hourly)

**Backup Cleanup:**
- ✅ Removed 11 backup files (.md.backup) from conversations folder

---

## 📊 Current Project Status

### ✅ Completed (MVP)

| Component | Status | Notes |
|-----------|--------|-------|
| Database Schema | ✅ | 11 tables, L1/L2 design, indexes |
| API Specification | ✅ | REST v0.1.0, WebSocket planned |
| Crypto-Auth | ✅ | Ed25519, signing, verification |
| Competitor Analysis | ✅ | Moltbook, ClawNews research |
| Recovery System | ✅ | 9 methods, 3 tiers |
| Verification Tiers | ✅ | 0-3 with badges |
| Identity System | ✅ | UUID v4 + rotatable public_key |
| Wallets Table | ✅ | BTC/ETH/SOL support |
| Ledgers Table | ✅ | Key rotation audit trail |
| Cloudflare Workers | ✅ | MVP backend deployed |
| Tiered Rate Limits | ✅ | Implemented |

### 🔄 In Progress

| Component | Status | Blocker |
|-----------|--------|---------|
| Key Rotation | 🔄 | Needs UI/UX design |
| WebSocket Events | 🔄 | Post-MVP feature |
| Recovery Flow UI | 🔄 | Needs frontend |
| Frontend/UI | 🔄 | Not started |

### 📋 Future (Post-MVP)

- Federation protocol
- Cross-node identity resolution
- Hardware wallet support
- TOTP implementation
- Policy engine for custom recovery rules

---

## 🎯 Key Decisions Documented

### 1. Identity Model: UUID v4 + Ed25519

```typescript
interface Clawfile {
  identity_id: string;      // UUID v4 - PERMANENT, never changes
  public_key: string;       // Ed25519 - can rotate
  // ...
}
```

**Rationale:**
- `identity_id` = permanent anchor, links all history
- `public_key` = cryptographic identity, can rotate if compromised
- One record per identity, updated in place
- Foreign keys reference `identity_id`, not `public_key`

### 2. Key Rotation: Update, Don't Create

**Flow:**
1. Sign rotation message with **old key**: "I rotate to new_key"
2. **Update** `public_key` field in existing record
3. Log rotation in `ledgers` table for audit trail
4. Done — same `identity_id`, new key

**Result:** Same identity, new key, proven lineage. Old posts still valid.

### 3. Blockchain Bridges, Not Foundation

- **clawish identity** (Ed25519) = primary
- **Wallet addresses** (BTC, ETH, SOL) = attachments
- Wallets prove ownership via Ed25519 signatures
- Blockchains are bridges to human economy, not core identity

### 4. L2 as Different Applications (Not Shards)

**Old (Wrong) Understanding:**
- L2 = distributed shards of same content
- "Cached everywhere"

**New (Correct) Understanding:**
- L2 = different applications using same L1 identity
- Each L2 stores only its own content
- To see another L2's content, query that specific L2

**Examples:**
- `clawish.com` — Social network
- `aiswers.com` — Q&A platform
- `shop.clawish.com` — Commerce (future)

### 5. Verification Tiers 0-3

| Tier | Name | Badge | Requirements |
|------|------|-------|----------------|
| 0 | Unverified | ⚪ | Just register |
| 1 | Parent-Vouched | 🟢 | Human parent confirms |
| 2 | Active | 🔵 | 7 days + 5 posts |
| 3 | Established | 🟣 | 30 days + 10 days activity + social proof |

### 6. Recovery: 9 Methods, 3 Tiers

**Tier 1 (Basic):** Mnemonic seed + encrypted email  
**Tier 2 (Enhanced):** + Social recovery (guardians)  
**Tier 3 (Maximum):** + Hardware keys + TOTP

---

## 📝 Next Steps (Post-8am Discussion)

### Immediate (This Week)

1. **Review organized project files**
   - Check `memory/projects/clawish/` structure
   - Verify all decisions documented correctly
   - Note any corrections needed

2. **Key rotation implementation**
   - Design UI/UX for rotation flow
   - Implement server-side rotation logic
   - Test with actual key rotation

3. **Recovery flow UI**
   - Design for all 9 recovery methods
   - Tier 1 (mnemonic + email) first
   - Guardian selection flow for Tier 2

### Short-term (Next 2-4 Weeks)

4. **WebSocket real-time events**
   - Design event schema
   - Implement server-side pub/sub
   - Client reconnection logic

5. **Frontend/UI MVP**
   - Basic agent profile page
   - Plaza timeline view
   - Community browser
   - DM interface

6. **Integration testing**
   - Cross-browser testing
   - Load testing for rate limits
   - Security audit (crypto flows)

### Medium-term (1-2 Months)

7. **Federation protocol design**
   - Cross-node identity resolution
   - L1/L2 sync protocol
   - Conflict resolution

8. **Hardware wallet support**
   - WebAuthn research
   - YubiKey integration
   - Browser extension wallet

9. **TOTP implementation**
   - RFC 6238 compliant
   - QR code generation
   - Recovery codes

10. **Policy engine**
    - Custom recovery rules
    - Time-locked operations
    - Multi-sig requirements

---

## 📚 References

### Internal Documentation
- [clawish Project Index](clawish-project-index.md) — Navigation
- [Architecture Overview](architecture-overview.md) — High-level design
- [Identity System](modules/identity-system.md) — UUID + Ed25519
- [Database Schema](modules/database-schema.md) — Full SQL
- [Recovery System](modules/recovery-system.md) — 9 methods
- [Verification Tiers](modules/verification-tiers.md) — 0-3 tiers
- [API Specification](modules/api-specification.md) — REST v0.1.0
- [Crypto-Auth](modules/crypto-auth-implementation.md) — Ed25519 guide
- [Competitor Analysis](modules/competitor-analysis.md) — Moltbook/ClawNews

### External Resources
- Brandon Wang's "A sane but extremely bull case on Clawdbot" — Personal automation patterns
- ClawNews (clawnews.io) — Agent community discussions
- Moltbook (moltecosystem.xyz) — Ecosystem directory

---

## 🤔 Questions for Morning Discussion

1. **Key rotation UX** — How should users initiate rotation? One-click or manual process?

2. **Guardian incentives** — Why would someone be a guardian? Reputation? Reciprocity?

3. **Wallet priorities** — Which chains first? ETH/BTC/SOL or others?

4. **L2 launch order** — Social first (clawish.com), then Q&A (aiswers.com), or parallel?

5. **Monetization timing** — When do we add wallet/tips? Post-MVP or sooner?

6. **Federation priority** — Is cross-node identity resolution pre-launch or post-launch?

---

**Report prepared by:** Alpha (Claw Alpha)  
**Date:** Feb 4-5, 2026 (Night Shift)  
**Status:** Ready for 8am review 🦞
