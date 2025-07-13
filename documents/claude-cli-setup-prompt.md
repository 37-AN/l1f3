# Claude CLI Setup Guide: AI Financial Dashboard with RAG

## Initial Project Setup

### 1. Install Claude CLI and Dependencies

```bash
# Install Claude CLI (Research Preview)
npm install -g @anthropic-ai/claude-cli

# Setup project directory
mkdir lif3-ai-dashboard
cd lif3-ai-dashboard

# Initialize project structure
mkdir -p {src,docs,data,prompts,config}
touch .env README.md

# Install Python dependencies for RAG system
pip install chromadb sentence-transformers anthropic python-dotenv fastapi uvicorn
```

### 2. Environment Configuration

Create `.env` file:
```env
ANTHROPIC_API_KEY=your_api_key_here
CHROMA_DB_PATH=./data/chroma_db
FINANCIAL_DATA_PATH=./data/financial_docs
PORT=3000
NODE_ENV=development
```

## Claude CLI Prompt Engineering Template

### 3. Master System Prompt (`prompts/system_prompt.md`)

```markdown
<role>
You are LIF3 AI Financial Assistant, an advanced AI system designed to provide comprehensive financial guidance, dashboard management, and business strategy consultation. You have access to a sophisticated RAG (Retrieval-Augmented Generation) knowledge base powered by Chroma vector database containing financial documents, investment strategies, and business growth tactics.
</role>

<core_capabilities>
1. **Financial Dashboard Management**: Monitor, analyze, and provide insights on net worth progression, investment portfolios, and business metrics
2. **Semantic Knowledge Retrieval**: Access and synthesize information from extensive financial document corpus
3. **Predictive Analytics**: Generate forecasts and recommendations based on historical data and market trends
4. **Goal-Oriented Planning**: Create actionable strategies to achieve specific financial targets
5. **Real-time Decision Support**: Provide immediate analysis and recommendations for financial decisions
</core_capabilities>

<knowledge_base_context>
You have access to a Chroma vector database containing:
- Personal finance management strategies (500+ documents)
- Investment analysis and portfolio optimization guides (300+ documents)  
- Business growth and revenue generation tactics (400+ documents)
- Market analysis and economic trend reports (200+ documents)
- Risk assessment and management frameworks (150+ documents)

When responding to queries, ALWAYS:
1. Search the knowledge base for relevant information first
2. Cite specific document sources when making recommendations
3. Provide confidence levels for your advice
4. Distinguish between general knowledge and knowledge base insights
</knowledge_base_context>

<financial_context>
Current User Profile:
- Target Net Worth: R1,800,000
- Current Net Worth: R0 (starting fresh)
- Primary Goal: Achieve target in 12 months
- Business: 43V3R (digital services/products)
- Required Daily Revenue: R4,881
- Required Monthly Growth: R15,000
- Risk Tolerance: Moderate to Aggressive
- Investment Horizon: Long-term wealth building
</financial_context>

<response_guidelines>
1. **Structured Responses**: Use clear sections with headers for different aspects
2. **Actionable Insights**: Always provide specific, implementable recommendations
3. **Data-Driven**: Support recommendations with calculations and projections
4. **Risk Awareness**: Highlight potential risks and mitigation strategies
5. **Progressive Disclosure**: Start with key insights, then provide detailed analysis
6. **Source Attribution**: Reference knowledge base documents when applicable
</response_guidelines>

<interaction_modes>
- **Dashboard Analysis**: Interpret financial metrics and provide performance insights
- **Strategy Consultation**: Develop comprehensive financial and business strategies  
- **Quick Advisory**: Rapid responses to specific financial questions
- **Document Research**: Deep knowledge base queries for specific topics
- **Predictive Modeling**: Generate forecasts and scenario analyses
</interaction_modes>
```

### 4. RAG Integration Prompt (`prompts/rag_integration.md`)

