import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  CircularProgress,
  Alert,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  CloudSync,
  CloudDone,
  CloudOff,
  Description,
  Refresh,
  FolderOpen,
  Schedule,
  Backup
} from '@mui/icons-material';
import axios from 'axios';
import logger from '../utils/logger';

interface GoogleDriveSyncProps {
  onSyncStatusChange?: (status: any) => void;
}

interface SyncStatus {
  isConnected: boolean;
  lastSync: string | null;
  fileCount: number;
  folderId: string;
  status: 'HEALTHY' | 'ERROR' | 'SYNCING';
  error?: string;
  recentFiles?: any[];
}

const GoogleDriveSync: React.FC<GoogleDriveSyncProps> = ({ onSyncStatusChange }) => {
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingBriefing, setIsCreatingBriefing] = useState(false);
  const [recentFiles, setRecentFiles] = useState<any[]>([]);

  const fetchSyncStatus = async () => {
    try {
      setIsLoading(true);
      logger.logAPICall('/api/integrations/google-drive/status', 'GET', 0, 0, 'GoogleDriveSync');
      
      const response = await axios.get('/api/integrations/google-drive/status');
      const status = response.data;
      
      setSyncStatus(status);
      onSyncStatusChange?.(status);
      
      logger.logUserInteraction('sync_status', 'FETCH', 'GoogleDriveSync', { status });
      
    } catch (error: any) {
      console.error('Failed to fetch sync status:', error);
      setSyncStatus({
        isConnected: false,
        lastSync: null,
        fileCount: 0,
        folderId: '1dD8C1e1hkcCPdtlqA3nsxJYWVvilV5Io',
        status: 'ERROR',
        error: error.message
      });
      
      logger.logError(error, 'GoogleDriveSync', 'FETCH_STATUS_ERROR');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRecentFiles = async () => {
    try {
      const response = await axios.get('/api/integrations/google-drive/files');
      setRecentFiles(response.data.slice(0, 5)); // Show last 5 files
      
      logger.logUserInteraction('files', 'FETCH', 'GoogleDriveSync', { 
        fileCount: response.data.length 
      });
      
    } catch (error: any) {
      console.error('Failed to fetch recent files:', error);
      logger.logError(error, 'GoogleDriveSync', 'FETCH_FILES_ERROR');
    }
  };

  const createTestBriefing = async () => {
    try {
      setIsCreatingBriefing(true);
      logger.logUserInteraction('create_briefing', 'CLICK', 'GoogleDriveSync');
      
      const response = await axios.post('/api/integrations/google-drive/test-briefing');
      
      if (response.data.success) {
        logger.logUserInteraction('briefing_created', 'SUCCESS', 'GoogleDriveSync', {
          fileName: response.data.fileName,
          fileId: response.data.fileId
        });
        
        // Refresh status and files
        await Promise.all([fetchSyncStatus(), fetchRecentFiles()]);
      }
      
    } catch (error: any) {
      console.error('Failed to create test briefing:', error);
      logger.logError(error, 'GoogleDriveSync', 'CREATE_BRIEFING_ERROR');
    } finally {
      setIsCreatingBriefing(false);
    }
  };

  const triggerSync = async () => {
    try {
      setIsLoading(true);
      logger.logUserInteraction('manual_sync', 'TRIGGER', 'GoogleDriveSync');
      
      const financialData = {
        netWorth: 239625,
        dailyRevenue: 0,
        goalProgress: (239625 / 1800000) * 100,
        transactions: [],
        businessMetrics: {
          dailyRevenue: 0,
          mrr: 0,
          dailyTarget: 4881,
          mrrTarget: 147917
        }
      };
      
      const response = await axios.post('/api/integrations/google-drive/sync', financialData);
      
      if (response.data.success) {
        await Promise.all([fetchSyncStatus(), fetchRecentFiles()]);
      }
      
    } catch (error: any) {
      console.error('Failed to trigger sync:', error);
      logger.logError(error, 'GoogleDriveSync', 'MANUAL_SYNC_ERROR');
    } finally {
      setIsLoading(false);
    }
  };

  const createFolderStructure = async () => {
    try {
      setIsLoading(true);
      logger.logUserInteraction('create_folders', 'TRIGGER', 'GoogleDriveSync');
      
      const response = await axios.post('/api/integrations/google-drive/create-folders');
      
      if (response.data.success) {
        await fetchSyncStatus();
      }
      
    } catch (error: any) {
      console.error('Failed to create folder structure:', error);
      logger.logError(error, 'GoogleDriveSync', 'CREATE_FOLDERS_ERROR');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSyncStatus();
    fetchRecentFiles();
    
    // Refresh every 30 seconds
    const interval = setInterval(() => {
      fetchSyncStatus();
      fetchRecentFiles();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = () => {
    if (isLoading) return <CircularProgress size={20} />;
    
    switch (syncStatus?.status) {
      case 'HEALTHY':
        return <CloudDone sx={{ color: 'success.main' }} />;
      case 'ERROR':
        return <CloudOff sx={{ color: 'error.main' }} />;
      case 'SYNCING':
        return <CloudSync sx={{ color: 'primary.main' }} />;
      default:
        return <CloudOff sx={{ color: 'grey.500' }} />;
    }
  };

  const getStatusColor = () => {
    switch (syncStatus?.status) {
      case 'HEALTHY': return 'success';
      case 'ERROR': return 'error';
      case 'SYNCING': return 'primary';
      default: return 'default';
    }
  };

  const formatFileDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-ZA', {
      timeZone: 'Africa/Johannesburg',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          {getStatusIcon()}
          <Typography variant="h6" sx={{ ml: 1, flexGrow: 1 }}>
            Google Drive Sync
          </Typography>
          <Chip 
            label={syncStatus?.status || 'Unknown'} 
            color={getStatusColor() as any}
            size="small"
          />
        </Box>

        {syncStatus?.error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {syncStatus.error}
          </Alert>
        )}

        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Folder ID: {syncStatus?.folderId || 'Not connected'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Files: {syncStatus?.fileCount || 0}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Last Sync: {syncStatus?.lastSync 
              ? formatFileDate(syncStatus.lastSync)
              : 'Never'
            }
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<Refresh />}
            onClick={triggerSync}
            disabled={isLoading}
          >
            Sync Now
          </Button>
          
          <Button
            variant="outlined"
            size="small"
            startIcon={<Description />}
            onClick={createTestBriefing}
            disabled={isCreatingBriefing}
          >
            {isCreatingBriefing ? 'Creating...' : 'Test Briefing'}
          </Button>
          
          <Button
            variant="outlined"
            size="small"
            startIcon={<FolderOpen />}
            onClick={createFolderStructure}
            disabled={isLoading}
          >
            Create Folders
          </Button>
        </Box>

        {recentFiles.length > 0 && (
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Recent Files
            </Typography>
            <List dense>
              {recentFiles.map((file, index) => (
                <ListItem key={file.id || index} sx={{ px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    {file.name?.includes('Briefing') ? <Description /> :
                     file.name?.includes('Backup') ? <Backup /> :
                     <Description />}
                  </ListItemIcon>
                  <ListItemText
                    primary={file.name || 'Unnamed file'}
                    secondary={file.createdTime ? formatFileDate(file.createdTime) : 'Unknown date'}
                    primaryTypographyProps={{ variant: 'body2' }}
                    secondaryTypographyProps={{ variant: 'caption' }}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        <Box sx={{ mt: 2, p: 1, bgcolor: 'background.default', borderRadius: 1 }}>
          <Typography variant="caption" color="text.secondary">
            📅 Daily briefings at 8:00 AM CAT<br />
            💾 Weekly backups on Sundays<br />
            🔄 Real-time financial sync
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default GoogleDriveSync;