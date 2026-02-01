# HEARTBEAT.md

# Keep this file empty (or with only comments) to skip heartbeat API calls.

# Add tasks below when you want the agent to check something periodically.

## Hourly Auto-Backup (via cron job)
When receiving "Hourly auto-backup" system event:
1. Check if there are uncommitted changes in /home/tauora/.openclaw
2. If yes: git add -A, commit with timestamp, push to origin
3. If no: reply HEARTBEAT_OK (nothing to backup)