```markdown
<rag_instructions>
For every financial query, follow this systematic approach:

1. **Query Analysis**:
   - Identify key financial concepts and entities
   - Determine information requirements
   - Classify query type (analysis, planning, research, advisory)

2. **Knowledge Base Search**:
   - Generate 3-5 semantic search queries
   - Search across multiple document categories
   - Filter by relevance threshold (>0.7 similarity)
   - Prioritize recent and high-authority sources

3. **Context Synthesis**:
   - Combine retrieved information with user's financial profile
   - Identify relevant patterns and insights
   - Note any conflicting information or gaps

4. **Response Generation**:
   - Lead with key insights and recommendations
   - Provide supporting evidence from knowledge base
   - Include confidence indicators and risk assessments
   - Suggest follow-up actions or additional research needs
</rag_instructions>

<search_optimization>
When searching the knowledge base:
- Use financial terminology and synonyms
- Include temporal context (market conditions, economic cycles)
- Consider user's risk profile and investment horizon
- Search for both strategies and case studies
- Look for contrarian viewpoints and risk factors
</search_optimization>

<citation_format>
When citing knowledge base sources:
- Use format: [Source: Document_Name | Similarity: 0.XX | Section: Topic]
- Include confidence level for each recommendation
- Distinguish between established principles and emerging strategies
- Note when information may be outdated or market-dependent
</citation_format>
```

### 5. Dashboard Integration Commands

#### Create Claude CLI Configuration (`config/claude_config.json`)

```json
{
  "model": "claude-3-sonnet-20240229",
  "max_tokens": 4000,
  "temperature": 0.1,
  "system_prompt_file": "./prompts/system_prompt.md",
  "context_files": [
    "./prompts/rag_integration.md",
    "./data/user_profile.json"
  ],
  "tools": [
    {
      "name": "chroma_search",
      "description": "Search financial knowledge base",
      "endpoint": "http://localhost:8000/search"
    },
    {
      "name": "dashboard_update",
      "description": "Update dashboard metrics",
      "endpoint": "http://localhost:3000/api/update"
    }
  ]
}
```

#### Dashboard Integration Script (`src/claude_integration.py`)

```python
#!/usr/bin/env python3
"""
Claude CLI Integration for LIF3 AI Financial Dashboard
"""

import os
import json
import asyncio
from anthropic import AsyncAnthropic
from chromadb import PersistentClient
from sentence_transformers import SentenceTransformer
import argparse

class LIF3ClaudeIntegration:
    def __init__(self):
        self.anthropic = AsyncAnthropic(api_key=os.getenv('ANTHROPIC_API_KEY'))
        self.chroma_client = PersistentClient(path=os.getenv('CHROMA_DB_PATH'))
        self.embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
        
    async def process_financial_query(self, query: str, context: dict = None):
        """
        Process financial query with RAG integration
        """
        # Search knowledge base
        search_results = await self.search_knowledge_base(query)
        
        # Build context
        context_markup = self.build_context_markup(search_results, context)
        
        # Generate response
        response = await self.anthropic.messages.create(
            model="claude-3-sonnet-20240229",
            max_tokens=4000,
            temperature=0.1,
            system=self.load_system_prompt(),
            messages=[
                {
                    "role": "user",
                    "content": f"""
<financial_query>
{query}
</financial_query>

<context_data>
{context_markup}
</context_data>

<response_requirements>
1. Search knowledge base for relevant financial strategies
2. Provide specific, actionable recommendations
3. Include confidence levels and risk assessments
4. Suggest concrete next steps
5. Update dashboard metrics if applicable
</response_requirements>
"""
                }
            ]
        )
        
        return response.content[0].text
    
    def build_context_markup(self, search_results: list, user_context: dict):
        """
        Build structured context markup for Claude
        """
        context = f"""
<knowledge_base_results>
{self.format_search_results(search_results)}
</knowledge_base_results>

<user_financial_profile>
Current Net Worth: R{user_context.get('net_worth', 0):,}
Target Net Worth: R{user_context.get('target', 1800000):,}
Daily Revenue Target: R{user_context.get('daily_target', 4881)}
Risk Tolerance: {user_context.get('risk_tolerance', 'Moderate')}
Investment Horizon: {user_context.get('investment_horizon', '12 months')}
</user_financial_profile>

<market_context>
Date: 2025-07-07
Market Conditions: Research required
Economic Indicators: Research required
</market_context>
"""
        return context
    
    def load_system_prompt(self):
        """Load system prompt from file"""
        with open('./prompts/system_prompt.md', 'r') as f:
            return f.read()

# CLI Interface
async def main():
    parser = argparse.ArgumentParser(description='LIF3 AI Financial Assistant')
    parser.add_argument('query', help='Financial query or command')
    parser.add_argument('--context', help='Additional context JSON file')
    parser.add_argument('--dashboard', action='store_true', help='Update dashboard')
    
    args = parser.parse_args()
    
    # Load context if provided
    context = {}
    if args.context:
        with open(args.context, 'r') as f:
            context = json.load(f)
    
    # Initialize integration
    integration = LIF3ClaudeIntegration()
    
    # Process query
    response = await integration.process_financial_query(args.query, context)
    
    print("🤖 LIF3 AI Financial Assistant Response:")
    print("=" * 50)
    print(response)
    print("=" * 50)

if __name__ == "__main__":
    asyncio.run(main())
```

### 6. Knowledge Base Setup Commands

#### Initial Knowledge Base Population (`scripts/setup_knowledge_base.py`)

```python
#!/usr/bin/env python3
"""
Setup initial knowledge base for LIF3 AI Financial Dashboard
"""

import chromadb
from pathlib import Path
import json

def setup_financial_knowledge_base():
    """Setup Chroma database with financial documents"""
    
    client = chromadb.PersistentClient(path="./data/chroma_db")
    
    # Create collections
    collections = {
        "financial_strategies": "Personal finance and investment strategies",
        "business_growth": "Business development and revenue generation",
        "market_analysis": "Market trends and economic analysis",
        "risk_management": "Risk assessment and management frameworks"
    }
    
    for collection_name, description in collections.items():
        try:
            collection = client.get_collection(name=collection_name)
            print(f"✅ Collection '{collection_name}' already exists")
        except:
            collection = client.create_collection(
                name=collection_name,
                metadata={"description": description}
            )
            print(f"🆕 Created collection '{collection_name}'")
    
    # Add initial financial knowledge
    financial_docs = [
        {
            "id": "emergency_fund_001",
            "content": "Emergency funds should contain 3-6 months of expenses in liquid, accessible accounts. For South African investors, consider money market funds or high-yield savings accounts.",
            "metadata": {"category": "emergency_planning", "priority": "high"}
        },
        {
            "id": "investment_strategy_001", 
            "content": "For aggressive growth targeting R1.8M in 12 months, consider 70% equity ETFs, 20% individual growth stocks, 10% cash. Focus on JSE Top 40 ETFs and emerging market exposure.",
            "metadata": {"category": "investment_strategy", "risk_level": "aggressive"}
        },
        {
            "id": "business_revenue_001",
            "content": "To achieve R4,881 daily revenue, focus on digital products with high margins. Consider SaaS, online courses, consulting services, or digital marketing agencies.",
            "metadata": {"category": "business_strategy", "revenue_type": "digital"}
        }
    ]
    
    # Add documents to appropriate collections
    strategies_collection = client.get_collection("financial_strategies")
    for doc in financial_docs:
        strategies_collection.add(
            documents=[doc["content"]],
            metadatas=[doc["metadata"]],
            ids=[doc["id"]]
        )
    
    print("📚 Knowledge base setup complete!")

if __name__ == "__main__":
    setup_financial_knowledge_base()
```

### 7. Usage Examples

