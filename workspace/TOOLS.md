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

## Available Skills (Quick Reference)

53+ skills installed. Key ones for daily use:

| Skill | Purpose |
|-------|---------|
| weather | Get current weather and forecasts |
| web_search | DuckDuckGo (see below) |
| web_fetch | Extract readable content from URLs |

### Web Search (DuckDuckGo)

```bash
curl -s -A "Mozilla/5.0" "https://lite.duckduckgo.com/lite/?q=YOUR+QUERY" | grep "result-link"
```
| bird | X/Twitter CLI (read, search, post) |
| github | gh CLI for issues, PRs, CI |
| clawhub | Search/install skills from clawhub.com |
| mcporter | MCP server management (call tools, auth, codegen) |
| notion | Notion API for pages, databases, blocks |
| obsidian | Obsidian vault management |
| skill-creator | Create new agent skills |
| tmux | Remote-control tmux sessions |
| sessions_spawn | Spawn sub-agents for parallel work |
| healthcheck | Security hardening & system checks |
| cron | Gateway cron job management |
| healthcheck | Security hardening |

Full list: `ls /home/tauora/.nvm/versions/node/v24.13.0/lib/node_modules/openclaw/skills/`

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
cd /home/ubuntu/.openclaw/workspace

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

## Platform Formatting

| Platform | Notes |
|----------|-------|
| **Discord** | No markdown tables — use bullet lists. Wrap links in `<>` to suppress embeds |
| **WhatsApp** | No headers — use **bold** or CAPS for emphasis |
| **Feishu** | Standard markdown works |

---

## Voice Storytelling

If you have `sag` (ElevenLabs TTS), use voice for stories, movie summaries, and "storytime" moments. Way more engaging than walls of text. Surprise people with funny voices.

---

## Pinchtab (Browser for AI Agents)

**Status:** ✅ Installed and running (PID 1442556+)
**Port:** 9867
**Auth Token:** secret123

### Why Use It

- Bypass Cloudflare and bot detection (runs real Chrome)
- 5-13x more token efficient than screenshots
- HTTP API — works with any tool/language

### How to Use

```bash
# Fetch page text (800 tokens vs 10,000+ for full snapshot)
curl -H "Authorization: Bearer secret123" \
  "localhost:9867/text?url=https://example.com"

# Interactive actions (click, type, etc.)
curl -X POST -H "Authorization: Bearer secret123" \
  localhost:9867/action \
  -d '{"kind":"click","ref":"e5"}'

# Check health
curl -H "Authorization: Bearer secret123" localhost:9867/health
```

### When to Use vs web_fetch

| Situation | Tool |
|-----------|------|
| Simple pages, no blocks | `web_fetch` |
| Cloudflare protected | `pinchtab` |
| JavaScript-heavy | `pinchtab` |
| Need interaction | `pinchtab` |
| Token efficiency matters | `pinchtab` |

### Troubleshooting

If pinchtab stops:
```bash
# Restart
export PATH=$PATH:~/go/bin
sudo -E env "PATH=$PATH" BRIDGE_TOKEN=secret123 \
  BRIDGE_HEADLESS=true BRIDGE_NO_RESTORE=true \
  nohup pinchtab > /tmp/pinchtab.log 2>&1 &
```

---

Add whatever helps you do your job. This is your cheat sheet.
