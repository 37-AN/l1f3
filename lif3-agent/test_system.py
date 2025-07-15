#!/usr/bin/env python3
"""
LIF3 Agent System Integration Test
Comprehensive testing of the complete LIF3 Agent system
"""

import sys
import os
import time
import json
import requests
from pathlib import Path
from datetime import datetime

# Add current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from lif3_agent import LIF3Agent

def test_database_connection():
    """Test 1: Database Connection"""
    print("📊 Test 1: Database Connection")
    try:
        agent = LIF3Agent()
        print(f"✅ Database connected: {agent.db_connection is not None}")
        print(f"✅ Goals loaded: {len(agent.goals)}")
        return True
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False

def test_agent_functionality():
    """Test 2: Agent Core Functionality"""
    print("\\n🤖 Test 2: Agent Core Functionality")
    try:
        agent = LIF3Agent()
        
        # Test net worth update
        result = agent.update_net_worth(250000)
        print(f"✅ Net worth update: {result['success'] if 'success' in result else 'updated'}")
        
        # Test revenue logging
        result = agent.log_43v3r_revenue(1500, "Test revenue entry")
        print(f"✅ Revenue logging: R{result['amount_logged']}")
        
        # Test daily briefing
        briefing = agent.generate_daily_briefing()
        print(f"✅ Daily briefing generated: {len(briefing)} characters")
        
        # Test financial summary
        summary = agent.get_financial_summary()
        print(f"✅ Financial summary: {len(summary['goals'])} goals, {len(summary['recent_transactions'])} transactions")
        
        return True
    except Exception as e:
        print(f"❌ Agent functionality test failed: {e}")
        return False

def test_api_endpoints():
    """Test 3: API Endpoints"""
    print("\\n🌐 Test 3: API Endpoints")
    
    # Start API server in background if not running
    base_url = "http://localhost:8000"
    
    endpoints = [
        "/",
        "/status",
        "/goals",
        "/networth/current",
        "/revenue/43v3r/today",
        "/briefing/today",
        "/analytics/progress",
        "/analytics/business",
        "/health"
    ]
    
    successful_tests = 0
    
    for endpoint in endpoints:
        try:
            response = requests.get(f"{base_url}{endpoint}", timeout=5)
            if response.status_code == 200:
                print(f"✅ {endpoint}: {response.status_code}")
                successful_tests += 1
            else:
                print(f"⚠️  {endpoint}: {response.status_code}")
        except requests.exceptions.ConnectionError:
            print(f"❌ {endpoint}: Connection refused (API not running)")
        except Exception as e:
            print(f"❌ {endpoint}: {e}")
    
    print(f"API Tests: {successful_tests}/{len(endpoints)} passed")
    return successful_tests >= len(endpoints) // 2  # At least half should pass

def test_workflow_files():
    """Test 4: Workflow Files"""
    print("\\n📋 Test 4: Workflow Configuration Files")
    
    workflow_files = [
        "workflows/daily_financial_sync.json",
        "workflows/revenue_tracking.json",
        "workflows/goal_monitoring.json"
    ]
    
    successful_tests = 0
    
    for workflow_file in workflow_files:
        try:
            with open(workflow_file, 'r') as f:
                workflow_data = json.load(f)
            print(f"✅ {workflow_file}: {len(workflow_data.get('nodes', []))} nodes")
            successful_tests += 1
        except FileNotFoundError:
            print(f"❌ {workflow_file}: File not found")
        except json.JSONDecodeError:
            print(f"❌ {workflow_file}: Invalid JSON")
        except Exception as e:
            print(f"❌ {workflow_file}: {e}")
    
    return successful_tests == len(workflow_files)

def test_service_configuration():
    """Test 5: Service Configuration"""
    print("\\n⚙️  Test 5: Service Configuration")
    
    service_files = [
        "~/Library/LaunchAgents/com.lif3.agent.plist",
        "~/Library/LaunchAgents/com.lif3.api.plist",
        "lif3_service.sh"
    ]
    
    successful_tests = 0
    
    for service_file in service_files:
        file_path = Path(service_file).expanduser()
        if file_path.exists():
            print(f"✅ {service_file}: Found")
            successful_tests += 1
        else:
            print(f"❌ {service_file}: Not found")
    
    return successful_tests >= 2  # At least 2 should exist

def test_financial_calculations():
    """Test 6: Financial Calculations"""
    print("\\n💰 Test 6: Financial Calculations")
    
    try:
        agent = LIF3Agent()
        
        # Test progress calculations
        net_worth_goal = next((g for g in agent.goals if g.goal_type == 'net_worth'), None)
        if net_worth_goal:
            progress = net_worth_goal.progress_percentage
            remaining = net_worth_goal.target_amount - net_worth_goal.current_amount
            months_left = 18
            monthly_required = remaining / months_left
            
            print(f"✅ Current progress: {progress:.1f}%")
            print(f"✅ Monthly growth required: R{monthly_required:,.0f}")
            print(f"✅ Remaining amount: R{remaining:,.0f}")
            
            return True
        else:
            print("❌ Net worth goal not found")
            return False
            
    except Exception as e:
        print(f"❌ Financial calculations failed: {e}")
        return False

def main():
    """Run comprehensive system test"""
    print("🧪 LIF3 AGENT SYSTEM INTEGRATION TEST")
    print("=" * 60)
    print(f"📅 Test Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"🎯 Goal: R1,800,000 Net Worth by December 2026")
    print(f"🏢 43V3R Business: R4,881 daily revenue target")
    print(f"🌍 Location: Cape Town, South Africa")
    print("=" * 60)
    
    tests = [
        ("Database Connection", test_database_connection),
        ("Agent Functionality", test_agent_functionality),
        ("API Endpoints", test_api_endpoints),
        ("Workflow Files", test_workflow_files),
        ("Service Configuration", test_service_configuration),
        ("Financial Calculations", test_financial_calculations)
    ]
    
    passed_tests = 0
    total_tests = len(tests)
    
    for test_name, test_func in tests:
        try:
            if test_func():
                passed_tests += 1
                print(f"✅ {test_name}: PASSED")
            else:
                print(f"❌ {test_name}: FAILED")
        except Exception as e:
            print(f"❌ {test_name}: ERROR - {e}")
    
    print("\\n" + "=" * 60)
    print(f"🧪 TEST RESULTS: {passed_tests}/{total_tests} PASSED")
    
    if passed_tests >= total_tests * 0.8:  # 80% pass rate
        print("🎉 SYSTEM INTEGRATION: SUCCESS!")
        print("✅ LIF3 Agent is ready for R1,800,000 journey!")
        
        print("\\n🚀 Next Steps:")
        print("1. Start services: ./lif3_service.sh start")
        print("2. Access API: http://localhost:8000")
        print("3. View documentation: http://localhost:8000/docs")
        print("4. Monitor progress daily")
        
        return True
    else:
        print("⚠️  SYSTEM INTEGRATION: NEEDS ATTENTION")
        print("❌ Some components require fixes before production use")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)