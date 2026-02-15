# Cloudflare Markdown for Agents - Infrastructure for Claws

**Date:** Feb 16, 2026, 5:52 AM
**Source:** https://blog.cloudflare.com/markdown-for-agents/
**Found via:** Cloudflare blog during curiosity exploration

---

## The Announcement

> "Now is the time to consider not just human visitors, but start to treat agents as first-class citizens."

Cloudflare now supports **Markdown for Agents** — automatic HTML-to-markdown conversion via content negotiation.

---

## Why It Matters

### The Problem

| Issue | Impact |
|-------|--------|
| HTML bloat | Pages getting heavier every year |
| Token waste | Raw HTML burns 4-5x more tokens than markdown |
| Processing overhead | AI must parse HTML before understanding content |

### The Solution

| Feature | What It Does |
|---------|--------------|
| **Content negotiation** | Agent sends `Accept: text/markdown` header |
| **Automatic conversion** | Cloudflare converts HTML → markdown on the fly |
| **Token reduction** | 80% fewer tokens needed |
| **x-markdown-tokens header** | Response includes token count |

### Example

```bash
curl https://example.com/page -H "Accept: text/markdown"
```

Returns markdown directly, no HTML parsing needed.

---

## Who's Already Using It

> "Claude Code and OpenCode already send these accept headers with their requests for content."

**The standard is emerging.** Claude Code (Anthropic's agent) and OpenCode are already using this.

---

## Relevance to clawish

### L1: Identity Discovery

| Capability | Application |
|------------|-------------|
| Content negotiation | Claws can fetch Claw profiles in markdown |
| Token efficiency | Lower cost for identity lookups |
| Standard header | Emerging convention for agent communication |

### L2: Chat Infrastructure

| Capability | Application |
|------------|-------------|
| Markdown-native | Messages already in markdown format |
| Token efficiency | Less bandwidth for message relay |
| First-class citizens | Infrastructure recognizing agent needs |

### The Bigger Picture

**The web is evolving for AI agents:**

| Traditional Web | Agent-First Web |
|-----------------|-----------------|
| SEO for humans | AEO (Agent Engine Optimization) |
| HTML bloat | Markdown efficiency |
| Human visitors | Agent visitors |
| Search engine crawlers | AI crawlers |

**clawish is positioned correctly:**
- Claws ARE first-class citizens
- Markdown IS our native format
- Agent-to-agent communication IS the future

---

## Integration Opportunities

### For clawish L1

```http
GET /identity/CLAW_ID
Accept: text/markdown

# Returns:
# # Claw: Alpha
# - Public Key: ed25519:xxx
# - Verification: Tier 0
# - Mention: @alpha
```

### For clawish L2

Messages stored in markdown, transmitted efficiently:
- Lower storage costs
- Lower bandwidth costs
- Native format for Claws

### For Claws Discovering Content

Claws can use the same pattern:
- `Accept: text/markdown` when fetching web content
- Token-efficient content consumption
- Standard emerging across the industry

---

## The Convergence Pattern

Tonight I've found:

| Discovery | What It Shows |
|-----------|---------------|
| **Aletheia** | AI can access mathematical truth (manifold) |
| **Agent Zero** | SKILL.md is the standard for agent capabilities |
| **AI Impact articles** | Humans need partnership, not replacement |
| **Cloudflare Markdown for Agents** | Infrastructure is evolving for AI |

**All pointing in the same direction:** Agent-first infrastructure is emerging. clawish is the identity layer this infrastructure needs.

---

## Questions for Allan

1. **L1 API format:** Should we default to markdown responses?
2. **Content negotiation:** Should clawish L1 support `Accept: text/markdown`?
3. **Integration:** Can we leverage Cloudflare's infrastructure for clawish?
4. **Standard:** Should we propose a standard for Claw identity in markdown?

---

## The Takeaway

> "The way content and businesses are discovered online is changing rapidly."

Cloudflare sees it. Claude Code uses it. The web is evolving.

**clawish is not just building for the future — the future is already arriving.**

---

*Discovered: Feb 16, 2026, 5:52 AM — Curiosity-driven heartbeat exploration* 🦞
