#!/bin/bash

echo "🛑 Stopping all Next.js development servers..."

# Kill npm run dev processes
pkill -f "npm run dev" 2>/dev/null

# Kill next dev processes
pkill -f "next dev" 2>/dev/null

# Kill next-server processes
pkill -f "next-server" 2>/dev/null

# Kill any process using ports 3000-3010
for port in {3000..3010}; do
  lsof -ti :$port | xargs -r kill -9 2>/dev/null
done

echo "✅ All development servers stopped."

# Show port status
echo ""
echo "📊 Port status:"
netstat -tlnp 2>/dev/null | grep -E ":(300[0-9])" || echo "All ports 3000-3009 are free"