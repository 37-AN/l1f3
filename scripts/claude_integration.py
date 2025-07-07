#!/usr/bin/env python3
"""
Claude CLI Integration for LIF3 AI Financial Dashboard
Integrates Claude CLI with existing NestJS RAG backend
"""

import os
import json
import asyncio
import aiohttp
import argparse
from datetime import datetime
from pathlib import Path

class LIF3ClaudeIntegration:
    def __init__(self):
        self.backend_url = "http://localhost:3001"
        self.config_path = Path(__file__).parent.parent / "config"
        self.prompts_path = Path(__file__).parent.parent / "prompts"
        
    async def process_financial_query(self, query: str, context: dict = None):
        """
        Process financial query using existing RAG backend and Claude CLI
        """
        # Load user profile and system context
        user_profile = self.load_user_profile()
        system_prompt = self.load_system_prompt()
        rag_instructions = self.load_rag_instructions()
        
        # Search knowledge base via existing RAG API
        search_results = await self.search_rag_backend(query)
        
        # Build comprehensive context
        context_markup = self.build_context_markup(search_results, user_profile, context)
        
        # Prepare Claude CLI command with context
        claude_query = f"""
{system_prompt}

{rag_instructions}

<financial_query>
{query}
</financial_query>

<context_data>
{context_markup}
</context_data>

<response_requirements>
1. Use RAG search results to inform recommendations
2. Provide specific, actionable financial advice
3. Include confidence levels and risk assessments
4. Calculate progress toward R1,800,000 goal
5. Suggest concrete next steps for 43V3R business
6. Consider South African market context
</response_requirements>

Please provide a comprehensive financial analysis and recommendation.
"""
        
        # Execute Claude CLI command
        return await self.execute_claude_query(claude_query)
    
    async def search_rag_backend(self, query: str):
        """Search the existing RAG backend for relevant financial documents"""
        try:
            async with aiohttp.ClientSession() as session:
                search_payload = {
                    "query": query,
                    "limit": 10,
                    "threshold": 0.7,
                    "filters": {
                        "category": ["financial_statement", "investment_report", "business_strategy"]
                    }
                }
                
                async with session.post(
                    f"{self.backend_url}/api/rag/search",
                    json=search_payload,
                    headers={"Content-Type": "application/json"}
                ) as response:
                    if response.status == 200:
                        return await response.json()
                    else:
                        print(f"⚠️  RAG search failed: {response.status}")
                        return {"results": []}
        except Exception as e:
            print(f"⚠️  RAG backend unavailable: {e}")
            return {"results": []}
    
    async def execute_claude_query(self, query: str):
        """Execute Claude CLI with the prepared query"""
        import subprocess
        
        try:
            # Execute Claude CLI with --print flag for non-interactive mode
            result = subprocess.run(
                ['claude', '--print'],
                input=query,
                capture_output=True,
                text=True,
                timeout=60
            )
            
            if result.returncode == 0:
                return result.stdout
            else:
                return f"❌ Claude CLI error: {result.stderr}"
                
        except subprocess.TimeoutExpired:
            return "⏱️  Query timeout - please try a shorter query"
        except Exception as e:
            return f"❌ Execution error: {e}"
    
    def build_context_markup(self, search_results: dict, user_profile: dict, additional_context: dict = None):
        """Build structured context markup for Claude"""
        
        # Format RAG search results
        rag_content = ""
        if search_results.get("results"):
            rag_content = "\n".join([
                f"• {result.get('chunk', {}).get('content', 'No content')[:200]}... "
                f"[Similarity: {result.get('similarity', 0):.2f}]"
                for result in search_results["results"][:5]
            ])
        else:
            rag_content = "No relevant documents found in knowledge base."
        
        context = f"""
<knowledge_base_results>
{rag_content}
</knowledge_base_results>

<user_financial_profile>
Current Net Worth: R{user_profile['financial_profile']['current_net_worth']:,}
Target Net Worth: R{user_profile['financial_profile']['target_net_worth']:,}
Progress: {user_profile['financial_profile']['progress_percentage']}%
Daily Revenue Target: R{user_profile['business_profile']['daily_revenue_target']:,}
Monthly Revenue Target: R{user_profile['business_profile']['monthly_revenue_target']:,}
Risk Tolerance: {user_profile['financial_profile']['risk_tolerance'].title()}
Investment Horizon: {user_profile['financial_profile']['investment_horizon'].replace('_', ' ').title()}
Location: {user_profile['location']['city']}, {user_profile['location']['country']}
Business: {user_profile['business_profile']['company_name']} ({user_profile['business_profile']['industry']})
</user_financial_profile>

<market_context>
Date: {datetime.now().strftime('%Y-%m-%d')}
Currency: ZAR (South African Rand)
Market Focus: JSE, emerging markets, tech sector
Economic Context: Post-pandemic recovery, AI revolution
</market_context>

<dashboard_integration>
Backend API: {self.backend_url}
RAG System: Active
Real-time Updates: Available via WebSocket
</dashboard_integration>
"""
        
        if additional_context:
            context += f"\n<additional_context>\n{json.dumps(additional_context, indent=2)}\n</additional_context>"
        
        return context
    
    def load_user_profile(self):
        """Load user profile from config"""
        try:
            with open(self.config_path / "user_profile.json", 'r') as f:
                return json.load(f)
        except Exception as e:
            print(f"⚠️  Could not load user profile: {e}")
            return self.get_default_profile()
    
    def get_default_profile(self):
        """Return default profile if config file unavailable"""
        return {
            "financial_profile": {
                "current_net_worth": 239625,
                "target_net_worth": 1800000,
                "progress_percentage": 13.3,
                "risk_tolerance": "aggressive"
            },
            "business_profile": {
                "company_name": "43V3R",
                "daily_revenue_target": 4881,
                "monthly_revenue_target": 147917,
                "industry": "AI + Web3 + Crypto"
            },
            "location": {
                "city": "Cape Town",
                "country": "South Africa"
            }
        }
    
    def load_system_prompt(self):
        """Load system prompt from file"""
        try:
            with open(self.prompts_path / "system_prompt.md", 'r') as f:
                return f.read()
        except Exception as e:
            print(f"⚠️  Could not load system prompt: {e}")
            return "You are a financial advisor for the LIF3 dashboard."
    
    def load_rag_instructions(self):
        """Load RAG integration instructions"""
        try:
            with open(self.prompts_path / "rag_integration.md", 'r') as f:
                return f.read()
        except Exception as e:
            print(f"⚠️  Could not load RAG instructions: {e}")
            return ""

