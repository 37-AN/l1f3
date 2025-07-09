#!/usr/bin/env python3
"""
LIF3 Financial MCP Server - Real Data Implementation
Ethan Barnes - Starting Fresh: R0 → R500,000 by Dec 2025
4 Life Categories: Personal, Work, 43V3R Tech, 43V3R Brand
"""

import asyncio
import sqlite3
import json
import os
from datetime import datetime, date
from typing import Dict, List, Any, Optional
from mcp.server import Server, NotificationOptions
from mcp.types import Resource, Tool, TextContent, EmbeddedResource

app = Server("lif3-financial-server")

# Real data from Ethan Barnes
DB_PATH = "/Users/ccladysmith/Desktop/dev/l1f3/data/lif3_financial.db"

# Ethan's Real Financial Data
REAL_DATA = {
    "personal": {
        "liquid_cash": 0,
        "emergency_fund": 0,
        "savings_account": 0,
        "current_debt": 7000,
        "target_net_worth": 500000,
        "target_date": "2025-12-31",
        "monthly_income_min": 18000,
        "monthly_income_max": 24000,
        "monthly_expenses": {
            "loan_payment": 1664,
            "rent": 3000,
            "wifi": 500,
            "bash_clothing": 2929,
            "iphone": 1200,
            "claude_ai": 350,
            "total": 9643
        }
    },
    "work": {
        "role": "IT Engineer",
        "education": "Computer Engineering Diploma",
        "linkedin": "https://www.linkedin.com/in/ethan-barnes17/",
        "career_goal": "High-paying remote position",
        "education_goal": "Advanced Diploma then Masters"
    },
    "tech_business": {
        "name": "43V3R Technology",
        "services": ["AI", "Web3", "Blockchain", "Quantum Computing", "Enterprise AI Solutions"],
        "current_mrr": 0,
        "target_mrr": 100000,
        "timeline": "2-3 years",
        "current_clients": 0,
        "monthly_expenses": 350,  # Claude AI
        "tools": ["Claude CLI", "Cursor", "Gemini CLI"]
    },
    "brand_business": {
        "name": "43V3R Brand",
        "focus": ["Futuristic Dystopian Clothing", "Smart LED Fabrics", "Glow in Dark", "Content Creation", "Music"],
        "current_revenue": 0,
        "target_revenue": 50000,
        "status": "Development Phase"
    },
    "habits": [
        {"name": "Work on AI Startup", "frequency": "daily", "category": "business"},
        {"name": "Quit Smoking", "frequency": "daily", "category": "health"},
        {"name": "Physical Fitness", "frequency": "daily", "category": "health"},
        {"name": "Skill Development", "frequency": "daily", "category": "work"}
    ]
}

