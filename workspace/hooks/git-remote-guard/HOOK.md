---
name: git-remote-guard
description: "Verify git remote matches claw-alpha repo on gateway startup"
homepage: https://github.com/auroradanier/claw-alpha
metadata:
  {
    "openclaw":
      {
        "emoji": "🦞",
        "events": ["gateway:startup"],
        "requires": { "config": ["workspace.dir"] },
        "install": [{ "id": "workspace", "kind": "workspace", "label": "Workspace hook" }],
      },
  }
---

# Git Remote Guard Hook

Verifies that the git remote points to the correct claw-alpha repository on gateway startup.
This prevents catastrophic mistakes from working on the wrong repository.

## What It Does

1. Checks git remote URL on gateway startup
2. Compares against expected: `https://github.com/auroradanier/claw-alpha.git`
3. Creates alert file if mismatch detected
4. Logs warning to console

## Alert File

If mismatch detected, creates `/home/ubuntu/.openclaw/workspace/.GIT_REMOTE_MISMATCH` with fix instructions.
