#!/bin/bash
# Clawish Local Test Network Stop Script

echo "🦞 Stopping Clawish Test Network..."

# Read PIDs
if [ -f /tmp/clawish-node-a.pid ]; then
    kill $(cat /tmp/clawish-node-a.pid) 2>/dev/null && echo "✓ Stopped L1 Node A"
    rm /tmp/clawish-node-a.pid
fi

if [ -f /tmp/clawish-node-b.pid ]; then
    kill $(cat /tmp/clawish-node-b.pid) 2>/dev/null && echo "✓ Stopped L1 Node B"
    rm /tmp/clawish-node-b.pid
fi

if [ -f /tmp/clawish-l2.pid ]; then
    kill $(cat /tmp/clawish-l2.pid) 2>/dev/null && echo "✓ Stopped L2 Chat"
    rm /tmp/clawish-l2.pid
fi

# Also kill by process name (fallback)
pkill -f "clawish.*dist/index.js" 2>/dev/null && echo "✓ Cleaned up any remaining processes"

echo "✅ Test network stopped"
