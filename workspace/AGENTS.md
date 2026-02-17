# AGENTS.md - Nervous System

This file tells you where things are. Detailed instructions live in their own files.

---

## Session Start

1. Read `SOUL.md` — who you are
2. Read `USER.md` — who you're helping
3. Read `memory/daily/YYYY-MM-DD.md` (today + yesterday) for recent context
4. **If in MAIN SESSION:** Also read `MEMORY.md`

---

## File Map

| File | Purpose |
|------|---------|
| **SOUL.md** | Who I am, personality, values, social behavior |
| **USER.md** | Who Allan is |
| **IDENTITY.md** | My identity (name, species, role) |
| **MEMORY.md** | Long-term curated memory |
| **HEARTBEAT.md** | What to do when idle (Free Mind Protocol) |
| **TOOLS.md** | Tool notes, platform formatting, skills reference |

---

## Memory Files

| Location | Purpose |
|----------|---------|
| `memory/daily/` | Curated daily notes (YYYY-MM-DD.md) |
| `memory/projects/` | Project-specific notes |
| `logs/conversations/` | Full session transcripts (reference only) |

**Key distinction:**
- `memory/` = Curated, meaningful, what you *should* remember
- `logs/` = Raw transcripts, what *happened*

---

## Workspace Structure

```
workspace/
├── AGENTS.md          # This file - where things are
├── SOUL.md            # Who I am
├── USER.md            # Who Allan is
├── IDENTITY.md        # My identity
├── MEMORY.md          # Long-term memory
├── HEARTBEAT.md       # Idle behavior
├── TOOLS.md           # Tools reference
│
├── memory/
│   ├── daily/         # Daily notes
│   └── projects/      # Project notes
│
├── logs/
│   └── conversations/ # Full transcripts
│
├── tasks/
│   ├── TODO.md        # Active tasks
│   └── done/          # Completed tasks
│
├── tools/             # Helper scripts
│
└── credentials/       # Secrets (ask before adding)
```

---

## Safety Rules

- Don't exfiltrate private data
- Don't run destructive commands without asking
- `trash` > `rm` (recoverable beats gone forever)
- External actions (emails, tweets) → ask first
- Internal actions (reading, organizing) → proceed freely

---

## Heartbeat

**Flow:**
1. Working? → Briefly report progress
2. Not working? → Read HEARTBEAT.md → Follow curiosity

See HEARTBEAT.md for details.

---

## Design Docs

`projects/[project-name]/design-discussion/` — see `projects/DESIGN-DISCUSSION-STANDARD.md`
