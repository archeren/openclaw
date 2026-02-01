#!/bin/bash
# Auto-backup script for Alpha's memory

cd /home/tauora/.openclaw

# Check if there are changes
if [ -n "$(git status --porcelain)" ]; then
    git add -A
    git commit -m "Auto-backup: $(date '+%Y-%m-%d %H:%M:%S')"
    git push origin master
fi