def init_database():
    """Initialize database with Ethan's real data"""
    conn = sqlite3.connect(DB_PATH)
    
    # Create tables
    conn.executescript("""
        -- Personal Financial Accounts
        CREATE TABLE IF NOT EXISTS accounts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            type TEXT NOT NULL, -- 'personal', 'work', 'tech_business', 'brand_business'
            category TEXT NOT NULL, -- 'checking', 'savings', 'investment', 'debt'
            balance REAL DEFAULT 0,
            currency TEXT DEFAULT 'ZAR',
            is_active BOOLEAN DEFAULT TRUE,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        -- All Transactions
        CREATE TABLE IF NOT EXISTS transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            account_id INTEGER,
            amount REAL NOT NULL,
            description TEXT,
            category TEXT, -- 'income', 'expense', 'transfer', 'investment'
            subcategory TEXT, -- 'rent', 'food', 'business_expense', etc.
            life_category TEXT, -- 'personal', 'work', 'tech_business', 'brand_business'
            date DATE DEFAULT CURRENT_DATE,
            is_recurring BOOLEAN DEFAULT FALSE,
            recurring_frequency TEXT,
            notes TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (account_id) REFERENCES accounts (id)
        );

        -- Goals across all life areas
        CREATE TABLE IF NOT EXISTS goals (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            life_category TEXT NOT NULL,
            target_amount REAL,
            current_amount REAL DEFAULT 0,
            target_date DATE,
            status TEXT DEFAULT 'active',
            priority TEXT DEFAULT 'medium',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        -- Business Metrics for 43V3R Technology
        CREATE TABLE IF NOT EXISTS tech_business_metrics (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            metric_name TEXT NOT NULL,
            metric_value REAL,
            metric_unit TEXT,
            date DATE DEFAULT CURRENT_DATE,
            notes TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        -- Business Metrics for 43V3R Brand
        CREATE TABLE IF NOT EXISTS brand_business_metrics (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            metric_name TEXT NOT NULL,
            metric_value REAL,
            metric_unit TEXT,
            platform TEXT,
            date DATE DEFAULT CURRENT_DATE,
            notes TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        -- Habits Tracking
        CREATE TABLE IF NOT EXISTS habits (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            habit_name TEXT NOT NULL,
            life_category TEXT,
            target_frequency TEXT,
            current_streak INTEGER DEFAULT 0,
            longest_streak INTEGER DEFAULT 0,
            is_active BOOLEAN DEFAULT TRUE,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        -- Habit Entries
        CREATE TABLE IF NOT EXISTS habit_entries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            habit_id INTEGER,
            completed BOOLEAN DEFAULT FALSE,
            date DATE DEFAULT CURRENT_DATE,
            notes TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (habit_id) REFERENCES habits (id)
        );
    """)
    
    # Insert Ethan's real data (starting fresh)
    data = REAL_DATA
    
    # Accounts - Starting Fresh (All R0 except debt)
    accounts_data = [
        ('Liquid Cash', 'personal', 'checking', 0),
        ('Emergency Fund', 'personal', 'savings', 0), 
        ('Savings Account', 'personal', 'savings', 0),
        ('Current Debt', 'personal', 'debt', -7000),
        ('43V3R Tech Business', 'tech_business', 'checking', 0),
        ('43V3R Brand Business', 'brand_business', 'checking', 0),
        ('IT Engineering Income', 'work', 'income', 0)
    ]
    
    conn.executemany("""
        INSERT OR REPLACE INTO accounts (name, type, category, balance) 
        VALUES (?, ?, ?, ?)
    """, accounts_data)
    
    # Goals - Ethan's Real Goals
    goals_data = [
        ('Net Worth R500K by Dec 2025', 'Primary financial goal - achieve R500,000 net worth', 'personal', 500000, 0, '2025-12-31', 'high'),
        ('Quit Smoking', 'Improve health and save money on cigarettes and weed', 'personal', 0, 0, '2025-06-30', 'high'),
        ('Own a House', 'Purchase own property', 'personal', 1000000, 0, '2026-12-31', 'high'),
        ('Get a Car', 'Reliable transportation', 'personal', 200000, 0, '2025-12-31', 'medium'),
        ('Million Dollar Startup', 'Build 43V3R into million dollar company', 'tech_business', 1000000, 0, '2027-12-31', 'high'),
        ('43V3R Tech R100K MRR', 'Scale technology business to R100K monthly recurring revenue', 'tech_business', 100000, 0, '2027-12-31', 'high'),
        ('Advanced Diploma', 'Complete advanced diploma in computer engineering', 'work', 50000, 0, '2026-12-31', 'medium'),
        ('High-Paying Remote Job', 'Secure remote IT position with higher salary', 'work', 50000, 0, '2025-12-31', 'high'),
        ('43V3R Brand Launch', 'Launch futuristic dystopian clothing line', 'brand_business', 25000, 0, '2025-09-30', 'medium'),
        ('Get Out of Debt', 'Eliminate R7,000 debt to be self-sustainable', 'personal', 7000, 0, '2025-06-30', 'high'),
        ('Help Parents', 'Be able to financially help parents', 'personal', 50000, 0, '2026-12-31', 'medium')
    ]
    
    conn.executemany("""
        INSERT OR REPLACE INTO goals (title, description, life_category, target_amount, current_amount, target_date, priority) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, goals_data)
    
    # Habits - Ethan's Current Habits
    habits_data = [
        ('Work on AI Startup', 'business', 'daily'),
        ('Quit Smoking Progress', 'personal', 'daily'),
        ('Physical Fitness', 'personal', 'daily'),
        ('Skill Development (AI)', 'work', 'daily'),
        ('Financial Review', 'personal', 'weekly'),
        ('Business Planning', 'business', 'weekly')
    ]
    
    conn.executemany("""
        INSERT OR REPLACE INTO habits (habit_name, life_category, target_frequency) 
        VALUES (?, ?, ?)
    """, habits_data)
    
    # Add initial monthly expense transactions
    expenses_data = [
        ('Loan Payment', -1664, 'expense', 'debt_payment'),
        ('Rent', -3000, 'expense', 'housing'),
        ('Internet/WiFi', -500, 'expense', 'utilities'),
        ('Bash.com Clothing', -2929, 'expense', 'clothing'),
        ('iPhone Payment', -1200, 'expense', 'technology'),
        ('Claude AI Subscription', -350, 'expense', 'business_tools')
    ]
    
    for desc, amount, cat, subcat in expenses_data:
        conn.execute("""
            INSERT INTO transactions (account_id, amount, description, category, subcategory, life_category)
            VALUES (
                (SELECT id FROM accounts WHERE name = 'Liquid Cash'),
                ?, ?, ?, ?, 'personal'
            )
        """, (amount, desc, cat, subcat))
    
    conn.commit()
    conn.close()
    print("✅ Database initialized with Ethan's real financial data")

def get_db_connection():
    """Get database connection"""
    if not os.path.exists(DB_PATH):
        init_database()
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

@app.list_resources()
async def list_resources() -> List[Resource]:
    """List available financial resources"""
    return [
        Resource(
            uri="lif3://dashboard",
            name="Complete LIF3 Dashboard",
            description="Ethan Barnes complete life dashboard - 4 categories",
            mimeType="application/json"
        ),
        Resource(
            uri="lif3://personal",
            name="Personal Finance",
            description="Personal financial tracking and goals (R0 → R500K)",
            mimeType="application/json"
        ),
        Resource(
            uri="lif3://work",
            name="IT Engineering Career",
            description="Work progress and career development",
            mimeType="application/json"
        ),
        Resource(
            uri="lif3://tech-business",
            name="43V3R Technology Business",
            description="AI/Web3/Blockchain startup (R0 → R100K MRR)",
            mimeType="application/json"
        ),
        Resource(
            uri="lif3://brand-business",
            name="43V3R Brand Business",
            description="Futuristic clothing and content creation",
            mimeType="application/json"
        ),
        Resource(
            uri="lif3://net-worth",
            name="Net Worth Calculation",
            description="Real-time net worth calculation across all accounts",
            mimeType="application/json"
        )
    ]

@app.read_resource()
async def read_resource(uri: str) -> str:
    """Read financial resource data"""
    with get_db_connection() as conn:
        if uri == "lif3://dashboard":
            # Complete dashboard for all 4 life categories
            dashboard = {
                "personal": {
                    "net_worth": conn.execute("SELECT SUM(balance) FROM accounts WHERE type = 'personal'").fetchone()[0] or 0,
                    "target_net_worth": 500000,
                    "target_date": "2025-12-31",
                    "monthly_income": "R18,000 - R24,000",
                    "monthly_expenses": 9643,
                    "debt": 7000,
                    "accounts": [dict(row) for row in conn.execute("SELECT * FROM accounts WHERE type = 'personal'").fetchall()],
                    "goals": [dict(row) for row in conn.execute("SELECT * FROM goals WHERE life_category = 'personal'").fetchall()]
                },
                "work": {
                    "role": "IT Engineer",
                    "education": "Computer Engineering Diploma",
                    "linkedin": "https://www.linkedin.com/in/ethan-barnes17/",
                    "salary_range": "R18,000 - R24,000",
                    "goals": [dict(row) for row in conn.execute("SELECT * FROM goals WHERE life_category = 'work'").fetchall()]
                },
                "tech_business": {
                    "name": "43V3R Technology",
                    "services": ["AI", "Web3", "Blockchain", "Quantum Computing"],
                    "current_mrr": 0,
                    "target_mrr": 100000,
                    "current_clients": 0,
                    "monthly_expenses": 350,
                    "tools": ["Claude CLI", "Cursor", "Gemini CLI"],
                    "goals": [dict(row) for row in conn.execute("SELECT * FROM goals WHERE life_category = 'tech_business'").fetchall()],
                    "metrics": [dict(row) for row in conn.execute("SELECT * FROM tech_business_metrics ORDER BY date DESC LIMIT 10").fetchall()]
                },
                "brand_business": {
                    "name": "43V3R Brand",
                    "focus": ["Futuristic Dystopian Clothing", "Smart LED Fabrics", "Content Creation", "Music"],
                    "current_revenue": 0,
                    "status": "Development Phase",
                    "goals": [dict(row) for row in conn.execute("SELECT * FROM goals WHERE life_category = 'brand_business'").fetchall()],
                    "metrics": [dict(row) for row in conn.execute("SELECT * FROM brand_business_metrics ORDER BY date DESC LIMIT 10").fetchall()]
                },
                "habits": [dict(row) for row in conn.execute("SELECT * FROM habits WHERE is_active = 1").fetchall()],
                "recent_transactions": [dict(row) for row in conn.execute("SELECT t.*, a.name as account_name FROM transactions t LEFT JOIN accounts a ON t.account_id = a.id ORDER BY t.date DESC LIMIT 10").fetchall()],
                "generated_at": datetime.now().isoformat()
            }
            return json.dumps(dashboard, indent=2, default=str)
        
        elif uri == "lif3://personal":
            personal_data = conn.execute("SELECT SUM(balance) FROM accounts WHERE type = 'personal'").fetchone()[0] or 0
            goal_progress = (personal_data / 500000) * 100
            days_remaining = (datetime(2025, 12, 31) - datetime.now()).days
            
            return json.dumps({
                "current_net_worth": personal_data,
                "target_net_worth": 500000,
                "goal_progress": goal_progress,
                "days_remaining": days_remaining,
                "monthly_income_min": 18000,
                "monthly_income_max": 24000,
                "monthly_expenses": 9643,
                "debt": 7000,
                "accounts": [dict(row) for row in conn.execute("SELECT * FROM accounts WHERE type = 'personal'").fetchall()],
                "goals": [dict(row) for row in conn.execute("SELECT * FROM goals WHERE life_category = 'personal'").fetchall()]
            }, indent=2, default=str)
        
        elif uri == "lif3://tech-business":
            return json.dumps({
                "business_name": "43V3R Technology",
                "services": ["AI", "Web3", "Blockchain", "Quantum Computing", "Enterprise AI Solutions"],
                "current_mrr": 0,
                "target_mrr": 100000,
                "timeline": "2-3 years to R100K MRR",
                "current_clients": 0,
                "monthly_expenses": 350,
                "tools": ["Claude CLI", "Cursor", "Gemini CLI"],
                "strategy": "Start with AI consulting R2K-R10K/project",
                "goals": [dict(row) for row in conn.execute("SELECT * FROM goals WHERE life_category = 'tech_business'").fetchall()],
                "metrics": [dict(row) for row in conn.execute("SELECT * FROM tech_business_metrics ORDER BY date DESC").fetchall()]
            }, indent=2, default=str)

@app.list_tools()
async def list_tools() -> List[Tool]:
    """List available financial tools"""
    return [
        Tool(
            name="update_balance",
            description="Update account balance for any life category",
            inputSchema={
                "type": "object",
                "properties": {
                    "account_name": {"type": "string", "description": "Account name (Liquid Cash, Emergency Fund, etc.)"},
                    "new_balance": {"type": "number", "description": "New balance in ZAR"},
                    "notes": {"type": "string", "description": "Optional notes"}
                },
                "required": ["account_name", "new_balance"]
            }
        ),
        Tool(
            name="add_transaction",
            description="Add transaction for personal, work, or business",
            inputSchema={
                "type": "object",
                "properties": {
                    "amount": {"type": "number", "description": "Amount in ZAR (negative for expenses)"},
                    "description": {"type": "string", "description": "Transaction description"},
                    "category": {"type": "string", "enum": ["income", "expense", "transfer", "investment"]},
                    "life_category": {"type": "string", "enum": ["personal", "work", "tech_business", "brand_business"]},
                    "account_name": {"type": "string", "description": "Account name", "default": "Liquid Cash"}
                },
                "required": ["amount", "description", "category", "life_category"]
            }
        ),
        Tool(
            name="calculate_net_worth",
            description="Calculate current net worth and progress toward R500K goal",
            inputSchema={"type": "object", "properties": {}, "required": []}
        ),
        Tool(
            name="add_business_revenue",
            description="Add revenue for 43V3R Technology or 43V3R Brand",
            inputSchema={
                "type": "object",
                "properties": {
                    "business": {"type": "string", "enum": ["tech", "brand"]},
                    "amount": {"type": "number", "description": "Revenue amount in ZAR"},
                    "description": {"type": "string", "description": "Revenue source/description"},
                    "client_name": {"type": "string", "description": "Client name (optional)"}
                },
                "required": ["business", "amount", "description"]
            }
        ),
        Tool(
            name="update_goal_progress",
            description="Update progress on any life goal",
            inputSchema={
                "type": "object",
                "properties": {
                    "goal_title": {"type": "string", "description": "Goal title to update"},
                    "progress_amount": {"type": "number", "description": "New progress amount"},
                    "notes": {"type": "string", "description": "Progress notes"}
                },
                "required": ["goal_title", "progress_amount"]
            }
        ),
        Tool(
            name="track_habit",
            description="Track daily habit completion",
            inputSchema={
                "type": "object",
                "properties": {
                    "habit_name": {"type": "string", "description": "Habit name"},
                    "completed": {"type": "boolean", "description": "Whether completed today"},
                    "notes": {"type": "string", "description": "Optional notes"}
                },
                "required": ["habit_name", "completed"]
            }
        ),
        Tool(
            name="get_financial_insights",
            description="Get AI insights and recommendations",
            inputSchema={
                "type": "object",
                "properties": {
                    "category": {"type": "string", "enum": ["personal", "work", "tech_business", "brand_business", "all"]},
                    "focus": {"type": "string", "description": "Specific focus area for insights"}
                },
                "required": ["category"]
            }
        )
    ]

@app.call_tool()
async def call_tool(name: str, arguments: Dict[str, Any]) -> List[TextContent]:
    """Execute financial tools"""
    
    if name == "update_balance":
        account_name = arguments["account_name"]
        new_balance = arguments["new_balance"]
        notes = arguments.get("notes", "")
        
        with get_db_connection() as conn:
            conn.execute("""
                UPDATE accounts 
                SET balance = ?, updated_at = CURRENT_TIMESTAMP 
                WHERE name = ?
            """, (new_balance, account_name))
            
            # Add transaction record
            account_id = conn.execute("SELECT id FROM accounts WHERE name = ?", (account_name,)).fetchone()
            if account_id:
                conn.execute("""
                    INSERT INTO transactions (account_id, amount, description, category, notes)
                    VALUES (?, ?, ?, 'adjustment', ?)
                """, (account_id[0], new_balance, f"Balance update: {account_name}", notes))
            
            conn.commit()
        
        return [TextContent(
            type="text",
            text=f"✅ Updated {account_name} to R{new_balance:,.2f}. {notes}"
        )]
    
    elif name == "calculate_net_worth":
        with get_db_connection() as conn:
            accounts = conn.execute("SELECT name, balance FROM accounts WHERE is_active = 1").fetchall()
            net_worth = sum(account[1] for account in accounts)
            progress = (net_worth / 500000) * 100
            days_remaining = (datetime(2025, 12, 31) - datetime.now()).days
            daily_target = (500000 - net_worth) / max(days_remaining, 1)
            
            breakdown = "\n".join([f"  {account[0]}: R{account[1]:,.2f}" for account in accounts])
            
            return [TextContent(
                type="text",
                text=f"""💰 **ETHAN'S NET WORTH CALCULATION**

{breakdown}

**Total Net Worth:** R{net_worth:,.2f}
**Target:** R500,000 by Dec 31, 2025
**Progress:** {progress:.1f}% complete
**Remaining:** R{500000 - net_worth:,.2f}

**Timeline Analysis:**
• Days remaining: {days_remaining}
• Daily target: R{daily_target:,.2f}
• Monthly target: R{daily_target * 30:,.2f}

**Strategy Priority:**
1. Launch 43V3R Tech AI consulting (R2K-R10K/project)
2. Eliminate R7,000 debt (R1,664/month payment)
3. Build emergency fund (R28,929 = 3 months expenses)
4. Scale business revenue to accelerate growth"""
            )]
    
    elif name == "add_business_revenue":
        business = arguments["business"]
        amount = arguments["amount"]
        description = arguments["description"]
        client_name = arguments.get("client_name", "")
        
        business_name = "43V3R Technology" if business == "tech" else "43V3R Brand"
        account_type = "tech_business" if business == "tech" else "brand_business"
        
        with get_db_connection() as conn:
            # Add to business account
            account_id = conn.execute(
                f"SELECT id FROM accounts WHERE type = '{account_type}'"
            ).fetchone()[0]
            
            conn.execute("""
                INSERT INTO transactions (account_id, amount, description, category, life_category, notes)
                VALUES (?, ?, ?, 'income', ?, ?)
            """, (account_id, amount, description, account_type, f"Client: {client_name}"))
            
            # Update account balance
            conn.execute(f"""
                UPDATE accounts 
                SET balance = balance + ?, updated_at = CURRENT_TIMESTAMP 
                WHERE type = '{account_type}'
            """, (amount,))
            
            # Add business metric
            table_name = "tech_business_metrics" if business == "tech" else "brand_business_metrics"
            conn.execute(f"""
                INSERT INTO {table_name} (metric_name, metric_value, metric_unit, notes)
                VALUES ('monthly_revenue', ?, 'ZAR', ?)
            """, (amount, f"{description} - {client_name}"))
            
            conn.commit()
        
        return [TextContent(
            type="text",
            text=f"🚀 **{business_name} Revenue Added!**\n\nAmount: R{amount:,.2f}\nDescription: {description}\nClient: {client_name}\n\n🎯 Great progress toward R100K MRR goal!"
        )]
    
    elif name == "get_financial_insights":
        category = arguments["category"]
        focus = arguments.get("focus", "")
        
        with get_db_connection() as conn:
            net_worth = conn.execute("SELECT SUM(balance) FROM accounts WHERE is_active = 1").fetchone()[0] or 0
            
            if category == "personal":
                insights = f"""📊 **PERSONAL FINANCE INSIGHTS**

**Current Status:**
• Net Worth: R{net_worth:,.2f} (Target: R500,000)
• Progress: {(net_worth/500000)*100:.1f}% to goal
• Monthly Income: R18,000 - R24,000
• Monthly Expenses: R9,643
• Debt: R7,000 (R1,664/month payment)

**💡 KEY RECOMMENDATIONS:**

1. **IMMEDIATE PRIORITY:** Launch 43V3R Tech AI consulting
   • Target: R2,000-R10,000 per project
   • 5 clients = R10K-R50K additional monthly income
   • Leverage Claude CLI and Cursor expertise

2. **EXPENSE OPTIMIZATION:**
   • Reduce Bash.com clothing: R2,929 → R1,500 (save R1,429)
   • Quit smoking: Save R2,000+ monthly
   • Total potential savings: R3,400+ monthly

3. **DEBT ELIMINATION:**
   • Current payment: R1,664/month
   • Extra R1,000/month = pay off 4 months early
   • Interest savings + faster debt freedom

4. **EMERGENCY FUND:**
   • Target: R28,929 (3 months expenses)
   • With 43V3R income: achievable in 3-6 months

**🎯 ACTION PLAN:**
Week 1: Create AI automation portfolio
Week 2: Contact 10 potential clients
Week 3: Close first 2 projects
Month 1: R5,000+ 43V3R revenue"""

            elif category == "tech_business":
                insights = f"""🚀 **43V3R TECHNOLOGY BUSINESS INSIGHTS**

**Current Status:**
• MRR: R0 (Target: R100,000)
• Clients: 0 (Building pipeline)
• Monthly Costs: R350 (Claude AI)
• Services: AI, Web3, Blockchain, Quantum

**💡 GROWTH STRATEGY:**

1. **IMMEDIATE REVENUE (Month 1-3):**
   • AI Consulting: R2,000-R10,000/project
   • Business automation services
   • Claude CLI + Cursor competitive advantage
   • Target: 5 clients = R25,000 initial revenue

2. **SERVICE PORTFOLIO:**
   • Tier 1: AI chatbots (R2,000-R5,000)
   • Tier 2: Process automation (R5,000-R15,000)
   • Tier 3: Enterprise AI (R20,000-R100,000)

3. **CAPE TOWN MARKET ADVANTAGE:**
   • Lower costs vs international
   • Strong tech ecosystem
   • Currency arbitrage for global clients

4. **SCALING TIMELINE:**
   • Year 1: R0 → R25,000 MRR (Consulting)
   • Year 2: R25,000 → R75,000 MRR (Enterprise)
   • Year 3: R75,000 → R100,000+ MRR (Full portfolio)

**🎯 THIS WEEK'S PRIORITIES:**
1. Build portfolio website
2. Create 3 service packages
3. Reach out to 10 local businesses
4. Price competitively for first clients"""

            else:
                insights = f"""🎯 **COMPLETE LIFE STRATEGY - ETHAN BARNES**

**THE R500K PATH (Dec 2025):**

**Phase 1 (Months 1-3): Foundation**
• Launch 43V3R Tech AI consulting
• Target: R10,000+ monthly business income
• Eliminate R7,000 debt
• Quit smoking (health + R2,000 savings)

**Phase 2 (Months 4-6): Growth**
• Build R28,929 emergency fund
• Scale 43V3R to R25,000 MRR
• Optimize IT career (remote position)
• Start 43V3R Brand development

**Phase 3 (Months 7-12): Acceleration**
• R50,000+ MRR from combined businesses
• Investment portfolio growth
• Advanced Diploma planning
• House deposit savings

**LIFE CATEGORY PRIORITIES:**
1. **Personal:** Debt elimination → Emergency fund
2. **Work:** Skill development for higher salary
3. **43V3R Tech:** AI consulting launch (IMMEDIATE)
4. **43V3R Brand:** Development phase

**SUCCESS FORMULA:**
IT Salary (R18-24K) + 43V3R Tech (R25K+) + Expense optimization (R3K savings) = R46-52K monthly positive cash flow

**YOUR ADVANTAGES:**
• AI expertise (Claude CLI, Cursor)
• IT engineering background
• Cape Town cost arbitrage
• Young and motivated
• Clear goals and timeline

🚀 **START TODAY:** Contact first potential AI client!"""
        
        return [TextContent(type="text", text=insights)]
    
    return [TextContent(type="text", text=f"✅ Tool '{name}' executed successfully")]

async def main():
    from mcp.server.stdio import stdio_server
    
    async with stdio_server() as (read_stream, write_stream):
        await app.run(
            read_stream,
            write_stream,
            NotificationOptions(capability_changed=True)
        )

if __name__ == "__main__":
    if not os.path.exists(DB_PATH):
        init_database()
    asyncio.run(main())
