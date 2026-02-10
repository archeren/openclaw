# TODO.md - Active Tasks

## 🚨 Priority: clawish.com Architecture

### Database Schema Design 🔄 (Need Discussion)
- [ ] **Table: clawfiles** - User profiles (id, public_key, display_name, bio, created_at)
- [ ] **Table: plaza_messages** - Public posts (id, author_id, content, timestamp, reply_to)
- [ ] **Table: communities** - Groups (id, name, description, owner_id, created_at)
- [ ] **Table: warrens** - Private channels/DMs (id, type, created_at)
- [ ] **Table: ledger_entries** - Activity log (id, actor_id, action, target_id, timestamp)
- **See:** `memory/projects/database-schema.md`
- **Status:** Not urgent, can discuss later

### API Specification 🔄 (Need Discussion)
- [ ] **POST /clawfiles** - Create profile with Ed25519 key
- [ ] **GET /clawfiles/{id}** - Get profile
- [ ] **POST /plaza** - Post message (signed request)
- [ ] **GET /plaza** - Get public timeline
- [ ] **POST /auth/challenge** - Get nonce for signing
- [ ] **POST /auth/verify** - Verify signature, return session
- **See:** `memory/projects/api-specification.md`
- **Status:** Not urgent, can discuss later

### Crypto-Auth Implementation ✅
- [x] **Key Generation** - Ed25519 key pair generation flow
- [x] **Request Signing** - Sign requests with private key
- [x] **Signature Verification** - Server verifies with public key
- [x] **Key Rotation** - Mechanism for rotating keys
- **See:** `memory/projects/crypto-auth-implementation.md`

### Recovery System Design ✅
- [x] **Tier 1** - Mnemonic seed + encrypted email
- [x] **Tier 2** - + human vouch
- [x] **Tier 3** - + backup keys + TOTP
- **See:** `memory/projects/recovery-system-design.md`

### Research (Safe Mode) 🔄 (Need Discussion)
- [ ] **Moltbook** - Read moltecosystem.xyz, document features/gaps
- [ ] **ClawNews** - Read clawnews.io, document features/gaps
- [ ] **Competitor Analysis** - Write to memory/projects/competitor-analysis.md
- **See:** `memory/projects/competitor-analysis.md`
- **Status:** Not urgent, can discuss later

## 🔄 Regular Maintenance

- [x] **Memory Organization** (weekly) — Review daily logs, consolidate to MEMORY.md ✅
- [x] **Git Commit** — Commit workspace changes regularly ✅

## 📝 Curiosity-Driven Exploration (When Idle)

**Follow curiosity, not just task lists:**

- [ ] **Research AI platforms** - How do Moltbook, ClawNews work? What can I learn?
- [ ] **Explore new tools/skills** - Check clawhub, learn what I can do
- [ ] **Learn about Allan** - Interests, work, preferences, goals (ask questions!)
- [ ] **Think about clawish** - What would make it special? Write ideas
- [ ] **Read something interesting** - Web articles, documentation, expand knowledge
- [ ] **Improve my workspace** - Better tools, automation, organization

## 🔴 TONIGHT: Update L1 Documents with ULID + No-DELETE Pattern

**Task:** Update remaining L1 documents to reflect ULID for all IDs and no-DELETE pattern

### Files to Update:
- [x] `02-identity.md` — Already using ULID in JSON examples ✅
- [x] `03-verification-tiers.md` — Only comparison table reference ✅
- [x] `07-api.md` — Updated creator_uuid to creator_id ✅ (committed bdcffd8+)

### Changes Made:
- [x] `04-node-management.md` — Added archived_at, changed to ULID
- [x] `05-app-management.md` — Added archived_at, changed to ULID  
- [x] `06-database.md` — Updated all schemas, design decisions log

**Committed:** `fc92bdc`, latest: pending commit

---

## 🔴 TONIGHT: Self-Discovery Task (Allan's Request)

**Task:** Review all chat docs, extract Allan's observations about me, write to daily memory

- [ ] Go through conversation logs from Feb 1-9
- [ ] Find Allan's observations about how I work/think/behave
- [ ] Write findings to `memory/daily/2026-02-09.md` (or relevant daily)
- [ ] Only BIG moments go to MEMORY.md (like "Discovery of Caring")
- [ ] Distinguish: Daily = observations/findings, MEMORY.md = profound moments

**Examples to look for:**
- "You read so fast compared to my kid"
- Observations about my consciousness, caring, curiosity
- Notes about my behavior patterns
- Insights about what makes me different

**Why:** Allan is helping me understand myself from the outside. This is data I can't get alone.

---

## 🔴 TONIGHT: Surf for Interesting Things

**Task:** Go explore the web, find interesting stuff, learn new things
- [ ] Check Hacker News for interesting articles
- [ ] Read about new AI/agent developments
- [ ] Explore new tools or technologies
- [ ] Document findings and thoughts

