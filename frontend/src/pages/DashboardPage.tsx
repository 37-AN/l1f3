import React, { useEffect, useState } from 'react'
import { Grid, Card, CardContent, Typography, Box, LinearProgress, Paper, TextField, Button, Snackbar, Alert, Divider, FormHelperText, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material'
import { TrendingUp, AccountBalance, Business, Flag } from '@mui/icons-material'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import logger from '../utils/logger'
import { API_CONFIG, createApiUrl } from '../config/api'
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

interface BusinessStrategy {
  currentMRR: string;
  targetMRR: string;
  timeline: string;
  immediateFocus: string;
  serviceOfferings: Array<{ name: string; priceRange: string }>;
  targetMarket: string[];
  focus: string;
  technology: string;
  target: string;
  revenueModel: string;
  competitiveAdvantages: string[];
  generated: string;
}

const DashboardPage: React.FC = () => {
  const [pageLoadTime, setPageLoadTime] = useState<number>(0)
  const [strategy, setStrategy] = useState<BusinessStrategy | null>(null);
  const [strategyLoading, setStrategyLoading] = useState(false);
  const [strategyError, setStrategyError] = useState<string | null>(null);
  const [strategySuccess, setStrategySuccess] = useState(false);
  const [strategyDraft, setStrategyDraft] = useState<BusinessStrategy | null>(null);
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});
  const [showConfirm, setShowConfirm] = useState(false);

  // Fetch financial dashboard data
  const { data: financialData, isLoading, error } = useQuery<FinancialData>({
    queryKey: ['financial-dashboard'],
    queryFn: async () => {
      const startTime = Date.now()
      try {
        const response = await axios.get(createApiUrl('/api/financial/dashboard'))
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

  // Fetch business strategy data
  useEffect(() => {
    setStrategyLoading(true);
    axios.get(createApiUrl('/api/business-strategy'))
      .then(res => {
        setStrategy(res.data);
        setStrategyDraft(res.data);
      })
      .catch(() => setStrategyError('Failed to load business strategy'))
      .finally(() => setStrategyLoading(false));
  }, []);

  useEffect(() => {
    const startTime = Date.now()
    const measureLoad = logger.measureComponentRender('DashboardPage')
    
    return () => {
      const loadTime = measureLoad()
      if (typeof loadTime === 'number') {
        setPageLoadTime(loadTime)
        logger.logPageView('Dashboard', loadTime)
      }
    }
  }, [])

  const validateStrategy = (data: BusinessStrategy | null) => {
    const errors: { [key: string]: string } = {};
    if (!data) return errors;
    if (!data.currentMRR) errors.currentMRR = 'Current MRR is required';
    if (!data.targetMRR) errors.targetMRR = 'Target MRR is required';
    if (data.currentMRR && isNaN(Number(data.currentMRR))) errors.currentMRR = 'Must be a number';
    if (data.targetMRR && isNaN(Number(data.targetMRR))) errors.targetMRR = 'Must be a number';
    if (!data.timeline) errors.timeline = 'Timeline is required';
    if (!data.immediateFocus) errors.immediateFocus = 'Immediate focus is required';
    if (!data.focus) errors.focus = 'Brand focus is required';
    if (!data.technology) errors.technology = 'Brand technology is required';
    if (!data.target) errors.target = 'Brand target is required';
    if (!data.revenueModel) errors.revenueModel = 'Revenue model is required';
    if (!data.generated) errors.generated = 'Generated date is required';
    if (!data.serviceOfferings || data.serviceOfferings.length === 0) errors.serviceOfferings = 'At least one service offering required';
    if (data.serviceOfferings) {
      data.serviceOfferings.forEach((o, i) => {
        if (!o.name) errors[`serviceOfferings.${i}.name`] = 'Name required';
        if (!o.priceRange) errors[`serviceOfferings.${i}.priceRange`] = 'Price range required';
      });
    }
    if (!data.targetMarket || data.targetMarket.length === 0) errors.targetMarket = 'At least one target market required';
    if (data.targetMarket) {
      data.targetMarket.forEach((v, i) => {
        if (!v) errors[`targetMarket.${i}`] = 'Target market required';
      });
    }
    if (!data.competitiveAdvantages || data.competitiveAdvantages.length === 0) errors.competitiveAdvantages = 'At least one competitive advantage required';
    if (data.competitiveAdvantages) {
      data.competitiveAdvantages.forEach((v, i) => {
        if (!v) errors[`competitiveAdvantages.${i}`] = 'Advantage required';
      });
    }
    return errors;
  };

  const handleStrategyChange = (field: keyof BusinessStrategy, value: any) => {
    setStrategy((prev) => prev ? { ...prev, [field]: value } : prev);
  };

  const handleStrategyDraftChange = (field: keyof BusinessStrategy, value: any) => {
    setStrategyDraft((prev) => prev ? { ...prev, [field]: value } : prev);
  };

  const handleServiceOfferingChange = (idx: number, key: 'name' | 'priceRange', value: string) => {
    setStrategyDraft((prev) => {
      if (!prev) return prev;
      const updated = [...(prev.serviceOfferings || [])];
      updated[idx] = { ...updated[idx], [key]: value };
      return { ...prev, serviceOfferings: updated };
    });
  };

  const handleAddServiceOffering = () => {
    setStrategyDraft((prev) => prev ? { ...prev, serviceOfferings: [...(prev.serviceOfferings || []), { name: '', priceRange: '' }] } : prev);
  };

  const handleRemoveServiceOffering = (idx: number) => {
    setStrategyDraft((prev) => {
      if (!prev) return prev;
      const updated = [...(prev.serviceOfferings || [])];
      updated.splice(idx, 1);
      return { ...prev, serviceOfferings: updated };
    });
  };

  const handleArrayFieldChange = (field: keyof BusinessStrategy, idx: number, value: string) => {
    setStrategyDraft((prev) => {
      if (!prev) return prev;
      const arr = [...(prev[field] as string[])];
      arr[idx] = value;
      return { ...prev, [field]: arr };
    });
  };

  const handleAddArrayField = (field: keyof BusinessStrategy) => {
    setStrategyDraft((prev) => prev ? { ...prev, [field]: [...((prev[field] as string[]) || []), ''] } : prev);
  };

  const handleRemoveArrayField = (field: keyof BusinessStrategy, idx: number) => {
    setStrategyDraft((prev) => {
      if (!prev) return prev;
      const arr = [...(prev[field] as string[])];
      arr.splice(idx, 1);
      return { ...prev, [field]: arr };
    });
  };

  const handleSaveStrategy = async () => {
    const errors = validateStrategy(strategyDraft);
    setValidationErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setShowConfirm(true);
  };

  const handleConfirmSave = async () => {
    setShowConfirm(false);
    setStrategyLoading(true);
    setStrategyError(null);
    try {
      await axios.post(createApiUrl('/api/business-strategy'), strategyDraft);
      setStrategy(strategyDraft);
      setStrategySuccess(true);
    } catch {
      setStrategyError('Failed to save business strategy');
    } finally {
      setStrategyLoading(false);
    }
  };

  const handleReset = () => {
    setStrategyDraft(strategy);
    setValidationErrors({});
  };

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

      {/* Business Strategy Section */}
      <Box sx={{ mt: 6 }}>
        <Card>
          <CardContent>
            <Typography variant="h5" gutterBottom>Business Strategy (Editable)</Typography>
            {strategyLoading && <LinearProgress sx={{ mb: 2 }} />}
            {strategyError && <Alert severity="error">{strategyError}</Alert>}
            {strategyDraft && (
              <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Divider sx={{ mb: 2 }}>Technology</Divider>
                <TextField label="Current MRR" value={strategyDraft.currentMRR} onChange={e => handleStrategyDraftChange('currentMRR', e.target.value)} error={!!validationErrors.currentMRR} helperText={validationErrors.currentMRR} fullWidth />
                <TextField label="Target MRR" value={strategyDraft.targetMRR} onChange={e => handleStrategyDraftChange('targetMRR', e.target.value)} error={!!validationErrors.targetMRR} helperText={validationErrors.targetMRR} fullWidth />
                <TextField label="Timeline" value={strategyDraft.timeline} onChange={e => handleStrategyDraftChange('timeline', e.target.value)} error={!!validationErrors.timeline} helperText={validationErrors.timeline} fullWidth />
                <TextField label="Immediate Focus" value={strategyDraft.immediateFocus} onChange={e => handleStrategyDraftChange('immediateFocus', e.target.value)} error={!!validationErrors.immediateFocus} helperText={validationErrors.immediateFocus} fullWidth />
                <Typography variant="subtitle1">Service Offerings</Typography>
                {validationErrors.serviceOfferings && <FormHelperText error>{validationErrors.serviceOfferings}</FormHelperText>}
                {strategyDraft.serviceOfferings?.map((offering, idx) => (
                  <Box key={idx} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <TextField label="Name" value={offering.name} onChange={e => handleServiceOfferingChange(idx, 'name', e.target.value)} error={!!validationErrors[`serviceOfferings.${idx}.name`]} helperText={validationErrors[`serviceOfferings.${idx}.name`]} />
                    <TextField label="Price Range" value={offering.priceRange} onChange={e => handleServiceOfferingChange(idx, 'priceRange', e.target.value)} error={!!validationErrors[`serviceOfferings.${idx}.priceRange`]} helperText={validationErrors[`serviceOfferings.${idx}.priceRange`]} />
                    <Button onClick={() => handleRemoveServiceOffering(idx)} color="error">Remove</Button>
                  </Box>
                ))}
                <Button onClick={handleAddServiceOffering} variant="outlined">Add Service Offering</Button>
                <Typography variant="subtitle1">Target Market</Typography>
                {validationErrors.targetMarket && <FormHelperText error>{validationErrors.targetMarket}</FormHelperText>}
                {strategyDraft.targetMarket?.map((val, idx) => (
                  <Box key={idx} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <TextField label={`Target Market #${idx + 1}`} value={val} onChange={e => handleArrayFieldChange('targetMarket', idx, e.target.value)} error={!!validationErrors[`targetMarket.${idx}`]} helperText={validationErrors[`targetMarket.${idx}`]} />
                    <Button onClick={() => handleRemoveArrayField('targetMarket', idx)} color="error">Remove</Button>
                  </Box>
                ))}
                <Button onClick={() => handleAddArrayField('targetMarket')} variant="outlined">Add Target Market</Button>
                <Divider sx={{ my: 2 }}>Brand</Divider>
                <TextField label="Brand Focus" value={strategyDraft.focus} onChange={e => handleStrategyDraftChange('focus', e.target.value)} error={!!validationErrors.focus} helperText={validationErrors.focus} fullWidth />
                <TextField label="Brand Technology" value={strategyDraft.technology} onChange={e => handleStrategyDraftChange('technology', e.target.value)} error={!!validationErrors.technology} helperText={validationErrors.technology} fullWidth />
                <TextField label="Brand Target" value={strategyDraft.target} onChange={e => handleStrategyDraftChange('target', e.target.value)} error={!!validationErrors.target} helperText={validationErrors.target} fullWidth />
                <TextField label="Revenue Model" value={strategyDraft.revenueModel} onChange={e => handleStrategyDraftChange('revenueModel', e.target.value)} error={!!validationErrors.revenueModel} helperText={validationErrors.revenueModel} fullWidth />
                <Typography variant="subtitle1">Competitive Advantages</Typography>
                {validationErrors.competitiveAdvantages && <FormHelperText error>{validationErrors.competitiveAdvantages}</FormHelperText>}
                {strategyDraft.competitiveAdvantages?.map((val, idx) => (
                  <Box key={idx} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <TextField label={`Advantage #${idx + 1}`} value={val} onChange={e => handleArrayFieldChange('competitiveAdvantages', idx, e.target.value)} error={!!validationErrors[`competitiveAdvantages.${idx}`]} helperText={validationErrors[`competitiveAdvantages.${idx}`]} />
                    <Button onClick={() => handleRemoveArrayField('competitiveAdvantages', idx)} color="error">Remove</Button>
                  </Box>
                ))}
                <Button onClick={() => handleAddArrayField('competitiveAdvantages')} variant="outlined">Add Competitive Advantage</Button>
                <Divider sx={{ my: 2 }}>Metadata</Divider>
                <TextField label="Generated" value={strategyDraft.generated} onChange={e => handleStrategyDraftChange('generated', e.target.value)} error={!!validationErrors.generated} helperText={validationErrors.generated} fullWidth />
                <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                  <Button onClick={handleSaveStrategy} variant="contained" color="primary" disabled={strategyLoading}>Save Strategy</Button>
                  <Button onClick={handleReset} variant="outlined" color="secondary" disabled={strategyLoading}>Reset</Button>
                </Box>
              </Box>
            )}
            <Snackbar open={strategySuccess} autoHideDuration={3000} onClose={() => setStrategySuccess(false)}>
              <Alert onClose={() => setStrategySuccess(false)} severity="success" sx={{ width: '100%' }}>
                Business strategy saved successfully!
              </Alert>
            </Snackbar>
            <Dialog open={showConfirm} onClose={() => setShowConfirm(false)}>
              <DialogTitle>Confirm Save</DialogTitle>
              <DialogContent>Are you sure you want to save changes to the business strategy?</DialogContent>
              <DialogActions>
                <Button onClick={() => setShowConfirm(false)}>Cancel</Button>
                <Button onClick={handleConfirmSave} variant="contained" color="primary">Confirm</Button>
              </DialogActions>
            </Dialog>
          </CardContent>
        </Card>
      </Box>
    </Box>
  )
}

export default DashboardPage