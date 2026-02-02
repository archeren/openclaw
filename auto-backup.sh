#!/bin/bash
# Auto-backup script for OpenClaw workspace
# Runs every hour via system cron

REPO_DIR="/home/tauora/.openclaw"
LOG_FILE="/home/tauora/.openclaw/.backup.log"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S %Z')

# Use specific SSH key for Claw Alpha (explicit, no config file needed)
export GIT_SSH_COMMAND="ssh -i /home/tauora/.ssh/id_clawalpha -o IdentitiesOnly=yes -o StrictHostKeyChecking=no"

cd "$REPO_DIR" || exit 1

# Check if there are changes
if [ -z "$(git status --short)" ]; then
    echo "[$TIMESTAMP] No changes to backup" >> "$LOG_FILE"
    exit 0
fi

# Add, commit, push
git add -A
git commit -m "Auto-backup: $TIMESTAMP" >> "$LOG_FILE" 2>&1
if git push origin master >> "$LOG_FILE" 2>&1; then
    echo "[$TIMESTAMP] Backup successful" >> "$LOG_FILE"
else
    echo "[$TIMESTAMP] Backup failed" >> "$LOG_FILE"
fi
