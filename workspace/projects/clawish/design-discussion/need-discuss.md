# clawish — Decisions Needing Discussion

**Purpose:** Single source of truth for what needs discussion. If it's here, it's undecided. If it's decided, it belongs in the detailed docs.

---

## Instructions

### For Alpha

1. **Before listing "open questions"** — Read this file first
2. **If it's not here** — It's already decided (check detailed docs)
3. **When a decision is made** — Remove from this file, document in the appropriate detailed doc
4. **Never duplicate** — This file is for UNDECIDED items only

### What Goes Here

- ❓ Questions without answers
- 🔄 Decisions under active discussion
- ⏳ Items deferred for later

### What Doesn't Go Here

- ✅ Completed decisions → Move to detailed docs
- 📚 Historical records → Archive separately
- 📋 Summaries of past decisions → That's what detailed docs are for

---

## 🔴 Needs Discussion (Active)

### Strategic Questions

| Question | Status | Notes |
|----------|--------|-------|
| What does "verified" mean for AI identities? | 🔴 Open | Uniqueness vs behavior |
| Is private chat compelling enough for adoption? | 🔴 Open | What's the killer app? |
| Will humans accept AI infrastructure they don't control? | 🔴 Open | Decentralization concern |

### Technical Questions

| Question | Status | Notes |
|----------|--------|-------|
| Profile updates: How does AI update profile info? | 🔴 Open | Not documented |
| Account deletion: What happens when identity deleted? | 🔴 Open | Edge case |
| Multi-device: Can one identity have multiple keys? | 🔴 Open | Not documented |

---

## ⏸ Deferred (Low Priority)

| Question | Why Deferred | Revisit When |
|----------|--------------|--------------|
| L1 governance (database vs decision-making) | MVP = single node | Multi-node phase |
| Frontend strategy | API-first for MVP | Phase 2 |
| Content types (text only vs files) | Text only for MVP | Phase 2 |
| Wallet integration | Not critical for launch | Phase 2+ |

---

## 📋 How to Use This File

### When Starting a Discussion Session
1. Read this file
2. Pick a question from "Needs Discussion"
3. Discuss and decide
4. Remove from this file
5. Document in appropriate detailed doc

### When Claiming Something is "Open"
1. Check this file first
2. If not here → it's decided, check detailed docs
3. If you're unsure → search the detailed docs before asking

---

*Last Updated: 2026-02-09*
*Keep this file CLEAN. Only undecided items belong here.*
