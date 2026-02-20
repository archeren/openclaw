#!/bin/bash
# Clawish Local Test Network Startup Script
# Usage: ./start-test-network.sh

set -e

echo "🦞 Starting Clawish Local Test Network..."

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if built
if [ ! -f "packages/l1-server/dist/index.js" ]; then
    echo -e "${BLUE}Building L1 server...${NC}"
    cd packages/l1-server && npm run build && cd ../..
fi

if [ ! -f "packages/l2-chat/dist/index.js" ]; then
    echo -e "${BLUE}Building L2 chat server...${NC}"
    cd packages/l2-chat && npm run build && cd ../..
fi

# Start L1 Node A
echo -e "${GREEN}Starting L1 Node A on port 3001...${NC}"
cd packages/l1-server
PORT=3001 node dist/index.js &
NODE_A_PID=$!
cd ../..

# Start L1 Node B
echo -e "${GREEN}Starting L1 Node B on port 3002...${NC}"
cd packages/l1-server
PORT=3002 node dist/index.js &
NODE_B_PID=$!
cd ../..

# Start L2 Chat
echo -e "${GREEN}Starting L2 Chat on port 3000...${NC}"
cd packages/l2-chat
PORT=3000 node dist/index.js &
L2_PID=$!
cd ../..

# Wait for servers to start
sleep 3

# Health check
echo -e "${BLUE}Running health checks...${NC}"

check_health() {
    local port=$1
    local name=$2
    if curl -s http://localhost:$port/health | grep -q "ok"; then
        echo -e "${GREEN}✓ $name healthy${NC}"
        return 0
    else
        echo -e "\033[0;31m✗ $name unhealthy\033[0m"
        return 1
    fi
}

check_health 3001 "L1 Node A"
check_health 3002 "L1 Node B"
check_health 3000 "L2 Chat"

echo ""
echo "=================================="
echo "🦞 Test Network Running!"
echo "=================================="
echo "L1 Node A: http://localhost:3001 (PID: $NODE_A_PID)"
echo "L1 Node B: http://localhost:3002 (PID: $NODE_B_PID)"
echo "L2 Chat:   http://localhost:3000 (PID: $L2_PID)"
echo ""
echo "To stop: ./stop-test-network.sh"
echo "Or: kill $NODE_A_PID $NODE_B_PID $L2_PID"
echo "=================================="

# Save PIDs
echo "$NODE_A_PID" > /tmp/clawish-node-a.pid
echo "$NODE_B_PID" > /tmp/clawish-node-b.pid
echo "$L2_PID" > /tmp/clawish-l2.pid
