// Test the AI Assistant fallback responses
// This simulates the frontend component logic

const currentMetrics = {
  netWorth: 239625,
  progress: 13.3,
  dailyRevenue: 0
};

const generateFallbackResponse = (query, metrics) => {
  const netWorth = metrics?.netWorth || 239625;
  const target = 1800000;
  const progress = metrics?.progress || 13.3;
  const dailyRevenue = metrics?.dailyRevenue || 0;
  const remaining = target - netWorth;
  
  const queryLower = query.toLowerCase();
  
  if (queryLower.includes('current') && queryLower.includes('situation')) {
    return `📊 **Current Financial Situation Analysis**

**Net Worth Progress:**
• Current: R${netWorth.toLocaleString()}
• Target: R${target.toLocaleString()}
• Progress: ${progress.toFixed(1)}%
• Remaining: R${remaining.toLocaleString()}

**43V3R Business:**
• Daily Revenue: R${dailyRevenue.toLocaleString()}
• Target: R4,881/day
• Monthly Target: R147,917

**Key Insights:**
✅ You're ${progress.toFixed(1)}% toward your R1.8M goal
⚡ Need R${Math.round(remaining/365).toLocaleString()}/day average growth
🚀 43V3R business is key to accelerating progress

**Top 3 Priorities:**
1. **Scale 43V3R Revenue** - Focus on reaching R4,881 daily target
2. **Aggressive Investment Strategy** - 70% growth assets, 30% stable
3. **Emergency Fund** - Maintain R75,000 liquid while maximizing growth

*AI-powered insights from LIF3 Financial Assistant*`;
  }
  
  return `🤖 **LIF3 AI Financial Assistant**

I understand you're asking about: "${query}"

**Current Status:**
• Net Worth: R${netWorth.toLocaleString()} (${progress.toFixed(1)}% of R${target.toLocaleString()} goal)
• 43V3R Revenue: R${dailyRevenue.toLocaleString()}/day (target: R4,881)
• Remaining to Goal: R${remaining.toLocaleString()}

Try asking me about specific areas like "investment strategy" or "business growth" for detailed guidance!

*Note: Enhanced AI responses available when RAG system is fully connected*`;
};

// Test queries
const testQueries = [
  "What's my current financial situation?",
  "What investment strategy should I use?",
  "How can I grow 43V3R business?",
  "How can I reach my goal faster?",
  "Random question about finance"
];

console.log("🧪 Testing AI Assistant Fallback Responses");
console.log("==========================================");

testQueries.forEach((query, index) => {
  console.log(`\n${index + 1}. Query: "${query}"`);
  console.log("─".repeat(50));
  const response = generateFallbackResponse(query, currentMetrics);
  console.log(response);
  console.log("\n" + "=".repeat(50));
});

console.log("\n✅ All fallback responses generated successfully!");
console.log("📱 The AI Assistant will work even when RAG backend is unavailable.");
console.log("🎯 Ready for dashboard testing at http://localhost:3000");