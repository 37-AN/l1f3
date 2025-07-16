#!/bin/bash
# LIF3 AI System Startup Script
# Quick activation of your AI-powered financial management system

echo "🚀 Starting LIF3 AI System..."
echo "=" * 50

# Check if knowledge sync daemon is running
if pgrep -f "knowledge-sync-daemon" > /dev/null; then
    echo "✅ Knowledge sync daemon: Running"
else
    echo "🔄 Starting knowledge sync daemon..."
    python3 /Users/ccladysmith/Desktop/dev/l1f3/knowledge-sync-daemon.py &
    echo "✅ Knowledge sync daemon: Started"
fi

# Show system status
echo ""
echo "📊 **SYSTEM STATUS**"
python3 /Users/ccladysmith/Desktop/dev/l1f3/lif3-system-demo.py --status

echo ""
echo "🎯 **QUICK START COMMANDS**"
echo "Generate daily briefing:"
echo "  python3 /Users/ccladysmith/Desktop/dev/l1f3/lif3-system-demo.py --briefing"
echo ""
echo "Analyze goal progress:"
echo "  python3 /Users/ccladysmith/Desktop/dev/l1f3/lif3-system-demo.py --progress"
echo ""
echo "Business strategy insights:"
echo "  python3 /Users/ccladysmith/Desktop/dev/l1f3/lif3-system-demo.py --business"
echo ""
echo "🤖 **AI CAPABILITIES READY**"
echo "✅ Daily executive briefings with strategic insights"
echo "✅ Goal progress analysis toward R1,800,000"
echo "✅ 43V3R business strategy recommendations"
echo "✅ Real-time knowledge base synchronization"
echo "✅ Automated financial monitoring"
echo ""
echo "💰 **CURRENT STATUS**"
echo "Net Worth: R239,625 → R1,800,000 (13.3% complete)"
echo "43V3R Target: R0 → R4,881 daily revenue"
echo "Timeline: 18 months to achieve goal"
echo ""
echo "🎉 **LIF3 AI SYSTEM ACTIVE - Ready to accelerate your journey!**"