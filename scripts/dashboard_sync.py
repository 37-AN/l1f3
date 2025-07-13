#!/usr/bin/env python3
"""
Real-time Dashboard Sync for LIF3 Claude CLI Integration
Connects Claude CLI responses with dashboard via WebSocket
"""

import asyncio
import websockets
import json
import aiohttp
from datetime import datetime
from pathlib import Path
import sys
import os

# Add the scripts directory to path for importing claude_integration
sys.path.append(str(Path(__file__).parent))
from claude_integration import LIF3ClaudeIntegration

class LIF3DashboardSync:
    def __init__(self, dashboard_port=3001):
        self.dashboard_url = f"ws://localhost:{dashboard_port}"
        self.integration = LIF3ClaudeIntegration()
        self.active_connections = set()
        
    async def websocket_handler(self, websocket, path):
        """Handle WebSocket connections from dashboard"""
        self.active_connections.add(websocket)
        print(f"🔗 New dashboard connection: {websocket.remote_address}")
        
        try:
            async for message in websocket:
                await self.process_dashboard_message(websocket, message)
        except websockets.exceptions.ConnectionClosed:
            print(f"📱 Dashboard disconnected: {websocket.remote_address}")
        except Exception as e:
            print(f"❌ WebSocket error: {e}")
        finally:
            self.active_connections.discard(websocket)
    
    async def process_dashboard_message(self, websocket, message):
        """Process incoming message from dashboard"""
        try:
            data = json.loads(message)
            message_type = data.get('type')
            
            if message_type == 'financial_query':
                await self.handle_financial_query(websocket, data)
            elif message_type == 'dashboard_update':
                await self.handle_dashboard_update(websocket, data)
            elif message_type == 'health_check':
                await self.send_health_response(websocket)
            else:
                await self.send_error(websocket, f"Unknown message type: {message_type}")
                
        except json.JSONDecodeError:
            await self.send_error(websocket, "Invalid JSON message")
        except Exception as e:
            await self.send_error(websocket, f"Processing error: {e}")
    
    async def handle_financial_query(self, websocket, data):
        """Handle financial query from dashboard"""
        query = data.get('query', '')
        context = data.get('context', {})
        session_id = data.get('session_id', 'dashboard')
        
        print(f"💬 Processing query: {query[:50]}...")
        
        # Send processing acknowledgment
        await websocket.send(json.dumps({
            "type": "query_processing",
            "session_id": session_id,
            "message": "Analyzing with Claude CLI + RAG...",
            "timestamp": datetime.now().isoformat()
        }))
        
        try:
            # Process with Claude CLI integration
            response = await self.integration.process_financial_query(query, context)
            
            # Send response back to dashboard
            await websocket.send(json.dumps({
                "type": "financial_response",
                "session_id": session_id,
                "query": query,
                "response": response,
                "context": context,
                "timestamp": datetime.now().isoformat(),
                "source": "claude_cli_rag"
            }))
            
            print(f"✅ Query processed successfully for session: {session_id}")
            
        except Exception as e:
            await self.send_error(websocket, f"Query processing failed: {e}", session_id)
    
    async def handle_dashboard_update(self, websocket, data):
        """Handle dashboard metric updates"""
        metrics = data.get('metrics', {})
        update_type = data.get('update_type', 'manual')
        
        print(f"📊 Dashboard update: {update_type}")
        
        # Process metrics with AI insights
        analysis_query = f"""
        Analyze these updated dashboard metrics and provide insights:
        
        Net Worth: R{metrics.get('net_worth', 239625):,}
        Business Revenue: R{metrics.get('business_revenue', 0):,}
        Investment Performance: {metrics.get('investment_return', 0)}%
        Goal Progress: {metrics.get('goal_progress', 13.3)}%
        
        Provide:
        1. Progress assessment
        2. Goal trajectory analysis  
        3. Strategic recommendations
        4. Next action items
        """
        
        try:
            response = await self.integration.process_financial_query(analysis_query, metrics)
            
            await websocket.send(json.dumps({
                "type": "metrics_analysis",
                "metrics": metrics,
                "analysis": response,
                "timestamp": datetime.now().isoformat(),
                "source": "claude_cli_analysis"
            }))
            
        except Exception as e:
            await self.send_error(websocket, f"Metrics analysis failed: {e}")
    
    async def send_health_response(self, websocket):
        """Send health check response"""
        await websocket.send(json.dumps({
            "type": "health_response",
            "status": "healthy",
            "services": {
                "claude_cli": "available",
                "rag_backend": await self.check_rag_backend(),
                "knowledge_base": "ready"
            },
            "timestamp": datetime.now().isoformat()
        }))
    
    async def check_rag_backend(self):
        """Check if RAG backend is available"""
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(f"{self.integration.backend_url}/health", timeout=5) as response:
                    return "available" if response.status == 200 else "unavailable"
        except:
            return "unavailable"
    
    async def send_error(self, websocket, error_message, session_id=None):
        """Send error message to dashboard"""
        await websocket.send(json.dumps({
            "type": "error",
            "message": error_message,
            "session_id": session_id,
            "timestamp": datetime.now().isoformat()
        }))
    
    async def broadcast_message(self, message):
        """Broadcast message to all connected dashboards"""
        if self.active_connections:
            disconnected = set()
            for websocket in self.active_connections:
                try:
                    await websocket.send(json.dumps(message))
                except websockets.exceptions.ConnectionClosed:
                    disconnected.add(websocket)
            
            # Clean up disconnected websockets
            self.active_connections -= disconnected
    
    async def start_server(self, host="localhost", port=8765):
        """Start the WebSocket server"""
        print(f"🚀 Starting LIF3 Dashboard Sync Server...")
        print(f"📡 WebSocket Server: ws://{host}:{port}")
        print(f"🔗 Backend API: {self.integration.backend_url}")
        print(f"🤖 Claude CLI: Ready")
        
        # Test backend connectivity
        backend_status = await self.check_rag_backend()
        print(f"📊 RAG Backend: {backend_status}")
        
        start_server = websockets.serve(self.websocket_handler, host, port)
        
        print("✅ Dashboard sync server ready!")
        print("💡 Connect your dashboard to ws://localhost:8765")
        print("📱 Send messages in format: {'type': 'financial_query', 'query': 'your question'}")
        
        await start_server
    
    async def send_daily_briefing(self):
        """Send automated daily briefing to all connected dashboards"""
        briefing_query = """
        Generate a comprehensive daily financial briefing for the LIF3 dashboard:
        
        1. Market outlook for South African investments
        2. Progress assessment toward R1.8M goal
        3. 43V3R business development priorities
        4. Investment opportunities and risks
        5. Key action items for today
        
        Format as a structured daily briefing suitable for dashboard display.
        """
        
        try:
            briefing = await self.integration.process_financial_query(briefing_query)
            
            await self.broadcast_message({
                "type": "daily_briefing",
                "content": briefing,
                "timestamp": datetime.now().isoformat(),
                "source": "automated_briefing"
            })
            
            print("📬 Daily briefing sent to all connected dashboards")
            
        except Exception as e:
            print(f"❌ Daily briefing failed: {e}")

async def main():
    """Main function with CLI options"""
    import argparse
    
    parser = argparse.ArgumentParser(description='LIF3 Dashboard Sync Server')
    parser.add_argument('--host', default='localhost', help='WebSocket host')
    parser.add_argument('--port', type=int, default=8765, help='WebSocket port')
    parser.add_argument('--backend', default='http://localhost:3001', help='Backend URL')
    parser.add_argument('--daily-briefing', action='store_true', help='Send daily briefing and exit')
    
    args = parser.parse_args()
    
    # Initialize dashboard sync
    sync = LIF3DashboardSync()
    sync.integration.backend_url = args.backend
    
    if args.daily_briefing:
        print("📬 Sending daily briefing...")
        await sync.send_daily_briefing()
        return
    
    # Start the server
    await sync.start_server(args.host, args.port)

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n👋 Dashboard sync server stopped")
    except Exception as e:
        print(f"❌ Server error: {e}")