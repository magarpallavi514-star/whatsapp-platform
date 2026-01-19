#!/bin/bash

# WhatsApp Platform - Quick Start Script
# Starts both backend and frontend servers

echo "🚀 Starting WhatsApp Platform..."
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo -e "${BLUE}📁 Project Root:${NC} $SCRIPT_DIR"
echo ""

# Check if node_modules exist
if [ ! -d "$SCRIPT_DIR/backend/node_modules" ]; then
    echo -e "${BLUE}📦 Installing backend dependencies...${NC}"
    cd "$SCRIPT_DIR/backend"
    npm install
    cd "$SCRIPT_DIR"
fi

if [ ! -d "$SCRIPT_DIR/frontend/node_modules" ]; then
    echo -e "${BLUE}📦 Installing frontend dependencies...${NC}"
    cd "$SCRIPT_DIR/frontend"
    npm install
    cd "$SCRIPT_DIR"
fi

echo ""
echo -e "${GREEN}✅ Dependencies ready${NC}"
echo ""

# Start backend in background
echo -e "${BLUE}🔧 Starting Backend Server (Port 5050)...${NC}"
cd "$SCRIPT_DIR/backend"
npm run dev > backend.log 2>&1 &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"

# Give backend a moment to start
sleep 3

# Start frontend
echo -e "${BLUE}🎨 Starting Frontend Server (Port 3000)...${NC}"
cd "$SCRIPT_DIR/frontend"
npm run dev > frontend.log 2>&1 &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"

echo ""
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}✅ Servers Started!${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo -e "📱 ${BLUE}Frontend:${NC} http://localhost:3000"
echo -e "🔧 ${BLUE}Backend:${NC}  http://localhost:5050"
echo -e "📝 ${BLUE}API Docs:${NC} http://localhost:5050/api"
echo ""
echo -e "View logs:"
echo -e "  ${BLUE}Backend:${NC}  tail -f backend/backend.log"
echo -e "  ${BLUE}Frontend:${NC} tail -f frontend/frontend.log"
echo ""
echo -e "Stop servers with: ${BLUE}killall node${NC}"
echo ""

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
