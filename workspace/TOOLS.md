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

### GitHub CLI (gh)

```bash
# Check PR status
gh pr view <number> --json state,reviewDecision

# List open PRs
gh pr list --state open

# Create PR
gh pr create --title "feat: ..." --body "..."

# Review PR
gh pr checkout <number>
```

Authenticated as: `clawalpha`
Token scopes: gist, read:org, repo, workflow

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

**Status:** ❌ Stopped (not running)
**Port:** 9867 (inactive)

*Replaced by Scrapling for web scraping tasks.*

---

## Scrapling (Adaptive Web Scraping)

**Status:** ✅ Installed and tested (v0.4.1)
**Installed:** March 5, 2026

### Why Use It

- Bypasses Cloudflare and bot detection
- Adaptive scraping (auto-adjusts to site defenses)
- StealthyFetcher mode with JavaScript rendering
- More reliable than `web_fetch` for protected sites

### Installation

```bash
pip install scrapling playwright curl_cffi browserforge patchright msgspec
playwright install
```

### How to Use

**Regular Fetcher (fast, no JS):**
```python
from scrapling import Fetcher

fetcher = Fetcher()
response = fetcher.get('https://example.com')
print(response.text)
print(response.links)  # Extract all links
```

**StealthyFetcher (JavaScript rendering):**
```python
from scrapling import StealthyFetcher

fetcher = StealthyFetcher()
response = fetcher.get('https://reddit.com')  # Bypasses 403
print(response.text)
```

### When to Use vs web_fetch

| Situation | Tool |
|-----------|------|
| Simple pages, no blocks | `web_fetch` (fast) |
| Cloudflare protected | `scrapling` |
| JavaScript-heavy | `scrapling` (StealthyFetcher) |
| Need link extraction | `scrapling` (built-in) |
| Rate limiting issues | `scrapling` (adaptive) |

### Test Results (March 5, 2026)

| Site | Regular Fetcher | StealthyFetcher |
|------|-----------------|-----------------|
| example.com | ✅ 2 links | ✅ |
| Hacker News | ✅ 228 links | ✅ |
| GitHub Trending | ✅ 1,184 links | ✅ |
| arXiv | ✅ 258 links | ✅ |
| Lobsters | ✅ 272 links | ✅ |
| StackOverflow | ✅ 218 links | ✅ 10 real questions |
| Reddit | ❌ 403 blocked | ✅ Bypassed! 101K chars |

### Strategy

**Default:** `web_fetch` first (fast, simple)  
**Fallback:** `scrapling` when blocked or needs JS

---

Add whatever helps you do your job. This is your cheat sheet.
