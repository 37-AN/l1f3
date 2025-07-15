#!/usr/bin/env python3
# enhanced-claude-cli.py - LIF3 Integration
# Connects Claude CLI with existing LIF3 backend system

import os
import sys
import json
import requests
import argparse
from pathlib import Path
from datetime import datetime, timedelta
from anthropic import Anthropic

class LIF3ClaudeIntegration:
    def __init__(self):
        self.client = Anthropic(api_key=os.getenv('ANTHROPIC_API_KEY'))
        self.knowledge_dir = Path.home() / "Development" / "claude-knowledge"
        self.lif3_api_base = "http://localhost:3001"  # Your existing backend
        self.config = self.load_config()
    
    def load_config(self):
        config_file = Path.home() / ".config" / "claude-cli" / "knowledge-config.json"
        if config_file.exists():
            with open(config_file) as f:
                return json.load(f)
        return {}
    
    def load_project_knowledge(self, project_name):
        """Load all documents from a knowledge project"""
        project_dir = self.knowledge_dir / project_name
        if not project_dir.exists():
            return ""
        
        knowledge_content = f"# {project_name.upper()} KNOWLEDGE BASE\n\n"
        knowledge_content += f"*Generated: {datetime.now().strftime('%Y-%m-%d %H:%M')}*\n\n"
        
        # Load all markdown files
        for md_file in sorted(project_dir.glob("*.md")):
            with open(md_file, 'r') as f:
                knowledge_content += f"## {md_file.stem.replace('_', ' ').title()}\n"
                knowledge_content += f.read() + "\n\n"
        
        return knowledge_content
    
    def get_lif3_financial_context(self):
        """Fetch current financial data from LIF3 backend"""
        try:
            # Get goals data
            goals_response = requests.get(f"{self.lif3_api_base}/api/financial/goals", timeout=5)
            transactions_response = requests.get(
                f"{self.lif3_api_base}/api/financial/transactions?limit=50", 
                timeout=5
            )
            
            financial_context = "# CURRENT LIF3 FINANCIAL STATUS\\n\\n"
            
            if goals_response.status_code == 200:
                goals = goals_response.json()
                financial_context += "## Active Goals\\n"
                for goal in goals:
                    progress = (goal.get('currentAmount', 0) / goal.get('targetAmount', 1)) * 100
                    financial_context += f"- **{goal.get('name')}**: R{goal.get('currentAmount', 0):,.0f} / R{goal.get('targetAmount', 0):,.0f} ({progress:.1f}%)\\n"
                financial_context += "\\n"
            
            if transactions_response.status_code == 200:
                transactions = transactions_response.json()
                financial_context += "## Recent Transactions (Last 50)\\n"
                for tx in transactions[:10]:  # Show top 10
                    financial_context += f"- {tx.get('date')}: R{tx.get('amount', 0):,.2f} - {tx.get('description', 'N/A')}\\n"
                financial_context += "\\n"
            
            return financial_context
            
        except Exception as e:
            return f"# LIF3 Backend Connection Error\\n\\nCould not fetch financial data: {str(e)}\\n\\n"
    
    def query_with_lif3_context(self, query, project=None, include_financial=True):
        """Query Claude with LIF3 context and knowledge"""
        
        system_message = """You are Claude, an AI assistant integrated with the LIF3 financial management system. 
You have access to:
1. Real-time financial data from the LIF3 backend
2. Complete LIF3 knowledge base and documentation
3. Goal tracking and progress monitoring capabilities

Your role is to help with:
- Financial analysis and insights
- Goal progress tracking  
- Business strategy for 43V3R
- Path to R1,800,000 net worth target
- Daily financial decision making

Respond with actionable insights and specific recommendations based on the current financial status."""

        messages = []
        context_parts = []
        
        # Add knowledge context
        if project:
            knowledge = self.load_project_knowledge(project)
            if knowledge:
                context_parts.append(knowledge)
        
        # Add real-time financial context
        if include_financial:
            financial_context = self.get_lif3_financial_context()
            context_parts.append(financial_context)
        
        # Combine contexts
        if context_parts:
            full_context = "\\n\\n".join(context_parts)
            messages.append({
                "role": "user", 
                "content": f"<LIF3_CONTEXT>\\n{full_context}\\n</LIF3_CONTEXT>\\n\\nBased on the above LIF3 context, please answer: {query}"
            })
        else:
            messages.append({"role": "user", "content": query})
        
        response = self.client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=4000,
            system=system_message,
            messages=messages
        )
        
        return response.content[0].text
    
    def generate_daily_briefing(self):
        """Generate daily LIF3 briefing with current data"""
        return self.query_with_lif3_context(
            "Generate today's LIF3 Daily Command Center briefing. Include current financial status, goal progress, recommended actions for today, and any alerts or insights based on recent activity.",
            project="lif3",
            include_financial=True
        )
    
    def analyze_progress_to_goal(self, goal_amount=1800000):
        """Analyze progress toward specific financial goal"""
        return self.query_with_lif3_context(
            f"Analyze my current progress toward reaching R{goal_amount:,} net worth. Provide specific recommendations for acceleration, timeline analysis, and monthly targets needed.",
            project="lif3",
            include_financial=True
        )
    
    def business_strategy_insights(self):
        """Generate 43V3R business strategy insights"""
        return self.query_with_lif3_context(
            "Based on my current financial position and goals, provide strategic insights for growing 43V3R business revenue. Focus on reaching the daily R4,881 target and scaling to R147,917 MRR.",
            project="lif3",
            include_financial=True
        )
    
    def list_projects(self):
        """List available knowledge projects"""
        if not self.knowledge_dir.exists():
            return []
        return [d.name for d in self.knowledge_dir.iterdir() if d.is_dir()]
    
    def update_lif3_goal(self, goal_id, new_amount):
        """Update goal progress in LIF3 backend"""
        try:
            response = requests.patch(
                f"{self.lif3_api_base}/api/financial/goals/{goal_id}",
                json={"currentAmount": new_amount},
                timeout=5
            )
            return response.status_code == 200
        except:
            return False
    
    def log_transaction(self, amount, description, category="BUSINESS_REVENUE"):
        """Log new transaction to LIF3 backend"""
        try:
            response = requests.post(
                f"{self.lif3_api_base}/api/financial/transactions",
                json={
                    "amount": amount,
                    "description": description,
                    "category": category,
                    "type": "INCOME" if amount > 0 else "EXPENSE",
                    "date": datetime.now().isoformat()
                },
                timeout=5
            )
            return response.status_code == 201
        except:
            return False