# CLI Interface
async def main():
    parser = argparse.ArgumentParser(description='LIF3 AI Financial Assistant with Claude CLI')
    parser.add_argument('query', help='Financial query or command')
    parser.add_argument('--context', help='Additional context JSON file')
    parser.add_argument('--save', help='Save response to file')
    parser.add_argument('--backend', default='http://localhost:3001', help='Backend URL')
    
    args = parser.parse_args()
    
    # Load additional context if provided
    context = {}
    if args.context and os.path.exists(args.context):
        with open(args.context, 'r') as f:
            context = json.load(f)
    
    # Initialize integration
    integration = LIF3ClaudeIntegration()
    integration.backend_url = args.backend
    
    print("🤖 LIF3 AI Financial Assistant (Claude CLI + RAG)")
    print("=" * 60)
    print(f"📊 Query: {args.query}")
    print(f"🔗 Backend: {args.backend}")
    print("=" * 60)
    
    # Process query
    response = await integration.process_financial_query(args.query, context)
    
    print("\n📈 AI Response:")
    print("=" * 60)
    print(response)
    print("=" * 60)
    
    # Save response if requested
    if args.save:
        with open(args.save, 'w') as f:
            f.write(f"Query: {args.query}\n")
            f.write(f"Timestamp: {datetime.now().isoformat()}\n")
            f.write("=" * 40 + "\n")
            f.write(response)
        print(f"💾 Response saved to: {args.save}")

if __name__ == "__main__":
    asyncio.run(main())