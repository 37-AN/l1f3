#!/usr/bin/env python3
"""
LIF3 Agent - Core AI Agent for Financial Management
Zero-GPU, Maximum Impact Strategy for R1,800,000 Goal
"""

import asyncio
import time
import sqlite3
import json
import requests
import os
from typing import Dict, List, Optional
from dataclasses import dataclass
from datetime import datetime, timedelta
from pathlib import Path
from anthropic import Anthropic

@dataclass
class LIF3Goal:
    goal_type: str
    target_amount: float
    current_amount: float
    target_date: str
    progress_percentage: float

class LIF3Agent:
    def __init__(self, db_path: str = "database/lif3_financial.db"):
        self.db_path = db_path
        self.base_dir = Path(__file__).parent
        self.db_connection = self._connect_db()
        self.goals = self._load_goals()
        self.claude_client = self._init_claude()
        self.automation_tasks = [
            "update_financial_metrics",
            "generate_daily_briefing", 
            "monitor_43v3r_revenue",
            "optimize_savings_rate",
            "generate_business_insights"
        ]
        
        # Create logs directory
        (self.base_dir / "logs").mkdir(exist_ok=True)
        
        print("🚀 LIF3 Agent initialized successfully")
        print(f"💾 Database: {self.db_path}")
        print(f"🎯 Goals loaded: {len(self.goals)}")
    
    def _init_claude(self) -> Optional[Anthropic]:
        """Initialize Claude AI client"""
        api_key = os.getenv('ANTHROPIC_API_KEY', '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')
        if api_key:
            return Anthropic(api_key=api_key)
        return None
    
    def _connect_db(self):
        """Connect to SQLite database"""
        db_full_path = self.base_dir / self.db_path
        return sqlite3.connect(str(db_full_path), check_same_thread=False)
    
    def _load_goals(self) -> List[LIF3Goal]:
        """Load financial goals from database"""
        cursor = self.db_connection.cursor()
        cursor.execute("SELECT * FROM goals WHERE status = 'active'")
        results = cursor.fetchall()
        
        goals = []
        for row in results:
            goal_type, target_amount, current_amount, target_date = row[1], row[2], row[3], row[4]
            progress = (current_amount / target_amount) * 100 if target_amount > 0 else 0
            goals.append(LIF3Goal(
                goal_type=goal_type,
                target_amount=target_amount,
                current_amount=current_amount,
                target_date=str(target_date),
                progress_percentage=progress
            ))
        return goals
    
    def update_net_worth(self, new_amount: float) -> Dict:
        """Update net worth and calculate progress"""
        cursor = self.db_connection.cursor()
        cursor.execute(
            "UPDATE goals SET current_amount = ? WHERE goal_type = 'net_worth'",
            (new_amount,)
        )
        self.db_connection.commit()
        
        # Reload goals
        self.goals = self._load_goals()
        
        # Calculate progress metrics
        net_worth_goal = next((g for g in self.goals if g.goal_type == 'net_worth'), None)
        if not net_worth_goal:
            return {"error": "Net worth goal not found"}
        
        months_remaining = 18  # Update based on actual timeline
        required_monthly_growth = (1800000 - new_amount) / months_remaining
        
        result = {
            "current_net_worth": new_amount,
            "target": 1800000,
            "progress": (new_amount / 1800000) * 100,
            "required_monthly_growth": required_monthly_growth,
            "on_track": required_monthly_growth <= 100000,  # Reasonable monthly target
            "updated_at": datetime.now().isoformat()
        }
        
        # Log the update
        self._log_event("net_worth_update", result)
        
        return result
    
    def log_43v3r_revenue(self, amount: float, description: str = "") -> Dict:
        """Log daily 43V3R business revenue"""
        cursor = self.db_connection.cursor()
        cursor.execute(
            """INSERT INTO transactions 
               (account_id, amount, description, category, date, is_business_expense) 
               VALUES (1, ?, ?, '43V3R Revenue', DATE('now'), FALSE)""",
            (amount, description)
        )
        self.db_connection.commit()
        
        # Check progress toward R4,881 daily target
        result = {
            "amount_logged": amount,
            "daily_target": 4881,
            "progress_today": (amount / 4881) * 100,
            "description": description,
            "logged_at": datetime.now().isoformat()
        }
        
        # Log the revenue
        self._log_event("43v3r_revenue", result)
        
        return result
    
    def get_daily_revenue(self) -> float:
        """Get today's 43V3R revenue"""
        cursor = self.db_connection.cursor()
        cursor.execute(
            """SELECT SUM(amount) as daily_revenue 
               FROM transactions 
               WHERE date = DATE('now') AND category = '43V3R Revenue'"""
        )
        result = cursor.fetchone()
        return result[0] if result[0] else 0
    
    def generate_daily_briefing(self) -> str:
        """Generate today's LIF3 command center briefing"""
        today = datetime.now().strftime("%Y-%m-%d")
        
        # Get current metrics
        net_worth_goal = next((g for g in self.goals if g.goal_type == 'net_worth'), None)
        if not net_worth_goal:
            return "Error: Net worth goal not found"
        
        # Get today's revenue
        daily_revenue = self.get_daily_revenue()
        
        # Generate AI-enhanced briefing if Claude is available
        if self.claude_client:
            briefing = self._generate_ai_briefing(net_worth_goal, daily_revenue)
        else:
            briefing = self._generate_basic_briefing(net_worth_goal, daily_revenue)
        
        # Save briefing to file
        briefing_file = self.base_dir / "logs" / f"daily_briefing_{today}.md"
        with open(briefing_file, 'w') as f:
            f.write(briefing)
        
        self._log_event("daily_briefing", {"generated": True, "file": str(briefing_file)})
        
        return briefing
    
    def _generate_ai_briefing(self, net_worth_goal: LIF3Goal, daily_revenue: float) -> str:
        """Generate AI-enhanced briefing using Claude"""
        context = f"""
        Current Net Worth: R{net_worth_goal.current_amount:,.0f}
        Target Net Worth: R{net_worth_goal.target_amount:,.0f}
        Progress: {net_worth_goal.progress_percentage:.1f}%
        Today's 43V3R Revenue: R{daily_revenue:,.0f}
        Daily Revenue Target: R4,881
        Location: Cape Town, South Africa
        Timeline: 18 months to goal
        """
        
        try:
            response = self.claude_client.messages.create(
                model="claude-3-5-sonnet-20241022",
                max_tokens=2000,
                system="You are a financial advisor and business strategist for a Cape Town-based entrepreneur building wealth through the 43V3R AI startup. Provide actionable, specific advice.",
                messages=[{
                    "role": "user",
                    "content": f"""Generate a daily executive briefing for LIF3 financial management with this data:

{context}

Include:
1. Executive summary with key metrics
2. Today's priority actions
3. 43V3R business recommendations
4. Financial optimization opportunities
5. Progress toward R1,800,000 goal

Format as a professional daily briefing for a Cape Town entrepreneur."""
                }]
            )
            return response.content[0].text
        except Exception as e:
            self._log_event("ai_briefing_error", {"error": str(e)})
            return self._generate_basic_briefing(net_worth_goal, daily_revenue)
    
    def _generate_basic_briefing(self, net_worth_goal: LIF3Goal, daily_revenue: float) -> str:
        """Generate basic briefing without AI"""
        today = datetime.now().strftime("%Y-%m-%d")
        
        briefing = f"""
# LIF3 Daily Command Center - {today}
*43V3R AI Startup & Personal Life Management (ZAR Currency)*

## 📊 TODAY'S EXECUTIVE SUMMARY
**Date**: {datetime.now().strftime('%A, %B %d, %Y')}
**Status**: Foundation Building Phase
**Net Worth Progress**: R{net_worth_goal.current_amount:,.0f} / R{net_worth_goal.target_amount:,.0f} ({net_worth_goal.progress_percentage:.1f}%)

## 🚀 43V3R BUSINESS METRICS
- **Today's Revenue**: R{daily_revenue:,.0f} / R4,881 target
- **Revenue Progress**: {(daily_revenue/4881)*100:.1f}%
- **Action Required**: {'✅ On track' if daily_revenue >= 4881 else '🔴 Need revenue activity'}

## 💰 FINANCIAL COMMAND CENTER
- **Current Net Worth**: R{net_worth_goal.current_amount:,.0f}
- **Target Net Worth**: R{net_worth_goal.target_amount:,.0f}
- **Remaining**: R{net_worth_goal.target_amount - net_worth_goal.current_amount:,.0f}
- **Progress**: {net_worth_goal.progress_percentage:.1f}%
- **Monthly Growth Required**: R{(net_worth_goal.target_amount - net_worth_goal.current_amount) / 18:,.0f}

## 🎯 TODAY'S PRIORITIES
1. [ ] Revenue generation activity (Target: R1,000+)
2. [ ] Financial optimization (investment research)
3. [ ] 43V3R development (2 hours minimum)
4. [ ] Skill development (AI/ML learning)
5. [ ] Network with Cape Town tech community

## 🤖 AI AGENT STATUS
**Agent Active**: ✅ Monitoring continuously
**Last Update**: {datetime.now().strftime('%H:%M')}
**Next Check**: {(datetime.now() + timedelta(hours=1)).strftime('%H:%M')}

## 📈 PROGRESS ANALYSIS
- **Days to Goal**: {(datetime(2026, 12, 31) - datetime.now()).days}
- **Daily Growth Needed**: R{(net_worth_goal.target_amount - net_worth_goal.current_amount) / 547:,.0f}
- **43V3R Impact**: Daily R4,881 = R147,917 monthly
- **Success Probability**: {'High' if net_worth_goal.progress_percentage > 10 else 'Requires Focus'}

## 🌍 CAPE TOWN ADVANTAGES
- Lower operational costs than US/EU
- Excellent time zone for global business
- Growing AI/tech talent pool
- Government startup incentives
"""
        return briefing
    
    def get_financial_summary(self) -> Dict:
        """Get comprehensive financial summary"""
        cursor = self.db_connection.cursor()
        
        # Get recent transactions
        cursor.execute(
            """SELECT amount, description, category, date 
               FROM transactions 
               ORDER BY date DESC 
               LIMIT 20"""
        )
        transactions = cursor.fetchall()
        
        # Get monthly revenue
        cursor.execute(
            """SELECT SUM(amount) as monthly_revenue 
               FROM transactions 
               WHERE date >= DATE('now', 'start of month') 
               AND category = '43V3R Revenue'"""
        )
        monthly_revenue = cursor.fetchone()[0] or 0
        
        return {
            "goals": [goal.__dict__ for goal in self.goals],
            "recent_transactions": transactions,
            "monthly_revenue": monthly_revenue,
            "daily_revenue": self.get_daily_revenue(),
            "last_updated": datetime.now().isoformat()
        }
    
    def _log_event(self, event_type: str, data: Dict):
        """Log system events"""
        log_entry = {
            "timestamp": datetime.now().isoformat(),
            "event_type": event_type,
            "data": data
        }
        
        log_file = self.base_dir / "logs" / f"lif3_agent_{datetime.now().strftime('%Y-%m-%d')}.log"
        with open(log_file, 'a') as f:
            f.write(json.dumps(log_entry) + "\\n")
    
    async def continuous_monitoring(self):
        """Main 24/7 monitoring loop"""
        print("🔄 Starting continuous monitoring...")
        
        while True:
            try:
                current_time = datetime.now()
                print(f"[{current_time}] LIF3 Agent Check Starting...")
                
                # 1. Generate daily briefing if it's 8 AM
                if current_time.hour == 8 and current_time.minute < 5:
                    briefing = self.generate_daily_briefing()
                    print("📋 Daily briefing generated")
                
                # 2. Check goal progress every hour
                if current_time.minute == 0:
                    self._check_milestone_alerts()
                
                # 3. Business automation during business hours
                if current_time.hour in [9, 13, 17] and current_time.minute == 0:
                    self._run_business_automation()
                
                print(f"[{current_time}] LIF3 Agent Check Complete")
                
                # Sleep for 5 minutes
                await asyncio.sleep(300)
                
            except Exception as e:
                print(f"[{datetime.now()}] Error in monitoring: {e}")
                self._log_event("monitoring_error", {"error": str(e)})
                await asyncio.sleep(300)  # 5 min before retry
    
    def _check_milestone_alerts(self):
        """Check for financial milestone achievements"""
        net_worth_goal = next((g for g in self.goals if g.goal_type == 'net_worth'), None)
        if not net_worth_goal:
            return
        
        # Check if we've hit major milestones
        milestones = [250000, 500000, 750000, 1000000, 1250000, 1500000, 1750000]
        
        for milestone in milestones:
            if net_worth_goal.current_amount >= milestone:
                self._log_event("milestone_achieved", {
                    "milestone": milestone,
                    "current": net_worth_goal.current_amount,
                    "progress": net_worth_goal.progress_percentage
                })
    
    def _run_business_automation(self):
        """Run 43V3R business automation tasks"""
        current_revenue = self.get_daily_revenue()
        
        if current_revenue < 1000:  # Less than R1,000 today
            self._log_event("revenue_alert", {
                "current_revenue": current_revenue,
                "target": 4881,
                "alert": "Low revenue - action needed"
            })
    
    def get_status(self) -> Dict:
        """Get current system status"""
        return {
            "status": "active",
            "goals_loaded": len(self.goals),
            "database_connected": self.db_connection is not None,
            "claude_available": self.claude_client is not None,
            "last_check": datetime.now().isoformat(),
            "net_worth_progress": next((g.progress_percentage for g in self.goals if g.goal_type == 'net_worth'), 0),
            "daily_revenue": self.get_daily_revenue()
        }

# Main execution
if __name__ == "__main__":
    agent = LIF3Agent()
    
    print("🚀 Starting LIF3 AI Agent...")
    print("💰 Monitoring path to R1,800,000 net worth")
    print("🏢 Tracking 43V3R revenue progress")
    print("🌍 Operating from Cape Town, South Africa")
    print()
    print("Press Ctrl+C to stop monitoring")
    
    try:
        # Generate initial briefing
        briefing = agent.generate_daily_briefing()
        print("📋 Initial briefing generated")
        
        # Start continuous monitoring
        asyncio.run(agent.continuous_monitoring())
    except KeyboardInterrupt:
        print("\\n🛑 LIF3 Agent stopped by user")
    except Exception as e:
        print(f"\\n❌ LIF3 Agent error: {e}")
        agent._log_event("agent_error", {"error": str(e)})