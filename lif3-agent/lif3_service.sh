#!/bin/bash
# LIF3 Service Control Script

case "$1" in
    start)
        echo "🚀 Starting LIF3 services..."
        launchctl load ~/Library/LaunchAgents/com.lif3.agent.plist
        launchctl load ~/Library/LaunchAgents/com.lif3.api.plist
        echo "✅ LIF3 Agent and API services started"
        ;;
    stop)
        echo "🛑 Stopping LIF3 services..."
        launchctl unload ~/Library/LaunchAgents/com.lif3.agent.plist
        launchctl unload ~/Library/LaunchAgents/com.lif3.api.plist
        echo "✅ LIF3 services stopped"
        ;;
    restart)
        echo "🔄 Restarting LIF3 services..."
        launchctl unload ~/Library/LaunchAgents/com.lif3.agent.plist
        launchctl unload ~/Library/LaunchAgents/com.lif3.api.plist
        sleep 2
        launchctl load ~/Library/LaunchAgents/com.lif3.agent.plist
        launchctl load ~/Library/LaunchAgents/com.lif3.api.plist
        echo "✅ LIF3 services restarted"
        ;;
    status)
        echo "📊 LIF3 Service Status:"
        echo "Agent: $(launchctl list | grep com.lif3.agent | wc -l) running"
        echo "API: $(launchctl list | grep com.lif3.api | wc -l) running"
        ;;
    logs)
        echo "📋 Recent LIF3 Agent logs:"
        tail -20 /Users/ccladysmith/Desktop/dev/l1f3/lif3-agent/logs/agent_stdout.log
        echo "\n📋 Recent API logs:"
        tail -20 /Users/ccladysmith/Desktop/dev/l1f3/lif3-agent/logs/api_stdout.log
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|status|logs}"
        exit 1
        ;;
esac