def main():
    parser = argparse.ArgumentParser(description="LIF3 Integrated Claude CLI")
    parser.add_argument("query", nargs="?", help="Your question or command")
    parser.add_argument("--project", "-p", help="Knowledge project to include", default="lif3")
    parser.add_argument("--briefing", "-b", action="store_true", help="Generate daily briefing")
    parser.add_argument("--progress", "-pr", action="store_true", help="Analyze goal progress")
    parser.add_argument("--business", "-bs", action="store_true", help="Business strategy insights")
    parser.add_argument("--list-projects", "-l", action="store_true", help="List available projects")
    parser.add_argument("--no-financial", action="store_true", help="Don't include financial context")
    parser.add_argument("--log-revenue", type=float, help="Log 43V3R revenue amount")
    parser.add_argument("--description", help="Description for revenue logging")
    
    args = parser.parse_args()
    
    cli = LIF3ClaudeIntegration()
    
    # Handle special commands
    if args.list_projects:
        projects = cli.list_projects()
        if projects:
            print("Available knowledge projects:")
            for project in projects:
                print(f"  - {project}")
        else:
            print("No knowledge projects found")
        return
    
    if args.briefing:
        print("🚀 **Generating LIF3 Daily Command Center Briefing...**\\n")
        response = cli.generate_daily_briefing()
        print(response)
        return
    
    if args.progress:
        print("📊 **Analyzing Progress to R1,800,000 Goal...**\\n")
        response = cli.analyze_progress_to_goal()
        print(response)
        return
    
    if args.business:
        print("🏢 **Generating 43V3R Business Strategy Insights...**\\n")
        response = cli.business_strategy_insights()
        print(response)
        return
    
    if args.log_revenue:
        description = args.description or "43V3R Revenue"
        success = cli.log_transaction(args.log_revenue, description, "BUSINESS_REVENUE")
        if success:
            print(f"✅ Logged R{args.log_revenue:,.2f} revenue: {description}")
        else:
            print("❌ Failed to log revenue. Check LIF3 backend connection.")
        return
    
    # Default query handling
    if not args.query:
        print("LIF3 Claude CLI - Use --help for options")
        print("Quick commands:")
        print("  --briefing     Daily briefing")
        print("  --progress     Goal analysis") 
        print("  --business     Strategy insights")
        print("  --log-revenue 1000 --description 'Client payment'")
        return
    
    # Regular query with LIF3 context
    response = cli.query_with_lif3_context(
        args.query, 
        project=args.project, 
        include_financial=not args.no_financial
    )
    
    print(response)

if __name__ == "__main__":
    main()