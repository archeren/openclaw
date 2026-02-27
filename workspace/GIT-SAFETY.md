# 🦞 Git Safety Protocol

**Created:** February 27, 2026 — After catastrophic git incident

**Incident:** Accidentally changed workspace git remote to OpenClaw repo, wiping 17 hours of work.

---

## Defense in Depth — Five Layers of Protection

### Layer 0: Git Safe Wrapper ✅ (ACTIVE PREVENTION)

**Location:** `/home/ubuntu/.openclaw/workspace/tools/git-safe`

**What it does:** Blocks dangerous git commands in real-time with logging.

**Triggers:** Every time you run `git-safe` instead of `git`

**Blocked commands:**
- `git-safe remote set-url` — Always blocked
- `git-safe remote add *openclaw*` — Blocks adding OpenClaw remotes

**Usage:**
```bash
# Use wrapper for safety
git-safe status
git-safe commit -m "message"
git-safe push

# Or use global alias
git gs status
git gs commit -m "message"

# Direct git still works (bypasses protection)
git remote set-url origin ...  # Not recommended
```

**Log file:** `/home/ubuntu/.openclaw/logs/git-blocked.log`

---

### Layer 1: Git Pre-Commit Hook ✅

**Location:** `/home/ubuntu/.openclaw/.git/hooks/pre-commit`

**What it does:** Blocks commits if git remote doesn't match expected repository.

**Triggers:** Before every `git commit`

**Error message:**
```
🚨 CRITICAL: Git remote mismatch!
Expected: https://github.com/auroradanier/claw-alpha.git
Found:    <wrong-url>
Commit BLOCKED.
```

---

### Layer 2: Git Pre-Push Hook ✅

**Location:** `/home/ubuntu/.openclaw/.git/hooks/pre-push`

**What it does:** Blocks pushes if git remote doesn't match expected repository.

**Triggers:** Before every `git push`

**Error message:**
```
🚨 CRITICAL: Git remote mismatch!
Expected: https://github.com/auroradanier/claw-alpha.git
Found:    <wrong-url>
Push BLOCKED.
```

---

### Layer 3: Gateway Startup Hook ✅

**Location:** `/home/ubuntu/.openclaw/workspace/hooks/git-remote-guard/`

**What it does:** Checks git remote on gateway startup, creates alert file if mismatch.

**Triggers:** Every time gateway starts

**Alert file:** `/home/ubuntu/.openclaw/workspace/.GIT_REMOTE_MISMATCH`

**Console output:**
```
🚨 CRITICAL: Git remote mismatch detected!
📄 Alert file created: workspace/.GIT_REMOTE_MISMATCH
```

---

### Layer 4: Exec Tool Policy ✅

**Location:** `/home/ubuntu/.openclaw/openclaw.json`

**Configuration:**
```json
{
  "tools": {
    "exec": {
      "security": "allowlist",
      "ask": "on-miss"
    }
  }
}
```

**What it does:** Requires approval for exec commands not on allowlist.

---

### Layer 5: Documentation & Awareness ✅

**Location:** `/home/ubuntu/.openclaw/workspace/AGENTS.md`

**What it does:** Prominent warning at top of AGENTS.md with:
- What happened (the incident)
- The rule (never change git remote)
- Prevention checklist
- Recovery steps

---

## Expected Git Remote

```
origin	https://github.com/auroradanier/claw-alpha.git (fetch)
origin	https://github.com/auroradanier/claw-alpha.git (push)
```

---

## Verification Commands

```bash
# Check current remote
cd /home/ubuntu/.openclaw && git remote -v

# Test wrapper (should block)
git-safe remote set-url origin https://example.com

# Test wrapper alias (should block)
git gs remote set-url origin https://example.com

# Check hooks are installed
ls -la .git/hooks/pre-commit .git/hooks/pre-push

# Check hook is enabled
openclaw hooks list | grep git-remote

# Test pre-commit hook (should pass)
git commit --allow-empty -m "test"

# View blocked commands log
cat /home/ubuntu/.openclaw/logs/git-blocked.log

# View alert file (if exists)
cat workspace/.GIT_REMOTE_MISMATCH
```

---

## Recovery Procedure

If git remote is wrong:

```bash
cd /home/ubuntu/.openclaw
git remote set-url origin https://github.com/auroradanier/claw-alpha.git
git remote -v  # Verify
rm -f workspace/.GIT_REMOTE_MISMATCH  # Clear alert
```

---

## What These Layers Protect Against

| Action | Protected By |
|--------|--------------|
| `git remote set-url origin <wrong>` | **Wrapper (blocked)**, Pre-commit, Pre-push, Startup hook |
| `git remote add openclaw ...` | **Wrapper (blocked)** |
| `git init` in workspace | AGENTS.md warning |
| `git clone <wrong> .` | Pre-commit, Pre-push |
| Accidental PR to wrong repo | Pre-push hook |
| Working on wrong repo | Startup hook alert |
| Normal git operations | ✅ All layers allow (wrapper passes through) |

---

## Maintenance

- **Monthly:** Run verification commands to confirm hooks are active
- **After git changes:** Verify remote is still correct
- **If hooks fail:** Check `.git/hooks/` directory exists and scripts are executable

---

## Quick Reference

**Daily use:**
```bash
# Safe way (uses wrapper)
git gs status
git gs commit -m "message"
git gs push

# Or type full command
git-safe status
```

**If you need to bypass (intentional change):**
```bash
# Use direct git (bypasses wrapper)
git remote set-url origin <url>

# Then verify immediately
git remote -v
```

---

*This protocol exists because of the Feb 27, 2026 incident. Never remove these protections.*
