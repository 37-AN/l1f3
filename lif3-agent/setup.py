#!/usr/bin/env python3
"""
LIF3 Agent Setup Script
Creates the complete infrastructure for the LIF3 AI Agent
"""

import os
import sys
import sqlite3
import subprocess
from pathlib import Path

def create_directory_structure():
    """Create LIF3 agent directory structure"""
    base_dir = Path("/Users/ccladysmith/Desktop/dev/l1f3/lif3-agent")
    base_dir.mkdir(exist_ok=True)
    
    # Create subdirectories
    subdirs = [
        "database",
        "api",
        "workflows",
        "logs",
        "config"
    ]
    
    for subdir in subdirs:
        (base_dir / subdir).mkdir(exist_ok=True)
    
    print("✅ Directory structure created")
    return base_dir

def create_database_schema():
    """Create SQLite database with LIF3 schema"""
    db_path = "/Users/ccladysmith/Desktop/dev/l1f3/lif3-agent/database/lif3_financial.db"
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Financial accounts table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS financial_accounts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            account_name TEXT NOT NULL,
            account_type TEXT NOT NULL,
            current_balance REAL NOT NULL,
            currency TEXT DEFAULT 'ZAR',
            last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # Transactions table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            account_id INTEGER REFERENCES financial_accounts(id),
            amount REAL NOT NULL,
            description TEXT,
            category TEXT,
            date DATE NOT NULL,
            is_business_expense BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # Goals table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS goals (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            goal_type TEXT NOT NULL,
            target_amount REAL NOT NULL,
            current_amount REAL NOT NULL,
            target_date DATE NOT NULL,
            status TEXT DEFAULT 'active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # Insert initial LIF3 goals
    cursor.execute("""
        INSERT OR REPLACE INTO goals (id, goal_type, target_amount, current_amount, target_date) VALUES
        (1, 'net_worth', 1800000.00, 239625.00, '2026-12-31'),
        (2, '43v3r_daily_revenue', 4881.00, 0.00, '2025-12-31'),
        (3, '43v3r_mrr', 147917.00, 0.00, '2025-12-31')
    """)
    
    # Insert default financial account
    cursor.execute("""
        INSERT OR REPLACE INTO financial_accounts (id, account_name, account_type, current_balance) VALUES
        (1, 'LIF3 Main Account', 'checking', 239625.00)
    """)
    
    conn.commit()
    conn.close()
    
    print("✅ Database schema created with initial data")
    return db_path

def install_python_dependencies():
    """Install required Python packages"""
    packages = [
        "fastapi",
        "uvicorn",
        "psycopg2-binary",
        "requests",
        "python-dotenv",
        "asyncio",
        "aiofiles"
    ]
    
    for package in packages:
        try:
            subprocess.check_call([sys.executable, "-m", "pip", "install", package])
            print(f"✅ Installed {package}")
        except subprocess.CalledProcessError:
            print(f"❌ Failed to install {package}")
    
    print("✅ Python dependencies installed")

def create_environment_file():
    """Create .env file with configuration"""
    env_path = "/Users/ccladysmith/Desktop/dev/l1f3/lif3-agent/.env"
    
    env_content = """
# LIF3 Agent Configuration
DATABASE_URL=sqlite:///database/lif3_financial.db
API_PORT=8000
API_HOST=0.0.0.0
LOG_LEVEL=INFO

# Financial Goals
NET_WORTH_TARGET=1800000.00
CURRENT_NET_WORTH=239625.00
BUSINESS_DAILY_TARGET=4881.00
BUSINESS_MRR_TARGET=147917.00

# Automation Settings
BRIEFING_HOUR=8
MONITORING_INTERVAL=3600
GOOGLE_DRIVE_FOLDER_ID=1dD8C1e1hkcCPdtlqA3nsxJYWVvilV5Io

# API Keys (set these manually)
ANTHROPIC_API_KEY=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
GOOGLE_DRIVE_API_KEY=
SLACK_WEBHOOK_URL=
"""
    
    with open(env_path, 'w') as f:
        f.write(env_content.strip())
    
    print("✅ Environment file created")
    return env_path

def main():
    print("🚀 LIF3 Agent Setup Starting...")
    print("=" * 50)
    
    # Create directory structure
    base_dir = create_directory_structure()
    
    # Create database
    db_path = create_database_schema()
    
    # Install dependencies
    install_python_dependencies()
    
    # Create environment file
    env_path = create_environment_file()
    
    print("=" * 50)
    print("🎉 LIF3 Agent Setup Complete!")
    print(f"📁 Base directory: {base_dir}")
    print(f"💾 Database: {db_path}")
    print(f"⚙️ Config: {env_path}")
    print()
    print("Next steps:")
    print("1. cd /Users/ccladysmith/Desktop/dev/l1f3/lif3-agent")
    print("2. python lif3_agent.py")
    print("3. python lif3_api.py")

if __name__ == "__main__":
    main()