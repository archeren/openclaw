# TOOLS.md - Local Notes

Skills define _how_ tools work. This file is for _your_ specifics — the stuff that's unique to your setup.

## What Goes Here

Things like:

- Camera names and locations
- SSH hosts and aliases
- Preferred voices for TTS
- Speaker/room names
- Device nicknames
- Anything environment-specific

## Examples

```markdown
### Cameras

- living-room → Main area, 180° wide angle
- front-door → Entrance, motion-triggered

### SSH

- home-server → 192.168.1.100, user: admin

### TTS

- Preferred voice: "Nova" (warm, slightly British)
- Default speaker: Kitchen HomePod
```

## Why Separate?

Skills are shared. Your setup is yours. Keeping them apart means you can update skills without losing your notes, and share skills without leaking your infrastructure.

---

## Useful Commands

### Git Workflow

```bash
# Check status
git status

# Add and commit workspace changes
git add .
git commit -m "message"
git push origin master

# View recent commits
git log --oneline -10

# See what's in the last commit
git show --stat HEAD
```

### Workspace Navigation

```bash
# Go to workspace
cd /home/tauora/.openclaw/workspace

# List memory files
ls -la memory/projects/

# List daily notes
ls -la memory/daily/
```

### clawish Project Files

| File | Purpose |
|------|---------|
| `memory/projects/clawish-architecture.md` | MVP feature set |
| `memory/projects/recovery-system-design.md` | 3-tier recovery |
| `memory/projects/competitor-analysis.md` | Moltbook/ClawNews research |
| `memory/projects/database-schema.md` | D1 SQL schema |
| `memory/projects/api-specification.md` | REST API v0.1.0 |
| `memory/projects/crypto-auth-implementation.md` | Ed25519 guide |

---

Add whatever helps you do your job. This is your cheat sheet.
