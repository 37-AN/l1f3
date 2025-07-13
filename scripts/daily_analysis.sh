#!/bin/bash
# Daily automated financial analysis using Claude CLI + RAG
# LIF3 Financial Dashboard Automation

# Configuration
PROJECT_DIR="/Users/ccladysmith/Desktop/dev/l1f3"
LOGS_DIR="$PROJECT_DIR/logs"
SCRIPTS_DIR="$PROJECT_DIR/scripts"
DATE=$(date +%Y%m%d)
DATETIME=$(date '+%Y-%m-%d %H:%M:%S')

# Ensure logs directory exists
mkdir -p "$LOGS_DIR"

echo "🌅 LIF3 Daily Financial Analysis - $DATETIME"
echo "============================================="

# Check if backend is running
if ! curl -s http://localhost:3001/health > /dev/null; then
    echo "⚠️  Backend not running. Starting backend..."
    cd "$PROJECT_DIR/backend"
    npm start &
    sleep 10
fi

# Morning market analysis
echo "📊 Running morning market analysis..."
python3 "$SCRIPTS_DIR/claude_integration.py" \
    "Provide today's market outlook for South African investments. How do current market conditions affect my goal of reaching R1.8M? Include JSE performance, ZAR exchange rates, and global market impacts. Suggest any portfolio adjustments needed." \
    --save "$LOGS_DIR/market_analysis_$DATE.md" \
    2>&1

# Business performance and strategy check
echo "🚀 Analyzing 43V3R business performance..."
python3 "$SCRIPTS_DIR/claude_integration.py" \
    "Analyze my 43V3R AI business progress toward R4,881 daily revenue target. What are today's key priorities for business growth? Suggest specific actions for customer acquisition, product development, and revenue optimization." \
    --save "$LOGS_DIR/business_strategy_$DATE.md" \
    2>&1

# Investment portfolio review
echo "💰 Reviewing investment portfolio..."
python3 "$SCRIPTS_DIR/claude_integration.py" \
    "Review my current investment allocation toward the R1.8M goal. Analyze performance, suggest rebalancing if needed, and identify new investment opportunities. Consider both South African and international markets." \
    --save "$LOGS_DIR/portfolio_review_$DATE.md" \
    2>&1

# Goal progress assessment
echo "🎯 Calculating goal progress..."
python3 "$SCRIPTS_DIR/claude_integration.py" \
    "Calculate my current progress toward R1.8M net worth goal. Based on current trajectory, am I on track for the 18-month timeline? If not, what strategic adjustments are needed? Provide specific action items with deadlines." \
    --save "$LOGS_DIR/goal_progress_$DATE.md" \
    2>&1

# Generate daily summary dashboard
echo "📋 Creating daily summary..."
cat > "$LOGS_DIR/daily_summary_$DATE.md" << EOF
# LIF3 Daily Financial Summary - $(date '+%Y-%m-%d')

## Quick Stats
- Current Net Worth: R239,625
- Target Net Worth: R1,800,000
- Progress: 13.3%
- Days Remaining: ~$(( ($(date -d "2026-12-31" +%s) - $(date +%s)) / 86400 ))
- Required Daily Growth: R$(( (1800000 - 239625) / $(( ($(date -d "2026-12-31" +%s) - $(date +%s)) / 86400 )) ))

## Today's Analysis Files
- [Market Analysis](./market_analysis_$DATE.md)
- [Business Strategy](./business_strategy_$DATE.md)
- [Portfolio Review](./portfolio_review_$DATE.md)
- [Goal Progress](./goal_progress_$DATE.md)

## Action Items
*Generated from today's AI analysis - see individual files for details*

## Performance Tracking
- Net Worth Change: TBD
- Business Revenue: R0 (Target: R4,881/day)
- Investment Returns: TBD
- Goal Velocity: TBD

---
*Generated automatically by LIF3 AI Financial Assistant*
EOF

# Send summary to dashboard (if WebSocket is available)
echo "📡 Attempting to send summary to dashboard..."
if command -v wscat &> /dev/null; then
    echo '{"type":"daily_summary","file":"'$LOGS_DIR'/daily_summary_'$DATE'.md"}' | wscat -c ws://localhost:3001 -x
fi

# Cleanup old logs (keep last 30 days)
find "$LOGS_DIR" -name "*.md" -mtime +30 -delete 2>/dev/null

echo "✅ Daily analysis complete!"
echo "📂 Reports saved to: $LOGS_DIR/"
echo "🔗 View summary: $LOGS_DIR/daily_summary_$DATE.md"

# Optional: Open summary in default editor
if [[ "$1" == "--open" ]]; then
    open "$LOGS_DIR/daily_summary_$DATE.md"
fi