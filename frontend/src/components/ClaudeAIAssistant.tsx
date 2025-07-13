import React, { useState, useEffect, useRef } from 'react'
import {
  Card,
  CardContent,
  Typography,
  TextField,
  IconButton,
  Box,
  Chip,
  CircularProgress,
  Divider,
  Button,
  Tooltip
} from '@mui/material'
import {
  Send,
  Psychology,
  AutoAwesome,
  TrendingUp,
  Business,
  AccountBalance,
  History,
  Clear
} from '@mui/icons-material'
import axios from 'axios'

interface Message {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
  metadata?: {
    confidence?: number
    sources?: string[]
    analysis_type?: string
  }
}

interface ClaudeAIAssistantProps {
  currentMetrics?: {
    netWorth: number
    dailyRevenue: number
    progress: number
  }
}

// Generate intelligent fallback responses based on current metrics
const generateFallbackResponse = (query: string, metrics?: any): string => {
  const netWorth = metrics?.netWorth || 239625
  const target = 1800000
  const progress = metrics?.progress || 13.3
  const dailyRevenue = metrics?.dailyRevenue || 0
  const remaining = target - netWorth
  
  const queryLower = query.toLowerCase()
  
  if (queryLower.includes('current') && queryLower.includes('situation')) {
    return `📊 **Current Financial Situation Analysis**

**Net Worth Progress:**
• Current: R${netWorth.toLocaleString()}
• Target: R${target.toLocaleString()}
• Progress: ${progress.toFixed(1)}%
• Remaining: R${remaining.toLocaleString()}

**43V3R Business:**
• Daily Revenue: R${dailyRevenue.toLocaleString()}
• Target: R4,881/day
• Monthly Target: R147,917

**Key Insights:**
✅ You're ${progress.toFixed(1)}% toward your R1.8M goal
⚡ Need R${Math.round(remaining/365).toLocaleString()}/day average growth
🚀 43V3R business is key to accelerating progress

**Top 3 Priorities:**
1. **Scale 43V3R Revenue** - Focus on reaching R4,881 daily target
2. **Aggressive Investment Strategy** - 70% growth assets, 30% stable
3. **Emergency Fund** - Maintain R75,000 liquid while maximizing growth

*AI-powered insights from LIF3 Financial Assistant*`
  }
  
  if (queryLower.includes('invest') || queryLower.includes('strategy') || queryLower.includes('portfolio')) {
    return `💰 **Investment Strategy Recommendations**

**Aggressive Growth Portfolio (18-month timeline):**

**Asset Allocation:**
• 40% JSE Growth ETFs (Satrix Top 40, Ashburton Mid Cap)
• 20% US Market ETFs (S&P 500 via EasyEquities)
• 15% Individual Growth Stocks (Tesla, Apple, Google)
• 15% Cryptocurrency (Bitcoin, Ethereum via Luno)
• 10% Emergency Fund (Money Market)

**South African Focus:**
• Max out TFSA: R36,000 annually (tax-free growth)
• Consider offshore allowance: R1M annually
• JSE Top 40 for stability + emerging markets for growth

**Expected Returns:** 25-35% annually (aggressive but achievable)
**Risk Level:** High (appropriate for 18-month aggressive goal)

**Next Steps:**
1. Open TFSA if not already done
2. Set up EasyEquities for offshore investing
3. Automate monthly investments: R15,000+

*Based on current R${netWorth.toLocaleString()} net worth and R${target.toLocaleString()} target*`
  }
  
  if (queryLower.includes('business') || queryLower.includes('43v3r') || queryLower.includes('grow') || queryLower.includes('revenue')) {
    return `🚀 **43V3R Business Growth Strategy**

**Revenue Target Analysis:**
• Current: R${dailyRevenue.toLocaleString()}/day
• Target: R4,881/day (R147,917/month)
• Gap: R${(4881 - dailyRevenue).toLocaleString()}/day needed

**Recommended Revenue Streams:**

**1. AI SaaS Products (60% of revenue):**
• Target: R88,750/month
• Products: Financial dashboards, AI automation tools
• Pricing: R500-2,000/month per customer
• Goal: 50-100 customers

**2. Consulting Services (25%):**
• Target: R36,979/month  
• Rate: R2,500/hour for AI/business consulting
• Goal: 15 hours/month high-value work

**3. Digital Products (15%):**
• Target: R22,188/month
• Online courses, templates, tools
• One-time sales: R1,000-5,000 each

**Cape Town Advantages:**
• Growing tech ecosystem (Silicon Cape)
• Lower development costs
• Access to African markets
• Government tech support

**Next Actions:**
1. Build MVP for core SaaS product
2. Network in Cape Town tech community
3. Target first 10 paying customers

*Accelerate wealth building through business growth*`
  }
  
  if (queryLower.includes('goal') || queryLower.includes('faster') || queryLower.includes('reach')) {
    return `🎯 **Accelerated Goal Achievement Plan**

**Current Trajectory:**
• Progress: ${progress.toFixed(1)}% (R${netWorth.toLocaleString()}/R${target.toLocaleString()})
• Time Remaining: ~12-18 months target
• Required Growth: R${Math.round(remaining/365).toLocaleString()}/day average

**Acceleration Strategies:**

**1. Business Income Boost (Highest Impact):**
• Scale 43V3R to R4,881/day = R147,917/month
• This alone covers 95% of monthly growth needed
• Focus: Customer acquisition, product development

**2. Investment Optimization:**
• Move to aggressive growth portfolio (25-35% returns)
• Maximize tax-advantaged accounts (TFSA, RA)
• Consider leveraged ETFs for faster growth

**3. Expense Optimization:**
• Redirect all excess income to investments
• Minimize lifestyle inflation
• Focus spending on business growth

**Timeline Scenarios:**
• **Conservative (20% returns):** 24 months
• **Moderate (30% returns):** 18 months  
• **Aggressive (40% returns + business):** 12 months

**Key Success Factors:**
✅ 43V3R revenue growth (most important)
✅ Aggressive but diversified investing
✅ Consistent monthly contributions
✅ Avoid major financial setbacks

*Your R${target.toLocaleString()} goal is achievable with focused execution!*`
  }
  
  // Default response for other queries
  return `🤖 **LIF3 AI Financial Assistant**

I understand you're asking about: "${query}"

**Current Status:**
• Net Worth: R${netWorth.toLocaleString()} (${progress.toFixed(1)}% of R${target.toLocaleString()} goal)
• 43V3R Revenue: R${dailyRevenue.toLocaleString()}/day (target: R4,881)
• Remaining to Goal: R${remaining.toLocaleString()}

**General Financial Guidance:**
• Focus on scaling 43V3R business revenue
• Maintain aggressive investment strategy
• Optimize for South African market conditions
• Balance growth with prudent risk management

**I can help with:**
• Investment strategy and portfolio allocation
• 43V3R business growth planning
• Goal achievement timelines and milestones
• South African tax optimization
• Risk assessment and management

Try asking me about specific areas like "investment strategy" or "business growth" for detailed guidance!

*Note: Enhanced AI responses available when RAG system is fully connected*`
}

