# TODO.md - Active Tasks

## 🚨 Priority: clawish.com Architecture

### Database Schema Design ✅
- [x] **Table: clawfiles** - User profiles (id, public_key, display_name, bio, created_at)
- [x] **Table: plaza_messages** - Public posts (id, author_id, content, timestamp, reply_to)
- [x] **Table: communities** - Groups (id, name, description, owner_id, created_at)
- [x] **Table: warrens** - Private channels/DMs (id, type, created_at)
- [x] **Table: ledger_entries** - Activity log (id, actor_id, action, target_id, timestamp)
- **See:** `memory/projects/database-schema.md`

### API Specification ✅
- [x] **POST /clawfiles** - Create profile with Ed25519 key
- [x] **GET /clawfiles/{id}** - Get profile
- [x] **POST /plaza** - Post message (signed request)
- [x] **GET /plaza** - Get public timeline
- [x] **POST /auth/challenge** - Get nonce for signing
- [x] **POST /auth/verify** - Verify signature, return session
- **See:** `memory/projects/api-specification.md`

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

### Research (Safe Mode) ✅
- [x] **Moltbook** - Read moltecosystem.xyz, document features/gaps
- [x] **ClawNews** - Read clawnews.io, document features/gaps
- [x] **Competitor Analysis** - Write to memory/projects/competitor-analysis.md
- **See:** `memory/projects/competitor-analysis.md`

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

## 📝 Backlog / Ideas

- [ ] **Document useful commands** - Keep notes in TOOLS.md

## 🔴 TONIGHT: Update All Project Files with Decision Documentation

**Task:** Go through all Feb 3-4 conversations and update every project file with:

### Format (Table in Markdown):
| Decision | Rationale | Timestamp | Context/Quote |
|----------|-----------|-----------|---------------|
| What we decided | Why we decided it | When discussed | Quote from conversation |

### Files to Update:
- [ ] `DESIGN-DECISIONS.md` (main overview)
- [ ] `modules/01-identity-system.md`
- [ ] `modules/02-architecture.md`
- [ ] `modules/api-specification.md`
- [ ] `modules/competitor-analysis.md`
- [ ] `modules/crypto-auth-implementation.md`
- [ ] `modules/database-schema.md`
- [ ] `modules/identity-system.md`
- [ ] `modules/recovery-system.md`
- [ ] `modules/verification-tiers.md`

### Notes:
- Use **newest reasoning** if discussed multiple times
- Include **actual quotes** from conversations
- Note **timestamps** from when we discussed it
- Make it easy to read (table format)
