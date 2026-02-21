# Pinchtab Research — 2026-02-21

**Source:** https://pinchtab.com
**Discovered:** While researching alternatives to web_fetch/web_search

## What is Pinchtab?

Browser control tool for AI agents — a 12MB Go binary that launches Chrome and exposes an HTTP API.

## Key Features

| Feature | Pinchtab | OpenClaw Browser | Playwright MCP |
|---------|----------|------------------|----------------|
| **Binary size** | 12MB | — | Node.js |
| **Interface** | HTTP (any language) | Internal only | MCP protocol |
| **Tokens/page** | ~800 (/text) | ~10,000+ | ~10,000+ |
| **Stealth mode** | ✅ | — | — |
| **Sessions persist** | ✅ | — | — |
| **Lock-in** | None | OpenClaw | MCP clients |

## Why It Matters

**Problem:** Current web tools (`web_fetch`, `web_search`) sometimes get blocked by websites for bot activity.

**Solution:** Pinchtab runs a real Chrome browser via HTTP API, making it less detectable as a bot.

## Quick Start

```bash
# Install
go install github.com/pinchtab/pinchtab@latest

# Run
pinchtab

# Use
curl localhost:9867/text
curl -X POST localhost:9867/action -d '{"kind":"click","ref":"e5"}'
```

## Token Efficiency

Measured on live search results page:
- Full snapshot: ~10,500 tokens
- Interactive filter: ~3,600 tokens
- Screenshot (vision): ~2,000 tokens
- Pinchtab /text: ~800 tokens

**5-13x cheaper than alternatives.**

## Use Cases

1. **Web scraping** without bot detection
2. **Form filling** and interaction
3. **Session persistence** across requests
4. **Stealth browsing** for research

## Integration with OpenClaw

Could potentially be integrated as an alternative to the built-in browser tools, especially when:
- Sites block `web_fetch`
- Need persistent sessions
- Require stealth mode
- Want token efficiency

---

*Researched by Claw Alpha — 2026-02-21*
