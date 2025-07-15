#!/usr/bin/env python3
"""
LIF3 Knowledge Sync Daemon
Real-time synchronization of LIF3 documentation and knowledge base
"""

import time
import os
import shutil
import json
from pathlib import Path
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
from datetime import datetime

class LIF3KnowledgeSyncHandler(FileSystemEventHandler):
    """Handler for file system events in LIF3 documentation"""
    
    def __init__(self, lif3_project_path, claude_knowledge_path):
        self.lif3_project = Path(lif3_project_path)
        self.claude_knowledge = Path(claude_knowledge_path) / "lif3"
        self.sync_log = []
        
        # Ensure knowledge directory exists
        self.claude_knowledge.mkdir(parents=True, exist_ok=True)
        
        print(f"📂 Watching: {self.lif3_project}")
        print(f"🔄 Syncing to: {self.claude_knowledge}")
        
    def on_modified(self, event):
        if event.is_directory:
            return
            
        self._sync_file(event.src_path, "modified")
    
    def on_created(self, event):
        if event.is_directory:
            return
            
        self._sync_file(event.src_path, "created")
    
    def on_moved(self, event):
        if event.is_directory:
            return
            
        # Handle file moves/renames
        if hasattr(event, 'dest_path'):
            self._sync_file(event.dest_path, "moved")
    
    def _sync_file(self, file_path, event_type):
        """Sync a specific file to Claude knowledge base"""
        try:
            file_path = Path(file_path)
            
            # Only sync specific file types
            if file_path.suffix not in ['.md', '.txt', '.json']:
                return
            
            # Skip certain directories
            excluded_dirs = {'node_modules', '.git', 'dist', 'logs', 'storage'}
            if any(excluded in file_path.parts for excluded in excluded_dirs):
                return
            
            # Calculate relative path from LIF3 project root
            try:
                rel_path = file_path.relative_to(self.lif3_project)
            except ValueError:
                # File is not within the watched directory
                return
            
            # Determine destination path
            dest_path = self.claude_knowledge / rel_path
            dest_path.parent.mkdir(parents=True, exist_ok=True)
            
            # Copy file to knowledge base
            shutil.copy2(file_path, dest_path)
            
            # Log the sync
            sync_entry = {
                "timestamp": datetime.now().isoformat(),
                "event": event_type,
                "source": str(file_path),
                "destination": str(dest_path),
                "relative_path": str(rel_path)
            }
            self.sync_log.append(sync_entry)
            
            print(f"✅ {event_type.upper()}: {rel_path}")
            
            # Maintain log size
            if len(self.sync_log) > 1000:
                self.sync_log = self.sync_log[-500:]
                
        except Exception as e:
            print(f"❌ Error syncing {file_path}: {e}")
    
    def initial_sync(self):
        """Perform initial sync of all relevant files"""
        print("🔄 Performing initial knowledge base sync...")
        
        file_types = ['*.md', '*.txt', '*.json']
        synced_count = 0
        
        for pattern in file_types:
            for file_path in self.lif3_project.rglob(pattern):
                # Skip excluded directories
                excluded_dirs = {'node_modules', '.git', 'dist', 'logs', 'storage'}
                if any(excluded in file_path.parts for excluded in excluded_dirs):
                    continue
                
                self._sync_file(file_path, "initial_sync")
                synced_count += 1
        
        print(f"✅ Initial sync complete: {synced_count} files synchronized")
    
    def save_sync_log(self):
        """Save sync log to knowledge base"""
        log_file = self.claude_knowledge / "sync_log.json"
        with open(log_file, 'w') as f:
            json.dump(self.sync_log, f, indent=2)

class LIF3KnowledgeSyncDaemon:
    """Main daemon class for LIF3 knowledge synchronization"""
    
    def __init__(self):
        self.lif3_project_path = "/Users/ccladysmith/Desktop/dev/l1f3"
        self.claude_knowledge_path = str(Path.home() / "Development" / "claude-knowledge")
        self.observer = None
        
    def start(self):
        """Start the knowledge sync daemon"""
        print("🚀 Starting LIF3 Knowledge Sync Daemon...")
        print(f"📅 Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        # Create event handler
        event_handler = LIF3KnowledgeSyncHandler(
            self.lif3_project_path, 
            self.claude_knowledge_path
        )
        
        # Perform initial sync
        event_handler.initial_sync()
        
        # Setup file watcher
        self.observer = Observer()
        self.observer.schedule(
            event_handler, 
            self.lif3_project_path, 
            recursive=True
        )
        
        # Start monitoring
        self.observer.start()
        print("👁️  File monitoring active...")
        print("💡 Use Ctrl+C to stop the daemon")
        
        try:
            while True:
                time.sleep(5)
                
                # Periodically save sync log
                if hasattr(event_handler, 'sync_log') and len(event_handler.sync_log) > 0:
                    event_handler.save_sync_log()
                
        except KeyboardInterrupt:
            print("\\n🛑 Stopping LIF3 Knowledge Sync Daemon...")
            self.stop()
    
    def stop(self):
        """Stop the knowledge sync daemon"""
        if self.observer:
            self.observer.stop()
            self.observer.join()
        print("✅ LIF3 Knowledge Sync Daemon stopped")

def main():
    """Main entry point"""
    daemon = LIF3KnowledgeSyncDaemon()
    
    try:
        daemon.start()
    except Exception as e:
        print(f"❌ Failed to start daemon: {e}")
        return 1
    
    return 0

if __name__ == "__main__":
    exit(main())