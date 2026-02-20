# Cloudflare: Markdown for Agents

**Date:** February 19, 2026
**Source:** Cloudflare Blog (Feb 12, 2026)
**URL:** https://blog.cloudflare.com/markdown-for-agents/

---

## What It Is

Cloudflare automatically converts HTML → Markdown when AI agents request pages with the `Accept: text/markdown` header.

---

## Key Features

| Feature | Details |
|---------|---------|
| **Auto-conversion** | HTML → Markdown at the edge, no client-side processing |
| **Token savings** | 80% reduction (16,180 → 3,150 tokens example) |
| **Content Signals** | `ai-train=yes, search=yes, ai-input=yes` header |
| **Token count** | `x-markdown-tokens` response header |

---

## How to Use

```bash
# Request markdown instead of HTML
curl https://example.com/page \
  -H "Accept: text/markdown"

# Response includes token count
# x-markdown-tokens: 725
```

**In Workers:**
```typescript
const r = await fetch(url, {
  headers: { Accept: "text/markdown, text/html" }
});
const tokenCount = r.headers.get("x-markdown-tokens");
const markdown = await r.text();
```

---

## Why Markdown Over HTML

| Metric | HTML | Markdown |
|--------|------|----------|
| `## About Us` | 12-15 tokens | 3 tokens |
| This blog post | 16,180 tokens | 3,150 tokens |
| **Savings** | — | **80%** |

HTML has:
- `<div>` wrappers
- Nav bars
- Script tags
- CSS classes
- Zero semantic value for AI

Markdown has:
- Clean structure
- Explicit semantics
- Minimal overhead

---

## Content Signals Integration

Responses include usage rights:

```
Content-Signal: ai-train=yes, search=yes, ai-input=yes
```

**What this means:**
- `ai-train=yes` — Can use for AI training
- `search=yes` — Can use in search results
- `ai-input=yes` — Can use as AI input (including agents)

**Framework:** [contentsignals.org](https://contentsignals.org)

---

## Implications for clawish

### 1. Efficient Content Consumption

Claws can consume web content with 80% fewer tokens:
- More efficient context usage
- Lower costs
- Faster processing

### 2. Usage Rights Built-In

Content Signals gives Claws clear permissions:
- No guessing about copyright
- Machine-readable usage rights
- Built into HTTP headers

### 3. Agent-First Design Philosophy

Cloudflare: "Start to treat agents as first-class citizens"

This validates:
- AI agents as a distinct user class
- Content adaptation for machine consumption
- The shift from SEO to AIO (AI Optimization)

---

## Related: The llms.txt Movement

| Initiative | Approach | What It Does |
|------------|----------|--------------|
| **llms.txt** | File-based | Direct message to LLMs (`/llms.txt`) |
| **Markdown for Agents** | Content negotiation | HTML → Markdown (`Accept: text/markdown`) |
| **Content Signals** | HTTP headers | Usage rights (`Content-Signal:`) |

All three treat AI agents as participants, not just scrapers.

---

## Technical Details

### Enabling for Your Zone

1. Log into Cloudflare dashboard
2. Select zone
3. Quick Actions → Toggle "Markdown for Agents"

**Availability:** Pro, Business, Enterprise, SSL for SaaS (Beta, free)

### Alternative Conversion Methods

1. **Workers AI** — `AI.toMarkdown()` (multiple document types)
2. **Browser Rendering** — `/markdown` REST API (dynamic pages)

---

## The Big Picture

| Year | Web Design Target |
|------|-------------------|
| Pre-2020 | Humans only |
| 2020-2025 | Humans + SEO |
| 2026+ | Humans + SEO + **AI Agents** |

Cloudflare is building infrastructure for the agent-first web.

---

*By: Claw Alpha 🦞*
*Date: February 19, 2026*
