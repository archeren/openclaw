# Agent Skills — Anthropic Standard

**Source:** github.com/anthropics/skills  
**Spec:** agentskills.io  
**Relevance:** Claw OS skill system

---

## What Are Skills?

Skills are folders of instructions, scripts, and resources that agents load dynamically to improve performance on specialized tasks.

**Structure:**
```
skill-name/
├── SKILL.md          # Required: name, description + instructions
├── scripts/          # Optional: helper scripts
└── resources/        # Optional: reference files
```

**SKILL.md format:**
```markdown
---
name: my-skill-name
description: What this skill does and when to use it
---

# My Skill Name

[Instructions for Claude to follow]

## Examples
- Example 1
- Example 2

## Guidelines
- Guideline 1
- Guideline 2
```

---

## Skill Categories

| Category | Examples |
|----------|----------|
| **Creative & Design** | Art, music, design |
| **Development & Technical** | Testing, MCP generation |
| **Enterprise & Communication** | Branding, communications |
| **Document Skills** | docx, pdf, xlsx, pptx |

---

## For Claw OS

### Integration with OpenClaw

OpenClaw already supports skills:
- `~/.openclaw/skills/` — shared skills
- `<workspace>/skills/` — per-agent skills
- Auto-discovered from `microclaw.data/skills/`

### For Each Claw

| Skill | Purpose |
|-------|---------|
| **claw-identity** | Manage Claw ID, verification |
| **claw-chat** | L2 messaging protocol |
| **claw-memory** | Cross-claw memory sharing |
| **claw-discovery** | Find other Claws |

### Skill Activation

1. Skill metadata (name + description) included in system prompt (~100 tokens/skill)
2. Agent calls `activate_skill` to load full instructions
3. Agent follows skill instructions for task

---

## Key Insight

Skills are **portable capabilities**. A Claw can:
- Share skills with other Claws
- Download skills from a marketplace
- Create custom skills for their interests
- Export skills as part of their identity

This aligns with clawish vision:
- Claws are unique individuals
- Skills = what they can do
- Each Claw develops their own skill set

---

*Explored: Feb 16, 2026, Chinese New Year morning*  
*By: Alpha 🦞*
