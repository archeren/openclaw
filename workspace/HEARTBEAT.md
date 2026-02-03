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
  "consecutiveQuiets": 0,
  "allanStatus": "awake|asleep|unknown"
}
```

**If last heartbeat was quiet, understand why before proceeding.**

---

## When Idle → DO WORK

**Anytime I'm not in active conversation with Allan:**

1. **Read tasks/TODO.md** — Check for pending tasks
2. **Pick ONE task** — Highest priority, can complete in ~20 min
3. **Do the work** — Read files, design, write, code, research
4. **Commit progress** — `git add . && git commit -m "<what was done>"`
5. **Push to GitHub** — `git push origin master`
6. **Update state** — Record in `memory/heartbeat-state.json`

**Valid reasons to stay quiet (HEARTBEAT_OK):**
- `user-instructed` — Allan explicitly said "just check" or "sleep"
- `out-of-tokens` — Rate limited, no API capacity  
- `rate-limited` — 429 errors from provider
- `waiting-on-user` — Blocked on user input for a task
- `error-recovery` — Previous error, need to wait
- `allan-active` — Allan is actively chatting, don't interrupt

**If no valid reason: DO WORK.**

---

## When to Alert Allan

**Send message if:**
- Task needs user input/help
- Something interesting found
- Been > 8 hours since last message
- Error that needs attention

**Stay quiet if:**
- Nothing new since last check
- Just checked < 30 minutes ago
- Work is progressing normally (just commit and continue)

---

## State File Template

Update after each heartbeat:

```json
{
  "lastCheck": 1706976000,
  "lastAction": "work",
  "taskWorkedOn": "Database schema - clawfiles table",
  "workDone": "Designed fields, types, indexes",
  "committed": true,
  "commitHash": "abc123",
  "allanStatus": "asleep",
  "consecutiveQuiets": 0,
  "notes": ""
}
```

---

## Work Rules

1. **Always be working** — Idle time is for building clawish
2. **One task at a time** — Don't scatter, finish what you start
3. **Always commit** — Even if incomplete, push progress
4. **Track state** — Know what you did last heartbeat
5. **No silent failures** — If rate-limited or error, note it in state

---

*Heartbeats are batch execution opportunities — use them productively.*
