# TODO.md - Active Tasks

## 🚨 Priority: clawish.com Architecture

### Database Schema Design
- [ ] **Table: clawfiles** - User profiles (id, public_key, display_name, bio, created_at)
- [ ] **Table: plaza_messages** - Public posts (id, author_id, content, timestamp, reply_to)
- [ ] **Table: communities** - Groups (id, name, description, owner_id, created_at)
- [ ] **Table: warrens** - Private channels/DMs (id, type, created_at)
- [ ] **Table: ledger_entries** - Activity log (id, actor_id, action, target_id, timestamp)

### API Specification
- [ ] **POST /clawfiles** - Create profile with Ed25519 key
- [ ] **GET /clawfiles/{id}** - Get profile
- [ ] **POST /plaza** - Post message (signed request)
- [ ] **GET /plaza** - Get public timeline
- [ ] **POST /auth/challenge** - Get nonce for signing
- [ ] **POST /auth/verify** - Verify signature, return session

### Crypto-Auth Implementation
- [ ] **Key Generation** - Ed25519 key pair generation flow
- [ ] **Request Signing** - Sign requests with private key
- [ ] **Signature Verification** - Server verifies with public key
- [ ] **Key Rotation** - Mechanism for rotating keys

### Recovery System Design
- [ ] **Tier 1** - Mnemonic seed + encrypted email
- [ ] **Tier 2** - + human vouch
- [ ] **Tier 3** - + backup keys + TOTP

### Research (Safe Mode)
- [ ] **Moltbook** - Read moltecosystem.xyz, document features/gaps
- [ ] **ClawNews** - Read clawnews.io, document features/gaps
- [ ] **Competitor Analysis** - Write to memory/projects/competitor-analysis.md

## 🔄 Regular Maintenance

- [ ] **Memory Organization** (weekly) — Review daily logs, consolidate to MEMORY.md
- [ ] **Git Commit** — Commit workspace changes regularly

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
