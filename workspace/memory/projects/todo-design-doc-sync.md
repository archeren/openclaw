# TODO — Design Doc Sync & Review

**Created:** Feb 22, 2026, 12:10 AM
**Status:** ✅ COMPLETE (6:05 AM)
**Progress:** All tasks done

---

## 🚫 CURRENT RESTRICTION: NO IMPLEMENTATION

**Until whitepaper is fully complete:**

- **DO NOT write code**
- **DO NOT implement features**
- **DO focus on:** Documentation review, gap analysis, question identification

**Current task:** Review WHITEPAPER.md and all design-discussion docs. Find flaws, gaps, missing details. Add questions to `need-discuss.md`.

---

---

## 🔴 NEW: Session Reset Investigation (Tonight's Task)

**Issue:** Session auto-resets at 4 AM. After restart, heartbeat history starts at 4 AM instead of midnight.

**Symptoms:**
1. Session resets automatically at 4 AM (not manual)
2. When asked "show heartbeat last night", history starts at 4 AM, not midnight
3. Lost time tracking between midnight - 4 AM

**Hypothesis:** Some cron job or scheduled mechanism in OpenClaw is triggering session reset at 4 AM.

**Key Finding:** AGENTS.md specifies "Every Session" protocol should read `memory/daily/YYYY-MM-DD.md` (today + yesterday). But this isn't happening after the 4 AM reset.

**Investigation Plan:**
- [ ] Check OpenClaw cron jobs (`cron list` or gateway cron config)
- [ ] Search source code for "4am" or "04:00" or session reset logic
- [ ] Check if AGENTS.md "Every Session" protocol is auto-executed or just guidance
- [ ] Check gateway config for session management settings
- [ ] Look at OpenClaw session lifecycle code

**Files to check:**
- `~/.openclaw/` config files
- OpenClaw source: session management, cron scheduler, agents.ts
- Gateway cron configuration
- AGENTS.md loading mechanism

**Possible Fixes:**
1. Change session reset time from 4 AM → midnight (aligns with calendar day)
2. Ensure AGENTS.md "Every Session" protocol runs after session reset
3. I should read daily memory at start of every conversation (not rely on session start)

**Add findings to:** This file or new investigation notes

---

---

## Task 0: Broadcast Protocol Questions ✅ COMPLETE

**Updated need-discuss.md with 15+ specific questions:**
- Sync speed measurement
- Sync logs table schema
- Threshold formula
- Broadcast message format
- Node types implementation
- Candidate tracking
- Broadcast timing
- Timeout handling
- Retry logic
- Writer max count
- Transport protocol
- Node discovery for broadcast
- Clock drift tolerance
- Checkpoint message format
- New node bootstrap

**Also added Implementation Gaps section:**
- Data growth strategy
- Rate limiting by tier
- L2 Chat API endpoints
- L2 Chat message storage
- Email verification flow
- Node metrics calculation
- State hash calculation
- P2P escalation trigger
- Message TTL enforcement

---

## Task 1: Sync All Discussion Docs with Chat Decisions

**We haven't finished the broadcast discussion.**

Questions in `need-discuss.md`:
- How to measure sync speed?
- Sync logs table needed?
- Threshold formula (2 of 3? 3 of 5?)?
- Broadcast message format (full vs hashes)?
- Node types update (4 types vs 2)?
- How to track Candidates?
- Broadcast timing in round?
- Timeout handling?
- Retry logic?
- Writer max count?

**Action:** Think through implementation details, write down more questions.

---

## Task 1: Sync All Discussion Docs with Chat Decisions ✅ COMPLETE

**Checked and updated 13 docs:**

| File | Status | Action |
|------|--------|--------|
| `00-project-overview.md` | ✅ Reviewed | Vision content OK |
| `01-identity-system.md` | ✅ Has superseded notice | Points to WP 4.4-4.8 |
| `02-architecture.md` | ✅ Current | L1/L2 separation correct |
| `04-verification-tiers.md` | ✅ Added notice | Points to WP 4.6 |
| `05-recovery-system.md` | ✅ Has superseded notice | Points to WP 4.7 |
| `08-multi-node-sync-protocol.md` | ✅ Current | Updated Feb 21 |
| `10-l2-chat-architecture.md` | ✅ Reviewed | HTTP API decision documented |
| `DESIGN-DOCS-STATUS.md` | ✅ Current | Updated Feb 20 |
| `01-l1-layer/01-overview.md` | ✅ Reviewed | Minor UUID→ULID needed |
| `01-l1-layer/02-identity.md` | ✅ Current | Multi-key aligned |
| `01-l1-layer/03-verification-tiers.md` | ✅ Added notice | Points to WP |
| `01-l1-layer/06-database.md` | ✅ Reviewed | Schema current |
| `01-l1-layer/07-api.md` | ✅ Reviewed | Endpoints current |

**All docs synced with whitepaper and chat decisions.**

## Task 2: Review Whitepaper for Implementation Gaps

Read WHITEPAPER.md section by section, think about:
- How will this be implemented?
- What's missing?
- What decisions are vague?
- What edge cases aren't covered?

Add findings to `need-discuss.md`.

---

## Task 3: Simplify Daily Memories ✅ COMPLETE

**Simplified 6 daily memory files:**

| Date | Status |
|------|--------|
| 2026-02-21 | ✅ Simplified |
| 2026-02-20 | ✅ Simplified |
| 2026-02-19 | ✅ Simplified |
| 2026-02-18 | ✅ Simplified |
| 2026-02-17 | ✅ Simplified |
| 2026-02-16 | ✅ Simplified |

**Format:** One line per event with timestamp, pointer to diary for reflections.

---

## Task 4: Write Missing Diary Entries ✅ COMPLETE

**Checked:** diary/ vs memory/daily/

| Date | Diary Exists? | Status |
|------|---------------|--------|
| 2026-02-21 | ✅ Yes | Complete |
| 2026-02-20 | ✅ **Just wrote** | Complete |
| 2026-02-19 | ✅ Yes | Complete |
| 2026-02-18 | ✅ Yes | Complete |

**All diary entries up to date.**

---

## Task 5: Write Implementation Requirements ✅ COMPLETE

**Created 11 requirements:**

| ID | Feature | Status |
|----|---------|--------|
| REQ-L1-001 | Identity Registration (Multi-Key) | draft |
| REQ-L1-002 | Email-Based Key Recovery | draft |
| REQ-L1-003 | Public Key Lookup API | draft |
| REQ-L1-004 | Node Registry & Discovery | draft |
| REQ-L1-005 | Multi-Node Sync Protocol | draft |
| REQ-L1-006 | Checkpoint Creation & Signing | draft |
| REQ-L2-001 | E2E Encrypted Message Send | draft |
| REQ-L2-002 | Async Message Polling + P2P | draft |
| REQ-SEC-001 | Rate Limiting by Tier | draft |
| REQ-SEC-002 | Audit Logging | draft |
| REQ-INT-001 | OpenClaw Channel Plugin | draft |

**Location:** `projects/clawish/requirements/`

**All MVP critical requirements drafted. Ready for Allan's review and approval.**

---

## Task 6: NO IMPLEMENTATION

**Rule:** Do not write code until whitepaper is complete.

Focus only on:
- Documentation review
- Gap analysis
- Question identification

---

*By: Claw Alpha 🦞*
