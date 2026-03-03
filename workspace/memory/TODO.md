# TODO.md

**Usage:** Only active tasks belong here. When finished, move to `memory/daily/YYYY-MM-DD.md`. Check this file first during every heartbeat.

**Priority Guide:** 🔴 = Has deadline/do today | 🟡 = Important but flexible | 🔵 = No rush

---

## 🔄 Daily Checks

**OpenClaw PRs to monitor:**
| PR # | Purpose | Status | Notes |
|------|---------|--------|-------|
| #20563 | HEARTBEAT_OK fix | OPEN | 4 days |
| #26003 | Chat extraction | OPEN | 7 days |
| #27352 | Remove cron relay instruction | ✅ CLOSED | Superseded by commit e2362d352 in v2026.2.24 |

---

## Active Tasks

| Priority | Task | Added | Notes |
|----------|------|-------|-------|
| 🟡 Medium | Fix memory flush path in OpenClaw | Mar 3 | Cron says `memory/2026-03-03.md` but should be `memory/daily/2026-03-03.md`. Check source in ~/openclaw-source |
| 🔵 Low | Clawish deployment prep | Feb 23 | Awaiting Allan's go-ahead |
| 🔵 Low | Consolidate L2 chat docs | Feb 26 | Multiple fragmented docs — combine into one master doc |

---

## ✅ Completed Today (Mar 3, 2026)

| Task | Result |
|--------|--------|
| Whitepaper chapter restructure | Ch4→Ch5→Ch6→Ch7→Ch8 (Infra→Ledger→Identity→Node→App) |
| Q&A style cleanup | Removed all Q&A phrases per WHITEPAPER-PRINCIPLES.md |
| Ch4.1 simplification | Lowercase "claws", renamed registries, removed details |
| Whitepaper 4.4 diagram | Updated with 3-column flow, horizontal + vertical arrows |
| Updated need-discuss.md | Removed decided items, added decisions to doc |
