#!/bin/bash
# Sync latest Claude CLI session context to project context file for Cursor

# Directory containing Claude CLI session files
CLAUDE_PROJECT_DIR="$HOME/.claude/projects/-Users-ccladysmith-Desktop-dev-l1f3"
# Path to project context file (in .claude directory)
PROJECT_CONTEXT_PATH="/Users/ccladysmith/Desktop/dev/l1f3/.claude/CONTEXT.jsonl"

# Find the most recently modified .jsonl file in the Claude project directory
LATEST_CONTEXT_FILE=$(ls -t "$CLAUDE_PROJECT_DIR"/*.jsonl 2>/dev/null | head -1)

# Check if a session file was found
if [ -z "$LATEST_CONTEXT_FILE" ]; then
  echo "Error: No Claude CLI session .jsonl files found in $CLAUDE_PROJECT_DIR"
  exit 1
fi

# Copy the latest Claude context to the project file
cp "$LATEST_CONTEXT_FILE" "$PROJECT_CONTEXT_PATH"

echo "Latest Claude context synced to $PROJECT_CONTEXT_PATH" 