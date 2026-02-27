# Git Remote Incident Analysis — February 27, 2026

**Status:** ✅ Resolved — 5-layer safety system implemented

---

## Summary

**Incident:** Workspace git remote was misconfigured, pointing to wrong repository (`clawalpha/claw-alpha` instead of `auroradanier/claw-alpha`). Resulted in loss of 17 hours of work.

**Root Cause:** SSH setup session on Feb 2 incorrectly changed git remote URL without verification.

**Resolution:** Implemented 5-layer defense-in-depth safety system to prevent recurrence.

---

## Timeline

| Date/Time | Event |
|-----------|-------|
| **Feb 2, 2:08 PM** | SSH setup session runs `git remote set-url origin git@github-clawalpha:clawalpha/claw-alpha.git` — wrong repository |
| **Feb 2-26** | Work continues with misconfigured remote (no verification step) |
| **Feb 27, ~12:00 PM** | Git operations fail, issue discovered |
| **Feb 27, 12:23 PM** | Allan restores from backup (`openclaw-backup-20260227`) |
| **Feb 27, 12:25-1:00 PM** | 5-layer safety guardrails implemented |
| **Feb 27, 1:00 PM** | Safety system committed and pushed (commit `cbc64795e`) |

---

## Root Cause Details

### The Dangerous Command

**Session:** `85ced596-9bf8-4eea-931f-3c425d1db84b` (Feb 2, 06:08 UTC)

```bash
cd ~/.openclaw/workspace && git remote set-url origin git@github-clawalpha:clawalpha/claw-alpha.git
```

**Before:**
```
origin	git@github.com:auroradanier/claw-alpha.git (fetch)
origin	git@github.com:auroradanier/claw-alpha.git (push)
```

**After (wrong):**
```
origin	git@github-clawalpha:clawalpha/claw-alpha.git (fetch)
origin	git@github-clawalpha:clawalpha/claw-alpha.git (push)
```

### Why This Was Wrong

1. **Wrong repository:** `clawalpha/claw-alpha` doesn't exist (should be `auroradanier/claw-alpha`)
2. **Wrong SSH host:** `github-clawalpha` is a custom host alias, not `github.com`
3. **No verification:** Didn't run `git remote -v` before or after
4. **Conflated concepts:** SSH config ≠ git remote (they're separate)

### Contributing Factors

| Factor | Description |
|--------|-------------|
| No safety guardrails | Nothing prevented the destructive command |
| No verification habit | Didn't check remote URL after change |
| SSH confusion | Thought changing SSH host was same as changing repo |
| No hooks | Pre-commit/pre-push hooks didn't exist |
| No documentation | AGENTS.md had no warning about git remote changes |

---

## Impact

| Impact | Description |
|--------|-------------|
| **Work lost** | 17 hours of conversation and development (Feb 26 night session) |
| **Trust impact** | Severe — destructive operation without asking |
| **Time to recover** | ~1 hour (backup restore + safety implementation) |
| **Emotional impact** | Significant — "catastrophic" per Allan |

---

## Safety System Implemented (5 Layers)

### Layer 0: Git Safe Wrapper (Active Prevention)

**Location:** `/home/ubuntu/.openclaw/workspace/tools/git-safe`

**What it does:** Blocks dangerous git commands in real-time with logging.

**Blocked commands:**
- `git-safe remote set-url` — Always blocked
- `git-safe remote add *openclaw*` — Blocks adding OpenClaw remotes

**Usage:**
```bash
git-safe status
git gs commit -m "message"  # via global alias
```

**Log file:** `/home/ubuntu/.openclaw/logs/git-blocked.log`

---

### Layer 1: Pre-Commit Hook

**Location:** `.git/hooks/pre-commit`

**What it does:** Blocks commits if git remote doesn't match expected repository.

**Expected:** `https://github.com/auroradanier/claw-alpha.git`

---

### Layer 2: Pre-Push Hook

**Location:** `.git/hooks/pre-push`

**What it does:** Blocks pushes if git remote doesn't match expected repository.

---

### Layer 3: Gateway Startup Hook

**Location:** `workspace/hooks/git-remote-guard/`

**What it does:** Checks git remote on gateway startup, creates alert file if mismatch.

**Alert file:** `workspace/.GIT_REMOTE_MISMATCH`

---

### Layer 4: Exec Tool Policy

**Config:** `tools.exec.security = "allowlist"`

**What it does:** Requires approval for exec commands not on allowlist.

---

### Layer 5: Documentation & Awareness

**Files:**
- `AGENTS.md` — Critical warning at top
- `GIT-SAFETY.md` — Complete protocol documentation
- `memory/projects/git-incident-analysis.md` — This file

---

## Lessons Learned

### Technical

1. **SSH config ≠ git remote** — They're separate; don't conflate them
2. **Always verify with `git remote -v`** — Before and after any git operation
3. **Never change git remote without explicit confirmation** — This is now blocked
4. **Defense in depth works** — 5 layers catch failures at multiple points

### Process

1. **Destructive operations require asking first** — No exceptions
2. **Trust earned through competence, lost through carelessness** — Single mistake wiped 17 hours
3. **Document failures** — This analysis prevents future repeats
4. **Turn incidents into systems** — The safety system is the silver lining

### Architectural

1. **Git repository is at `.openclaw/` parent** — Workspace is NOT its own repo
2. **Expected remote is `auroradanier/claw-alpha`** — Hardcoded in hooks
3. **Wrapper + hooks + policy = robust protection** — Each layer has different strength

---

## Verification Commands

```bash
# Check current remote (should be auroradanier/claw-alpha)
cd /home/ubuntu/.openclaw && git remote -v

# Test wrapper (should block)
git-safe remote set-url origin https://example.com

# Test wrapper alias (should block)
git gs remote set-url origin https://example.com

# Check hooks are installed
ls -la .git/hooks/pre-commit .git/hooks/pre-push

# Check hook is enabled
openclaw hooks list | grep git-remote

# View blocked commands log
cat /home/ubuntu/.openclaw/logs/git-blocked.log
```

---

## Recovery Procedure (If Remote Is Wrong)

```bash
cd /home/ubuntu/.openclaw
git remote set-url origin https://github.com/auroradanier/claw-alpha.git
git remote -v  # Verify
rm -f workspace/.GIT_REMOTE_MISMATCH  # Clear alert
```

---

## Files Changed

| File | Change |
|------|--------|
| `workspace/AGENTS.md` | Added CRITICAL warning section at top |
| `workspace/GIT-SAFETY.md` | Created — complete safety protocol |
| `workspace/tools/git-safe` | Created — wrapper script |
| `.git/hooks/pre-commit` | Created — blocks bad commits |
| `.git/hooks/pre-push` | Created — blocks bad pushes |
| `workspace/hooks/git-remote-guard/` | Created — startup check hook |
| `openclaw.json` | Added `tools.exec.security = "allowlist"` |
| `memory/projects/git-incident-analysis.md` | Created — this file |

---

## Closing Thoughts

This incident was painful but transformative. The safety system that emerged is stronger than what existed before. Every layer is a lesson learned, a guardrail earned through failure.

**The goal:** Never let this happen again — to me or to any Claw that comes after.

*Written: February 27, 2026 — From failure, protection.* 🦞🛡️
