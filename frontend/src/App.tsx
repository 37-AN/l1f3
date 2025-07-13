import React, { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Box, Container, AppBar, Toolbar, Typography, IconButton, Badge, Avatar, Menu, MenuItem } from '@mui/material'
import { Notifications, AccountCircle, Dashboard, TrendingUp, Business, Settings } from '@mui/icons-material'
import DashboardPage from './pages/DashboardPage'
import GoalsPage from './pages/GoalsPage'
import BusinessPage from './pages/BusinessPage'
import SettingsPage from './pages/SettingsPage'
import { useWebSocket } from './hooks/useWebSocket'
import logger from './utils/logger'

function App() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [notifications, setNotifications] = useState<any[]>([])
  
  // WebSocket connection for real-time updates  
  const { isConnected, lastEvent } = useWebSocket('http://localhost:3001')

  useEffect(() => {
    // Handle real-time events
    if (lastEvent) {
      logger.logWebSocketEvent(lastEvent.event, lastEvent.data)
      
      // Add to notifications
      if (['balance_update', 'goal_progress', 'business_revenue', 'milestone_achieved'].includes(lastEvent.event)) {
        setNotifications(prev => [...prev.slice(-4), lastEvent]) // Keep last 5 notifications
      }
    }
  }, [lastEvent])

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const menuId = 'primary-search-account-menu'
  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      id={menuId}
      keepMounted
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      open={Boolean(anchorEl)}
      onClose={handleMenuClose}
    >
      <MenuItem onClick={handleMenuClose}>Profile</MenuItem>
      <MenuItem onClick={handleMenuClose}>Settings</MenuItem>
      <MenuItem onClick={handleMenuClose}>Logout</MenuItem>
    </Menu>
  )

  // Log page performance
  const measurePagePerformance = logger.measureComponentRender('App')

  useEffect(() => {
    return measurePagePerformance()
  }, [measurePagePerformance])

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* App Bar */}
      <AppBar position="static" elevation={1}>
        <Toolbar>
          <TrendingUp sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            LIF3 Financial Dashboard
          </Typography>
          
          {/* Net Worth Progress Indicator */}
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 3 }}>
            <Typography variant="body2" sx={{ mr: 1 }}>
              R239,625 → R1.8M
            </Typography>
            <Typography variant="body2" color="secondary.main" fontWeight="bold">
              (13.3%)
            </Typography>
          </Box>

          {/* Connection Status */}
          <Box sx={{ 
            width: 8, 
            height: 8, 
            borderRadius: '50%', 
            backgroundColor: isConnected ? 'success.main' : 'error.main',
            mr: 2
          }} />

          {/* Notifications */}
          <IconButton
            size="large"
            aria-label={`show ${notifications.length} new notifications`}
            color="inherit"
          >
            <Badge badgeContent={notifications.length} color="error">
              <Notifications />
            </Badge>
          </IconButton>

          {/* Profile Menu */}
          <IconButton
            size="large"
            edge="end"
            aria-label="account of current user"
            aria-controls={menuId}
            aria-haspopup="true"
            onClick={handleProfileMenuOpen}
            color="inherit"
          >
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
              EB
            </Avatar>
          </IconButton>
        </Toolbar>
      </AppBar>
      {renderMenu}

      {/* Main Content */}
      <Container maxWidth="xl" sx={{ mt: 3, mb: 3 }}>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/goals" element={<GoalsPage />} />
          <Route path="/business" element={<BusinessPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </Container>

      {/* Real-time Notifications */}
      {lastEvent && (
        <Box
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            bgcolor: 'primary.main',
            color: 'white',
            p: 2,
            borderRadius: 1,
            maxWidth: 300,
            opacity: 0.9
          }}
        >
          <Typography variant="body2">
            {lastEvent.event}: {JSON.stringify(lastEvent.data, null, 2)}
          </Typography>
        </Box>
      )}
    </Box>
  )
}

export default App