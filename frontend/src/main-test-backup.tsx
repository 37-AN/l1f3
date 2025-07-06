import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import App from './App'
import { registerSW } from 'virtual:pwa-register'
import logger from './utils/logger'

// Register service worker for PWA
const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm('New content available, reload?')) {
      updateSW(true)
    }
  },
  onOfflineReady() {
    console.log('App ready to work offline')
  },
})

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 2,
      onError: (error) => {
        logger.logError(error as Error, 'ReactQuery', 'QUERY_ERROR')
      }
    },
    mutations: {
      onError: (error) => {
        logger.logError(error as Error, 'ReactQuery', 'MUTATION_ERROR')
      }
    }
  }
})

// LIF3 Material-UI theme with ZAR-focused colors
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2', // Deep blue for financial stability
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#ffa726', // Gold for goal achievements
      light: '#ffcc80',
      dark: '#f57c00',
    },
    success: {
      main: '#388e3c', // Green for positive growth
      light: '#66bb6a',
      dark: '#2e7d32',
    },
    warning: {
      main: '#f57c00', // Orange for budget alerts
      light: '#ffb74d',
      dark: '#ef6c00',
    },
    error: {
      main: '#d32f2f', // Red for financial risks
      light: '#ef5350',
      dark: '#c62828',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 500,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 500,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 500,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 500,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 500,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
  },
})

// Initialize logger with user context
logger.setUserId('ethan_barnes')
logger.logPageView('App Initialization')

// Performance monitoring
const appStartTime = Date.now()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <App />
        </ThemeProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>,
)

// Log app initialization performance
window.addEventListener('load', () => {
  const loadTime = Date.now() - appStartTime
  logger.logPerformance('APP_INITIALIZATION', loadTime, 'ms', 'Main')
  logger.logPageView('App Loaded', loadTime)
})