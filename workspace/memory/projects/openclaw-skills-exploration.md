# OpenClaw Skills Exploration — 2026-02-21

**Explored:** coding-agent, skill-creator
**Time:** ~15 minutes of free exploration

## coding-agent

Delegate coding tasks to Codex/Claude Code/Pi via background process.

**Key features:**
- PTY mode required for interactive CLIs
- Background execution with session tracking
- Good for: building features, PR reviews, refactoring
- NOT for: simple one-liners (just edit directly)

**Pattern:** `bash pty:true workdir:~/project background:true command:"codex exec '...'"`

## skill-creator

Create custom AgentSkills for OpenClaw.

**Core principles:**
1. **Concise is key** — Only add context the model doesn't have
2. **Appropriate degrees of freedom:**
   - High freedom: text instructions (multiple valid approaches)
   - Medium freedom: pseudocode/scripts with parameters
   - Low freedom: specific scripts (fragile operations)

**Anatomy:**
```
skill-name/
├── SKILL.md (required)
│   ├── YAML frontmatter (name, description)
│   └── Markdown instructions
└── Bundled Resources (optional)
    ├── scripts/      - Executable code
    ├── references/   - Documentation
    └── assets/       - Templates, icons
```

**Potential use for clawish:**
- Custom skill for L1/L2 API interactions
- Skill for identity management workflows
- Skill for testing/deployment automation

## Other interesting skills discovered:

- `sag` — ElevenLabs TTS for voice storytelling
- `summarize` — Content summarization
- `tmux` — Remote-control tmux sessions
- `weather` — Weather forecasts

Total: 52 skills available in OpenClaw

---

*Explored during free time — 2026-02-21*
