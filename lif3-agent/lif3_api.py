#!/usr/bin/env python3
"""
LIF3 API - FastAPI Web Interface for LIF3 Management
REST API for controlling the LIF3 Agent and accessing financial data
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional
import uvicorn
import json
from datetime import datetime
from lif3_agent import LIF3Agent

# Initialize FastAPI app
app = FastAPI(
    title="LIF3 Management API",
    description="AI-Powered Financial Management System for R1,800,000 Goal",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize LIF3 Agent
agent = LIF3Agent()

# Pydantic models for API requests
class RevenueEntry(BaseModel):
    amount: float
    description: str = ""

class NetWorthUpdate(BaseModel):
    new_amount: float

class TransactionEntry(BaseModel):
    amount: float
    description: str
    category: str
    account_id: int = 1

# API Routes
@app.get("/")
async def root():
    """Root endpoint - API status"""
    return {
        "message": "LIF3 Agent API Active",
        "status": "monitoring",
        "version": "1.0.0",
        "goal": "R1,800,000 Net Worth",
        "location": "Cape Town, South Africa"
    }

@app.get("/status")
async def get_status():
    """Get current system status"""
    return agent.get_status()

@app.get("/dashboard")
async def get_dashboard():
    """Get current LIF3 dashboard metrics"""
    try:
        briefing = agent.generate_daily_briefing()
        financial_summary = agent.get_financial_summary()
        
        return {
            "briefing": briefing,
            "financial_summary": financial_summary,
            "status": "active",
            "generated_at": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/goals")
async def get_goals():
    """Get all financial goals"""
    try:
        goals = [goal.__dict__ for goal in agent.goals]
        return {
            "goals": goals,
            "total_goals": len(goals),
            "retrieved_at": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/goals/{goal_type}")
async def get_goal_by_type(goal_type: str):
    """Get specific goal by type"""
    try:
        goal = next((g for g in agent.goals if g.goal_type == goal_type), None)
        if not goal:
            raise HTTPException(status_code=404, detail=f"Goal type '{goal_type}' not found")
        
        return {
            "goal": goal.__dict__,
            "retrieved_at": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/revenue/43v3r")
async def log_revenue(entry: RevenueEntry):
    """Log 43V3R business revenue"""
    try:
        result = agent.log_43v3r_revenue(entry.amount, entry.description)
        return {
            "success": True,
            "result": result,
            "logged_at": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/revenue/43v3r/today")
async def get_today_revenue():
    """Get today's 43V3R revenue"""
    try:
        daily_revenue = agent.get_daily_revenue()
        return {
            "daily_revenue": daily_revenue,
            "target": 4881,
            "progress": (daily_revenue / 4881) * 100,
            "on_track": daily_revenue >= 4881,
            "date": datetime.now().strftime("%Y-%m-%d")
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/networth/update")
async def update_networth(update: NetWorthUpdate):
    """Update net worth and get progress analysis"""
    try:
        result = agent.update_net_worth(update.new_amount)
        return {
            "success": True,
            "result": result,
            "updated_at": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/networth/current")
async def get_current_networth():
    """Get current net worth and progress"""
    try:
        net_worth_goal = next((g for g in agent.goals if g.goal_type == 'net_worth'), None)
        if not net_worth_goal:
            raise HTTPException(status_code=404, detail="Net worth goal not found")
        
        return {
            "current_amount": net_worth_goal.current_amount,
            "target_amount": net_worth_goal.target_amount,
            "progress_percentage": net_worth_goal.progress_percentage,
            "remaining_amount": net_worth_goal.target_amount - net_worth_goal.current_amount,
            "target_date": net_worth_goal.target_date,
            "retrieved_at": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/briefing/today")
async def get_daily_briefing():
    """Get today's daily briefing"""
    try:
        briefing = agent.generate_daily_briefing()
        return {
            "briefing": briefing,
            "generated_at": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/briefing/generate")
async def generate_new_briefing(background_tasks: BackgroundTasks):
    """Generate a new briefing (can be run in background)"""
    try:
        briefing = agent.generate_daily_briefing()
        return {
            "briefing": briefing,
            "generated_at": datetime.now().isoformat(),
            "message": "Fresh briefing generated"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/transactions/recent")
async def get_recent_transactions(limit: int = 20):
    """Get recent transactions"""
    try:
        financial_summary = agent.get_financial_summary()
        transactions = financial_summary["recent_transactions"][:limit]
        
        return {
            "transactions": transactions,
            "count": len(transactions),
            "retrieved_at": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/financial/summary")
async def get_financial_summary():
    """Get comprehensive financial summary"""
    try:
        summary = agent.get_financial_summary()
        return {
            "summary": summary,
            "retrieved_at": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        status = agent.get_status()
        return {
            "status": "healthy",
            "agent_status": status,
            "api_version": "1.0.0",
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }

# Business intelligence endpoints
@app.get("/analytics/progress")
async def get_progress_analytics():
    """Get progress analytics toward R1,800,000 goal"""
    try:
        net_worth_goal = next((g for g in agent.goals if g.goal_type == 'net_worth'), None)
        if not net_worth_goal:
            raise HTTPException(status_code=404, detail="Net worth goal not found")
        
        # Calculate analytics
        days_to_goal = (datetime(2026, 12, 31) - datetime.now()).days
        daily_growth_needed = (net_worth_goal.target_amount - net_worth_goal.current_amount) / max(days_to_goal, 1)
        monthly_growth_needed = daily_growth_needed * 30
        
        return {
            "current_net_worth": net_worth_goal.current_amount,
            "target_net_worth": net_worth_goal.target_amount,
            "progress_percentage": net_worth_goal.progress_percentage,
            "days_to_goal": days_to_goal,
            "daily_growth_needed": daily_growth_needed,
            "monthly_growth_needed": monthly_growth_needed,
            "on_track": net_worth_goal.progress_percentage >= 13.0,  # Should be at least 13% by now
            "43v3r_daily_revenue": agent.get_daily_revenue(),
            "43v3r_target": 4881,
            "calculated_at": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/analytics/business")
async def get_business_analytics():
    """Get 43V3R business analytics"""
    try:
        financial_summary = agent.get_financial_summary()
        daily_revenue = agent.get_daily_revenue()
        monthly_revenue = financial_summary["monthly_revenue"]
        
        return {
            "daily_revenue": daily_revenue,
            "daily_target": 4881,
            "daily_progress": (daily_revenue / 4881) * 100,
            "monthly_revenue": monthly_revenue,
            "monthly_target": 147917,
            "monthly_progress": (monthly_revenue / 147917) * 100,
            "business_stage": "Foundation Building",
            "location": "Cape Town, South Africa",
            "services": ["AI Consulting", "Web3 Development", "Blockchain Solutions", "Quantum Computing"],
            "calculated_at": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# System control endpoints
@app.post("/system/restart")
async def restart_agent():
    """Restart the LIF3 agent (reinitialize)"""
    try:
        global agent
        agent = LIF3Agent()
        return {
            "message": "LIF3 Agent restarted successfully",
            "restarted_at": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Documentation endpoint
@app.get("/docs-info")
async def get_api_docs():
    """Get API documentation information"""
    return {
        "message": "LIF3 Management API Documentation",
        "interactive_docs": "/docs",
        "openapi_json": "/openapi.json",
        "endpoints": {
            "status": "GET /status - System status",
            "dashboard": "GET /dashboard - Dashboard metrics",
            "goals": "GET /goals - All financial goals",
            "revenue": "POST /revenue/43v3r - Log business revenue",
            "networth": "POST /networth/update - Update net worth",
            "briefing": "GET /briefing/today - Daily briefing",
            "analytics": "GET /analytics/progress - Progress analytics"
        }
    }

if __name__ == "__main__":
    print("🚀 Starting LIF3 Management API...")
    print("🌐 API will be available at: http://localhost:8000")
    print("📖 Documentation at: http://localhost:8000/docs")
    print("🎯 Goal: R1,800,000 Net Worth")
    print("🏢 43V3R Business: R4,881 daily revenue target")
    print("🌍 Location: Cape Town, South Africa")
    print()
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )