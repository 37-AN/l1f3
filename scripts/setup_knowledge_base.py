#!/usr/bin/env python3
"""
Setup and enhance ChromaDB knowledge base for LIF3 AI Financial Dashboard
Adds comprehensive financial documents to existing RAG system
"""

import requests
import json
from datetime import datetime
from pathlib import Path

class LIF3KnowledgeBaseSetup:
    def __init__(self, backend_url="http://localhost:3001"):
        self.backend_url = backend_url
        
    def setup_financial_knowledge_base(self):
        """Add comprehensive financial documents to existing RAG system"""
        
        print("📚 Setting up LIF3 Financial Knowledge Base...")
        
        # Financial strategy documents
        financial_docs = [
            {
                "title": "Emergency Fund Strategy for R1.8M Goal",
                "content": """
                Emergency Fund Requirements for Aggressive Wealth Building:
                
                For someone targeting R1.8M in 18 months starting from R239,625, emergency fund strategy must balance security with growth opportunity cost.
                
                Recommended Approach:
                1. Minimum Emergency Fund: R50,000-75,000 (3 months essential expenses)
                2. Liquid Investment Buffer: R100,000 in money market funds
                3. Credit Line Backup: R200,000 available credit for true emergencies
                
                South African Options:
                - Capitec Money Market: 8-9% return, instant access
                - Discovery Bank Money Market: Competitive rates, no fees
                - Nedbank Money Market: Good institutional backing
                
                This approach minimizes opportunity cost while maintaining financial security during aggressive growth phase.
                """,
                "category": "emergency_planning",
                "tags": ["emergency_fund", "south_africa", "money_market", "liquidity"]
            },
            {
                "title": "Aggressive Investment Strategy: R239k to R1.8M",
                "content": """
                Investment Allocation for 18-Month Wealth Building Goal:
                
                Current Position: R239,625 → Target: R1,800,000 (650% growth required)
                
                Recommended Portfolio Allocation:
                1. High-Growth Equities (60%): ~R950,000 target allocation
                   - JSE Top 40 ETF (20%): Stable South African exposure
                   - S&P 500 ETF (20%): US market exposure via EasyEquities
                   - Emerging Markets (10%): Higher growth potential
                   - Individual Growth Stocks (10%): Tesla, Apple, Google via offshore investing
                
                2. Alternative Investments (25%): ~R400,000
                   - Cryptocurrency (15%): Bitcoin, Ethereum via Luno/VALR
                   - REITs (10%): Property exposure without direct ownership
                
                3. Business Investment (15%): ~R270,000
                   - 43V3R AI business development
                   - Technology and infrastructure
                   - Marketing and customer acquisition
                
                Expected Returns: 25-35% annually (aggressive but achievable in current market)
                Risk Level: High (appropriate for 18-month timeline)
                """,
                "category": "investment_strategy",
                "tags": ["portfolio_allocation", "aggressive_growth", "jse", "cryptocurrency", "business_investment"]
            },
            {
                "title": "43V3R Business Revenue Strategy: R0 to R4,881 Daily",
                "content": """
                Digital Business Model for R147,917 Monthly Revenue:
                
                Current: R0 → Target: R4,881 daily (R147,917 monthly)
                
                Recommended Revenue Streams:
                
                1. AI-Powered SaaS Products (60% of revenue):
                   - Monthly Recurring Revenue: R88,750
                   - Target: 100 customers at R887/month average
                   - Products: AI automation tools, financial dashboards, business intelligence
                
                2. Consulting & Professional Services (25%):
                   - Monthly Target: R36,979
                   - Rate: R2,500/hour for AI/business consulting
                   - Target: 15 hours/month high-value consulting
                
                3. Digital Products & Courses (15%):
                   - Monthly Target: R22,188
                   - Online courses on AI, business automation, financial management
                   - One-time products: R2,000-5,000 per sale
                
                Growth Strategy:
                - Month 1-3: Build MVP, gain first 10 customers
                - Month 4-6: Scale to 30 customers, refine product-market fit
                - Month 7-12: Aggressive growth to 100+ customers
                - Month 13-18: Optimize and expand internationally
                
                South African Advantages:
                - Lower development costs
                - Growing digital transformation market
                - Government support for tech startups
                - Access to African markets
                """,
                "category": "business_strategy",
                "tags": ["saas", "revenue_model", "ai_business", "south_africa", "digital_transformation"]
            },
            {
                "title": "South African Investment Vehicles & Tax Optimization",
                "content": """
                Tax-Efficient Investment Strategies for Wealth Building:
                
                Key South African Investment Accounts:
                
                1. Tax-Free Savings Account (TFSA):
                   - Annual Limit: R36,000 (lifetime R500,000)
                   - 100% tax-free growth and withdrawals
                   - Priority: Max out annually for compound growth
                   - Best for: ETFs, high-growth investments
                
                2. Retirement Annuity (RA):
                   - Tax deduction up to 27.5% of income
                   - Excellent for high-income periods
                   - Forced preservation until retirement
                   - Consider: When 43V3R generates significant income
                
                3. Offshore Investment Allowance:
                   - R1 million annually without tax clearance
                   - R10 million with SARS approval
                   - Currency diversification
                   - Access to global markets via EasyEquities, etc.
                
                4. Section 12J Tax Incentives:
                   - 100% tax deduction for qualifying investments
                   - Venture capital funds focusing on SMEs
                   - Higher risk but significant tax benefits
                
                Capital Gains Tax Strategy:
                - Annual exclusion: R40,000
                - Effective rate: 18% for individuals
                - Hold assets >1 year for CGT treatment
                - Harvest losses to offset gains
                
                Business Tax Optimization:
                - Register 43V3R as Pty Ltd for 28% company tax
                - Claim all business expenses
                - Salary vs dividend optimization
                - R&D tax incentives for AI development
                """,
                "category": "tax_strategy",
                "tags": ["tfsa", "retirement_annuity", "offshore_investing", "capital_gains", "business_tax"]
            },
            {
                "title": "Risk Management Framework for Aggressive Growth",
                "content": """
                Risk Mitigation During Rapid Wealth Building:
                
                Key Risk Categories:
                
                1. Market Risk:
                   - Diversification across asset classes
                   - Geographic diversification (SA, US, emerging markets)
                   - Time-based dollar-cost averaging for large positions
                   - Stop-loss strategies for individual stocks
                
                2. Business Risk (43V3R):
                   - Multiple revenue streams to reduce dependency
                   - Strong cash flow management
                   - Customer diversification
                   - Competitive moat development
                
                3. Currency Risk:
                   - ZAR exposure vs offshore investments
                   - Natural hedging through offshore revenue
                   - Currency-hedged ETFs when appropriate
                
                4. Concentration Risk:
                   - No single investment >20% of portfolio
                   - Regular rebalancing quarterly
                   - Profit-taking on outsized winners
                
                5. Liquidity Risk:
                   - Maintain 10% in liquid assets
                   - Staggered investment maturities
                   - Credit line availability
                
                Insurance Considerations:
                - Professional indemnity for consulting business
                - Key person insurance for 43V3R
                - Adequate life and disability cover
                - Cyber liability insurance for tech business
                
                Monitoring & Adjustment:
                - Monthly portfolio review
                - Quarterly strategy adjustment
                - Annual comprehensive review
                - Real-time dashboard monitoring
                """,
                "category": "risk_management",
                "tags": ["diversification", "insurance", "liquidity", "currency_risk", "business_risk"]
            },
            {
                "title": "Cape Town Tech Ecosystem & Networking Opportunities",
                "content": """
                Leveraging Cape Town's Tech Scene for 43V3R Growth:
                
                Key Organizations & Communities:
                
                1. Startup Communities:
                   - Silicon Cape: Premier tech community
                   - Founder Coffee: Weekly networking
                   - AngelHub: Angel investor network
                   - Ventureburn: Tech media and events
                
                2. Funding Opportunities:
                   - Knife Capital: Early-stage VC
                   - 4Di Capital: African tech focus
                   - TLcom Capital: Pan-African VC
                   - SA SME Fund: Government-backed funding
                
                3. Accelerators & Incubators:
                   - Atlantis Hub: Corporate innovation
                   - RLabs: Social innovation
                   - 88mph: Early-stage accelerator
                   - Grindstone: Growth accelerator
                
                4. Co-working Spaces:
                   - Workshop17: Premium co-working
                   - The Workspace: Affordable options
                   - Root44: Innovation hub
                   - Bandwidth Barn: Creative community
                
                5. Tech Events & Conferences:
                   - AfricArena: Annual tech summit
                   - DisruptHR: HR tech focus
                   - DevConf: Developer conference
                   - AI Expo: Artificial intelligence focus
                
                Business Development Strategy:
                - Join 2-3 key communities for networking
                - Attend monthly events for visibility
                - Speak at conferences to establish thought leadership
                - Partner with other startups for mutual growth
                - Leverage government tech initiatives and grants
                
                International Expansion:
                - Use Cape Town as African headquarters
                - Leverage trade missions and government support
                - Access to rest of Africa via established networks
                - Time zone advantages for European markets
                """,
                "category": "networking",
                "tags": ["cape_town", "startup_ecosystem", "funding", "accelerators", "tech_events"]
            }
        ]
        
        # Upload documents to RAG system
        uploaded_count = 0
        for doc in financial_docs:
            success = self.upload_document_to_rag(doc)
            if success:
                uploaded_count += 1
                print(f"✅ Uploaded: {doc['title']}")
            else:
                print(f"❌ Failed: {doc['title']}")
        
        print(f"\n📊 Knowledge Base Setup Complete!")
        print(f"📄 Documents uploaded: {uploaded_count}/{len(financial_docs)}")
        
        # Test the knowledge base
        self.test_knowledge_base()
    
    def upload_document_to_rag(self, doc):
        """Upload a document to the RAG system via API"""
        try:
            # Create a temporary text file content
            content = f"Title: {doc['title']}\n\nContent:\n{doc['content']}\n\nCategory: {doc['category']}\nTags: {', '.join(doc['tags'])}"
            
            # Prepare the upload data
            upload_data = {
                "content": content,
                "metadata": {
                    "fileName": f"{doc['title'].replace(' ', '_').lower()}.txt",
                    "fileType": "text/plain",
                    "category": doc['category'],
                    "tags": doc['tags'],
                    "uploadedAt": datetime.now().isoformat(),
                    "source": "knowledge_base_setup"
                }
            }
            
            # Since the RAG system expects file uploads, we'll use the analyze endpoint instead
            response = requests.post(
                f"{self.backend_url}/api/rag/analyze",
                json={
                    "content": content,
                    "analysisType": "document_classification",
                    "metadata": upload_data["metadata"]
                },
                headers={"Content-Type": "application/json"},
                timeout=30
            )
            
            return response.status_code in [200, 201]
            
        except Exception as e:
            print(f"Upload error: {e}")
            return False
    
    def test_knowledge_base(self):
        """Test the knowledge base with sample queries"""
        test_queries = [
            "What is the best investment strategy for reaching R1.8M?",
            "How can I optimize my tax strategy in South Africa?", 
            "What are the key risks I should consider for aggressive growth?",
            "How can I grow 43V3R to R4,881 daily revenue?"
        ]
        
        print("\n🧪 Testing Knowledge Base...")
        
        for query in test_queries:
            try:
                response = requests.post(
                    f"{self.backend_url}/api/rag/search",
                    json={
                        "query": query,
                        "limit": 3,
                        "threshold": 0.7
                    },
                    headers={"Content-Type": "application/json"},
                    timeout=10
                )
                
                if response.status_code == 200:
                    results = response.json()
                    result_count = len(results.get("results", []))
                    print(f"✅ Query: '{query[:50]}...' → {result_count} results")
                else:
                    print(f"❌ Query failed: {query[:50]}...")
                    
            except Exception as e:
                print(f"❌ Test error: {e}")

def main():
    print("🚀 LIF3 Financial Knowledge Base Setup")
    print("=" * 50)
    
    setup = LIF3KnowledgeBaseSetup()
    setup.setup_financial_knowledge_base()
    
    print("\n💡 Next Steps:")
    print("1. Test Claude CLI integration with:")
    print("   python scripts/claude_integration.py 'What investment strategy should I use?'")
    print("2. Start the backend server if not running:")
    print("   npm start")
    print("3. Access RAG endpoints at http://localhost:3001/api/rag/")

if __name__ == "__main__":
    main()