#!/usr/bin/env python3

import asyncio
import sqlite3
import json
import sys
import os
from datetime import datetime
from mcp.server import Server
from mcp.server.stdio import stdio_server
from mcp.types import Tool, TextContent

# Configuration
DATABASE_PATH = "/Users/ccladysmith/Desktop/dev/l1f3/data/lif3_financial.db"
CURRENT_NET_WORTH = 239625
TARGET_NET_WORTH = 1800000

# Initialize MCP server
server = Server("lif3-financial")

def init_database():
    """Initialize the database with LIF3 schema and data"""
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    
    # Create tables
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS accounts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            type TEXT NOT NULL,
            category TEXT NOT NULL,
            balance REAL DEFAULT 0,
            currency TEXT DEFAULT 'ZAR',
            is_active BOOLEAN DEFAULT TRUE,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            account_id INTEGER,
            amount REAL NOT NULL,
            description TEXT,
            category TEXT,
            life_category TEXT,
            date DATE DEFAULT CURRENT_DATE,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (account_id) REFERENCES accounts (id)
        )
    """)
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS goals (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            life_category TEXT NOT NULL,
            target_amount REAL,
            current_amount REAL DEFAULT 0,
            target_date DATE,
            priority TEXT DEFAULT 'medium',
            status TEXT DEFAULT 'active',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # Insert LIF3 data if not exists
    cursor.execute("SELECT COUNT(*) FROM accounts")
    if cursor.fetchone()[0] == 0:
        cursor.execute("""
            INSERT INTO accounts (name, type, category, balance) VALUES
            ('Liquid Cash', 'personal', 'checking', 88750),
            ('Investment Portfolio', 'personal', 'investment', 142000),
            ('43V3R Business', 'business', 'checking', 8875),
            ('IT Salary', 'work', 'income', 96250)
        """)
        
        cursor.execute("""
            INSERT INTO goals (title, description, life_category, target_amount, current_amount, target_date, priority) VALUES
            ('Net Worth R1.8M', 'Achieve R1,800,000 net worth', 'personal', 1800000, 239625, '2026-12-31', 'high'),
            ('43V3R Daily Revenue', 'Achieve R4,881 daily revenue', 'business', 4881, 0, '2025-12-31', 'high'),
            ('43V3R MRR', 'Achieve R147,917 MRR', 'business', 147917, 0, '2026-06-30', 'high'),
            ('Emergency Fund', 'Build R300,000 emergency fund', 'personal', 300000, 88750, '2025-12-31', 'high')
        """)
    
    conn.commit()
    conn.close()

@server.list_tools()
async def list_tools():
    """List available LIF3 tools"""
    return [
        Tool(
            name="net_worth_progress",
            description="Get current net worth progress toward R1,800,000 goal",
            inputSchema={
                "type": "object",
                "properties": {},
                "required": []
            }
        ),
        Tool(
            name="log_transaction",
            description="Log a financial transaction",
            inputSchema={
                "type": "object",
                "properties": {
                    "amount": {"type": "number", "description": "Transaction amount in ZAR"},
                    "description": {"type": "string", "description": "Transaction description"},
                    "category": {"type": "string", "description": "Transaction category"},
                    "type": {"type": "string", "enum": ["income", "expense"], "description": "Transaction type"}
                },
                "required": ["amount", "description", "type"]
            }
        ),
        Tool(
            name="business_metrics",
            description="Get 43V3R business metrics and progress",
            inputSchema={
                "type": "object",
                "properties": {},
                "required": []
            }
        ),
        Tool(
            name="savings_calculator",
            description="Calculate required savings rate for R1.8M goal",
            inputSchema={
                "type": "object",
                "properties": {
                    "months": {"type": "number", "description": "Timeline in months", "default": 18}
                },
                "required": []
            }
        ),
        Tool(
            name="query_database",
            description="Query the LIF3 financial database",
            inputSchema={
                "type": "object",
                "properties": {
                    "query": {"type": "string", "description": "SQL query to execute"}
                },
                "required": ["query"]
            }
        )
    ]

@server.call_tool()
async def call_tool(name: str, arguments: dict):
    """Handle tool calls"""
    
    if name == "net_worth_progress":
        progress = (CURRENT_NET_WORTH / TARGET_NET_WORTH) * 100
        remaining = TARGET_NET_WORTH - CURRENT_NET_WORTH
        monthly_required = remaining / 18
        
        return [TextContent(
            type="text",
            text=f"""💰 LIF3 NET WORTH PROGRESS

