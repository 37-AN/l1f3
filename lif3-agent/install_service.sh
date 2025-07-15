#!/bin/bash
# LIF3 Agent Service Installation Script for macOS
# Creates LaunchAgent for persistent 24/7 operation

echo "🚀 Installing LIF3 Agent as macOS Service..."

# Get current user
USER=$(whoami)
LIF3_DIR="/Users/$USER/Desktop/dev/l1f3/lif3-agent"

# Create LaunchAgent directory
mkdir -p ~/Library/LaunchAgents

# Create LaunchAgent plist file
cat > ~/Library/LaunchAgents/com.lif3.agent.plist << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.lif3.agent</string>
    <key>Program</key>
    <string>/usr/bin/python3</string>
    <key>ProgramArguments</key>
    <array>
        <string>/usr/bin/python3</string>
        <string>$LIF3_DIR/lif3_agent.py</string>
    </array>
    <key>WorkingDirectory</key>
    <string>$LIF3_DIR</string>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>StandardOutPath</key>
    <string>$LIF3_DIR/logs/agent_stdout.log</string>
    <key>StandardErrorPath</key>
    <string>$LIF3_DIR/logs/agent_stderr.log</string>
    <key>EnvironmentVariables</key>
    <dict>
        <key>ANTHROPIC_API_KEY</key>
        <string>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</string>
        <key>PYTHONPATH</key>
        <string>$LIF3_DIR</string>
    </dict>
</dict>
</plist>
EOF

# Create API service plist
cat > ~/Library/LaunchAgents/com.lif3.api.plist << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.lif3.api</string>
    <key>Program</key>
    <string>/usr/bin/python3</string>
    <key>ProgramArguments</key>
    <array>
        <string>/usr/bin/python3</string>
        <string>$LIF3_DIR/lif3_api.py</string>
    </array>
    <key>WorkingDirectory</key>
    <string>$LIF3_DIR</string>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>StandardOutPath</key>
    <string>$LIF3_DIR/logs/api_stdout.log</string>
    <key>StandardErrorPath</key>
    <string>$LIF3_DIR/logs/api_stderr.log</string>
    <key>EnvironmentVariables</key>
    <dict>
        <key>ANTHROPIC_API_KEY</key>
        <string>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</string>
        <key>PYTHONPATH</key>
        <string>$LIF3_DIR</string>
    </dict>
</dict>
</plist>
EOF

# Set permissions
chmod 644 ~/Library/LaunchAgents/com.lif3.agent.plist
chmod 644 ~/Library/LaunchAgents/com.lif3.api.plist

# Create service control script
cat > $LIF3_DIR/lif3_service.sh << EOF
#!/bin/bash
# LIF3 Service Control Script

case "\$1" in
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
        echo "Agent: \$(launchctl list | grep com.lif3.agent | wc -l) running"
        echo "API: \$(launchctl list | grep com.lif3.api | wc -l) running"
        ;;
    logs)
        echo "📋 Recent LIF3 Agent logs:"
        tail -20 $LIF3_DIR/logs/agent_stdout.log
        echo "\\n📋 Recent API logs:"
        tail -20 $LIF3_DIR/logs/api_stdout.log
        ;;
    *)
        echo "Usage: \$0 {start|stop|restart|status|logs}"
        exit 1
        ;;
esac
EOF

chmod +x $LIF3_DIR/lif3_service.sh

echo "✅ LaunchAgent files created"
echo "✅ Service control script created"
echo ""
echo "🎯 LIF3 Agent Service Installation Complete!"
echo ""
echo "📋 Available commands:"
echo "  $LIF3_DIR/lif3_service.sh start     # Start services"
echo "  $LIF3_DIR/lif3_service.sh stop      # Stop services"
echo "  $LIF3_DIR/lif3_service.sh restart   # Restart services"
echo "  $LIF3_DIR/lif3_service.sh status    # Check status"
echo "  $LIF3_DIR/lif3_service.sh logs      # View logs"
echo ""
echo "🌐 API will be available at: http://localhost:8000"
echo "📖 Documentation at: http://localhost:8000/docs"
echo ""
echo "To start now: $LIF3_DIR/lif3_service.sh start"