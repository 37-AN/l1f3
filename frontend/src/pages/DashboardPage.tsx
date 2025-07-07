import React, { useEffect, useState } from 'react'
import { Grid, Card, CardContent, Typography, Box, LinearProgress, Paper } from '@mui/material'
import { TrendingUp, AccountBalance, Business, Flag } from '@mui/icons-material'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import logger from '../utils/logger'
import ClaudeAIAssistant from '../components/ClaudeAIAssistant'

interface FinancialData {
  netWorth: {
    current: number
    target: number
    progress: number
  }
  accounts: Array<{
    id: string
    name: string
    balance: number
    currency: string
  }>
  businessMetrics: {
    dailyRevenue: number
    dailyTarget: number
    mrr: number
    mrrTarget: number
  }
  goals: Array<{
    id: string
    name: string
    current: number
    target: number
    progress: number
  }>
}

const DashboardPage: React.FC = () => {
  const [pageLoadTime, setPageLoadTime] = useState<number>(0)

  // Fetch financial dashboard data
  const { data: financialData, isLoading, error } = useQuery<FinancialData>({
    queryKey: ['financial-dashboard'],
    queryFn: async () => {
      const startTime = Date.now()
      try {
        const response = await axios.get('/api/financial/dashboard')
        const loadTime = Date.now() - startTime
        logger.logAPICall('/api/financial/dashboard', 'GET', loadTime, response.status, 'DashboardPage')
        return response.data
      } catch (error) {
        logger.logError(error as Error, 'DashboardPage', 'FETCH_DASHBOARD_DATA')
        throw error
      }
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  })

  useEffect(() => {
    const startTime = Date.now()
    const measureLoad = logger.measureComponentRender('DashboardPage')
    
    return () => {
      const loadTime = measureLoad()
      setPageLoadTime(loadTime)
      logger.logPageView('Dashboard', loadTime)
    }
  }, [])

  // Log user interactions
  const handleCardClick = (cardType: string) => {
    logger.logUserInteraction('card', 'click', 'DashboardPage', { cardType })
  }

  if (isLoading) {
    return (
      <Box sx={{ width: '100%', mt: 2 }}>
        <LinearProgress />
        <Typography variant="h6" sx={{ mt: 2, textAlign: 'center' }}>
          Loading your financial dashboard...
        </Typography>
      </Box>
    )
  }

  if (error) {
    logger.logError(error as Error, 'DashboardPage', 'RENDER_ERROR')
    return (
      <Typography variant="h6" color="error" sx={{ textAlign: 'center', mt: 4 }}>
        Unable to load dashboard data. Please try again.
      </Typography>
    )
  }

  const formatZAR = (amount: number) => `R${amount.toLocaleString('en-ZA')}`

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Financial Dashboard
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Your journey to R1.8M net worth • Current progress: {financialData?.netWorth.progress.toFixed(1)}%
        </Typography>
        {pageLoadTime > 0 && (
          <Typography variant="caption" color="text.secondary">
            Page loaded in {pageLoadTime}ms
          </Typography>
        )}
      </Box>

      <Grid container spacing={3}>
        {/* Net Worth Overview */}
        <Grid item xs={12} md={8}>
          <Card onClick={() => handleCardClick('net-worth')} sx={{ cursor: 'pointer', '&:hover': { elevation: 4 } }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingUp sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Net Worth Progress</Typography>
              </Box>
              
              <Typography variant="h3" component="div" color="primary.main" gutterBottom>
                {formatZAR(financialData?.netWorth.current || 239625)}
              </Typography>
              
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Target: {formatZAR(financialData?.netWorth.target || 1800000)}
              </Typography>
              
              <Box sx={{ mt: 2, mb: 1 }}>
                <LinearProgress 
                  variant="determinate" 
                  value={financialData?.netWorth.progress || 13.3} 
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
              
              <Typography variant="body2" color="text.secondary">
                {(financialData?.netWorth.progress || 13.3).toFixed(1)}% complete • 
                {formatZAR((financialData?.netWorth.target || 1800000) - (financialData?.netWorth.current || 239625))} remaining
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Stats */}
        <Grid item xs={12} md={4}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Card onClick={() => handleCardClick('daily-target')} sx={{ cursor: 'pointer' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Flag sx={{ mr: 1, color: 'secondary.main' }} />
                    <Typography variant="subtitle2">Daily Target</Typography>
                  </Box>
                  <Typography variant="h6">
                    R{(financialData?.netWorth.target || 1800000) / 365 | 0}/day
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    To reach goal in 1 year
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12}>
              <Card onClick={() => handleCardClick('monthly-growth')} sx={{ cursor: 'pointer' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <TrendingUp sx={{ mr: 1, color: 'success.main' }} />
                    <Typography variant="subtitle2">Monthly Growth</Typography>
                  </Box>
                  <Typography variant="h6">R15,000</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Average needed
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        {/* Account Balances */}
        <Grid item xs={12} md={4}>
          <Card onClick={() => handleCardClick('accounts')} sx={{ cursor: 'pointer' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AccountBalance sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Account Balances</Typography>
              </Box>
              
              {(financialData?.accounts || [
                { id: 'liquid', name: 'Liquid Cash', balance: 88750, currency: 'ZAR' },
                { id: 'investments', name: 'Investments', balance: 142000, currency: 'ZAR' },
                { id: 'business', name: 'Business Equity', balance: 8875, currency: 'ZAR' }
              ]).map((account) => (
                <Box key={account.id} sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2">{account.name}</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {formatZAR(account.balance)}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* 43V3R Business Metrics */}
        <Grid item xs={12} md={4}>
          <Card onClick={() => handleCardClick('business')} sx={{ cursor: 'pointer' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Business sx={{ mr: 1, color: 'secondary.main' }} />
                <Typography variant="h6">43V3R Business</Typography>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">Daily Revenue</Typography>
                <Typography variant="h6">
                  {formatZAR(financialData?.businessMetrics.dailyRevenue || 0)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Target: {formatZAR(financialData?.businessMetrics.dailyTarget || 4881)}
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={((financialData?.businessMetrics.dailyRevenue || 0) / (financialData?.businessMetrics.dailyTarget || 4881)) * 100}
                  sx={{ mt: 1, height: 4 }}
                />
              </Box>
              
              <Box>
                <Typography variant="body2" color="text.secondary">Monthly Recurring Revenue</Typography>
                <Typography variant="h6">
                  {formatZAR(financialData?.businessMetrics.mrr || 0)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Target: {formatZAR(financialData?.businessMetrics.mrrTarget || 147917)}
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={((financialData?.businessMetrics.mrr || 0) / (financialData?.businessMetrics.mrrTarget || 147917)) * 100}
                  sx={{ mt: 1, height: 4 }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Goals Progress */}
        <Grid item xs={12} md={4}>
          <Card onClick={() => handleCardClick('goals')} sx={{ cursor: 'pointer' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Flag sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Goals</Typography>
              </Box>
              
              {(financialData?.goals || [
                { id: 'net_worth', name: 'Net Worth R1.8M', current: 239625, target: 1800000, progress: 13.3 },
                { id: 'daily_revenue', name: '43V3R Daily Revenue', current: 0, target: 4881, progress: 0 }
              ]).map((goal) => (
                <Box key={goal.id} sx={{ mb: 2 }}>
                  <Typography variant="body2" gutterBottom>{goal.name}</Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption">
                      {formatZAR(goal.current)} / {formatZAR(goal.target)}
                    </Typography>
                    <Typography variant="caption" fontWeight="bold">
                      {goal.progress.toFixed(1)}%
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={goal.progress} 
                    sx={{ height: 4 }}
                  />
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Claude AI Assistant */}
        <Grid item xs={12} lg={8}>
          <ClaudeAIAssistant 
            currentMetrics={{
              netWorth: financialData?.netWorth.current || 239625,
              dailyRevenue: financialData?.businessMetrics.dailyRevenue || 0,
              progress: financialData?.netWorth.progress || 13.3
            }}
          />
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 3, height: '600px', overflow: 'auto' }}>
            <Typography variant="h6" gutterBottom>Recent Activity</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Dashboard loaded • WebSocket connected • Real-time updates active
            </Typography>
            
            {/* Sample activity items */}
            <Box sx={{ mt: 2 }}>
              <Box sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="body2" fontWeight="bold">
                  Net Worth Updated
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Current: R{(financialData?.netWorth.current || 239625).toLocaleString()} 
                  ({(financialData?.netWorth.progress || 13.3).toFixed(1)}% toward goal)
                </Typography>
              </Box>
              
              <Box sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="body2" fontWeight="bold">
                  43V3R Business Metrics
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Daily Revenue: R{(financialData?.businessMetrics.dailyRevenue || 0).toLocaleString()}
                  / R{(financialData?.businessMetrics.dailyTarget || 4881).toLocaleString()} target
                </Typography>
              </Box>
              
              <Box sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="body2" fontWeight="bold">
                  Claude AI Assistant
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Ready to provide financial insights and business strategy advice
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}

export default DashboardPage