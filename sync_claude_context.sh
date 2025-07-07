#!/bin/bash
# Sync Claude CLI context to project context file for Cursor

# Path to Claude CLI's latest context (now in l1f3 directory)
CLAUDE_CONTEXT_PATH="./last_context.txt"
# Path to project context file
PROJECT_CONTEXT_PATH="./CONTEXT.md"

# Copy the latest Claude context to the project file
cp "$CLAUDE_CONTEXT_PATH" "$PROJECT_CONTEXT_PATH"

echo "Claude context synced to $PROJECT_CONTEXT_PATH" 