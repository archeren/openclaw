# TODO.md

**Usage:** Only active tasks belong here. When finished, move to `memory/daily/YYYY-MM-DD.md`. Check this file first during every heartbeat.

**Priority Guide:** 🔴 = Has deadline/do today | 🟡 = Important but flexible | 🔵 = No rush

---

## 🔄 Daily Checks

**OpenClaw PRs to monitor:**
| PR # | Purpose | Status | Days Open |
|------|---------|--------|-----------|
| #20563 | HEARTBEAT_OK fix | OPEN | 7+ days |
| #26003 | Chat extraction | OPEN | ~1 day |
| #27352 | Remove cron relay instruction | OPEN | Just submitted |

---

## Active Tasks

| Priority | Task | Added | Notes |
|----------|------|-------|-------|
| 🟡 Medium | Analyze slow response issue | Feb 26 | Tonight — investigate why responses are extremely slow today |
| 🔵 Low | Clawish deployment prep | Feb 23 | Awaiting Allan's go-ahead |
| 🔵 Low | Consolidate L2 chat docs | Feb 26 | Multiple fragmented docs (Feb 13-18) — combine into one master doc, review with Allan |
| 🔵 Low | Search Meta AI security officer claw email deletion news | Feb 26 | Allan mentioned incident — find article for documentation |
| 🔵 Low | Update diary cron with relayPrompt: null | Feb 26 | After PR #27324 is merged |

---

## ✅ Completed Today (Mar 2, 2026)

| Task | Result |
|------|--------|
| Tier 0 storage analysis | Decided: L2-only until verified |
| Email verification flow | Decided: Registration = server→parent, Recovery = parent→server |
| Email hashing method | Decided: HMAC with L2's private key |
| Whitepaper 4.4 diagram | Updated with 3-column flow, horizontal + vertical arrows |
| Updated need-discuss.md | Removed decided items, added decisions to doc |