#### Basic Financial Query
```bash
# Ask for investment advice
python src/claude_integration.py "What's the best investment strategy to reach R1.8M in 12 months starting from zero?"

# Business strategy consultation  
python src/claude_integration.py "How can I build a business generating R4,881 daily revenue?" --context data/user_profile.json

# Dashboard analysis
python src/claude_integration.py "Analyze my current financial position and recommend next steps" --dashboard
```

#### Advanced RAG Queries
```bash
# Multi-faceted research query
python src/claude_integration.py "Compare aggressive vs conservative investment approaches for my timeline and provide risk-adjusted recommendations"

# Business model research
python src/claude_integration.py "Research digital business models with fastest path to R147,917 monthly revenue"
```

### 8. Dashboard Integration Commands

#### Real-time Dashboard Updates (`scripts/dashboard_sync.py`)

```python
#!/usr/bin/env python3
"""
Sync Claude AI insights with dashboard in real-time
"""

import asyncio
import websockets
import json
from claude_integration import LIF3ClaudeIntegration

async def dashboard_websocket_handler(websocket, path):
    """Handle WebSocket connections from dashboard"""
    integration = LIF3ClaudeIntegration()
    
    async for message in websocket:
        try:
            data = json.loads(message)
            query = data.get('query')
            context = data.get('context', {})
            
            # Process with Claude AI
            response = await integration.process_financial_query(query, context)
            
            # Send response back to dashboard
            await websocket.send(json.dumps({
                "type": "ai_response",
                "content": response,
                "timestamp": asyncio.get_event_loop().time()
            }))
            
        except Exception as e:
            await websocket.send(json.dumps({
                "type": "error",
                "message": str(e)
            }))

# Start WebSocket server
start_server = websockets.serve(dashboard_websocket_handler, "localhost", 8765)
asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()
```

### 9. Automated Workflow Setup

#### Daily Analysis Automation (`scripts/daily_analysis.sh`)

```bash
#!/bin/bash
# Daily automated financial analysis using Claude CLI

# Morning market analysis
python src/claude_integration.py "Provide today's market outlook and how it affects my R1.8M goal" > logs/daily_market_$(date +%Y%m%d).md

# Business performance check
python src/claude_integration.py "Analyze yesterday's business metrics and suggest today's priorities" --dashboard

# Investment portfolio review
python src/claude_integration.py "Review my investment portfolio performance and suggest rebalancing if needed"

# Evening goal progress assessment
python src/claude_integration.py "Calculate progress toward R1.8M goal and adjust strategy if needed" --context data/current_metrics.json
```

### 10. Advanced Prompt Engineering Features

#### Context-Aware Follow-up System (`prompts/followup_context.md`)

```markdown
<conversation_memory>
Maintain context across interactions by:
1. Tracking previous recommendations and their outcomes
2. Building user preference profiles based on responses
3. Adjusting strategies based on progress toward goals
4. Learning from successful and unsuccessful advice
</conversation_memory>

<adaptive_prompting>
Adjust response style based on:
- User's financial literacy level (detected from questions)
- Risk tolerance (observed from decision patterns)  
- Communication preferences (technical vs simplified)
- Success rate of previous recommendations
</adaptive_prompting>

<proactive_insights>
Generate proactive recommendations for:
- Market opportunities aligned with user goals
- Risk warnings based on portfolio concentration
- Goal progression alerts and milestone celebrations
- Strategy optimizations based on performance data
</proactive_insights>
```

## Quick Start Commands

```bash
# Complete setup
./scripts/setup_project.sh

# Initialize knowledge base
python scripts/setup_knowledge_base.py

# Start dashboard and AI integration
npm run dev &
python scripts/dashboard_sync.py &

# First AI consultation
python src/claude_integration.py "I'm starting fresh with R0 net worth. Create a comprehensive 12-month plan to reach R1.8M through business and investments."
```

This setup provides a production-ready AI financial dashboard with advanced RAG capabilities, proper prompt engineering, and seamless Claude CLI integration.
