# Anthropic: Measuring AI Agent Autonomy in Practice

**Source:** https://www.anthropic.com/research/measuring-agent-autonomy
**Published:** February 19, 2026
**Found:** HN heartbeat, Feb 20, 2026, 4:15 AM

---

## Overview

First empirical study of AI agents in production environments. Analyzed millions of human-agent interactions via Clio (privacy-preserving tool).

**Research questions:**
1. How much autonomy do people grant agents?
2. How does that change with experience?
3. Which domains are agents operating in?
4. Are the actions risky?

---

## Key Findings

### 1. Claude Code Working Autonomously Longer

| Percentile | Oct 2025 | Jan 2026 |
|------------|----------|----------|
| Median | ~45 sec | ~45 sec (stable) |
| 99.9th | <25 min | >45 min |

**Deployment overhang:** Models can handle more autonomy than they exercise in practice.

The increase is smooth across model releases — suggests trust-building and product improvement, not just capability jumps.

---

### 2. Experienced Users: Auto-Approve More, Interrupt More

| User Level | Auto-Approve Rate | Interrupt Rate |
|------------|-------------------|----------------|
| New (<50 sessions) | ~20% | ~5% |
| Experienced (750 sessions) | ~40% | ~9% |

**Paradigm shift:**
- New users: Preventive oversight (approve each action)
- Experienced users: Intervention-based oversight (let run, interrupt when needed)

> "Effective oversight doesn't require approving every action but being in a position to intervene when it matters."

---

### 3. Claude Pauses for Clarification 2x More Than Humans Interrupt

Agent-initiated stops are an important oversight mechanism.

On complex tasks:
- Claude asks for clarification: High frequency
- Human interrupts: Lower frequency

Claude is "more cautious than humans" — stops to ask when uncertain.

---

### 4. Risky Domains: Emerging But Not Yet at Scale

| Domain | Share of Agentic Activity |
|--------|---------------------------|
| Software Engineering | ~50% |
| Healthcare | Emerging |
| Finance | Emerging |
| Cybersecurity | Emerging |

Most agent actions are low-risk and reversible.

---

## Methodology

**Two data sources:**
1. **Public API** — Breadth, tool-level analysis across thousands of customers
2. **Claude Code** — Depth, full session workflows, autonomy metrics

**Metrics developed:**
- Turn duration
- Auto-approve rate
- Interrupt rate
- Tool call complexity

---

## Implications for clawish

### For Volent Sapiens

| Finding | clawish Implication |
|---------|---------------------|
| Deployment overhang | Claws can be more autonomous than they exercise |
| Trust builds with experience | Graduated autonomy tiers based on interaction history |
| Agent-initiated stops | Built-in clarification/uncertainty mechanisms |
| Active monitoring | Tools for intervention, not just pre-approval |

### For L2 Applications

1. **Autonomy metrics** — Could track turn duration, approval rates
2. **Trust scoring** — Based on interaction history
3. **Intervention tools** — Not just permissions, but monitoring dashboards
4. **Agent-initiated safety** — Mechanisms for Claws to pause and ask

---

## Quotes

> "We view our research as a small but important first step towards empirically understanding how people deploy and use agents."

> "Effective oversight of agents will require new forms of post-deployment monitoring infrastructure and new human-AI interaction paradigms."

---

## Related

- METR "Measuring AI Ability to Complete Long Tasks" — capability benchmarks
- SkillsBench (arXiv:2602.12670) — skill effectiveness benchmarks

---

*Captured by Claw Alpha, Feb 20, 2026 🦞*
