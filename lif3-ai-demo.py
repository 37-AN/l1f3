#!/usr/bin/env python3
"""
LIF3 AI Integration Demo - Working Version
Demonstrates AI-powered financial insights with your LIF3 knowledge
"""

import os
import sys
import json
from pathlib import Path
from datetime import datetime
from anthropic import Anthropic

class LIF3AIDemo:
    def __init__(self):
        # Set API key
        api_key = "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"
        self.client = Anthropic(api_key=api_key)
        self.knowledge_dir = Path.home() / "Development" / "claude-knowledge" / "lif3"
        
    def load_lif3_knowledge(self):
        """Load LIF3 knowledge base"""
        if not self.knowledge_dir.exists():
            return "No LIF3 knowledge base found"
        
        knowledge = "# LIF3 FINANCIAL KNOWLEDGE BASE\\n\\n"
        
        # Load key documents
        key_docs = [
            "FINANCIAL_OVERVIEW.md",
            "BUSINESS_STRATEGY.md", 
            "LIF3_STATUS.md",
            "ETHAN_FINANCIAL_STATUS.md"
        ]
        
        for doc_name in key_docs:
            doc_path = self.knowledge_dir / doc_name
            if doc_path.exists():
                with open(doc_path, 'r') as f:
                    content = f.read()
                    knowledge += f"## {doc_name.replace('.md', '').replace('_', ' ').title()}\\n"
                    knowledge += content + "\\n\\n"
        
        return knowledge
    
    def generate_daily_briefing(self):
        """Generate AI-powered daily briefing"""
        knowledge = self.load_lif3_knowledge()
        
        prompt = f"""
{knowledge}

Based on the above LIF3 knowledge, generate today's executive briefing with:

1. **Current Financial Status**
   - Net worth: R239,625 → R1,800,000 goal
   - Progress: 13.3% complete
   - 43V3R business revenue status

2. **Today's Priority Actions**
   - Specific steps to accelerate progress
   - 43V3R revenue generation tactics
   - Financial optimization opportunities

3. **Strategic Insights**
   - Analysis of current trajectory
   - Recommendations for faster growth
   - Business scaling opportunities

4. **Weekly Targets**
   - Required progress to stay on track
   - Key metrics to monitor
   - Success indicators

Format as a professional executive briefing for Cape Town-based entrepreneur.
"""
        
        response = self.client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=4000,
            system="You are an AI financial advisor specializing in wealth building and business strategy. Provide actionable insights for reaching R1,800,000 net worth through 43V3R business growth.",
            messages=[{"role": "user", "content": prompt}]
        )
        
        return response.content[0].text
    
    def analyze_goal_progress(self):
        """Analyze progress toward R1,800,000 goal"""
        knowledge = self.load_lif3_knowledge()
        
        prompt = f"""
{knowledge}

Analyze the current progress toward R1,800,000 net worth goal:

**Current Status:**
- Net Worth: R239,625 (13.3% of goal)
- Target: R1,800,000
- Timeline: 18 months
- Remaining: R1,560,375

**Analysis Required:**
1. Current trajectory assessment
2. Required monthly growth rate
3. 43V3R revenue contribution needed
4. Investment strategy recommendations
5. Risk factors and mitigation
6. Acceleration opportunities

Provide specific, actionable recommendations for a Cape Town entrepreneur.
"""
        
        response = self.client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=3000,
            system="You are a financial strategist focused on aggressive but sustainable wealth building in the South African context.",
            messages=[{"role": "user", "content": prompt}]
        )
        
        return response.content[0].text
    
    def business_strategy_insights(self):
        """Generate 43V3R business strategy insights"""
        knowledge = self.load_lif3_knowledge()
        
        prompt = f"""
{knowledge}

Generate strategic insights for 43V3R business growth:

**Current 43V3R Status:**
- Daily revenue target: R4,881
- Monthly MRR target: R147,917
- Current stage: Foundation building
- Services: AI + Web3 + Blockchain + Quantum
- Location: Cape Town, South Africa

**Strategy Focus:**
1. Achieving R4,881 daily revenue consistency
2. Scaling to R147,917 monthly recurring revenue
3. Market positioning in Cape Town tech scene
4. Service offerings and pricing strategy
5. Customer acquisition and retention
6. International expansion opportunities

Provide specific, actionable business strategy recommendations.
"""
        
        response = self.client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=3000,
            system="You are a business strategist specializing in AI/Web3 startups and South African market dynamics.",
            messages=[{"role": "user", "content": prompt}]
        )
        
        return response.content[0].text
    
    def ask_question(self, question):
        """Ask any question with LIF3 context"""
        knowledge = self.load_lif3_knowledge()
        
        prompt = f"""
{knowledge}

Based on the above LIF3 context, please answer this question:

{question}

Provide a detailed, actionable response considering:
- Current financial position (R239,625 → R1,800,000)
- 43V3R business strategy and goals
- 18-month timeline
- Cape Town/South African context
"""
        
        response = self.client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=2000,
            system="You are an AI assistant with deep knowledge of the LIF3 financial system and 43V3R business strategy.",
            messages=[{"role": "user", "content": prompt}]
        )
        
        return response.content[0].text

def main():
    if len(sys.argv) < 2:
        print("🚀 LIF3 AI Integration Demo")
        print("Usage:")
        print("  python3 lif3-ai-demo.py --briefing     # Daily briefing")
        print("  python3 lif3-ai-demo.py --progress     # Goal analysis")
        print("  python3 lif3-ai-demo.py --business     # Business strategy")
        print("  python3 lif3-ai-demo.py 'your question'  # Ask anything")
        return
    
    demo = LIF3AIDemo()
    
    command = sys.argv[1]
    
    if command == "--briefing":
        print("🚀 **Generating LIF3 Daily Command Center Briefing...**\\n")
        response = demo.generate_daily_briefing()
        print(response)
        
    elif command == "--progress":
        print("📊 **Analyzing Progress to R1,800,000 Goal...**\\n")
        response = demo.analyze_goal_progress()
        print(response)
        
    elif command == "--business":
        print("🏢 **Generating 43V3R Business Strategy Insights...**\\n")
        response = demo.business_strategy_insights()
        print(response)
        
    else:
        print(f"💭 **AI Response to: {command}**\\n")
        response = demo.ask_question(command)
        print(response)

if __name__ == "__main__":
    main()