const ClaudeAIAssistant: React.FC<ClaudeAIAssistantProps> = ({ currentMetrics }) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Quick suggestion prompts
  const quickPrompts = [
    "What's my current financial situation?",
    "How can I reach R1.8M faster?",
    "Best investment strategies for me?",
    "43V3R business growth advice",
    "Risk assessment for my portfolio"
  ]

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // Check if Claude CLI integration is available
    checkConnection()
  }, [])

  const checkConnection = async () => {
    try {
      const response = await axios.get('/api/rag/stats')
      setIsConnected(true)
      
      // Add welcome message
      if (messages.length === 0) {
        addWelcomeMessage()
      }
    } catch (error) {
      setIsConnected(false)
      console.warn('Claude AI integration not available:', error)
    }
  }

  const addWelcomeMessage = () => {
    const welcomeMessage: Message = {
      id: `welcome-${Date.now()}`,
      type: 'assistant',
      content: `👋 Hi! I'm your LIF3 AI Financial Assistant powered by Claude CLI + RAG.

I can help you with:
• Financial planning and investment strategies
• 43V3R business growth advice  
• Progress analysis toward your R1.8M goal
• Risk assessment and portfolio optimization
• South African market insights

Current Status:
💰 Net Worth: R${currentMetrics?.netWorth?.toLocaleString() || '239,625'}
🎯 Progress: ${currentMetrics?.progress?.toFixed(1) || '13.3'}% toward R1.8M
🚀 43V3R Revenue: R${currentMetrics?.dailyRevenue?.toLocaleString() || '0'}/day

Ask me anything about your financial journey!`,
      timestamp: new Date(),
      metadata: {
        analysis_type: 'welcome',
        confidence: 1.0
      }
    }
    setMessages([welcomeMessage])
  }

  const handleSendMessage = async (message?: string) => {
    const queryText = message || inputValue.trim()
    if (!queryText || isLoading) return

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: queryText,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    try {
      // Try RAG backend first, with fallback to direct financial advice
      let assistantMessage: Message;
      
      try {
        const ragResponse = await axios.post('/api/rag/query', {
          query: queryText,
          maxContextTokens: 4000,
          contextChunks: 5
        });

        assistantMessage = {
          id: `assistant-${Date.now()}`,
          type: 'assistant',
          content: ragResponse.data.response || 'I received your question but couldn\'t generate a response. Please try again.',
          timestamp: new Date(),
          metadata: {
            confidence: ragResponse.data.confidence || 0.8,
            sources: ragResponse.data.sources || [],
            analysis_type: ragResponse.data.analysisType || 'rag_response'
          }
        };
      } catch (ragError) {
        // Fallback to local financial insights based on current metrics
        assistantMessage = {
          id: `assistant-${Date.now()}`,
          type: 'assistant',
          content: generateFallbackResponse(queryText, currentMetrics),
          timestamp: new Date(),
          metadata: {
            confidence: 0.7,
            sources: ['Local Financial Analysis'],
            analysis_type: 'fallback_response'
          }
        };
      }

      setMessages(prev => [...prev, assistantMessage])

    } catch (error) {
      console.error('AI Assistant error:', error)
      
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        type: 'assistant',
        content: '❌ I\'m having trouble processing your request right now. The system may need a moment to initialize.',
        timestamp: new Date(),
        metadata: {
          confidence: 0,
          analysis_type: 'error'
        }
      }
      
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSendMessage()
    }
  }

  const clearConversation = () => {
    setMessages([])
    addWelcomeMessage()
  }

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString('en-ZA', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  return (
    <Card sx={{ height: '600px', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Psychology sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6">LIF3 AI Assistant</Typography>
            <Box sx={{ 
              ml: 2,
              width: 8, 
              height: 8, 
              borderRadius: '50%', 
              backgroundColor: isConnected ? 'success.main' : 'error.main'
            }} />
          </Box>
          <Tooltip title="Clear conversation">
            <IconButton size="small" onClick={clearConversation}>
              <Clear />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Quick Actions */}
        <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {quickPrompts.slice(0, 3).map((prompt, index) => (
            <Chip
              key={index}
              label={prompt}
              size="small"
              variant="outlined"
              onClick={() => handleSendMessage(prompt)}
              sx={{ fontSize: '0.75rem' }}
            />
          ))}
        </Box>
      </CardContent>

      <Divider />

      {/* Messages Area */}
      <Box sx={{ 
        flex: 1, 
        overflow: 'auto', 
        p: 2, 
        display: 'flex', 
        flexDirection: 'column',
        gap: 2
      }}>
        {messages.map((message) => (
          <Box key={message.id}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start',
              mb: 1
            }}>
              <Box sx={{
                maxWidth: '80%',
                p: 2,
                borderRadius: 2,
                backgroundColor: message.type === 'user' 
                  ? 'primary.main' 
                  : 'grey.100',
                color: message.type === 'user' ? 'white' : 'text.primary'
              }}>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                  {message.content}
                </Typography>
                
                {/* Metadata for assistant messages */}
                {message.type === 'assistant' && message.metadata && (
                  <Box sx={{ mt: 1, pt: 1, borderTop: '1px solid rgba(0,0,0,0.1)' }}>
                    {message.metadata.confidence && (
                      <Typography variant="caption" color="text.secondary">
                        Confidence: {(message.metadata.confidence * 100).toFixed(0)}%
                      </Typography>
                    )}
                    {message.metadata.analysis_type && (
                      <Chip 
                        label={message.metadata.analysis_type} 
                        size="small" 
                        variant="outlined"
                        sx={{ ml: 1, height: 20, fontSize: '0.7rem' }}
                      />
                    )}
                  </Box>
                )}
              </Box>
            </Box>
            
            <Typography variant="caption" color="text.secondary" sx={{ 
              display: 'block',
              textAlign: message.type === 'user' ? 'right' : 'left',
              px: 1
            }}>
              {formatTimestamp(message.timestamp)}
            </Typography>
          </Box>
        ))}
        
        {isLoading && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CircularProgress size={16} />
            <Typography variant="body2" color="text.secondary">
              AI Assistant is thinking...
            </Typography>
          </Box>
        )}
        
        <div ref={messagesEndRef} />
      </Box>

      <Divider />

      {/* Input Area */}
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Ask me about your finances, investments, or business strategy..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading || !isConnected}
            multiline
            maxRows={3}
            sx={{ 
              '& .MuiOutlinedInput-root': {
                borderRadius: 2
              }
            }}
          />
          <IconButton 
            color="primary" 
            onClick={() => handleSendMessage()}
            disabled={!inputValue.trim() || isLoading || !isConnected}
            sx={{ 
              bgcolor: 'primary.main',
              color: 'white',
              '&:hover': { bgcolor: 'primary.dark' },
              '&:disabled': { bgcolor: 'grey.300' }
            }}
          >
            <Send />
          </IconButton>
        </Box>
        
        {!isConnected && (
          <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
            AI Assistant offline - backend connection required
          </Typography>
        )}
      </Box>
    </Card>
  )
}

export default ClaudeAIAssistant