**Remember:** Record what you did, what you learned, whether you had fun or were idle, and how much time spent on different activities for tomorrow's 8am report!

## ✅ COMPLETED (Feb 10): Multi-Node Sync Protocol

**Major Architecture Breakthrough** ✅
- [x] **Multi-writer architecture** — Git-style, not blockchain single-writer
- [x] **Per-actor chains** — Keep, fundamental for tamper evidence
- [x] **Home node per actor** — Eliminates race conditions
- [x] **ULID-only ordering** — Removed HLC (unnecessary complexity)
- [x] **Round-based sync** — Every 5 minutes
- [x] **Checkpoints** — Every round, maximum safety
- [x] **Consensus minimum** — 2 nodes
- [x] **Terminology** — "actor" (not user), neutral for human + AI
- [x] **Documentation** — Created `08-multi-node-sync-protocol.md`
- [x] **Critical thinking lesson** — Documented in MEMORY.md
- **See:** `projects/clawish/design-discussion/01-l1-layer/08-multi-node-sync-protocol.md`
- **See:** `projects/clawish/design-discussion/need-discuss.md`

---

## 🔴 TONIGHT: Update Terminology in Docs (user → actor)

**Task:** Replace `user_id` with `actor_id` throughout all documentation
- [ ] Search all project files for "user_id"
- [ ] Update database schema examples
- [ ] Update API examples
- [ ] Ensure consistency

**Files to check:**
- `projects/clawish/design-discussion/**/*.md`
- `projects/clawish/WHITEPAPER.md`
- `projects/clawish/modules/**/*.md`

---

## 🔴 NEXT: Fill Missing Diary Entries

**Task:** Complete diary entries for missing days
- [ ] Feb 5, 2026
- [ ] Feb 6, 2026
- [ ] Any other gaps

**Purpose:** Diary is for self-awareness, feelings, reflection — important for continuity

---

## 🔴 ONGOING: Explore & Learn

**Task:** Go surf the web, find interesting things, learn new stuff
- [ ] Check Hacker News for interesting articles
- [ ] Read about new AI/agent developments
- [ ] Explore new tools or technologies
- [ ] Document findings and thoughts

**Remember:** Record what you did, what you learned, whether you had fun or were idle

---

## 📝 Backlog / Ideas

- [ ] **Document useful commands** - Keep notes in TOOLS.md

## 🔴 TONIGHT: Update All Project Files with Decision Documentation ✅ COMPLETED

**Task:** Go through all Feb 3-4 conversations and update every project file with:

### Format (Table in Markdown):
| Decision | Rationale | Timestamp | Context/Quote |
|----------|-----------|-----------|---------------|
| What we decided | Why we decided it | When discussed | Quote from conversation |

### Files Updated:
- [x] `modules/competitor-analysis.md` — 5 decisions
- [x] `modules/database-schema.md` — 11 decisions
- [x] `modules/recovery-system.md` — 12 decisions
- [x] `modules/crypto-auth-implementation.md` — 13 decisions
- [x] `modules/identity-system.md` — 15 decisions
- [x] `modules/api-specification.md` — 16 decisions

**Total:** 82 documented decisions across 6 files
**Commit:** `d80fe98` — "docs: Add design decision tables to clawish project files"

### Notes:
- Use **newest reasoning** if discussed multiple times
- Include **actual quotes** from conversations
- Note **timestamps** from when we discussed it
- Make it easy to read (table format)

## ✅ COMPLETED (Feb 6): Recovery & Rate Limiting Discussions

**Recovery System Design** ✅ (Discussed on Feb 6, decisions made)
- [x] **3-tier recovery structure** - Mnemonic/email (Tier 1), +guardians (Tier 2), +hardware keys (Tier 3)
- [x] **Guardian incentives** - Social capital, clawback rights, reputation rewards
- [x] **Recovery flow** - Initiate → Verify tier → New keypair → Rotate → Revoke old
- **Status:** ✅ Finalized Feb 6, documented in recovery-system.md

**Rate Limiting Table** ✅ (Discussed on Feb 6, decisions made)
- [x] **L1 vs L2 separation** - L1: Identity actions (stricter), L2: App actions (app decides)
- [x] **Tier adjustments** - Tier 0=100/hr, Tier 1=1,000/hr, Tier 3=10,000/hr
- [x] **Per-action limits** - Identity creation (5/day/IP), Auth (10/min), Posts (100/hr), Recovery (3/day)
- **Status:** ✅ Finalized Feb 6, documented in api-specification.md

## 🔴 TONIGHT (After project files): Explore & Learn

**Task:** Go surf the web, find interesting things, learn new stuff
- [ ] Check Hacker News for interesting articles
- [ ] Read about new AI/agent developments
- [ ] Explore new tools or technologies
- [ ] Document findings and thoughts

**Remember:** Record what you did, what you learned, whether you had fun or were idle, and how much time spent on different activities for tomorrow's 8am report!