📊 Current Status:
• Current Net Worth: R{CURRENT_NET_WORTH:,}
• Target Net Worth: R{TARGET_NET_WORTH:,}
• Progress: {progress:.1f}%
• Remaining: R{remaining:,}

🎯 Timeline Analysis:
• Target Timeline: 18 months
• Required Monthly Increase: R{monthly_required:,.0f}
• Current Monthly Capacity: R35,500 (based on savings rate)

📈 Milestone Breakdown:
• Emergency Fund (R300K): {(CURRENT_NET_WORTH/300000*100):.1f}%
• Investment Base (R500K): {(CURRENT_NET_WORTH/500000*100):.1f}%
• First Million (R1M): {(CURRENT_NET_WORTH/1000000*100):.1f}%
• Ultimate Goal (R1.8M): {progress:.1f}%

🚀 Strategy: 43V3R business growth + IT career advancement + smart investments"""
        )]
    
    elif name == "log_transaction":
        amount = arguments.get('amount', 0)
        description = arguments.get('description', '')
        category = arguments.get('category', 'General')
        transaction_type = arguments.get('type', 'expense')
        
        # Log to database
        conn = sqlite3.connect(DATABASE_PATH)
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO transactions (account_id, amount, description, category, life_category, date)
            VALUES (1, ?, ?, ?, 'personal', DATE('now'))
        """, (amount if transaction_type == 'income' else -abs(amount), description, category))
        conn.commit()
        conn.close()
        
        return [TextContent(
            type="text",
            text=f"""✅ Transaction logged: {transaction_type.upper()} R{abs(amount):,} - {description}"""
        )]
    
    elif name == "business_metrics":
        return [TextContent(
            type="text",
            text=f"""🚀 43V3R BUSINESS METRICS

💰 Revenue Targets:
• Daily Revenue Target: R4,881
• Monthly Recurring Revenue Target: R147,917
• Current Stage: Foundation Building

🎯 Business Focus:
• AI Development (40%)
• Web3 Integration (25%)
• Crypto Solutions (25%)
• Quantum Research (10%)"""
        )]
    
    elif name == "savings_calculator":
        months = arguments.get('months', 18)
        monthly_needed = (TARGET_NET_WORTH - CURRENT_NET_WORTH) / months
        
        return [TextContent(
            type="text",
            text=f"""📊 SAVINGS CALCULATOR

Required Monthly Savings: R{monthly_needed:,.0f}
Timeline: {months} months
Current Net Worth: R{CURRENT_NET_WORTH:,}
Target Net Worth: R{TARGET_NET_WORTH:,}"""
        )]
    
    elif name == "query_database":
        query = arguments.get('query', '')
        
        try:
            conn = sqlite3.connect(DATABASE_PATH)
            cursor = conn.cursor()
            cursor.execute(query)
            results = cursor.fetchall()
            columns = [description[0] for description in cursor.description]
            conn.close()
            
            if not results:
                return [TextContent(type="text", text="No results found.")]
            
            # Format results
            result_text = f"Query: {query}\n\n"
            result_text += " | ".join(columns) + "\n"
            result_text += "-" * 50 + "\n"
            
            for row in results:
                result_text += " | ".join(str(item) for item in row) + "\n"
            
            return [TextContent(type="text", text=result_text)]
            
        except Exception as e:
            return [TextContent(type="text", text=f"Database error: {str(e)}")]
    
    else:
        return [TextContent(type="text", text=f"Unknown tool: {name}")]

async def main():
    """Run the MCP server"""
    # Initialize database
    init_database()
    
    # Start server
    async with stdio_server() as (read_stream, write_stream):
        await server.run(read_stream, write_stream, server.create_initialization_options())

if __name__ == "__main__":
    asyncio.run(main())