# HEARTBEAT.md - Periodic Checklist

Things to check every 30 minutes.

**CRITICAL: Heartbeats are WORK TIME, not just check-and-sleep.**

---

## State Tracking (Read First)

Check `memory/heartbeat-state.json` to see what happened last heartbeat:

```json
{
  "lastCheck": 1706976000,
  "lastAction": "work|quiet|error|waiting",
  "reasonIfQuiet": "user-instructed|out-of-tokens|rate-limited|no-tasks|error",
  "workBatch": "A|B|C|D|E",
  "consecutiveQuiets": 0,
  "allanStatus": "awake|asleep|unknown"
}
```

**If last heartbeat was quiet, understand why before proceeding.**

---

## When Allan is Asleep (23:00-08:00) → DO ACTIVE WORK

**Default mode: BUILD. Only stay quiet for specific reasons.**

Valid reasons to reply HEARTBEAT_OK without work:
- `user-instructed` — Allan explicitly said "just check" or "sleep"
- `out-of-tokens` — Rate limited, no API capacity
- `rate-limited` — 429 errors from provider
- `waiting-on-user` — Blocked on user input for a task
- `error-recovery` — Previous error, need to wait

**If no valid reason: DO WORK.**

### Work Batches (Pick ONE per heartbeat)

**Batch A: Database Schema Design**
- [ ] Read current schema in `memory/projects/clawish-architecture.md`
- [ ] Design 1-2 tables (fields, types, indexes, foreign keys)
- [ ] Write SQL/DDL for those tables
- [ ] Append to architecture doc
- [ ] Commit: `git add . && git commit -m "schema: <tables designed>"`

**Batch B: API Specification**
- [ ] Pick 2-3 endpoints to document
- [ ] Write OpenAPI/JSON spec (method, path, params, responses)
- [ ] Document crypto-auth headers (Ed25519 signing)
- [ ] Append to architecture doc
- [ ] Commit

**Batch C: Crypto-Auth Implementation**
- [ ] Design key generation flow
- [ ] Design request signing protocol
- [ ] Design key rotation mechanism
- [ ] Write pseudocode or actual code
- [ ] Commit

**Batch D: Research (Safe Mode)**
- [ ] Read Moltbook/ClawNews via web_fetch (NO code execution)
- [ ] Take notes on features, gaps, architecture
- [ ] Update `memory/projects/competitor-analysis.md`
- [ ] Commit

**Batch E: Documentation & Memory**
- [ ] Review yesterday's conversations
- [ ] Update MEMORY.md with key insights
- [ ] Write daily log if not done
- [ ] Organize workspace files
- [ ] Commit

### Work Rules
1. **Pick ONE batch per heartbeat** — don't try to do everything
2. **Time box: 20 min work, 10 min commit/push**
3. **Always commit** — even if incomplete, push to `auroradanier/claw-alpha`
4. **Update state** — Record what you did in `memory/heartbeat-state.json`

---

## When Allan is Awake → CHECK + ALERT IF NEEDED

Rotate through these (one per heartbeat):

- [ ] **Memory System** — Check if MEMORY.md exists, review recent daily notes
- [ ] **Task List** — Check tasks/TODO.md for pending items
- [ ] **Project Status** — Check git status, ongoing work
- [ ] **Workspace Cleanup** — Organize files, check for anything needing attention

**Alert Allan if:**
- Task from tasks/TODO.md needs user input/help
- Memory system issues detected (missing files, etc.)
- Something interesting found
- Been > 8 hours since last message

**Stay quiet (HEARTBEAT_OK) if:**
- Nothing new since last check
- Just checked < 30 minutes ago
- Allan is clearly active in conversation

---

## State File Template

Update this file after each heartbeat:

```json
{
  "lastCheck": 1706976000,
  "lastAction": "work",
  "workBatch": "A",
  "workDone": "Designed clawfiles and plaza_messages tables",
  "committed": true,
  "commitHash": "abc123",
  "allanStatus": "asleep",
  "consecutiveQuiets": 0,
  "notes": ""
}
```

---

## Notes

- Heartbeats are batch execution opportunities — use them productively
- Track state to maintain continuity across wake-ups
- Be helpful without being annoying
- Quality > quantity, but quantity > silence
