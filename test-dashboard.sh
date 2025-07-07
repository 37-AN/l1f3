#!/bin/bash
# Test LIF3 Dashboard Integration

echo "🧪 Testing LIF3 Dashboard + Claude CLI Integration"
echo "================================================="

# Test backend health
echo "1. Testing Backend Health..."
BACKEND_HEALTH=$(curl -s http://localhost:3001/health)
if [[ $? -eq 0 ]]; then
    echo "✅ Backend: Running"
    echo "   Status: $(echo $BACKEND_HEALTH | grep -o '"status":"[^"]*' | cut -d'"' -f4)"
else
    echo "❌ Backend: Not accessible"
fi

# Test frontend
echo ""
echo "2. Testing Frontend..."
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000)
if [[ $FRONTEND_STATUS -eq 200 ]]; then
    echo "✅ Frontend: Running on http://localhost:3000"
else
    echo "❌ Frontend: Not accessible (HTTP $FRONTEND_STATUS)"
fi

# Test RAG endpoints
echo ""
echo "3. Testing RAG System..."
RAG_STATS=$(curl -s http://localhost:3001/api/rag/stats)
if [[ $? -eq 0 ]]; then
    echo "✅ RAG Endpoints: Available"
    echo "   $(echo $RAG_STATS | head -c 100)..."
else
    echo "❌ RAG Endpoints: Not accessible"
fi

# Test dashboard API
echo ""
echo "4. Testing Dashboard API..."
DASHBOARD_API=$(curl -s http://localhost:3001/api/financial/dashboard)
if [[ $? -eq 0 ]]; then
    echo "✅ Dashboard API: Working"
else
    echo "❌ Dashboard API: Error"
fi

# Test Claude CLI integration script
echo ""
echo "5. Testing Claude CLI Integration..."
cd /Users/ccladysmith/Desktop/dev/l1f3
if [[ -f "scripts/claude_integration.py" ]]; then
    echo "✅ Claude Integration Script: Available"
    echo "   Location: scripts/claude_integration.py"
else
    echo "❌ Claude Integration Script: Missing"
fi

# Test knowledge base setup
echo ""
echo "6. Testing Knowledge Base Setup..."
if [[ -f "scripts/setup_knowledge_base.py" ]]; then
    echo "✅ Knowledge Base Setup: Available"
    echo "   Location: scripts/setup_knowledge_base.py"
else
    echo "❌ Knowledge Base Setup: Missing"
fi

echo ""
echo "🎯 Integration Status Summary:"
echo "=============================="
echo "Frontend:     http://localhost:3000"
echo "Backend:      http://localhost:3001" 
echo "Health:       http://localhost:3001/health"
echo "API Docs:     http://localhost:3001/api/docs"
echo "RAG Stats:    http://localhost:3001/api/rag/stats"
echo ""
echo "📱 To test the dashboard:"
echo "1. Open http://localhost:3000 in your browser"
echo "2. Navigate to the dashboard page"
echo "3. Look for the Claude AI Assistant component"
echo "4. Try asking questions like:"
echo "   • 'What's my current financial situation?'"
echo "   • 'What investment strategy should I use?'"
echo "   • 'How can I grow 43V3R business?'"
echo ""
echo "🤖 Claude CLI Integration:"
echo "• System prompts: prompts/system_prompt.md"
echo "• User profile: config/user_profile.json"
echo "• Integration script: scripts/claude_integration.py"
echo "• Daily automation: scripts/daily_analysis.sh"
echo ""
echo "✨ Happy testing!"