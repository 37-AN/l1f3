// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://lif3-backend-clean.onrender.com',
  WS_URL: import.meta.env.VITE_WS_URL || 'https://lif3-backend-clean.onrender.com',
  TIMEOUT: 10000
}

// Helper function to create full API URLs
export const createApiUrl = (path: string): string => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  return `${API_CONFIG.BASE_URL}${cleanPath}`
}

// Helper function for API calls
export const apiCall = async (endpoint: string, options?: RequestInit) => {
  const url = endpoint.startsWith('http') ? endpoint : createApiUrl(endpoint)
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers
    },
    ...options
  }

  const response = await fetch(url, defaultOptions)
  
  if (!response.ok) {
    throw new Error(`API call failed: ${response.status} ${response.statusText}`)
  }
  
  return response.json()
}