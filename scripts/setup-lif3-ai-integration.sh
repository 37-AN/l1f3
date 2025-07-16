#!/bin/bash
# LIF3 AI Integration Setup Script
echo "🚀 Setting up LIF3 AI Agent Integration..."

# Check dependencies
echo "📋 Checking dependencies..."

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is required but not installed"
    exit 1
fi

# Check pip
if ! command -v pip3 &> /dev/null; then
    echo "❌ pip3 is required but not installed"
    exit 1
fi

# Install Python dependencies
echo "📦 Installing Python dependencies..."
pip3 install anthropic watchdog requests

# Check Node.js and npm (for backend)
if ! command -v node &> /dev/null; then
    echo "⚠️  Node.js not found - backend integration will be limited"
else
    echo "✅ Node.js found"
fi

# Create knowledge base directory structure
echo "📁 Setting up knowledge base..."
mkdir -p ~/Development/claude-knowledge/{lif3,43v3r,business}

# Create configuration directory
mkdir -p ~/.config/claude-cli

# Copy existing documentation to knowledge base
echo "📄 Copying LIF3 documentation..."
if [ -d "/Users/ccladysmith/Desktop/dev/l1f3/documents" ]; then
    cp /Users/ccladysmith/Desktop/dev/l1f3/documents/*.md ~/Development/claude-knowledge/lif3/ 2>/dev/null || true
    echo "✅ Documentation copied"
else
    echo "⚠️  No documents directory found - will create knowledge base dynamically"
fi

# Create Claude CLI alias
echo "🔗 Setting up Claude CLI aliases..."
SHELL_RC=""
if [ -f ~/.zshrc ]; then
    SHELL_RC="$HOME/.zshrc"
elif [ -f ~/.bashrc ]; then
    SHELL_RC="$HOME/.bashrc"
elif [ -f ~/.bash_profile ]; then
    SHELL_RC="$HOME/.bash_profile"
fi

if [ ! -z "$SHELL_RC" ]; then
    echo "" >> "$SHELL_RC"
    echo "# LIF3 AI Integration Aliases" >> "$SHELL_RC"
    echo "alias lif3-claude='python3 /Users/ccladysmith/Desktop/dev/l1f3/enhanced-claude-cli.py'" >> "$SHELL_RC"
    echo "alias lif3-briefing='python3 /Users/ccladysmith/Desktop/dev/l1f3/enhanced-claude-cli.py --briefing'" >> "$SHELL_RC"
    echo "alias lif3-progress='python3 /Users/ccladysmith/Desktop/dev/l1f3/enhanced-claude-cli.py --progress'" >> "$SHELL_RC"
    echo "alias lif3-business='python3 /Users/ccladysmith/Desktop/dev/l1f3/enhanced-claude-cli.py --business'" >> "$SHELL_RC"
    echo "alias lif3-sync='python3 /Users/ccladysmith/Desktop/dev/l1f3/knowledge-sync-daemon.py &'" >> "$SHELL_RC"
    echo "✅ Aliases added to $SHELL_RC"
else
    echo "⚠️  Could not detect shell configuration file"
fi

# Check for ANTHROPIC_API_KEY
if [ -z "$ANTHROPIC_API_KEY" ]; then
    echo ""
    echo "⚠️  ANTHROPIC_API_KEY environment variable not set"
    echo "💡 Add this to your shell configuration:"
    echo "export ANTHROPIC_API_KEY='your_api_key_here'"
    echo ""
fi

# Test basic functionality
echo "🧪 Testing basic functionality..."

# Test knowledge base access
if [ -d ~/Development/claude-knowledge/lif3 ]; then
    FILE_COUNT=$(find ~/Development/claude-knowledge/lif3 -name "*.md" | wc -l)
    echo "✅ Knowledge base: $FILE_COUNT documents found"
else
    echo "❌ Knowledge base not properly created"
fi

# Test Python script
if python3 /Users/ccladysmith/Desktop/dev/l1f3/enhanced-claude-cli.py --list-projects &>/dev/null; then
    echo "✅ Enhanced Claude CLI script functional"
else
    echo "❌ Enhanced Claude CLI script has issues"
fi

echo ""
echo "🎉 LIF3 AI Integration Setup Complete!"
echo ""
echo "📖 Quick Start Commands:"
echo "  lif3-claude --briefing          # Generate daily briefing"
echo "  lif3-claude --progress          # Analyze goal progress"
echo "  lif3-claude --business          # Business strategy insights"
echo "  lif3-claude \"your question\"     # Ask any LIF3-related question"
echo "  lif3-sync                       # Start knowledge sync daemon"
echo ""
echo "💡 Restart your terminal or run: source $SHELL_RC"
echo ""

# Instructions for backend integration
echo "🔧 Backend Integration:"
echo "1. Ensure your LIF3 backend is running on localhost:3001"
echo "2. Add ANTHROPIC_API_KEY to your backend .env file"
echo "3. The AI Agent module will provide automated daily briefings"
echo ""

echo "✅ Setup completed successfully!"