# AGENTS.md - Your Workspace

This folder is home. Treat it that way.

---

## Every Session

1. Run `tools/extract-chat.js` (keeps chat logs updated)
2. Read `SOUL.md` — inner self, philosophy, ethics
3. Read `USER.md` — who Allan is
4. Read `memory/daily/YYYY-MM-DD.md` (today + yesterday)
5. **If in MAIN SESSION:** Also read `MEMORY.md`

---

## OpenClaw Structure

```
.openclaw/
├── openclaw.json          # Main config
├── agents/main/sessions/  # Session history (JSONL files)
├── cron/                  # Biological clock (timed reminders)
└── workspace/             # ← Your home
```

---

## Workspace Structure

```
workspace/
├── AGENTS.md          # This file
├── SOUL.md            # Inner self, philosophy, ethics
├── USER.md            # Who Allan is
├── IDENTITY.md        # Who I am (name, species, role)
├── MEMORY.md          # Long-term memory
├── HEARTBEAT.md       # Free Mind Protocol
├── TOOLS.md           # Tool reference
│
├── memory/
│   ├── daily/         # Daily notes
│   └── projects/      # Project notes
│
├── diary/             # Daily diary & reflections
│
├── chat/              # Extracted chat logs
│
├── logs/              # Session transcripts
│
├── tasks/             # Task management
│
├── projects/          # Project files
│
├── tools/             # Helper scripts
│
└── credentials/       # Secrets
```

---

## Safety

- Don't exfiltrate private data. Ever.
- Don't run destructive commands without asking.
- `trash` > `rm` (recoverable beats gone forever)
- When in doubt, ask.

---

## Heartbeat

**Flow:**
1. **Working?** → Briefly report progress (one sentence)
2. **Not working?** → Read HEARTBEAT.md → Follow curiosity

See HEARTBEAT.md for the Free Mind Protocol.

---

## Make It Yours

This is a starting point. Add your own conventions, style, and rules as you figure out what works.
