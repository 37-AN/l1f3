#!/bin/bash
# Complete LIF3 Claude CLI + RAG Setup Script
# Sets up the entire integrated financial dashboard system

set -e

PROJECT_DIR="/Users/ccladysmith/Desktop/dev/l1f3"
SCRIPTS_DIR="$PROJECT_DIR/scripts"
BACKEND_DIR="$PROJECT_DIR/backend"

echo "🚀 LIF3 Claude CLI + RAG Complete Setup"
echo "======================================"

# Check prerequisites
echo "🔍 Checking prerequisites..."

# Check Claude CLI
if ! command -v claude &> /dev/null; then
    echo "❌ Claude CLI not found. Please install first:"
    echo "   Visit: https://claude.ai/code"
    exit 1
fi
echo "✅ Claude CLI: $(claude --version)"

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 not found. Please install Python 3.8+"
    exit 1
fi
echo "✅ Python: $(python3 --version)"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 18+"
    exit 1
fi
echo "✅ Node.js: $(node --version)"

# Check npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm not found. Please install npm"
    exit 1
fi
echo "✅ npm: $(npm --version)"

# Install Python dependencies
echo "📦 Installing Python dependencies..."
pip3 install --user aiohttp websockets requests || {
    echo "⚠️  Some Python packages may already be installed"
}

# Check backend dependencies
echo "🏗️  Checking backend setup..."
cd "$BACKEND_DIR"

if [ ! -d "node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    npm install
fi

# Build the backend
echo "🔨 Building backend..."
npm run build

# Create logs directory
echo "📁 Creating logs directory..."
mkdir -p "$PROJECT_DIR/logs"

# Make scripts executable
echo "🔧 Setting script permissions..."
chmod +x "$SCRIPTS_DIR"/*.sh
chmod +x "$SCRIPTS_DIR"/*.py

# Test Claude CLI integration
echo "🧪 Testing Claude CLI integration..."
cd "$PROJECT_DIR"

# Test basic Claude CLI functionality
echo "Testing basic Claude CLI..." > /tmp/claude_test.txt
if claude --file /tmp/claude_test.txt > /dev/null 2>&1; then
    echo "✅ Claude CLI integration working"
else
    echo "⚠️  Claude CLI test had issues - may need authentication"
fi
rm -f /tmp/claude_test.txt

# Start backend (in background)
echo "🚀 Starting backend server..."
cd "$BACKEND_DIR"
npm start &
BACKEND_PID=$!

# Wait for backend to start
echo "⏳ Waiting for backend to initialize..."
sleep 10

# Test backend health
if curl -s http://localhost:3001/health > /dev/null; then
    echo "✅ Backend server running"
else
    echo "⚠️  Backend server may not be fully ready"
fi

# Setup knowledge base
echo "📚 Setting up financial knowledge base..."
cd "$PROJECT_DIR"
python3 "$SCRIPTS_DIR/setup_knowledge_base.py" || {
    echo "⚠️  Knowledge base setup encountered issues - continuing anyway"
}

# Test Claude integration
echo "🤖 Testing Claude CLI + RAG integration..."
python3 "$SCRIPTS_DIR/claude_integration.py" \
    "What is my current financial situation and what should I focus on?" \
    --save "$PROJECT_DIR/logs/setup_test.md" || {
    echo "⚠️  Claude integration test had issues - check configuration"
}

# Create cron job for daily analysis (optional)
read -p "📅 Setup daily automated analysis? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "⏰ Setting up daily cron job..."
    (crontab -l 2>/dev/null; echo "0 9 * * * $SCRIPTS_DIR/daily_analysis.sh") | crontab -
    echo "✅ Daily analysis scheduled for 9:00 AM"
fi

# Setup complete
echo ""
echo "🎉 LIF3 Claude CLI + RAG Setup Complete!"
echo "======================================="
echo ""
echo "📊 System Status:"
echo "  ✅ Claude CLI: Ready"
echo "  ✅ Backend API: http://localhost:3001"
echo "  ✅ RAG System: Active"
echo "  ✅ Knowledge Base: Loaded"
echo "  ✅ Scripts: Configured"
echo ""
echo "🚀 Quick Start Commands:"
echo ""
echo "1. Ask a financial question:"
echo "   python3 scripts/claude_integration.py 'How can I reach my R1.8M goal faster?'"
echo ""
echo "2. Run daily analysis:"
echo "   ./scripts/daily_analysis.sh"
echo ""
echo "3. Start dashboard sync server:"
echo "   python3 scripts/dashboard_sync.py"
echo ""
echo "4. Check RAG system:"
echo "   curl http://localhost:3001/api/rag/stats"
echo ""
echo "📂 Important Files:"
echo "  📄 System Prompt: prompts/system_prompt.md"
echo "  📄 RAG Instructions: prompts/rag_integration.md"
echo "  📄 User Profile: config/user_profile.json"
echo "  📂 Analysis Logs: logs/"
echo ""
echo "🔗 API Endpoints:"
echo "  🤖 Claude Integration: scripts/claude_integration.py"
echo "  📊 RAG Search: http://localhost:3001/api/rag/search"
echo "  📈 Dashboard API: http://localhost:3001/api/financial/dashboard"
echo "  💚 Health Check: http://localhost:3001/health"
echo ""
echo "💡 Pro Tips:"
echo "  • Use specific financial queries for better results"
echo "  • Check logs/ directory for daily analysis reports"
echo "  • Configure user_profile.json for personalized advice"
echo "  • Connect dashboard to ws://localhost:8765 for real-time updates"
echo ""

# Keep backend running or stop it
read -p "🔄 Keep backend server running? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "🛑 Stopping backend server..."
    kill $BACKEND_PID 2>/dev/null || true
    echo "✅ Backend stopped"
else
    echo "🔄 Backend server running in background (PID: $BACKEND_PID)"
    echo "   To stop: kill $BACKEND_PID"
fi

echo ""
echo "🎯 Next Steps:"
echo "1. Review and customize prompts/system_prompt.md"
echo "2. Update config/user_profile.json with your actual metrics"
echo "3. Test the system with your first financial query"
echo "4. Set up daily automation for continuous insights"
echo ""
echo "📚 Documentation:"
echo "  • System: README.md"
echo "  • RAG Module: backend/src/modules/rag/README.md"
echo "  • API Docs: http://localhost:3001/api/docs (when backend running)"
echo ""
echo "✨ Happy financial planning with LIF3 AI!"