#!/bin/bash
# 🦞 CLAW Git Auto-Backup
# Runs every 12 hours (midnight and noon) via system cron
# Independent of agent sessions — always backs up even if agent is offline

set -e

# Configuration
OPENCLAW_DIR="/home/ubuntu/.openclaw"
WORKSPACE_DIR="$OPENCLAW_DIR/workspace"
LOG_FILE="$WORKSPACE_DIR/logs/git-backup.log"
LOCK_FILE="/tmp/git-backup.lock"

# Ensure log directory exists
mkdir -p "$(dirname "$LOG_FILE")"

# Logging function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" >> "$LOG_FILE"
}

# Check if another backup is running
if [ -f "$LOCK_FILE" ]; then
    log "⚠️  Backup already running (lock file exists). Exiting."
    exit 0
fi

# Create lock file
touch "$LOCK_FILE"
trap "rm -f $LOCK_FILE" EXIT

log "🦞 Starting git backup..."

cd "$OPENCLAW_DIR"

# Check if there are any changes
if ! git status --porcelain > /dev/null 2>&1; then
    log "❌ Not a git repository or git error. Exiting."
    exit 1
fi

CHANGES=$(git status --porcelain 2>/dev/null | wc -l)

if [ "$CHANGES" -eq 0 ]; then
    log "✅ No changes to commit. Skipping backup."
else
    log "📝 Found $CHANGES changed file(s). Committing..."
    
    # Add all changes
    git add . 2>/dev/null || true
    
    # Commit with timestamp
    TIMESTAMP=$(date '+%Y-%m-%d %H:%M')
    git commit -m "🦞 Auto-backup: $TIMESTAMP" 2>/dev/null || {
        log "⚠️  Nothing to commit or commit failed."
    }
    
    # Push to remote
    log "📤 Pushing to remote..."
    if git push origin master 2>&1 | tee -a "$LOG_FILE"; then
        log "✅ Backup successful!"
    else
        log "❌ Push failed. Check SSH/auth configuration."
    fi
fi

log "🦞 Backup complete."
