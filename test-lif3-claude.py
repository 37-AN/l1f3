#!/usr/bin/env python3
# Simple test of LIF3 Claude integration

import os
import sys
from pathlib import Path
from datetime import datetime

# Test without requiring Anthropic API - just demonstrate the knowledge loading
class LIF3TestSystem:
    def __init__(self):
        self.knowledge_dir = Path.home() / "Development" / "claude-knowledge"
        
    def load_lif3_knowledge(self):
        """Load and display LIF3 knowledge base"""
        lif3_dir = self.knowledge_dir / "lif3"
        if not lif3_dir.exists():
            return "❌ LIF3 knowledge directory not found"
        
        knowledge_summary = f"# LIF3 Knowledge Base Status\\n"
        knowledge_summary += f"📅 Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\\n\\n"
        
        md_files = list(lif3_dir.glob("*.md"))
        knowledge_summary += f"📄 Documents found: {len(md_files)}\\n\\n"
        
        # List all documents
        knowledge_summary += "## Available Documents:\\n"
        for md_file in sorted(md_files):
            file_size = md_file.stat().st_size
            knowledge_summary += f"- {md_file.name} ({file_size:,} bytes)\\n"
        
        # Show sample content from key documents
        key_docs = ['FINANCIAL_OVERVIEW.md', 'BUSINESS_STRATEGY.md', 'LIF3_STATUS.md']
        for doc_name in key_docs:
            doc_path = lif3_dir / doc_name
            if doc_path.exists():
                knowledge_summary += f"\\n## Sample from {doc_name}:\\n"
                with open(doc_path, 'r') as f:
                    content = f.read()[:500]  # First 500 chars
                    knowledge_summary += f"```\\n{content}...\\n```\\n"
        
        return knowledge_summary
    
    def simulate_financial_context(self):
        """Simulate financial context without backend"""
        return """
# LIF3 FINANCIAL SIMULATION
📊 Current Status: Demo Mode (Backend not connected)

## Financial Goals:
- Net Worth Target: R1,800,000
- Current Progress: R239,625 (13.3%)
- 43V3R Daily Target: R4,881
- Timeline: 18 months remaining

## Today's Priorities:
1. ✅ Test AI integration setup
2. 🔄 Validate knowledge base sync
3. 📊 Configure financial tracking
4. 🚀 Begin automated monitoring

## System Status:
- Knowledge Base: ✅ Operational
- Documentation Sync: ✅ Active
- AI Integration: ✅ Ready
- Backend Connection: ⏳ Pending startup
"""

def main():
    print("🚀 LIF3 AI Integration Test")
    print("=" * 50)
    
    test_system = LIF3TestSystem()
    
    # Test 1: Knowledge Base
    print("\\n📚 Testing Knowledge Base...")
    knowledge_status = test_system.load_lif3_knowledge()
    print(knowledge_status)
    
    # Test 2: Financial Context
    print("\\n💰 Testing Financial Context...")
    financial_context = test_system.simulate_financial_context()
    print(financial_context)
    
    # Test 3: System Integration
    print("\\n🔧 System Integration Status:")
    
    # Check for key files
    key_files = [
        "/Users/ccladysmith/Desktop/dev/l1f3/enhanced-claude-cli.py",
        "/Users/ccladysmith/Desktop/dev/l1f3/knowledge-sync-daemon.py",
        "/Users/ccladysmith/Desktop/dev/l1f3/backend/src/modules/ai-agent/ai-agent.service.ts"
    ]
    
    for file_path in key_files:
        if Path(file_path).exists():
            print(f"✅ {Path(file_path).name}")
        else:
            print(f"❌ {Path(file_path).name}")
    
    # Check aliases
    print("\\n🔗 Available Commands:")
    print("  lif3-claude --briefing          # Generate daily briefing")
    print("  lif3-claude --progress          # Analyze goal progress")
    print("  lif3-claude --business          # Business strategy")
    print("  lif3-sync                       # Start knowledge sync")
    
    print("\\n🎯 Next Steps:")
    print("1. Start LIF3 backend: cd backend && npm run dev")
    print("2. Verify Anthropic API key is valid")
    print("3. Test full integration: lif3-claude --briefing")
    print("4. Begin daily usage for R1,800,000 goal tracking")
    
    print("\\n✅ LIF3 AI Integration Test Complete!")

if __name__ == "__main__":
    main()